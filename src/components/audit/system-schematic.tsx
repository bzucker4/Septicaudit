import type { Grade } from "@/lib/audit/types";
import { cn } from "@/lib/utils";

const fieldFill: Record<Grade, string> = {
  sound: "fill-ok-bg stroke-primary",
  watch: "fill-warn-bg stroke-warn",
  risk: "fill-warn-bg stroke-danger",
  critical: "fill-danger-bg stroke-danger",
};

export function SystemSchematic({
  grade = "watch",
  className,
}: {
  grade?: Grade;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 640 220"
      className={cn("w-full text-fg", className)}
      role="img"
      aria-label="Septic tank and drainfield schematic"
    >
      <text x="24" y="28" className="fill-muted" fontSize="11" fontFamily="Figtree, sans-serif">
        HOUSE
      </text>
      <rect x="24" y="40" width="72" height="56" rx="4" className="fill-surface stroke-border-strong" strokeWidth="1.5" />
      <path d="M20 44 L60 18 L100 44" className="fill-none stroke-fg" strokeWidth="1.5" />
      <path d="M96 88 H150" className="stroke-fg" strokeWidth="2" />
      <text x="150" y="28" className="fill-muted" fontSize="11" fontFamily="Figtree, sans-serif">
        TANK
      </text>
      <rect x="150" y="56" width="150" height="88" rx="10" className="fill-surface stroke-primary" strokeWidth="2" />
      <path d="M225 56 V144" className="stroke-primary" strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx="188" cy="100" r="14" className="fill-ok-bg stroke-primary" strokeWidth="1.5" />
      <circle cx="262" cy="100" r="14" className="fill-ok-bg stroke-primary" strokeWidth="1.5" />
      <text x="181" y="104" fontSize="9" className="fill-primary" fontFamily="Figtree, sans-serif">
        1
      </text>
      <text x="256" y="104" fontSize="9" className="fill-primary" fontFamily="Figtree, sans-serif">
        2
      </text>
      <path d="M300 100 H348" className="stroke-fg" strokeWidth="2" />
      <rect x="348" y="88" width="36" height="24" rx="3" className="fill-surface stroke-border-strong" strokeWidth="1.5" />
      <text x="352" y="80" className="fill-muted" fontSize="10" fontFamily="Figtree, sans-serif">
        D-BOX
      </text>
      <text x="410" y="28" className="fill-muted" fontSize="11" fontFamily="Figtree, sans-serif">
        DRAINFIELD
      </text>
      <g className={fieldFill[grade]}>
        <path d="M410 70 H610" strokeWidth="3" />
        <path d="M410 100 H610" strokeWidth="3" />
        <path d="M410 130 H610" strokeWidth="3" />
        <path d="M410 160 H610" strokeWidth="3" />
      </g>
      <path d="M384 100 H410" className="stroke-fg" strokeWidth="2" />
      <path d="M410 70 V160" className="stroke-fg" strokeWidth="2" />
    </svg>
  );
}
