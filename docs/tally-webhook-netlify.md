# Tally webhook on Netlify Functions

Backend webhook for [SepticAudit](https://septicaudit.com) Tally form `dWyO7y` (Service & Inspection Report). Site + function both live on Netlify: signature verify → map → score → Supabase insert → async email.

Runtime: **Node.js 22** (see `netlify.toml` / `.nvmrc`)  
Source: `netlify/functions/tally-webhook/`  
**Production webhook path:** `/.netlify/functions/tally-webhook`

Example production URL to paste into Tally:

```text
https://septicaudit.com/.netlify/functions/tally-webhook
```

(Use your Netlify production domain if it differs.)

> **GCP Gen2 abandoned:** The earlier Cloud Functions Gen2 path under `gcp/functions/tally-webhook/` is **superseded**. Keep that folder only as historical reference (see its README). Do **not** deploy to GCP or use Secret Manager for this webhook.

## 1. Set Netlify environment variables

Do **not** put secrets in source or commit them. In the Netlify UI: **Site configuration → Environment variables** (scope: Production, and Deploy Previews if you want signed preview tests).

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (e.g. `https://odskyepivuzritmbehws.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only insert path (bypasses RLS) |
| `TALLY_SIGNING_SECRET` | Tally webhook signing secret (**required in production** / fail-closed) |
| `RESEND_API_KEY` | Resend API key for report email |
| `REPORT_TO_EMAIL` | Inbox for intake notifications |

**`TALLY_SIGNING_SECRET` is fail-closed in production:** when Netlify `CONTEXT=production` and the secret is missing, the function returns **500** `server_misconfigured` and does **not** accept unsigned bodies. Leaving it unset is allowed **only for local** runs so fixtures can be posted without HMAC.

Also configure Resend domain / from-address (`reports@septicaudit.com`) before relying on email.

## 2. Apply Supabase migration

Run `supabase/migrations/20260915000000_audits.sql` (approved core DDL) against the SepticAudit Supabase project (CLI `supabase db push`, SQL editor, or CI). Also apply follow-up `20260915000100_audits_form_version_checks.sql` (`form_version` text + CHECKs `tank_size_gallons > 0` / `gallons_pumped >= 0`, nulls still allowed). RLS is enabled with **no anon policies**; only the service-role key used by this function can insert/select.

## 3. Deploy on Netlify

Push to the linked Git branch (or `npx netlify deploy --build --prod`). `netlify.toml` sets:

- Build: `npm run build`
- Publish: `dist/client`
- Functions directory: `netlify/functions`
- Bundler: `esbuild`
- Node: `22`

Confirm the function appears under **Functions** in the Netlify UI as `tally-webhook`.

## 4. Point Tally at the function

1. Open https://tally.so/r/dWyO7y → **Integrations** → **Webhooks**.
2. Endpoint URL = `https://<your-production-domain>/.netlify/functions/tally-webhook`
3. Enable **signing secret** and store the **same** value in Netlify env `TALLY_SIGNING_SECRET`.
4. Save. Submit a test response and check the Tally events log + Netlify function logs.

Tally must call a **public HTTPS** URL and expects **2xx within ~10 seconds**. Always set `TALLY_SIGNING_SECRET` in production and reject bad signatures with 401.

## 5. Behavior (locked)

1. HMAC verify on **raw body** (`req.arrayBuffer()` → bytes; `Tally-Signature` = base64 HMAC-SHA256) before JSON parse. **Never** `JSON.stringify` a parsed body for verification.
2. **401** when secret is set and signature is bad; **500** when secret is missing in production (`CONTEXT=production`).
3. Idempotency on `tally_event_id` / `tally_response_id` / `request_idempotency_key` (unique indexes) **before** Resend; duplicates → **200** without re-email.
4. Missing event id → `request_idempotency_key = sha256(raw)`.
5. Fast ack: validate → insert → **200**; then email via `context.waitUntil(...)` (keeps the isolate alive after the response; prefer over Background Function for v1). Durable queue is a **stub only** (`enqueueEmailTaskStub` logs intent). If the function times out mid-send, there is **no durable retry** until a queue is wired. Unscored service-log emails are **intake alerts** (address / tank / gallons / notes / photo refs), **not** scored briefings.
6. Score via vendored `scoreAudit` only when full ledger answers are present; **never** trust a wire score; null score/grade otherwise.
7. Live webhook field keys are `question_*` (see `LIVE_FIELD_KEYS` / `EXTENDED_FIELD_KEYS` in `map.ts`, sourced from SA-2026-7012). Form-definition UUIDs are **not** on the wire. Matcher: exact `field.key` or checkbox option-row prefix (`parentKey_…`); label heuristics remain as fallback.
8. Photos: URL/metadata in `photo_refs` only; **empty photos → 422**. Service-log path also requires `tank_size_gallons > 0`, `gallons_pumped >= 0` (present), non-empty notes, and `acknowledgment === true`.
9. `public_id` = `SA-YYYY-NNNN`.
10. County map: only clear WNY county names (and `other`); city labels like "Buffalo" stay `null` — do **not** coerce to `erie`.
11. Body size cap: **2MB** → 413.

## 6. Curl fixtures

Fixtures live under `netlify/functions/tally-webhook/fixtures/`. Sign locally when testing with a secret:

```bash
URL="https://septicaudit.com/.netlify/functions/tally-webhook"
BODY="$(cat netlify/functions/tally-webhook/fixtures/happy-service-log.json)"
SIG="$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$TALLY_SIGNING_SECRET" -binary | base64)"

curl -sS -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -H "Tally-Signature: $SIG" \
  --data-binary @"netlify/functions/tally-webhook/fixtures/happy-service-log.json"
```

Unsigned (only works if `TALLY_SIGNING_SECRET` is unset — **local only**; production must set the secret and fail closed):

```bash
curl -sS -X POST "http://localhost:8888/.netlify/functions/tally-webhook" \
  -H 'Content-Type: application/json' \
  --data-binary @"netlify/functions/tally-webhook/fixtures/happy-service-log.json"
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
| prod missing `TALLY_SIGNING_SECRET` | 500 `server_misconfigured` |

## 7. Local run / offline fixtures

Offline map+score smoke (no network):

```bash
npx tsx netlify/functions/tally-webhook/scripts/run-fixtures.ts
```

With Netlify platform emulation (TanStack Start + `@netlify/vite-plugin-tanstack-start`):

```bash
npm run dev
# POST to http://localhost:3000/.netlify/functions/tally-webhook
```

Or `npx netlify functions:serve` / `netlify dev` if you prefer the CLI.

## Secrets checklist (Netlify env)

| Netlify env var | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only insert path (bypasses RLS) |
| `TALLY_SIGNING_SECRET` | Tally webhook signing secret (**required in prod** / fail-closed; unset only for local) |
| `RESEND_API_KEY` | Resend API key for report email |
| `REPORT_TO_EMAIL` | Inbox for intake notifications |
