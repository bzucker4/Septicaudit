import { Resend } from "resend";
import type { MappedAudit } from "./map";
import type { ScoredSnapshot } from "./score";

export type EmailContext = {
  publicId: string;
  mapped: MappedAudit;
  scored: ScoredSnapshot;
  formId: string | null;
  responseId: string | null;
};

/**
 * Fire-and-forget email via Resend.
 * TODO(durable-queue): replace with Netlify Background Functions / a queue for
 * durable retries: enqueueEmailTask({ auditId, publicId }) → worker sends.
 */
export async function sendReportEmail(ctx: EmailContext): Promise<{
  messageId: string | null;
  error: string | null;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_TO_EMAIL;
  if (!apiKey || !to) {
    return { messageId: null, error: "email_not_configured" };
  }

  const resend = new Resend(apiKey);
  const scoreLine =
    ctx.scored.scored && ctx.scored.score !== null
      ? `Score: ${ctx.scored.score} (${ctx.scored.grade})`
      : "Score: n/a (service log — incomplete ledger answers)";

  const photoLines =
    ctx.mapped.photoRefs.length === 0
      ? "None"
      : ctx.mapped.photoRefs.map((p) => `- ${p.name ?? "photo"}: ${p.url}`).join("\n");

  const text = [
    `SepticAudit intake ${ctx.publicId}`,
    scoreLine,
    `Form: ${ctx.formId ?? "unknown"} / response: ${ctx.responseId ?? "unknown"}`,
    "",
    `Address: ${ctx.mapped.propertyAddressLine1}`,
    `City/State/ZIP: ${[ctx.mapped.propertyCity, ctx.mapped.propertyState, ctx.mapped.propertyPostal].filter(Boolean).join(", ")}`,
    `County: ${ctx.mapped.county ?? "—"}`,
    `Contact: ${ctx.mapped.contactName ?? "—"} <${ctx.mapped.contactEmail ?? "—"}> ${ctx.mapped.contactPhone ?? ""}`,
    `Tank size (gal): ${ctx.mapped.tankSizeGallons ?? "—"}`,
    `Gallons pumped: ${ctx.mapped.gallonsPumped ?? "—"}`,
    `Acknowledgment: ${ctx.mapped.acknowledgment}`,
    "",
    "Notes:",
    ctx.mapped.notes ?? "—",
    "",
    "Photo refs:",
    photoLines,
    "",
    "Actions:",
    ...(ctx.scored.actions.length ? ctx.scored.actions.map((a) => `- ${a}`) : ["—"]),
  ].join("\n");

  try {
    const result = await resend.emails.send({
      from: "SepticAudit <reports@septicaudit.com>",
      to: [to],
      subject: `[SepticAudit] ${ctx.publicId} — ${ctx.mapped.propertyAddressLine1}`,
      text,
    });
    if (result.error) {
      return { messageId: null, error: result.error.message };
    }
    return { messageId: result.data?.id ?? null, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "email_send_failed";
    return { messageId: null, error: message };
  }
}

/** Stub for durable async dispatch (Background Function / queue). */
export function enqueueEmailTaskStub(auditId: string, publicId: string): void {
  // TODO: Netlify Background Function or queue → /internal/send-audit-email
  console.info(
    JSON.stringify({
      msg: "email_task_stub",
      auditId,
      publicId,
      note: "Using fire-and-forget sendReportEmail until durable queue is wired",
    }),
  );
}
