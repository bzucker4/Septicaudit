import { cn } from "@/lib/utils";

const SCALE = 22;
const GRADE_Y = 40;
const LEFT = 48;
const RIGHT = 300;

function yAt(ft: number) {
  return GRADE_Y + ft * SCALE;
}

export function SoilProfile({
  shwtFt,
  rockFt,
  className,
}: {
  shwtFt: number;
  rockFt: number;
  className?: string;
}) {
  const trenchBottom = 2;
  const waterOk = shwtFt >= trenchBottom + 2;
  const rockOk = rockFt >= trenchBottom + 4;
  const maxFt = Math.max(9, rockFt + 0.8, shwtFt + 0.8);
  const height = GRADE_Y + maxFt * SCALE + 28;

  const trenchY = yAt(trenchBottom);
  const waterY = yAt(shwtFt);
  const rockY = yAt(rockFt);
  const sepWater = shwtFt - trenchBottom;
  const sepRock = rockFt - trenchBottom;
  const waterLabelY = waterY - 8;
  const rockLabelY = Math.abs(rockY - waterY) < 22 ? rockY + 16 : rockY + 14;

  return (
    <svg
      viewBox={`0 0 520 ${height}`}
      className={cn("w-full text-fg", className)}
      role="img"
      aria-label={`Soil profile. Seasonal high water at ${shwtFt} feet. Bedrock at ${rockFt} feet.`}
    >
      <rect x="8" y="8" width="504" height={height - 16} rx="8" className="fill-bg stroke-border" strokeWidth="1" />

      <text x="24" y="28" fontSize="11" className="fill-subtle" fontFamily="Figtree, sans-serif">
        ORIGINAL GRADE
      </text>
      <path d={`M${LEFT} ${GRADE_Y} H496`} className="stroke-fg" strokeWidth="1.5" />

      <rect
        x={LEFT}
        y={GRADE_Y}
        width="72"
        height={trenchBottom * SCALE}
        className="fill-ok-bg stroke-primary"
        strokeWidth="1.5"
      />
      <text
        x={LEFT + 8}
        y={GRADE_Y + trenchBottom * SCALE * 0.62}
        fontSize="10"
        className="fill-primary"
        fontFamily="Figtree, sans-serif"
      >
        24-in trench
      </text>

      <path
        d={`M${LEFT} ${waterY} H496`}
        className={waterOk ? "stroke-primary" : "stroke-danger"}
        strokeWidth="1.6"
        strokeDasharray="6 4"
      />
      <text
        x={RIGHT}
        y={waterLabelY}
        fontSize="11"
        className={waterOk ? "fill-primary" : "fill-danger"}
        fontFamily="Figtree, sans-serif"
      >
        High water · {shwtFt} ft · {sepWater.toFixed(1)} ft under invert {waterOk ? "(≥2)" : "(need 2)"}
      </text>

      <path d={`M${LEFT} ${rockY} H496`} className={rockOk ? "stroke-fg" : "stroke-danger"} strokeWidth="3" />
      <text
        x={RIGHT}
        y={rockLabelY}
        fontSize="11"
        className={rockOk ? "fill-muted" : "fill-danger"}
        fontFamily="Figtree, sans-serif"
      >
        Bedrock · {rockFt} ft · {sepRock.toFixed(1)} ft under invert {rockOk ? "(≥4)" : "(need 4)"}
      </text>
    </svg>
  );
}
