import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ScoreRing } from "@/components/audit/score-ring";
import { SystemSchematic } from "@/components/audit/system-schematic";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GRADE_COPY, scoreAudit } from "@/lib/audit/engine";
import { loadAudit } from "@/lib/audit/store";
import type { AuditResult, Severity } from "@/lib/audit/types";

export const Route = createFileRoute("/report")({ component: ReportPage });

const SAMPLE_ANSWERS = {
  purpose: "buy-sell",
  occupancy: "3-4",
  age: "25-40",
  type: "conventional",
  pump: "5-8",
  inspect: "never",
  symptoms: ["green"],
  habits: ["disposal"],
  site: ["well"],
};

function sampleResult(): AuditResult {
  const scored = scoreAudit(SAMPLE_ANSWERS);
  return {
    ...scored,
    id: "SA-SAMPLE-2204",
    createdAt: "2026-04-12T14:00:00.000Z",
  };
}

const severityTone: Record<Severity, "ok" | "watch" | "fail" | "muted"> = {
  pass: "ok",
  info: "muted",
  watch: "watch",
  fail: "fail",
};

function ReportPage() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isSample, setIsSample] = useState(false);

  useEffect(() => {
    const stored = loadAudit();
    if (stored) {
      setResult(stored);
      setIsSample(false);
    } else {
      setResult(sampleResult());
      setIsSample(true);
    }
  }, []);

  const dated = useMemo(() => {
    if (!result) return "";
    return new Date(result.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [result]);

  if (!result) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted">Opening the ledger…</div>
      </SiteShell>
    );
  }

  const copy = GRADE_COPY[result.grade];

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-start justify-between gap-4 no-print">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-subtle">
              {isSample ? "Sample report" : "Your report"}
            </p>
            <h1 className="mt-2 font-display text-4xl tracking-tight">Septic health ledger</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={() => window.print()}>
              <Printer className="size-4" />
              Print
            </Button>
            <Button asChild>
              <Link to="/book">Book a visit</Link>
            </Button>
          </div>
        </div>

        <header className="mt-8 rounded-lg border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ScoreRing score={result.score} grade={result.grade} className="mx-auto size-32 sm:mx-0" />
            <div className="flex-1">
              <p className="font-mono text-xs tabular-nums text-muted">
                {result.id} · {dated}
              </p>
              <h2 className="mt-1 font-display text-2xl">{copy.label}</h2>
              <p className="mt-1 text-sm text-muted">{copy.kicker}</p>
              <p className="mt-3 text-sm leading-relaxed text-fg">{copy.summary}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
            <Meta
              label="Pump"
              value={
                result.pumpWithinMonths === 0
                  ? "Due now"
                  : result.pumpWithinMonths
                    ? `Within ${result.pumpWithinMonths} mo`
                    : "On cadence"
              }
            />
            <Meta
              label="Certified inspect"
              value={result.certifiedInspect ? "Recommended" : "Optional"}
            />
            <Meta label="Findings" value={`${result.findings.length} on file`} />
          </div>
        </header>

        <div className="mt-8 rounded-lg border border-border bg-surface p-4">
          <p className="px-2 text-xs uppercase tracking-[0.16em] text-subtle">System sketch</p>
          <SystemSchematic grade={result.grade} />
        </div>

        <section className="mt-8">
          <h2 className="font-display text-2xl">Findings</h2>
          <ul className="mt-4 space-y-3">
            {result.findings.map((finding) => (
              <li key={finding.id} className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium">{finding.title}</h3>
                  <Badge tone={severityTone[finding.severity]}>{finding.severity}</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{finding.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        {result.actions.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-2xl">Next actions</h2>
            <ol className="mt-4 space-y-2">
              {result.actions.map((action, i) => (
                <li
                  key={action}
                  className="flex gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm"
                >
                  <span className="font-mono text-xs tabular-nums text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <p className="mt-10 text-xs leading-relaxed text-subtle">
          This ledger is generated from the answers provided
          {isSample ? " (sample data)" : ""}. It is not a certified inspection,
          soil test, or permit. File id {result.id}.
        </p>

        <div className="mt-8 flex flex-col gap-3 no-print sm:flex-row">
          <Button asChild variant="secondary">
            <Link to="/audit">Run the audit again</Link>
          </Button>
          <Button asChild>
            <Link to="/book">Schedule lids-off inspection</Link>
          </Button>
        </div>
      </article>
    </SiteShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
