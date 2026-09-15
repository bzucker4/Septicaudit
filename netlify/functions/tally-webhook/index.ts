import type { Context } from "@netlify/functions";
import { enqueueEmailTaskStub, sendReportEmail } from "./email";
import { isUniqueViolation, resolveIdempotencyKey } from "./idempotency";
import {
  mapTallyPayload,
  validateMapped,
  type TallyWebhookPayload,
} from "./map";
import { newPublicId } from "./publicId";
import { recomputeScore } from "./score";
import {
  buildInsertRow,
  findExistingByIdempotency,
  getSupabase,
  insertAudit,
  markEmailResult,
} from "./supabase";
import { isProdContext, verifyTallySignature } from "./verify";

const MAX_BODY_BYTES = 2 * 1024 * 1024;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/**
 * Read the exact request bytes for HMAC. Never JSON.stringify a parsed body —
 * that would break Tally-Signature verification.
 */
async function readRawBody(req: Request): Promise<Buffer> {
  const ab = await req.arrayBuffer();
  return Buffer.from(ab);
}

export default async (req: Request, context: Context): Promise<Response> => {
  try {
    if (req.method === "GET" || req.method === "HEAD") {
      return json(200, { ok: true, service: "septicaudit-tally-webhook" });
    }

    if (req.method !== "POST") {
      return json(405, { ok: false, error: "method_not_allowed" });
    }

    const rawBody = await readRawBody(req);
    if (!rawBody.length) {
      return json(400, { ok: false, error: "empty_body" });
    }
    if (rawBody.byteLength > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: "body_too_large" });
    }

    const signingSecret = process.env.TALLY_SIGNING_SECRET;
    // Fail-closed in Netlify production: missing secret → 500, never skip HMAC.
    if (isProdContext() && !signingSecret) {
      console.error(
        JSON.stringify({
          msg: "signing_secret_unset",
          context: process.env.CONTEXT ?? null,
        }),
      );
      return json(500, { ok: false, error: "server_misconfigured" });
    }

    const sig = req.headers.get("tally-signature");
    const verified = verifyTallySignature(rawBody, sig ?? undefined, signingSecret);
    if (!verified.ok) {
      console.warn(
        JSON.stringify({ msg: "signature_rejected", reason: verified.reason }),
      );
      return json(401, { ok: false, error: "invalid_signature" });
    }

    let payload: TallyWebhookPayload;
    try {
      payload = JSON.parse(rawBody.toString("utf8")) as TallyWebhookPayload;
    } catch {
      return json(400, { ok: false, error: "invalid_json" });
    }

    if (payload.eventType && payload.eventType !== "FORM_RESPONSE") {
      return json(200, { ok: true, ignored: true, reason: "non_form_response" });
    }

    const responseId =
      payload.data?.responseId ?? payload.data?.submissionId ?? null;
    const ids = resolveIdempotencyKey({
      eventId: payload.eventId,
      responseId,
      rawBody,
    });

    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      return json(500, { ok: false, error: "server_misconfigured" });
    }

    // Fast duplicate short-circuit before map/score work
    const existing = await findExistingByIdempotency(supabase, ids);
    if (existing) {
      return json(200, {
        ok: true,
        duplicate: true,
        public_id: existing.publicId,
        id: existing.id,
      });
    }

    const mapped = mapTallyPayload(payload);
    const valid = validateMapped(mapped);
    if (!valid.ok) {
      return json(valid.status, { ok: false, error: valid.error });
    }

    // NEVER trust wire score — recompute or leave null when ledger incomplete
    const scored = recomputeScore(mapped.answers);

    const formId =
      typeof payload.data?.formId === "string" ? payload.data.formId : null;

    let publicId = newPublicId();
    let inserted: { id: string; publicId: string; duplicate: boolean } | null =
      null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const row = buildInsertRow({
        publicId,
        mapped,
        scored,
        tallyEventId: ids.tallyEventId,
        tallyResponseId: ids.tallyResponseId,
        tallyFormId: formId,
        requestIdempotencyKey: ids.requestIdempotencyKey,
        rawPayload: payload as Record<string, unknown>,
      });

      try {
        inserted = await insertAudit(supabase, row);
        break;
      } catch (err) {
        if (isUniqueViolation(err)) {
          // Race: another delivery won — treat as idempotent success
          const again = await findExistingByIdempotency(supabase, ids);
          if (again) {
            return json(200, {
              ok: true,
              duplicate: true,
              public_id: again.publicId,
              id: again.id,
            });
          }
          // public_id collision only — retry with new id
          publicId = newPublicId();
          continue;
        }
        console.error(
          JSON.stringify({
            msg: "insert_failed",
            error: err instanceof Error ? err.message : String(err),
          }),
        );
        return json(500, { ok: false, error: "insert_failed" });
      }
    }

    if (!inserted) {
      return json(500, { ok: false, error: "public_id_exhausted" });
    }

    // Fast ack — keep isolate alive for email via waitUntil (prefer over Background Function for v1).
    enqueueEmailTaskStub(inserted.id, inserted.publicId);
    context.waitUntil(
      sendReportEmail({
        publicId: inserted.publicId,
        mapped,
        scored,
        formId,
        responseId: ids.tallyResponseId,
      })
        .then((result) => markEmailResult(supabase, inserted!.id, result))
        .catch((err) => {
          console.error(
            JSON.stringify({
              msg: "email_async_failed",
              public_id: inserted!.publicId,
              error: err instanceof Error ? err.message : String(err),
            }),
          );
        }),
    );

    return json(200, {
      ok: true,
      duplicate: false,
      public_id: inserted.publicId,
      id: inserted.id,
      scored: scored.scored,
      score: scored.score,
      grade: scored.grade,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        msg: "unhandled",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return json(500, { ok: false, error: "internal_error" });
  }
};

// Deployed at /.netlify/functions/tally-webhook (default Netlify Functions path).
