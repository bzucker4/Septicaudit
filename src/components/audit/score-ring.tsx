import type { Grade } from "@/lib/audit/types";
import { GRADE_COPY } from "@/lib/audit/engine";
import { cn } from "@/lib/utils";

const stroke: Record<Grade, string> = {
  sound: "stroke-primary",
  watch: "stroke-warn",
  risk: "stroke-warn",
  critical: "stroke-danger",
};

export function ScoreRing({
  score,
  grade,
  className,
}: {
  score: number;
  grade: Grade;
  className?: string;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c;

  return (
    <div className={cn("relative grid place-items-center", className)}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          className="fill-none stroke-border"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          className={cn("fill-none", stroke[grade])}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-3xl leading-none tabular-nums text-fg">
            {score}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted">
            {GRADE_COPY[grade].label}
          </div>
        </div>
      </div>
    </div>
  );
}
