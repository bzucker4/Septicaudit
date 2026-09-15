# GCP (superseded)

SepticAudit Tally webhook hosting moved from Cloud Functions Gen2 to **Netlify Functions**.

- Current implementation: `netlify/functions/tally-webhook/`
- Docs: `docs/tally-webhook-netlify.md`

This `gcp/` tree is retained to avoid churn and as a historical reference. Do **not** deploy these functions or rely on GCP Secret Manager for the webhook.
