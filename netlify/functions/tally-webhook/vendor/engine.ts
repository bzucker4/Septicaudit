/**
 * Vendored from src/lib/audit/engine.ts for the Cloud Function package.
 * Keep in sync when the client scoring engine changes.
 */
import type { Answers, AuditResult, Finding, Grade } from "./types";

function asList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function gradeFor(score: number): Grade {
  if (score >= 86) return "sound";
  if (score >= 70) return "watch";
  if (score >= 50) return "risk";
  return "critical";
}

export const GRADE_COPY: Record<
  Grade,
  { label: string; kicker: string; summary: string }
> = {
  sound: {
    label: "Sound",
    kicker: "No red flags in the answers you gave.",
    summary:
      "This reads like a maintained system. Keep the pump interval honest and get lids off on a regular cadence. A certified inspection is still the right move before a sale.",
  },
  watch: {
    label: "Watch",
    kicker: "Serviceable, with gaps that should be closed.",
    summary:
      "Nothing here is an emergency on paper, but the record is thin or the load is high. Schedule a pump and a proper open-tank inspection before the next season.",
  },
  risk: {
    label: "At risk",
    kicker: "The system is asking for attention.",
    summary:
      "Age, overdue pumping, or site conditions put this system in a range where small problems become field failures. Do not wait for a backup to force the issue.",
  },
  critical: {
    label: "Critical",
    kicker: "Treat this as a live problem, not a someday task.",
    summary:
      "Symptoms and history point to a system that may already be failing. Stop heavy water use if you can, keep people off the field, and book a field inspection now.",
  },
};

export function scoreAudit(answers: Answers): Omit<AuditResult, "id" | "createdAt"> {
  let score = 84;
  const findings: Finding[] = [];
  const actions: string[] = [];
  let pumpWithinMonths: number | null = 36;
  let certifiedInspect = answers.purpose === "buy-sell";

  const occupancy = answers.occupancy;
  if (occupancy === "5+") {
    score -= 6;
    findings.push({
      id: "load",
      severity: "watch",
      title: "High occupancy load",
      detail:
        "Five or more residents push a residential tank harder. Pumping every 2–3 years is the safe default, not every 5.",
    });
    pumpWithinMonths = Math.min(pumpWithinMonths ?? 36, 24);
  } else if (occupancy === "seasonal") {
    findings.push({
      id: "seasonal",
      severity: "info",
      title: "Seasonal use",
      detail:
        "Idle tanks still need lids checked. A spring open-and-inspect is smarter than waiting for the first long weekend backup.",
    });
  } else {
    findings.push({
      id: "load",
      severity: "pass",
      title: "Household load looks ordinary",
      detail: "Occupancy is in a range a standard residential tank is built for.",
    });
  }

  const age = answers.age;
  if (age === "25-40") {
    score -= 8;
    findings.push({
      id: "age",
      severity: "watch",
      title: "Mid-life system",
      detail:
        "At 25–40 years the tank may be sound while the field is the weak link. A locate and a hydraulic check belong on the next visit.",
    });
  } else if (age === "40+") {
    score -= 14;
    findings.push({
      id: "age",
      severity: "fail",
      title: "Late-life system",
      detail:
        "Systems past 40 often hide cracked baffles, outdated laterals, or a field at the end of its life. Budget for findings, not just a pump.",
    });
    certifiedInspect = true;
  } else if (age === "unknown") {
    score -= 6;
    findings.push({
      id: "age",
      severity: "watch",
      title: "No age on record",
      detail:
        "An undated system is a disclosure risk. County records or a locate will tell you more than a guess from the house year.",
    });
  } else if (age === "under-10") {
    findings.push({
      id: "age",
      severity: "pass",
      title: "Relatively new system",
      detail: "Age is not the concern. Installation quality and the pump record still are.",
    });
  }

  const type = answers.type;
  if (type === "unknown") {
    score -= 5;
    findings.push({
      id: "type",
      severity: "watch",
      title: "System type unknown",
      detail:
        "Conventional, mound, and aerobic units fail in different ways. A locate and a sketch should be the first page of the file.",
    });
    actions.push("Locate the tank, laterals, and any pump or alarm. Draw a simple site sketch.");
  } else if (type === "holding") {
    score -= 4;
    pumpWithinMonths = Math.min(pumpWithinMonths ?? 36, 3);
    findings.push({
      id: "type",
      severity: "info",
      title: "Holding tank",
      detail:
        "There is no drainfield to fail, but overflow is the whole risk. High-water alarms and a tight pump contract are not optional.",
    });
    actions.push("Confirm a high-water alarm and a standing pump-out agreement.");
  } else if (type === "mound" || type === "aerobic") {
    findings.push({
      id: "type",
      severity: "info",
      title: type === "mound" ? "Mound system" : "Aerobic treatment unit",
      detail:
        "These need more than a pump truck. Electrical, pumps, and media all have their own inspection items.",
    });
    certifiedInspect = true;
  } else {
    findings.push({
      id: "type",
      severity: "pass",
      title: "Conventional layout",
      detail: "A tank-and-field system is straightforward to inspect if the lids can be found.",
    });
  }

  const pump = answers.pump;
  if (pump === "under-3") {
    findings.push({
      id: "pump",
      severity: "pass",
      title: "Pumped on a sane interval",
      detail: "A recent pump-out is the single best thing on this ledger.",
    });
  } else if (pump === "3-5") {
    score -= 6;
    pumpWithinMonths = Math.min(pumpWithinMonths ?? 36, 12);
    findings.push({
      id: "pump",
      severity: "watch",
      title: "Pumping is due soon",
      detail: "Three to five years is the edge for most occupied houses. Do not stretch it.",
    });
  } else if (pump === "5-8") {
    score -= 12;
    pumpWithinMonths = 0;
    findings.push({
      id: "pump",
      severity: "fail",
      title: "Overdue for a pump-out",
      detail:
        "At this interval sludge can reach the outlet baffle and seed the field with solids. Pump, then inspect, in that order if the tank is full.",
    });
    actions.push("Pump the tank. Ask the pumper to measure scum and sludge and note baffle condition.");
  } else if (pump === "8+" || pump === "never") {
    score -= 18;
    pumpWithinMonths = 0;
    findings.push({
      id: "pump",
      severity: "fail",
      title: pump === "never" ? "No pump record at all" : "Far past a safe pump interval",
      detail:
        "Solids in the field are how a cheap skip becomes a replacement. Treat pumping as the first appointment, not a nice-to-have.",
    });
    actions.push("Book a pump-out immediately. Do not run a camera or dye test until the tank is opened.");
    certifiedInspect = true;
  } else if (pump === "unknown") {
    score -= 8;
    pumpWithinMonths = Math.min(pumpWithinMonths ?? 36, 6);
    findings.push({
      id: "pump",
      severity: "watch",
      title: "No pumping record",
      detail: "Unknown usually means overdue. Assume it needs a pump until a receipt says otherwise.",
    });
    actions.push("Search for pump receipts. If none, schedule a pump-out and start the file.");
  }

  const inspect = answers.inspect;
  if (inspect === "never" || inspect === "unknown") {
    score -= inspect === "never" ? 10 : 6;
    certifiedInspect = true;
    findings.push({
      id: "inspect",
      severity: inspect === "never" ? "fail" : "watch",
      title: "No professional inspection on file",
      detail:
        "A pump truck can empty a tank without evaluating baffles, the field, or the inlet. That is not an inspection.",
    });
    actions.push("Schedule a certified open-tank inspection with lids off and the field walked.");
  } else if (inspect === "2-5") {
    score -= 3;
    findings.push({
      id: "inspect",
      severity: "info",
      title: "Inspection is aging",
      detail: "A two-to-five-year-old report is a starting point, not current condition.",
    });
  } else {
    findings.push({
      id: "inspect",
      severity: "pass",
      title: "Recently opened",
      detail: "A professional has had lids off in the last two years. Keep that paper with the house file.",
    });
  }

  const symptoms = asList(answers.symptoms);
  const hasNone = symptoms.includes("none") && symptoms.length === 1;
  if (symptoms.includes("backup")) {
    score -= 22;
    findings.push({
      id: "backup",
      severity: "fail",
      title: "History of backup",
      detail:
        "A backup is a system speaking in complete sentences. Limit water use and get a technician on site. This is not a wait-and-see finding.",
    });
    actions.push("Treat backups as urgent. Keep people off the field and book a same-week field visit.");
    certifiedInspect = true;
    pumpWithinMonths = 0;
  }
  if (symptoms.includes("wet")) {
    score -= 16;
    findings.push({
      id: "wet",
      severity: "fail",
      title: "Wet or pooling drainfield",
      detail:
        "Spongy ground or surface effluent is the classic sign of a saturated or broken field. Do not drive on it. Do not plant a garden on it.",
    });
    actions.push("Walk the field with a technician. Dye testing may be needed after the tank is opened.");
    certifiedInspect = true;
  }
  if (symptoms.includes("odor")) {
    score -= 10;
    findings.push({
      id: "odor",
      severity: "fail",
      title: "Sewage odor",
      detail:
        "Odor at the lids can be a dry trap, a cracked pipe, or a tank at capacity. Odor indoors is never cosmetic.",
    });
  }
  if (symptoms.includes("green")) {
    score -= 8;
    findings.push({
      id: "green",
      severity: "watch",
      title: "Unusually green strip over the field",
      detail:
        "A lush stripe is often effluent nitrogen. It can be an early field issue even when the lawn looks 'healthy'.",
    });
  }
  if (symptoms.includes("slow")) {
    score -= 6;
    findings.push({
      id: "slow",
      severity: "watch",
      title: "Slow or gurgling drains",
      detail:
        "Could be a house plumbing clog, or a tank and field that cannot take the flow. Do not keep pouring chemical openers into it.",
    });
  }
  if (hasNone) {
    score += 4;
    findings.push({
      id: "symptoms",
      severity: "pass",
      title: "No surface symptoms reported",
      detail:
        "Quiet ground is good news, not a clean bill. Buried failures still hide without lids off.",
    });
  }

  const habits = asList(answers.habits);
  if (habits.includes("disposal")) {
    score -= 6;
    findings.push({
      id: "disposal",
      severity: "watch",
      title: "Daily garbage disposal",
      detail: "Grinders send extra solids to the tank. Shorten the pump interval by a year.",
    });
    if (pumpWithinMonths && pumpWithinMonths > 0) {
      pumpWithinMonths = Math.min(pumpWithinMonths, 24);
    }
  }
  if (habits.includes("cleaners")) {
    score -= 8;
    findings.push({
      id: "cleaners",
      severity: "fail",
      title: "Chemical drain openers in use",
      detail:
        "Caustic cleaners punch through a clog and then punch through the biology in the tank. Stop. Use a snake, then a technician.",
    });
    actions.push("Stop chemical drain openers. Mechanical clearing only until the system is evaluated.");
  }
  if (habits.includes("softener")) {
    score -= 3;
    findings.push({
      id: "softener",
      severity: "info",
      title: "Softener brine to the tank",
      detail:
        "Salt backwash is hard on some fields. Confirm whether the unit can discharge elsewhere.",
    });
  }
  if (habits.includes("parties")) {
    score -= 3;
    findings.push({
      id: "parties",
      severity: "info",
      title: "Spike loading",
      detail:
        "Rentals and gatherings can swamp a tank that is fine the rest of the year. Time-dosing and extra capacity matter.",
    });
  }

  const site = asList(answers.site);
  if (site.includes("high-water")) {
    score -= 8;
    findings.push({
      id: "high-water",
      severity: "fail",
      title: "High water table or seasonal flooding",
      detail:
        "A saturated field cannot treat effluent. This is a design and siting issue, not just a maintenance one.",
    });
    certifiedInspect = true;
  }
  if (site.includes("driveway")) {
    score -= 7;
    findings.push({
      id: "driveway",
      severity: "fail",
      title: "Traffic over the field",
      detail:
        "Vehicles compact laterals and crush pipe. Keep parking, sheds, and new patio ideas off the drainfield.",
    });
    actions.push("Keep all vehicles and new hardscape off the drainfield. Mark the area.");
  }
  if (site.includes("well")) {
    findings.push({
      id: "well",
      severity: "info",
      title: "Drinking well on the lot",
      detail:
        "Setbacks from well to tank and field are a legal and health issue. A sale inspection should verify distances.",
    });
    certifiedInspect = true;
  }
  if (site.includes("water")) {
    findings.push({
      id: "surface-water",
      severity: "info",
      title: "Surface water nearby",
      detail:
        "A failing field next to a stream is a contamination problem, not just a yard problem.",
    });
  }

  if (answers.purpose === "buy-sell") {
    certifiedInspect = true;
    actions.unshift(
      "Order a certified real-estate inspection before earnest money goes hard. This self-audit is not a substitute.",
    );
  } else if (answers.purpose === "trouble") {
    certifiedInspect = true;
    if (!actions.some((a) => a.toLowerCase().includes("field visit"))) {
      actions.unshift("Book a field inspection this week. Describe the symptoms when you call.");
    }
  } else if (answers.purpose === "unknown") {
    actions.push("Pull county permit records. Start a house file: receipts, sketches, photos of lids.");
  }

  if (certifiedInspect && !actions.some((a) => a.toLowerCase().includes("certified"))) {
    actions.push("A certified inspector should open the tank, walk the field, and write a condition report.");
  }

  if (pumpWithinMonths === 0) {
    actions.push("Pumping is due now, not on the next convenient Saturday.");
  } else if (pumpWithinMonths !== null && pumpWithinMonths <= 12) {
    actions.push(`Plan a pump-out within about ${pumpWithinMonths} months.`);
  }

  score = Math.max(8, Math.min(98, Math.round(score)));

  const uniqueActions = [...new Set(actions)];

  return {
    answers,
    score,
    grade: gradeFor(score),
    findings,
    actions: uniqueActions,
    pumpWithinMonths,
    certifiedInspect,
  };
}

export function newAuditId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  const y = new Date().getFullYear();
  return `SA-${y}-${n}`;
}
