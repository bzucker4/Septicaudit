/**
 * Offline map+score smoke test (no Supabase / network).
 * Usage (from repo root): npx tsx netlify/functions/tally-webhook/scripts/run-fixtures.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { createHmac } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mapTallyPayload, validateMapped, type TallyWebhookPayload } from "../map";
import { recomputeScore } from "../score";
import { verifyTallySignature } from "../verify";
import { resolveIdempotencyKey } from "../idempotency";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "..", "fixtures");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const raw = readFileSync(join(dir, file));
  const payload = JSON.parse(raw.toString("utf8")) as TallyWebhookPayload;
  const ids = resolveIdempotencyKey({
    eventId: payload.eventId,
    responseId: payload.data?.responseId ?? payload.data?.submissionId,
    rawBody: raw,
  });
  const mapped = mapTallyPayload(payload);
  const valid = validateMapped(mapped);
  const scored = recomputeScore(mapped.answers);
  const secret = "test-secret";
  const sig = createHmac("sha256", secret).update(raw).digest("base64");
  const okSig = verifyTallySignature(raw, sig, secret);
  const badSig = verifyTallySignature(raw, "nope", secret);

  console.log(
    JSON.stringify({
      file,
      valid,
      address: mapped.propertyAddressLine1,
      county: mapped.county,
      tank: mapped.tankSizeGallons,
      photos: mapped.photoRefs.length,
      answers: mapped.answers,
      scored: scored.scored,
      score: scored.score,
      grade: scored.grade,
      idempotency: ids.requestIdempotencyKey.slice(0, 16),
      sigOk: okSig.ok,
      badSigRejected: !badSig.ok,
    }),
  );
}
