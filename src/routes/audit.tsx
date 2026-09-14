import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { newAuditId, scoreAudit } from "@/lib/audit/engine";
import { QUESTIONS } from "@/lib/audit/questions";
import { saveAudit } from "@/lib/audit/store";
import type { Answers } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({ component: AuditPage });

function AuditPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const question = QUESTIONS[step];
  const total = QUESTIONS.length;
  const current = question ? answers[question.id] : undefined;
  const ready = useMemo(() => {
    if (!question) return false;
    if (question.type === "multi") {
      return Array.isArray(current) && current.length > 0;
    }
    return typeof current === "string" && current.length > 0;
  }, [question, current]);

  function selectSingle(value: string) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function toggleMulti(value: string) {
    if (!question) return;
    setAnswers((prev) => {
      const existing = Array.isArray(prev[question.id]) ? [...(prev[question.id] as string[])] : [];
      if (value === "none") {
        return { ...prev, [question.id]: ["none"] };
      }
      const withoutNone = existing.filter((v) => v !== "none");
      const next = withoutNone.includes(value)
        ? withoutNone.filter((v) => v !== value)
        : [...withoutNone, value];
      return { ...prev, [question.id]: next };
    });
  }

  function finish() {
    const scored = scoreAudit(answers);
    const result = {
      ...scored,
      id: newAuditId(),
      createdAt: new Date().toISOString(),
    };
    saveAudit(result);
    void navigate({ to: "/report" });
  }

  function next() {
    if (step >= total - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }

  if (!question) return null;

  const progress = ((step + 1) / total) * 100;

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">Health ledger</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <span className="font-mono tabular-nums">
            {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span>{question.type === "multi" ? "Select all that apply" : "Choose one"}</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h1 className="mt-8 font-display text-3xl tracking-tight sm:text-4xl">{question.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{question.body}</p>

        <ul className="mt-8 space-y-2">
          {question.options.map((option) => {
            const selected =
              question.type === "multi"
                ? Array.isArray(current) && current.includes(option.value)
                : current === option.value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() =>
                    question.type === "multi"
                      ? toggleMulti(option.value)
                      : selectSingle(option.value)
                  }
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-ok-bg"
                      : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                      selected ? "border-primary bg-primary text-primary-fg" : "border-border-strong",
                    )}
                  >
                    {selected ? <Check className="size-3" /> : null}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-fg">{option.label}</span>
                    {option.hint ? (
                      <span className="mt-0.5 block text-xs text-muted">{option.hint}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button type="button" onClick={next} disabled={!ready}>
            {step >= total - 1 ? "Write the report" : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
