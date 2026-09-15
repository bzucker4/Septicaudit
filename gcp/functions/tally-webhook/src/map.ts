import type { Answers } from "./vendor/types";

/**
 * Live Tally form dWyO7y UUID map (service log).
 * Extended form will add contact + ledger UUIDs — plug them into EXTENDED_FIELD_UUIDS.
 */
export const LIVE_FIELD_UUIDS = {
  address: "618aab43-3754-4d8d-8831-7e7c674445cd",
  cityStateZip: "58ad7818-21d3-482d-ad85-ea64126b25fe",
  tankSize: "19bb0248-ab9f-4fd5-987b-94de94963c36",
  gallons: "776270f1-b4b1-4817-bd97-35d7abd211eb",
  notes: "b98cbafe-6134-4dc6-9083-533d8233d37c",
  photos: "d6fd7ef2-5f79-40d4-9f33-aefd768bad15",
  acknowledgment: "90c5e9a3-16a3-41a1-ac6a-a6dd7e154df5",
} as const;

/** Placeholder UUIDs for the extended ledger form — set when fields are added in Tally. */
export const EXTENDED_FIELD_UUIDS: Record<string, string | null> = {
  contactName: null,
  contactEmail: null,
  contactPhone: null,
  contactRole: null,
  county: null,
  purpose: null,
  occupancy: null,
  age: null,
  type: null,
  pump: null,
  inspect: null,
  symptoms: null,
  habits: null,
  site: null,
  parcelId: null,
};

export type PhotoRef = {
  id?: string;
  name?: string;
  url: string;
  mimeType?: string;
  size?: number;
};

export type MappedAudit = {
  propertyAddressLine1: string;
  propertyAddressLine2: string | null;
  propertyCity: string | null;
  propertyState: string;
  propertyPostal: string | null;
  county: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactRole: string | null;
  tankSizeGallons: number | null;
  gallonsPumped: number | null;
  tankCondition: string | null;
  notes: string | null;
  photoRefs: PhotoRef[];
  acknowledgment: boolean | null;
  answers: Answers;
  occupancy: string | null;
  symptoms: string[];
};

export type TallyField = {
  key?: string;
  label?: string;
  type?: string;
  value?: unknown;
  options?: Array<{ id: string; text: string }>;
};

export type TallyWebhookPayload = {
  eventId?: string;
  eventType?: string;
  createdAt?: string;
  data?: {
    responseId?: string;
    submissionId?: string;
    formId?: string;
    formName?: string;
    createdAt?: string;
    fields?: TallyField[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const ENGINE_ENUMS: Record<string, Set<string>> = {
  purpose: new Set(["buy-sell", "maintenance", "trouble", "unknown"]),
  occupancy: new Set(["1-2", "3-4", "5+", "seasonal"]),
  age: new Set(["under-10", "10-25", "25-40", "40+", "unknown"]),
  type: new Set(["conventional", "mound", "aerobic", "holding", "unknown"]),
  pump: new Set(["under-3", "3-5", "5-8", "8+", "never", "unknown"]),
  inspect: new Set(["under-2", "2-5", "never", "unknown"]),
  symptoms: new Set(["none", "slow", "odor", "wet", "green", "backup"]),
  habits: new Set(["typical", "disposal", "softener", "cleaners", "parties"]),
  site: new Set(["none", "well", "water", "high-water", "driveway"]),
};

const WNY_COUNTIES = new Set([
  "erie",
  "niagara",
  "genesee",
  "orleans",
  "wyoming",
  "cattaraugus",
  "chautauqua",
  "allegany",
  "other",
]);

function extractUuid(keyOrId: string | undefined): string | null {
  if (!keyOrId) return null;
  const m = keyOrId.match(UUID_RE);
  return m ? m[0].toLowerCase() : null;
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t.length ? t : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function resolveOptionTexts(field: TallyField): string[] {
  const value = field.value;
  const options = field.options ?? [];
  const byId = new Map(options.map((o) => [o.id, o.text]));

  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === "string") return byId.get(v) ?? v;
        return asText(v);
      })
      .filter((x): x is string => !!x);
  }
  if (typeof value === "string") {
    return [byId.get(value) ?? value];
  }
  if (typeof value === "boolean") {
    return value ? ["true"] : [];
  }
  return [];
}

function normalizeLabel(label: string | undefined): string {
  return (label ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function parseCityStateZip(raw: string | null): {
  city: string | null;
  state: string;
  postal: string | null;
} {
  if (!raw) return { city: null, state: "NY", postal: null };

  // "Buffalo, NY 14201" | "Buffalo NY 14201" | "14201"
  const postalMatch = raw.match(/\b(\d{5}(?:-\d{4})?)\b/);
  const postal = postalMatch ? postalMatch[1] : null;
  const stateMatch = raw.match(/\b([A-Za-z]{2})\b(?=\s*\d{5}|\s*$|,)/);
  let state = "NY";
  if (stateMatch) {
    state = stateMatch[1].toUpperCase();
  }
  let cityPart = raw;
  if (postalMatch) cityPart = cityPart.replace(postalMatch[0], " ");
  if (stateMatch) cityPart = cityPart.replace(new RegExp(`\\b${stateMatch[1]}\\b`, "i"), " ");
  cityPart = cityPart.replace(/[,\s]+/g, " ").trim();
  return { city: cityPart || null, state, postal };
}

function mapCounty(raw: string | null): string | null {
  if (!raw) return null;
  const n = raw.toLowerCase().replace(/\s+county$/, "").trim();
  // Only clear WNY county names (and explicit "other"); city labels like "Buffalo" stay null.
  if (WNY_COUNTIES.has(n)) return n;
  return null;
}

function coerceEngineValue(
  key: string,
  texts: string[],
): string | string[] | undefined {
  const allowed = ENGINE_ENUMS[key];
  if (!allowed) return undefined;

  const multi = key === "symptoms" || key === "habits" || key === "site";
  const mapped: string[] = [];

  for (const t of texts) {
    const slug = t
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9+\-]/g, "");

    // Direct match
    if (allowed.has(t)) {
      mapped.push(t);
      continue;
    }
    if (allowed.has(slug)) {
      mapped.push(slug);
      continue;
    }

    // Heuristic label → engine value
    const hit = heuristicEngineValue(key, t);
    if (hit && allowed.has(hit)) mapped.push(hit);
  }

  if (!mapped.length) return undefined;
  if (multi) {
    let vals = [...new Set(mapped)];
    if (vals.includes("none") && vals.length > 1) {
      vals = vals.filter((v) => v !== "none");
    }
    return vals;
  }
  return mapped[0];
}

function heuristicEngineValue(key: string, label: string): string | undefined {
  const l = label.toLowerCase();
  if (key === "purpose") {
    if (l.includes("buy") || l.includes("sell") || l.includes("real estate")) return "buy-sell";
    if (l.includes("trouble") || l.includes("problem") || l.includes("off")) return "trouble";
    if (l.includes("maintenance") || l.includes("routine")) return "maintenance";
    if (l.includes("inherit") || l.includes("unknown") || l.includes("barely")) return "unknown";
  }
  if (key === "occupancy") {
    if (l.includes("seasonal") || l.includes("weekend")) return "seasonal";
    if (/\b5\b/.test(l) || l.includes("five") || l.includes("more")) return "5+";
    if (/\b3\b/.test(l) || /\b4\b/.test(l) || l.includes("three") || l.includes("four")) return "3-4";
    if (/\b1\b/.test(l) || /\b2\b/.test(l) || l.includes("one") || l.includes("two")) return "1-2";
  }
  if (key === "age") {
    if (l.includes("under 10") || l.includes("under-10") || l.startsWith("under")) return "under-10";
    if (l.includes("10 to 25") || l.includes("10-25")) return "10-25";
    if (l.includes("25 to 40") || l.includes("25-40")) return "25-40";
    if (l.includes("40") || l.includes("more than")) return "40+";
    if (l.includes("no idea") || l.includes("unknown")) return "unknown";
  }
  if (key === "type") {
    if (l.includes("conventional") || l.includes("tank and drain")) return "conventional";
    if (l.includes("mound") || l.includes("raised")) return "mound";
    if (l.includes("aerobic")) return "aerobic";
    if (l.includes("holding")) return "holding";
    if (l.includes("unknown")) return "unknown";
  }
  if (key === "pump") {
    if (l.includes("within") && l.includes("3")) return "under-3";
    if (l.includes("3 to 5") || l.includes("3-5")) return "3-5";
    if (l.includes("5 to 8") || l.includes("5-8")) return "5-8";
    if (l.includes("more than 8") || l.includes("8+")) return "8+";
    if (l.includes("never")) return "never";
    if (l.includes("no record") || l.includes("unknown")) return "unknown";
  }
  if (key === "inspect") {
    if (l.includes("within") && l.includes("2")) return "under-2";
    if (l.includes("2 to 5") || l.includes("2-5")) return "2-5";
    if (l.includes("never")) return "never";
    if (l.includes("no record") || l.includes("unknown")) return "unknown";
  }
  if (key === "symptoms") {
    if (l.includes("nothing") || l === "none") return "none";
    if (l.includes("backup")) return "backup";
    if (l.includes("wet") || l.includes("pool")) return "wet";
    if (l.includes("odor") || l.includes("smell")) return "odor";
    if (l.includes("green") || l.includes("lush")) return "green";
    if (l.includes("slow") || l.includes("gurg")) return "slow";
  }
  if (key === "habits") {
    if (l.includes("ordinary") || l.includes("typical")) return "typical";
    if (l.includes("disposal") || l.includes("grinder")) return "disposal";
    if (l.includes("softener") || l.includes("brine")) return "softener";
    if (l.includes("chemical") || l.includes("opener") || l.includes("cleaner")) return "cleaners";
    if (l.includes("gather") || l.includes("rental") || l.includes("parties") || l.includes("spike")) return "parties";
  }
  if (key === "site") {
    if (l.includes("nothing notable") || l === "none") return "none";
    if (l.includes("well")) return "well";
    if (l.includes("stream") || l.includes("pond") || l.includes("ditch") || l.includes("surface")) return "water";
    if (l.includes("high water") || l.includes("flood")) return "high-water";
    if (l.includes("driveway") || l.includes("patio") || l.includes("vehicle")) return "driveway";
  }
  return undefined;
}

function isAcknowledgment(value: unknown, field: TallyField): boolean | null {
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") {
    const t = value.toLowerCase();
    if (["true", "yes", "1", "acknowledged", "on"].includes(t)) return true;
    if (["false", "no", "0", "off"].includes(t)) return false;
  }
  const texts = resolveOptionTexts(field);
  if (!texts.length) return null;
  return true;
}

function photoRefsFromValue(value: unknown): PhotoRef[] {
  if (!Array.isArray(value)) return [];
  const out: PhotoRef[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const url = asText(o.url);
    if (!url) continue;
    out.push({
      id: asText(o.id) ?? undefined,
      name: asText(o.name) ?? undefined,
      url,
      mimeType: asText(o.mimeType) ?? undefined,
      size: asNumber(o.size) ?? undefined,
    });
  }
  return out;
}

function fieldMatchesUuid(field: TallyField, uuid: string): boolean {
  const u = uuid.toLowerCase();
  return (
    extractUuid(field.key) === u ||
    (typeof field.key === "string" && field.key.toLowerCase().includes(u))
  );
}

function findByUuid(fields: TallyField[], uuid: string | null | undefined): TallyField | undefined {
  if (!uuid) return undefined;
  return fields.find((f) => fieldMatchesUuid(f, uuid));
}

function findByLabel(
  fields: TallyField[],
  predicates: Array<(label: string) => boolean>,
): TallyField | undefined {
  for (const pred of predicates) {
    const hit = fields.find((f) => pred(normalizeLabel(f.label)));
    if (hit) return hit;
  }
  return undefined;
}

/**
 * Map a Tally FORM_RESPONSE payload into typed audit columns + engine answers.
 * UUID map wins; label heuristics fill contact/ledger gaps for the extended form.
 */
export function mapTallyPayload(payload: TallyWebhookPayload): MappedAudit {
  const fields = payload.data?.fields ?? [];

  const addressField =
    findByUuid(fields, LIVE_FIELD_UUIDS.address) ??
    findByLabel(fields, [
      (l) => l.includes("property address") || l === "address" || l.includes("street"),
    ]);

  const cszField =
    findByUuid(fields, LIVE_FIELD_UUIDS.cityStateZip) ??
    findByLabel(fields, [
      (l) => l.includes("city") && (l.includes("state") || l.includes("zip")),
      (l) => l === "city, state, zip" || l === "city state zip",
    ]);

  const tankSizeField =
    findByUuid(fields, LIVE_FIELD_UUIDS.tankSize) ??
    findByLabel(fields, [(l) => l.includes("tank size") || l.includes("tank capacity")]);

  const gallonsField =
    findByUuid(fields, LIVE_FIELD_UUIDS.gallons) ??
    findByLabel(fields, [(l) => l.includes("gallons pumped") || l === "gallons"]);

  const notesField =
    findByUuid(fields, LIVE_FIELD_UUIDS.notes) ??
    findByLabel(fields, [
      (l) => l.includes("observation") || l.includes("notes") || l.includes("tank condition"),
    ]);

  const photosField =
    findByUuid(fields, LIVE_FIELD_UUIDS.photos) ??
    findByLabel(fields, [(l) => l.includes("photo") || l.includes("file upload") || l.includes("attach")]);

  const ackField =
    findByUuid(fields, LIVE_FIELD_UUIDS.acknowledgment) ??
    findByLabel(fields, [(l) => l.includes("acknowledg")]);

  // Contact / extended — UUID placeholders first, then label heuristics
  const nameField =
    findByUuid(fields, EXTENDED_FIELD_UUIDS.contactName) ??
    findByLabel(fields, [
      (l) => l === "name" || l.includes("full name") || l.includes("contact name") || l.includes("your name"),
    ]);

  const emailField =
    findByUuid(fields, EXTENDED_FIELD_UUIDS.contactEmail) ??
    findByLabel(fields, [(l) => l.includes("email")]);

  const phoneField =
    findByUuid(fields, EXTENDED_FIELD_UUIDS.contactPhone) ??
    findByLabel(fields, [(l) => l.includes("phone") || l.includes("mobile") || l.includes("cell")]);

  const roleField =
    findByUuid(fields, EXTENDED_FIELD_UUIDS.contactRole) ??
    findByLabel(fields, [(l) => l.includes("role") || l.includes("i am a") || l.includes("your role")]);

  const countyField =
    findByUuid(fields, EXTENDED_FIELD_UUIDS.county) ??
    findByLabel(fields, [(l) => l.includes("county")]);

  const csz = parseCityStateZip(asText(cszField?.value));

  const answers: Answers = {};
  const ledgerKeys = [
    "purpose",
    "occupancy",
    "age",
    "type",
    "pump",
    "inspect",
    "symptoms",
    "habits",
    "site",
  ] as const;

  for (const key of ledgerKeys) {
    const uuid = EXTENDED_FIELD_UUIDS[key];
    let field = findByUuid(fields, uuid);
    if (!field) {
      field = findByLabel(fields, [(l) => labelLooksLikeLedger(key, l)]);
    }
    if (!field) continue;
    const texts = resolveOptionTexts(field);
    const coerced = coerceEngineValue(key, texts.length ? texts : [asText(field.value) ?? ""].filter(Boolean));
    if (coerced !== undefined) answers[key] = coerced;
  }

  const occupancyRaw = answers.occupancy;
  const occupancy =
    typeof occupancyRaw === "string"
      ? occupancyRaw
      : Array.isArray(occupancyRaw)
        ? occupancyRaw[0] ?? null
        : null;

  let symptoms: string[] = [];
  if (Array.isArray(answers.symptoms)) symptoms = answers.symptoms as string[];
  else if (typeof answers.symptoms === "string") symptoms = [answers.symptoms];

  const notes = asText(notesField?.value);

  return {
    propertyAddressLine1: asText(addressField?.value) ?? "",
    propertyAddressLine2: null,
    propertyCity: csz.city,
    propertyState: csz.state,
    propertyPostal: csz.postal,
    county: mapCounty(
      countyField
        ? (resolveOptionTexts(countyField)[0] ?? asText(countyField.value))
        : null,
    ),
    contactName: asText(nameField?.value),
    contactEmail: asText(emailField?.value)?.toLowerCase() ?? null,
    contactPhone: asText(phoneField?.value),
    contactRole: asText(roleField?.value),
    tankSizeGallons: asNumber(tankSizeField?.value),
    gallonsPumped: asNumber(gallonsField?.value),
    tankCondition: notes,
    notes,
    photoRefs: photoRefsFromValue(photosField?.value),
    acknowledgment: ackField ? isAcknowledgment(ackField.value, ackField) : null,
    answers,
    occupancy,
    symptoms,
  };
}

function labelLooksLikeLedger(key: string, label: string): boolean {
  if (label === key) return true;
  switch (key) {
    case "purpose":
      return label.includes("bring") || label.includes("purpose") || label.includes("reason");
    case "occupancy":
      return label.includes("occupancy") || label.includes("how many people") || label.includes("live there");
    case "age":
      return (
        label === "age" ||
        label.includes("how old") ||
        label.includes("system age") ||
        (label.includes("age") && label.includes("system"))
      );
    case "type":
      return (
        label === "type" ||
        label.includes("kind of system") ||
        label.includes("system type") ||
        label.includes("what kind")
      );
    case "pump":
      return (
        label.includes("last pumped") ||
        (label.includes("pump") && !label.includes("gallons") && !label.includes("size"))
      );
    case "inspect":
      return (
        label === "inspect" ||
        label.includes("opened by") ||
        label.includes("last inspection") ||
        label.includes("professional")
      );
    case "symptoms":
      return label.includes("seeing") || label.includes("smelling") || label.includes("symptom");
    case "habits":
      return label.includes("goes down") || label.includes("habits") || label.includes("disposal");
    case "site":
      return (
        label === "site" ||
        label.includes("near the system") ||
        label.includes("what sits near") ||
        (label.includes("well") && label.includes("stream"))
      );
    default:
      return false;
  }
}

export function validateMapped(mapped: MappedAudit): { ok: true } | { ok: false; status: number; error: string } {
  if (!mapped.propertyAddressLine1.trim()) {
    return { ok: false, status: 422, error: "missing_property_address" };
  }
  if (mapped.propertyAddressLine1.length > 500) {
    return { ok: false, status: 422, error: "address_too_long" };
  }

  // Photos hard-required (empty array → 422).
  if (!mapped.photoRefs.length) {
    return { ok: false, status: 422, error: "photos_required" };
  }

  // Service-log path (live dWyO7y): tank / gallons / notes / acknowledgment.
  if (mapped.tankSizeGallons === null || !(mapped.tankSizeGallons > 0)) {
    return { ok: false, status: 422, error: "invalid_tank_size_gallons" };
  }
  if (mapped.gallonsPumped === null || mapped.gallonsPumped < 0) {
    return { ok: false, status: 422, error: "invalid_gallons_pumped" };
  }
  if (!mapped.notes || !mapped.notes.trim()) {
    return { ok: false, status: 422, error: "notes_required" };
  }
  if (mapped.notes.length > 20000) {
    return { ok: false, status: 422, error: "notes_too_long" };
  }
  if (mapped.acknowledgment !== true) {
    return { ok: false, status: 422, error: "acknowledgment_required" };
  }

  return { ok: true };
}
