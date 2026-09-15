import { scoreAudit } from "./vendor/engine";
import type { Answers, AuditResult, Grade } from "./vendor/types";

/** Ledger keys required before we trust a server-side score. */
export const LEDGER_KEYS = [
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

export function hasFullLedgerAnswers(answers: Answers): boolean {
  return LEDGER_KEYS.every((key) => {
    const v = answers[key];
    if (v === undefined || v === null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    return Array.isArray(v);
  });
}

export type ScoredSnapshot = {
  score: number | null;
  grade: Grade | null;
  findings: AuditResult["findings"];
  actions: string[];
  pumpWithinMonths: number | null;
  certifiedInspect: boolean;
  scored: boolean;
};

/**
 * NEVER trust a wire/client score. Recompute only when the full ledger is present;
 * otherwise leave score/grade null (service-log-only submissions).
 */
export function recomputeScore(answers: Answers): ScoredSnapshot {
  if (!hasFullLedgerAnswers(answers)) {
    return {
      score: null,
      grade: null,
      findings: [],
      actions: [],
      pumpWithinMonths: null,
      certifiedInspect: false,
      scored: false,
    };
  }

  const result = scoreAudit(answers);
  return {
    score: result.score,
    grade: result.grade,
    findings: result.findings,
    actions: result.actions,
    pumpWithinMonths: result.pumpWithinMonths,
    certifiedInspect: result.certifiedInspect,
    scored: true,
  };
}

export type { Answers, Grade };
export { scoreAudit };
