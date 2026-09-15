# Tally webhook fixtures

Use with the curl examples in `docs/tally-webhook-gcp.md`.

| File | Intent |
| --- | --- |
| `happy-service-log.json` | Live dWyO7y fields only → insert, null score/grade |
| `happy-full-ledger.json` | Contact + full ledger via label heuristics → scored |
| `critical-ledger.json` | Backup / never pumped / high water → low score |
| `missing-address.json` | 422 `missing_property_address` |
| `acknowledgment-false.json` | 422 `acknowledgment_required` |
| `symptoms-string-and-none-plus-backup.json` | Drop `none` when combined with `backup` |
| `unicode-address.json` | Unicode address/name; county "Buffalo" → `null` (not erie) |

Also exercise manually:

- Empty body → 400
- Bad `Tally-Signature` → 401
- Replay same `eventId` → 200 `duplicate: true`
- Empty photos array → 422 `photos_required`
