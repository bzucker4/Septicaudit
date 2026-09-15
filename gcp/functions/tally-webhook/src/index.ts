import type { Request, Response } from "@google-cloud/functions-framework";
import { http } from "@google-cloud/functions-framework";
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
import { verifyTallySignature } from "./verify";

const MAX_BODY_BYTES = 2 * 1024 * 1024;

function getRawBody(req: Request): Buffer {
  const anyReq = req as Request & { rawBody?: Buffer };
  if (anyReq.rawBody && Buffer.isBuffer(anyReq.rawBody)) {
    return anyReq.rawBody;
  }
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  // Last resort — may break signature if framework already parsed JSON.
  return Buffer.from(JSON.stringify(req.body ?? {}));
}

function json(res: Response, status: number, body: Record<string, unknown>): void {
  res.status(status).type("application/json").send(JSON.stringify(body));
}

async function handleTallyWebhook(req: Request, res: Response): Promise<void> {
  if (req.method === "GET" || req.method === "HEAD") {
    json(res, 200, { ok: true, service: "septicaudit-tally-webhook" });
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  const rawBody = getRawBody(req);
  if (!rawBody.length) {
    json(res, 400, { ok: false, error: "empty_body" });
    return;
  }
  if (rawBody.byteLength > MAX_BODY_BYTES) {
    json(res, 413, { ok: false, error: "body_too_large" });
    return;
  }

  const sig =
    req.get("tally-signature") ??
    req.headers["tally-signature"] ??
    req.headers["Tally-Signature"];

  const verified = verifyTallySignature(
    rawBody,
    sig,
    process.env.TALLY_SIGNING_SECRET,
  );
  if (!verified.ok) {
    console.warn(JSON.stringify({ msg: "signature_rejected", reason: verified.reason }));
    json(res, 401, { ok: false, error: "invalid_signature" });
    return;
  }

  let payload: TallyWebhookPayload;
  try {
    payload = JSON.parse(rawBody.toString("utf8")) as TallyWebhookPayload;
  } catch {
    json(res, 400, { ok: false, error: "invalid_json" });
    return;
  }

  if (payload.eventType && payload.eventType !== "FORM_RESPONSE") {
    json(res, 200, { ok: true, ignored: true, reason: "non_form_response" });
    return;
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
    json(res, 500, { ok: false, error: "server_misconfigured" });
    return;
  }

  // Fast duplicate short-circuit before map/score work
  const existing = await findExistingByIdempotency(supabase, ids);
  if (existing) {
    json(res, 200, {
      ok: true,
      duplicate: true,
      public_id: existing.publicId,
      id: existing.id,
    });
    return;
  }

  const mapped = mapTallyPayload(payload);
  const valid = validateMapped(mapped);
  if (!valid.ok) {
    json(res, valid.status, { ok: false, error: valid.error });
    return;
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
          json(res, 200, {
            ok: true,
            duplicate: true,
            public_id: again.publicId,
            id: again.id,
          });
          return;
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
      json(res, 500, { ok: false, error: "insert_failed" });
      return;
    }
  }

  if (!inserted) {
    json(res, 500, { ok: false, error: "public_id_exhausted" });
    return;
  }

  // Fast ack — email is async (fire-and-forget). Cloud Tasks stub logged.
  enqueueEmailTaskStub(inserted.id, inserted.publicId);
  void sendReportEmail({
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
    });

  json(res, 200, {
    ok: true,
    duplicate: false,
    public_id: inserted.publicId,
    id: inserted.id,
    scored: scored.scored,
    score: scored.score,
    grade: scored.grade,
  });
}

http("tallyWebhook", (req, res) => {
  void handleTallyWebhook(req, res).catch((err) => {
    console.error(
      JSON.stringify({
        msg: "unhandled",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    if (!res.headersSent) {
      json(res, 500, { ok: false, error: "internal_error" });
    }
  });
});
