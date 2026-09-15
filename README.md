# SepticAudit

A scored septic health ledger and inspection briefing for homeowners, buyers, and operators in **Western New York**.

The system is under the lawn. The ledger is above it.

## What this site is

SepticAudit is a complete website for a septic inspection practice:

- **Home:** the field-ledger pitch, buried-system schematic, and services
- **Free audit:** a ten-question interview (occupancy, age, pumping, symptoms, site)
- **Report:** 0–100 health score, grade (Sound / Watch / At risk / Critical), findings, next actions
- **Design standards:** NY Appendix 75-A explorer: Table 1 flow, Table 3 tanks, Table 2 setbacks, Table 4A perc, and 75-A.8 / .9 siting (trench, raised, mound, ETU)
- **Services:** transfer inspections, maintenance audits, failure diagnostics, compliance letters
- **Book a visit:** Tally service and inspection report (`https://tally.so/r/dWyO7y`) — also used for sample requests
- **Ledger notes:** short paper on pumping vs inspection, the three-year default, and what a buyer should demand

The online audit is a briefing, not a certified inspection. A real visit still opens lids and walks the field. The standards pages are a briefing, not a stamped drawing.

**Contact:** [brian@septicaudit.com](mailto:brian@septicaudit.com)

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Marketing home |
| `/audit` | Interactive health ledger |
| `/report` | Scored report (your answers, or a sample) |
| `/standards` | Design standards explorer (75-A tables + site fit) |
| `/services` | Field services |
| `/book` | Inspection / sample request |
| `/resources` | Notes and FAQ |

## Stack

React 19, TanStack Start (Vite), TanStack Router, TypeScript, Tailwind CSS v4. Audits stay on-device (`localStorage`). Booking and inspection reports go to the Tally form. No account required.

## Run locally

Requires **Node.js 22.12+** (see `.nvmrc`).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run preview   # optional local preview of the production build
```

Production client assets land in `dist/client`. The `@netlify/vite-plugin-tanstack-start` plugin prepares the SSR server for Netlify Functions.

## Deploy on Netlify

Uses the official [`@netlify/vite-plugin-tanstack-start`](https://www.npmjs.com/package/@netlify/vite-plugin-tanstack-start) plugin (TanStack Start ≥ 1.132) plus `netlify.toml`.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` (`vite build`) |
| Publish directory | `dist/client` |
| Node | `22` (see `netlify.toml` / `.nvmrc`) |

1. Push this repo to GitHub (or connect the folder in the Netlify UI / CLI).
2. Create a new Netlify site from the repo (or link an existing site).
3. Confirm build settings match `netlify.toml` (`npm run build`, publish `dist/client`, Node 22).
4. Deploy. No env vars are required for the public ledger.
5. For the Tally webhook (`/.netlify/functions/tally-webhook`), set Netlify env vars documented in [`docs/tally-webhook-netlify.md`](docs/tally-webhook-netlify.md) (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TALLY_SIGNING_SECRET`, `RESEND_API_KEY`, `REPORT_TO_EMAIL`).

Optional CLI (after `netlify login` / linking; requires netlify-cli ≥ 17.31):

```bash
npx netlify deploy --build
npx netlify deploy --build --prod
```

Local production build check:

```bash
npm run build
# static assets → dist/client/
```

## Note

This repository holds the SepticAudit product source. Distinctive features — the health ledger, system schematic, and NY 75-A standards explorer — are intentional differentiators and should be kept.
