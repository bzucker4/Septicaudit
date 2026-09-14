export const SERVICES = [
  {
    id: "transfer",
    title: "Real estate transfer inspection",
    kicker: "Buyers, sellers, lenders",
    summary:
      "A certified open-tank inspection written for a closing file: lids off, baffles, sludge, field walk, and a plain-language condition letter.",
    includes: [
      "Locate and open accessible lids",
      "Scum and sludge measurements",
      "Baffle, inlet, and outlet check",
      "Drainfield walk and moisture notes",
      "Written report suitable for a transaction",
    ],
    turnaround: "Report within two business days of the visit",
  },
  {
    id: "maintenance",
    title: "Maintenance audit",
    kicker: "Homeowners",
    summary:
      "The annual (or overdue) health check. We tell you whether to pump, wait, or stop using the field — without selling you a replacement you do not need.",
    includes: [
      "Tank condition and pumping interval",
      "Alarm and pump check when present",
      "Field surface evaluation",
      "Usage and household-load notes",
      "A dated ledger entry for the house file",
    ],
    turnaround: "Same-week visits in season",
  },
  {
    id: "diagnostic",
    title: "Failure diagnostic",
    kicker: "Odors, wet ground, backups",
    summary:
      "When the yard is soft or the basement has spoken. Dye, camera, and hydraulic checks after the tank is opened — not before.",
    includes: [
      "Symptom interview and water-use freeze",
      "Open-tank evaluation",
      "Dye or camera as indicated",
      "Field saturation assessment",
      "Repair vs. replace recommendation",
    ],
    turnaround: "Priority scheduling",
  },
  {
    id: "compliance",
    title: "Compliance letter",
    kicker: "Towns, loans, refinances",
    summary:
      "A tight letter that matches what the county or the underwriter actually asked for — not a marketing PDF with a logo on it.",
    includes: [
      "Scope matched to the request",
      "Photos of lids and field",
      "Measurements and findings",
      "Limitations stated in writing",
      "Digital copy for the file",
    ],
    turnaround: "Letter within two business days",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Answer the ledger",
    body: "Ten questions. Occupancy, age, pumping, symptoms, site. No account required. Takes a few minutes.",
  },
  {
    n: "02",
    title: "Read the score",
    body: "A 0–100 health score, graded findings, and the next action — pump, inspect, or stand down.",
  },
  {
    n: "03",
    title: "Put a technician on the lot",
    body: "If the ledger says the tank should be opened, book a field visit. The self-audit is the briefing, not the inspection.",
  },
];

export const FAQS = [
  {
    q: "Is the online audit a real inspection?",
    a: "No. It is a structured interview that scores what you know about the system. A real inspection opens lids, measures sludge, and walks the field. Use the audit to decide how fast to book that visit.",
  },
  {
    q: "How often should a tank be pumped?",
    a: "For a typical occupied house, every 3 years is a defensible default. High occupancy, garbage disposals, and older tanks pull that in. Holding tanks are a different schedule entirely — they are pumped, not treated.",
  },
  {
    q: "We are buying a house with a septic system. What should we do?",
    a: "Do not take a seller's 'it was pumped last year' as an inspection. Order a certified transfer inspection with lids off before the inspection period ends. The online audit will tell you which questions to ask the seller tonight.",
  },
  {
    q: "The lawn is greener over one strip. Is that bad?",
    a: "Often. A lush stripe over laterals can mean effluent in the root zone. It is an early warning, not proof of failure, and it belongs on a field walk.",
  },
  {
    q: "Can I use the report with my lender?",
    a: "The self-audit report is for you. Lenders and counties want a certified inspector's letter. Book a transfer inspection if a third party has to rely on the paper.",
  },
  {
    q: "Do you pump tanks too?",
    a: "We coordinate pumping when the audit says the tank is due, and we inspect. Pumping without inspection is how solids reach a field. We would rather do both in the right order.",
  },
];

export const COVERAGE =
  "Property owners, buyers, and operators across the Northeast. Field work is scheduled by county; the online ledger is available anywhere.";
