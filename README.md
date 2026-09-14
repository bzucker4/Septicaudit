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

Production server entry (Node):

```bash
npm start
# → node .output/server/index.mjs
```

## Deploy on Vercel

1. Push this repo to GitHub (or import the folder).
2. Create a new Vercel project from the repo.
3. Vercel detects TanStack Start + Nitro automatically when `nitro()` is present in `vite.config.ts`.
4. Build command: `npm run build` (default). Leave the output directory to framework detection.
5. Deploy. No env vars are required for the public ledger.

Optional CLI:

```bash
npx vercel
```

## Note

This repository holds the SepticAudit product source. Distinctive features — the health ledger, system schematic, and NY 75-A standards explorer — are intentional differentiators and should be kept.
