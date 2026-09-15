import { createHmac, timingSafeEqual } from "node:crypto";

/** Netlify sets CONTEXT=production on production deploys. */
export function isProdContext(): boolean {
  return process.env.CONTEXT === "production";
}

/**
 * Tally.so signs webhooks with base64(HMAC-SHA256(secret, rawBody)).
 * Header: Tally-Signature (case-insensitive).
 * Always verify against the exact raw body bytes — never re-serialized JSON.
 *
 * When secret is unset: allow only outside production (local/fixture curls).
 * Production fail-closed is enforced by the handler before calling this when
 * CONTEXT=production and TALLY_SIGNING_SECRET is missing.
 */
export function verifyTallySignature(
  rawBody: Buffer | string,
  signatureHeader: string | string[] | undefined,
  signingSecret: string | undefined,
): { ok: true } | { ok: false; reason: string } {
  if (!signingSecret) {
    // Secret unset: skip verification (local/dev only). Prod must set it.
    return { ok: true };
  }

  const received = Array.isArray(signatureHeader)
    ? signatureHeader[0]
    : signatureHeader;

  if (!received) {
    return { ok: false, reason: "missing_signature" };
  }

  const expected = createHmac("sha256", signingSecret)
    .update(rawBody)
    .digest("base64");

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  return { ok: true };
}
