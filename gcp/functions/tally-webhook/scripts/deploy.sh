#!/usr/bin/env bash
# Deploy SepticAudit Tally webhook to Cloud Functions Gen2.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SOURCE="${ROOT}/gcp/functions/tally-webhook"
PROJECT_ID="${PROJECT_ID:-septicaudit}"
REGION="${REGION:-us-east1}"
FUNCTION_NAME="${FUNCTION_NAME:-tally-webhook}"

export PATH="/home/box/google-cloud-sdk/bin:${PATH}"

gcloud config set project "${PROJECT_ID}"

gcloud functions deploy "${FUNCTION_NAME}" \
  --gen2 \
  --runtime=nodejs22 \
  --region="${REGION}" \
  --source="${SOURCE}" \
  --entry-point=tallyWebhook \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=60s \
  --memory=256Mi \
  --set-secrets=SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,TALLY_SIGNING_SECRET=TALLY_SIGNING_SECRET:latest,RESEND_API_KEY=RESEND_API_KEY:latest,REPORT_TO_EMAIL=REPORT_TO_EMAIL:latest

echo "URL:"
gcloud functions describe "${FUNCTION_NAME}" --gen2 --region="${REGION}" --format='value(serviceConfig.uri)'
