# Tally webhook on Google Cloud Functions Gen2

Backend webhook for [SepticAudit](https://septicaudit.com) Tally form `dWyO7y` (Service & Inspection Report). Frontend stays on Netlify; this function owns signature verify → map → score → Supabase insert → async email.

Project: **`septicaudit`**  
Region: **`us-east1`**  
Runtime: **Node.js 22**  
Timeout: **60s**  
Source: `gcp/functions/tally-webhook/`

## 1. Enable APIs

```bash
export PROJECT_ID=septicaudit
export REGION=us-east1
gcloud config set project "$PROJECT_ID"

gcloud services enable \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com
```

## 2. Create secrets (Secret Manager)

Do **not** put secrets in source or commit them.

**`TALLY_SIGNING_SECRET` is fail-closed in production:** prod deploy **must** set it via Secret Manager (reject unsigned/bad signatures with 401). Leaving it unset is allowed **only for local** runs so fixtures can be posted without HMAC.

```bash
# Values are prompted / piped — never echo into the repo.
printf '%s' 'https://YOUR_PROJECT.supabase.co' | \
  gcloud secrets create SUPABASE_URL --data-file=-

printf '%s' 'YOUR_SUPABASE_SERVICE_ROLE_KEY' | \
  gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-

printf '%s' 'YOUR_TALLY_SIGNING_SECRET' | \
  gcloud secrets create TALLY_SIGNING_SECRET --data-file=-

printf '%s' 're_YOUR_RESEND_KEY' | \
  gcloud secrets create RESEND_API_KEY --data-file=-

printf '%s' 'brian@septicaudit.com' | \
  gcloud secrets create REPORT_TO_EMAIL --data-file=-
```

If a secret already exists, add a new version:

```bash
printf '%s' 'new-value' | gcloud secrets versions add SECRET_NAME --data-file=-
```

Grant the Cloud Functions / Cloud Run runtime service account access to each secret (`roles/secretmanager.secretAccessor`).

## 3. Apply Supabase migration

Run `supabase/migrations/20260915000000_audits.sql` (approved core DDL) against the SepticAudit Supabase project (CLI `supabase db push`, SQL editor, or CI). Also apply follow-up `20260915000100_audits_form_version_checks.sql` (`form_version` text + CHECKs `tank_size_gallons > 0` / `gallons_pumped >= 0`, nulls still allowed). RLS is enabled with **no anon policies**; only the service-role key used by this function can insert/select.

## 4. Deploy Gen2 HTTP function

From the repo root (or use `gcp/functions/tally-webhook/scripts/deploy.sh`):

```bash
gcloud functions deploy tally-webhook \
  --gen2 \
  --runtime=nodejs22 \
  --region=us-east1 \
  --source=gcp/functions/tally-webhook \
  --entry-point=tallyWebhook \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=60s \
  --memory=256Mi \
  --set-secrets=SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,TALLY_SIGNING_SECRET=TALLY_SIGNING_SECRET:latest,RESEND_API_KEY=RESEND_API_KEY:latest,REPORT_TO_EMAIL=REPORT_TO_EMAIL:latest
```

Tally must call a **public HTTPS** URL and expects **2xx within ~10 seconds**. `--allow-unauthenticated` is required for Tally’s servers. Alternatives:

- Keep the function public but **always** set `TALLY_SIGNING_SECRET` and reject bad signatures with 401.
- Or put Cloud Armor / API Gateway / a shared secret path in front (Tally can send custom headers).

Print the URL:

```bash
gcloud functions describe tally-webhook --gen2 --region=us-east1 --format='value(serviceConfig.uri)'
```

## 5. Point Tally at the function

1. Open https://tally.so/r/dWyO7y → **Integrations** → **Webhooks**.
2. Endpoint URL = the Gen2 HTTPS URI from above.
3. Enable **signing secret** and store the same value in Secret Manager `TALLY_SIGNING_SECRET`.
4. Save. Submit a test response and check the Tally events log + Cloud Logging.

## 6. Behavior (locked)

1. HMAC verify on **raw body** (`Tally-Signature` = base64 HMAC-SHA256) before JSON parse; **401** when secret is set and signature is bad.
2. Idempotency on `tally_event_id` / `tally_response_id` / `request_idempotency_key`; duplicates → **200** without re-email.
3. Missing event id → `request_idempotency_key = sha256(raw)`.
4. Fast ack: validate → insert → **200**; then email.
5. **Email (v1):** still **fire-and-forget** after the 200. Cloud Tasks is a **stub only** (`enqueueEmailTaskStub` logs intent). If the Cloud Functions instance dies mid-send, there is **no durable retry** — email can be lost until Tasks (or equivalent) is wired. Unscored service-log emails are **intake alerts** (address / tank / gallons / notes / photo refs), **not** scored briefings.
6. Score via vendored `scoreAudit` only when full ledger answers are present; **never** trust a wire score; null score/grade otherwise.
7. Live UUID map for address / city-state-zip / tank size / gallons / notes / photos / acknowledgment; label heuristics + `EXTENDED_FIELD_UUIDS` for contact + ledger.
8. Photos: URL/metadata in `photo_refs` only; **empty photos → 422**. Service-log path also requires `tank_size_gallons > 0`, `gallons_pumped >= 0` (present), non-empty notes, and `acknowledgment === true`.
9. `public_id` = `SA-YYYY-NNNN`.
10. County map: only clear WNY county names (and `other`); city labels like "Buffalo" stay `null` — do **not** coerce to `erie`.

## 7. Curl fixtures

Fixtures live under `gcp/functions/tally-webhook/fixtures/`. Sign locally when testing with a secret:

```bash
URL="$(gcloud functions describe tally-webhook --gen2 --region=us-east1 --format='value(serviceConfig.uri)')"
BODY="$(cat gcp/functions/tally-webhook/fixtures/happy-service-log.json)"
# Optional signature (requires openssl + secret):
SIG="$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$TALLY_SIGNING_SECRET" -binary | base64)"

curl -sS -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -H "Tally-Signature: $SIG" \
  --data-binary @"gcp/functions/tally-webhook/fixtures/happy-service-log.json"
```

Unsigned (only works if `TALLY_SIGNING_SECRET` is unset — **local only**; prod must set the secret and fail closed):

```bash
curl -sS -X POST "$URL" \
  -H 'Content-Type: application/json' \
  --data-binary @"gcp/functions/tally-webhook/fixtures/happy-service-log.json"
```

Expected:

| Fixture | Expect |
| --- | --- |
| `happy-service-log.json` | 200, `scored: false`, null score/grade (intake alert email, not scored briefing) |
| `happy-full-ledger.json` | 200, `scored: true`, recomputed score |
| `critical-ledger.json` | 200, low score / critical-ish grade |
| `missing-address.json` | 422 |
| `acknowledgment-false.json` | 422 `acknowledgment_required` |
| empty photos array | 422 `photos_required` |
| `empty-body` (curl `-d ''`) | 400 |
| replay same `eventId` | 200, `duplicate: true` |
| bad `Tally-Signature` | 401 |

## 8. Local run

```bash
cd gcp/functions/tally-webhook
npm install
npm run build
export SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... # etc.
npm start   # functions-framework on :8080
```

## Secrets Brian must create

| Secret Manager name | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only insert path (bypasses RLS) |
| `TALLY_SIGNING_SECRET` | Tally webhook signing secret (**required in prod** / fail-closed; unset only for local) |
| `RESEND_API_KEY` | Resend API key for report email |
| `REPORT_TO_EMAIL` | Inbox for intake notifications |

Also configure Resend domain / from-address (`reports@septicaudit.com`) before relying on email.
