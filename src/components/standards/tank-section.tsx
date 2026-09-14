import { cn } from "@/lib/utils";

export function TankSection({
  gallons,
  surface,
  className,
}: {
  gallons: number;
  surface: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 640 220"
      className={cn("w-full text-fg", className)}
      role="img"
      aria-label={`Two-compartment septic tank, ${gallons} gallons, ${surface} square feet of liquid surface.`}
    >
      <rect x="8" y="8" width="624" height="204" rx="8" className="fill-bg stroke-border" strokeWidth="1" />

      <text x="24" y="28" fontSize="11" className="fill-subtle" fontFamily="Figtree, sans-serif">
        INLET
      </text>
      <text x="560" y="28" fontSize="11" className="fill-subtle" fontFamily="Figtree, sans-serif">
        OUTLET
      </text>

      <path d="M8 72 H88" className="stroke-fg" strokeWidth="3" />
      <path d="M552 84 H632" className="stroke-fg" strokeWidth="3" />

      <rect x="88" y="48" width="464" height="132" rx="10" className="fill-surface stroke-primary" strokeWidth="2" />
      <rect x="96" y="96" width="448" height="76" className="fill-ok-bg" />

      <path d="M88 96 H552" className="stroke-primary" strokeWidth="1.2" strokeDasharray="4 4" />
      <text x="104" y="90" fontSize="10" className="fill-primary" fontFamily="Figtree, sans-serif">
        Liquid line · 30–60 in
      </text>

      <path d="M360 56 V172" className="stroke-primary" strokeWidth="2" />
      <path d="M360 108 H348" className="stroke-primary" strokeWidth="2" />
      <text x="250" y="128" fontSize="11" className="fill-primary" fontFamily="Figtree, sans-serif">
        60–75%
      </text>
      <text x="400" y="128" fontSize="11" className="fill-primary" fontFamily="Figtree, sans-serif">
        25–40%
      </text>

      <rect x="108" y="56" width="10" height="52" className="fill-fg" />
      <rect x="510" y="68" width="10" height="52" className="fill-fg" />
      <text x="122" y="74" fontSize="10" className="fill-muted" fontFamily="Figtree, sans-serif">
        Inlet baffle
      </text>
      <text x="428" y="64" fontSize="10" className="fill-muted" fontFamily="Figtree, sans-serif">
        Outlet baffle / filter
      </text>

      <text x="24" y="198" fontSize="11" className="fill-muted" fontFamily="IBM Plex Mono, monospace">
        {gallons.toLocaleString()} gal · {surface} ft² liquid surface · ≥ 6 ft inlet to outlet
      </text>
    </svg>
  );
}
