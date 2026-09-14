# SepticAudit

A scored septic health ledger and inspection briefing for homeowners, buyers, and operators.

The system is under the lawn. The ledger is above it.

## What this site is

SepticAudit is a complete website for a septic inspection practice:

- **Home** — the field-ledger pitch, buried-system schematic, and services
- **Free audit** — a ten-question interview (occupancy, age, pumping, symptoms, site)
- **Report** — 0–100 health score, grade (Sound / Watch / At risk / Critical), findings, next actions
- **Design standards** — NY Appendix 75-A explorer: Table 1 flow, Table 3 tanks, Table 2 setbacks, Table 4A perc, and 75-A.8 / .9 siting (trench, raised, mound, ETU)
- **Services** — transfer inspections, maintenance audits, failure diagnostics, compliance letters
- **Book a visit** — request a lids-off field inspection
- **Ledger notes** — short paper on pumping vs inspection, the three-year default, and what a buyer should demand

The online audit is a briefing, not a certified inspection. A real visit still opens lids and walks the field. The standards pages are a briefing, not a stamped drawing.

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Marketing home |
| `/audit` | Interactive health ledger |
| `/report` | Scored report (your answers, or a sample) |
| `/standards` | Design standards explorer (75-A tables + site fit) |
| `/services` | Field services |
| `/book` | Inspection request |
| `/resources` | Notes and FAQ |

## Stack

React, TanStack Start, Tailwind CSS. Audits and booking requests stay on-device (localStorage) for the demo — no account required.

## Note

This repository holds the SepticAudit product source. The live site is the deployed preview of the same app.
