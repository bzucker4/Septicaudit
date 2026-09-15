import { createHash } from "node:crypto";

export function sha256Hex(raw: Buffer | string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Prefer Tally event id, then response/submission id, else sha256(raw body).
 */
export function resolveIdempotencyKey(input: {
  eventId?: string | null;
  responseId?: string | null;
  rawBody: Buffer | string;
}): {
  tallyEventId: string | null;
  tallyResponseId: string | null;
  requestIdempotencyKey: string;
} {
  const tallyEventId = input.eventId?.trim() || null;
  const tallyResponseId = input.responseId?.trim() || null;
  const requestIdempotencyKey =
    tallyEventId ?? tallyResponseId ?? sha256Hex(input.rawBody);

  return { tallyEventId, tallyResponseId, requestIdempotencyKey };
}

export function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code === "23505") return true;
  const msg = (e.message ?? "").toLowerCase();
  return (
    msg.includes("duplicate key") ||
    msg.includes("unique constraint") ||
    msg.includes("audits_tally_event") ||
    msg.includes("audits_tally_response") ||
    msg.includes("audits_idempotency") ||
    msg.includes("audits_public_id")
  );
}
