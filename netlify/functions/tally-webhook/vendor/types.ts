/**
 * Vendored from src/lib/audit/types.ts for the Cloud Function package.
 * Keep in sync when the client scoring engine changes.
 */
export type Grade = "sound" | "watch" | "risk" | "critical";

export type Severity = "pass" | "info" | "watch" | "fail";

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
};

export type Option = {
  value: string;
  label: string;
  hint?: string;
};

export type Question = {
  id: string;
  title: string;
  body: string;
  type: "single" | "multi";
  options: Option[];
};

export type Answers = Record<string, string | string[]>;

export type AuditResult = {
  id: string;
  createdAt: string;
  answers: Answers;
  score: number;
  grade: Grade;
  findings: Finding[];
  actions: string[];
  pumpWithinMonths: number | null;
  certifiedInspect: boolean;
};
