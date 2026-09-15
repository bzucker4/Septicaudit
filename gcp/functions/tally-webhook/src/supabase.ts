import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { MappedAudit } from "./map";
import type { ScoredSnapshot } from "./score";

export type AuditInsertRow = {
  public_id: string;
  source: "tally_webhook";
  tally_event_id: string | null;
  tally_response_id: string | null;
  tally_form_id: string | null;
  request_idempotency_key: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_role: string | null;
  property_address_line1: string;
  property_address_line2: string | null;
  property_city: string | null;
  property_state: string;
  property_postal: string | null;
  county: string | null;
  answers: Record<string, unknown>;
  tank_condition: string | null;
  occupancy: string | null;
  symptoms: string[];
  score: number | null;
  grade: string | null;
  findings: unknown[];
  actions: string[];
  pump_within_months: number | null;
  certified_inspect: boolean;
  engine_version: string;
  raw_payload: Record<string, unknown>;
  tank_size_gallons: number | null;
  gallons_pumped: number | null;
  photo_refs: unknown[];
  acknowledgment: boolean | null;
};

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("missing_supabase_env");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function buildInsertRow(input: {
  publicId: string;
  mapped: MappedAudit;
  scored: ScoredSnapshot;
  tallyEventId: string | null;
  tallyResponseId: string | null;
  tallyFormId: string | null;
  requestIdempotencyKey: string;
  rawPayload: Record<string, unknown>;
}): AuditInsertRow {
  return {
    public_id: input.publicId,
    source: "tally_webhook",
    tally_event_id: input.tallyEventId,
    tally_response_id: input.tallyResponseId,
    tally_form_id: input.tallyFormId,
    request_idempotency_key: input.requestIdempotencyKey,
    contact_name: input.mapped.contactName,
    contact_email: input.mapped.contactEmail,
    contact_phone: input.mapped.contactPhone,
    contact_role: input.mapped.contactRole,
    property_address_line1: input.mapped.propertyAddressLine1,
    property_address_line2: input.mapped.propertyAddressLine2,
    property_city: input.mapped.propertyCity,
    property_state: input.mapped.propertyState,
    property_postal: input.mapped.propertyPostal,
    county: input.mapped.county,
    answers: input.mapped.answers,
    tank_condition: input.mapped.tankCondition,
    occupancy: input.mapped.occupancy,
    symptoms: input.mapped.symptoms,
    score: input.scored.score,
    grade: input.scored.grade,
    findings: input.scored.findings,
    actions: input.scored.actions,
    pump_within_months: input.scored.pumpWithinMonths,
    certified_inspect: input.scored.certifiedInspect,
    engine_version: "1",
    raw_payload: input.rawPayload,
    tank_size_gallons: input.mapped.tankSizeGallons,
    gallons_pumped: input.mapped.gallonsPumped,
    photo_refs: input.mapped.photoRefs,
    acknowledgment: input.mapped.acknowledgment,
  };
}

export async function insertAudit(
  client: SupabaseClient,
  row: AuditInsertRow,
): Promise<{ id: string; publicId: string; duplicate: boolean }> {
  const { data, error } = await client
    .from("audits")
    .insert(row)
    .select("id, public_id")
    .single();

  if (error) {
    throw Object.assign(new Error(error.message), {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  return { id: data.id as string, publicId: data.public_id as string, duplicate: false };
}

export async function findExistingByIdempotency(
  client: SupabaseClient,
  keys: {
    tallyEventId: string | null;
    tallyResponseId: string | null;
    requestIdempotencyKey: string;
  },
): Promise<{ id: string; publicId: string; emailDispatchedAt: string | null } | null> {
  if (keys.tallyEventId) {
    const { data } = await client
      .from("audits")
      .select("id, public_id, email_dispatched_at")
      .eq("tally_event_id", keys.tallyEventId)
      .maybeSingle();
    if (data) {
      return {
        id: data.id,
        publicId: data.public_id,
        emailDispatchedAt: data.email_dispatched_at,
      };
    }
  }
  if (keys.tallyResponseId) {
    const { data } = await client
      .from("audits")
      .select("id, public_id, email_dispatched_at")
      .eq("tally_response_id", keys.tallyResponseId)
      .maybeSingle();
    if (data) {
      return {
        id: data.id,
        publicId: data.public_id,
        emailDispatchedAt: data.email_dispatched_at,
      };
    }
  }
  const { data } = await client
    .from("audits")
    .select("id, public_id, email_dispatched_at")
    .eq("request_idempotency_key", keys.requestIdempotencyKey)
    .maybeSingle();
  if (data) {
    return {
      id: data.id,
      publicId: data.public_id,
      emailDispatchedAt: data.email_dispatched_at,
    };
  }
  return null;
}

export async function markEmailResult(
  client: SupabaseClient,
  auditId: string,
  result: { messageId: string | null; error: string | null },
): Promise<void> {
  const patch: Record<string, unknown> = {
    email_error: result.error,
  };
  if (result.messageId && !result.error) {
    patch.email_dispatched_at = new Date().toISOString();
    patch.email_message_id = result.messageId;
  }
  await client.from("audits").update(patch).eq("id", auditId);
}
