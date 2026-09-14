import type { Setback } from "@/lib/standards";
import { setbackFeet } from "@/lib/standards";
import { cn } from "@/lib/utils";

export function LotPlan({
  setback,
  useNy,
  className,
}: {
  setback: Setback;
  useNy: boolean;
  className?: string;
}) {
  const tankFt = setbackFeet(setback, useNy, "tank");
  const fieldFt = setbackFeet(setback, useNy, "field");
  const pitFt = setbackFeet(setback, useNy, "pit");
  const highlight = setback.id;
  const source = setback.source === "table2" ? "75-A TABLE 2" : "CONSTRUCTION PRACTICE";

  return (
    <svg
      viewBox="0 0 640 280"
      className={cn("w-full text-fg", className)}
      role="img"
      aria-label={`Lot plan. Tank ${tankFt} feet and field ${fieldFt} feet from ${setback.feature}.`}
    >
      <rect x="8" y="8" width="624" height="264" rx="8" className="fill-bg stroke-border" strokeWidth="1" />

      <rect x="36" y="48" width="88" height="64" rx="4" className="fill-surface stroke-fg" strokeWidth="1.5" />
      <path d="M32 52 L80 22 L128 52" className="fill-none stroke-fg" strokeWidth="1.5" />
      <text x="52" y="86" fontSize="11" className="fill-muted" fontFamily="Figtree, sans-serif">
        HOUSE
      </text>

      <rect
        x="168"
        y="64"
        width="70"
        height="44"
        rx="6"
        className={highlight === "house" ? "fill-ok-bg stroke-primary" : "fill-surface stroke-primary"}
        strokeWidth="1.7"
      />
      <text x="182" y="90" fontSize="11" className="fill-primary" fontFamily="Figtree, sans-serif">
        TANK
      </text>

      <g className={highlight === "house" || highlight === "drive" ? "stroke-primary" : "stroke-fg"}>
        <path d="M238 86 H280" strokeWidth="2" />
        <path d="M280 70 H430" strokeWidth="3" />
        <path d="M280 86 H430" strokeWidth="3" />
        <path d="M280 102 H430" strokeWidth="3" />
        <path d="M280 118 H430" strokeWidth="3" />
        <path d="M280 70 V118" strokeWidth="2" />
      </g>
      <text x="318" y="58" fontSize="11" className="fill-muted" fontFamily="Figtree, sans-serif">
        FIELD
      </text>

      <rect
        x="448"
        y="168"
        width="44"
        height="52"
        rx="4"
        className={highlight === "well" || highlight === "public-well" ? "fill-surface stroke-primary" : "fill-surface-2 stroke-border"}
        strokeWidth="1.4"
        strokeDasharray="3 3"
      />
      <text x="452" y="198" fontSize="9" className="fill-muted" fontFamily="Figtree, sans-serif">
        PIT
      </text>

      <circle
        cx="88"
        cy="200"
        r="16"
        className={highlight === "well" || highlight === "public-well" ? "fill-ok-bg stroke-primary" : "fill-surface stroke-border-strong"}
        strokeWidth="1.6"
      />
      <text x="76" y="230" fontSize="11" className="fill-muted" fontFamily="Figtree, sans-serif">
        WELL
      </text>

      <path
        d="M500 36 C 520 80, 490 120, 530 160 C 560 196, 510 230, 548 252"
        className={highlight === "stream" ? "stroke-primary" : "stroke-border-strong"}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <text x="552" y="150" fontSize="11" className="fill-muted" fontFamily="Figtree, sans-serif">
        WATER
      </text>

      <path d="M36 248 H220" className="stroke-border-strong" strokeWidth="6" />
      <text x="36" y="268" fontSize="11" className="fill-muted" fontFamily="Figtree, sans-serif">
        DRIVE
      </text>

      <text x="168" y="148" fontSize="12" className="fill-primary" fontFamily="IBM Plex Mono, monospace">
        {tankFt} ft tank
      </text>
      <text x="280" y="148" fontSize="12" className="fill-primary" fontFamily="IBM Plex Mono, monospace">
        {fieldFt} ft field
      </text>
      <text x="448" y="236" fontSize="11" className="fill-muted" fontFamily="IBM Plex Mono, monospace">
        {pitFt} ft pit
      </text>
      <text x="36" y="36" fontSize="11" className="fill-subtle" fontFamily="Figtree, sans-serif">
        {setback.feature.toUpperCase()} · {source}
      </text>
    </svg>
  );
}

export function TrenchPlan({
  count,
  each,
  width,
  className,
}: {
  count: number;
  each: number;
  width: number;
  className?: string;
}) {
  const n = Math.min(8, count);
  const gap = 18;
  const top = 52;
  const left = 48;
  const bar = 420;

  return (
    <svg
      viewBox="0 0 520 200"
      className={cn("w-full text-fg", className)}
      role="img"
      aria-label={`${count} laterals, about ${each} feet each, ${width} feet wide.`}
    >
      <rect x="8" y="8" width="504" height="184" rx="8" className="fill-bg stroke-border" strokeWidth="1" />
      <text x="20" y="28" fontSize="11" className="fill-muted" fontFamily="Figtree, sans-serif">
        D-BOX
      </text>
      <rect
        x="20"
        y="40"
        width="22"
        height={Math.max(36, n * gap)}
        rx="3"
        className="fill-surface stroke-border-strong"
        strokeWidth="1.4"
      />
      {Array.from({ length: n }).map((_, i) => {
        const y = top + i * gap;
        return (
          <g key={i}>
            <line x1="42" y1={y} x2={left} y2={y} className="stroke-fg" strokeWidth="1.5" />
            <line
              x1={left}
              y1={y}
              x2={left + bar}
              y2={y}
              className="stroke-primary"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        );
      })}
      <text x={left} y="178" fontSize="11" className="fill-muted" fontFamily="IBM Plex Mono, monospace">
        {n} × {each} ft · {width} ft wide{width > 2 ? " · not NY 75-A" : ""}
      </text>
    </svg>
  );
}
