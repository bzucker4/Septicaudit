import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LotPlan, TrenchPlan } from "@/components/standards/lot-plan";
import { SoilProfile } from "@/components/standards/soil-profile";
import { TankSection } from "@/components/standards/tank-section";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import {
  CERTS,
  FLOW_RULES,
  GEOMETRY,
  PERC_BANDS,
  SETBACKS,
  SYSTEMS,
  TABLE2,
  TABLE2_NOTES,
  TABLE3,
  TIERS,
  designFlow,
  etuReducedLength,
  fieldArea,
  laterals,
  setbackFeet,
  siteFit,
  table3Row,
  tankGallons,
  tankSurface,
  trenchLength,
  twoTimesFlow,
  type FitStatus,
  type Setback,
} from "@/lib/standards";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/standards")({ component: StandardsPage });

const TABS = [
  { id: "size", label: "Size the system" },
  { id: "setbacks", label: "Setbacks" },
  { id: "soil", label: "Soil & field" },
  { id: "systems", label: "Which system" },
  { id: "geometry", label: "Geometry" },
  { id: "certs", label: "What governs" },
] as const;

type Tab = (typeof TABS)[number]["id"];

function StandardsPage() {
  const [tab, setTab] = useState<Tab>("size");
  const [bedrooms, setBedrooms] = useState(3);
  const [ruleId, setRuleId] = useState("ny");
  const [disposal, setDisposal] = useState(false);
  const [percId, setPercId] = useState("11-15");
  const [width, setWidth] = useState(2);
  const [setbackId, setSetbackId] = useState("well");
  const [useNy, setUseNy] = useState(true);
  const [shwtFt, setShwtFt] = useState(5);
  const [rockFt, setRockFt] = useState(8);
  const [slopePct, setSlopePct] = useState(6);

  const rule = FLOW_RULES.find((r) => r.id === ruleId) ?? FLOW_RULES[0];
  const perc = PERC_BANDS.find((s) => s.id === percId) ?? PERC_BANDS[3];
  const setback = SETBACKS.find((s) => s.id === setbackId) ?? SETBACKS[1];

  const flow = designFlow(bedrooms, rule.gpdPerBedroom);
  const tank = tankGallons(bedrooms, disposal);
  const surface = tankSurface(bedrooms, disposal);
  const twice = twoTimesFlow(flow);
  const equiv = table3Row(bedrooms, disposal);
  const area = fieldArea(flow, perc.rate);
  const length = perc.kind === "trench" ? trenchLength(area, width) : null;
  const basal = perc.kind === "mound" ? area : null;
  const runs = laterals(length);
  const reduced = etuReducedLength(length);

  const fits = useMemo(
    () => siteFit({ perc, shwtFt, rockFt, slopePct }),
    [perc, shwtFt, rockFt, slopePct],
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">Design standards</p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl tracking-tight sm:text-5xl">
          The numbers under a permit — not a guess from a catalog.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          EPA writes manuals. New York writes Appendix 75-A. The county stamps
          the plan. Run Table 1 flow, Table 3 tanks, Table 2 setbacks, Table 4A
          perc, and the 75-A.8 / .9 siting tests. This is a briefing, not a
          stamped drawing.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "h-11 rounded-sm px-4 text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-primary text-primary-fg"
                  : "border border-border bg-surface text-fg hover:bg-surface-2",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "size" ? (
          <SizePanel
            bedrooms={bedrooms}
            setBedrooms={setBedrooms}
            ruleId={ruleId}
            setRuleId={setRuleId}
            disposal={disposal}
            setDisposal={setDisposal}
            flow={flow}
            tank={tank}
            surface={surface}
            twice={twice}
            equiv={equiv}
            ruleNote={rule.note}
          />
        ) : null}

        {tab === "setbacks" ? (
          <SetbackPanel
            selected={setback}
            onSelect={setSetbackId}
            useNy={useNy}
            setUseNy={setUseNy}
          />
        ) : null}

        {tab === "soil" ? (
          <SoilPanel
            percId={percId}
            setPercId={setPercId}
            width={width}
            setWidth={setWidth}
            flow={flow}
            area={area}
            length={length}
            basal={basal}
            runs={runs}
            reduced={reduced}
            percKind={perc.kind}
            percNote={perc.note}
            shwtFt={shwtFt}
            rockFt={rockFt}
          />
        ) : null}

        {tab === "systems" ? (
          <SystemsPanel
            shwtFt={shwtFt}
            setShwtFt={setShwtFt}
            rockFt={rockFt}
            setRockFt={setRockFt}
            slopePct={slopePct}
            setSlopePct={setSlopePct}
            percLabel={perc.label}
            fits={fits}
          />
        ) : null}

        {tab === "geometry" ? <GeometryPanel gallons={tank} surface={surface} /> : null}

        {tab === "certs" ? <CertsPanel /> : null}

        <p className="mt-10 text-xs leading-relaxed text-subtle">
          Tank gallons and liquid surface follow NY Appendix 75-A Table 3.
          Design flow follows Table 1 (110 / 130 / 150 gpd per bedroom). Perc
          rates follow Table 4A. Setbacks follow Table 2. Raised and mound
          siting follow 75-A.9. County health departments may be stricter. Not
          a permit.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/audit">Run the health audit</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/book">Ask for a site check</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}

function Stepper({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number | ((prev: number) => number)) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, +n.toFixed(1)));
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-subtle">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange((prev) => clamp(prev - step))}
        >
          −
        </Button>
        <span className="min-w-16 text-center font-display text-3xl tabular-nums">
          {value}
          <span className="ml-1 font-sans text-sm text-muted">{unit}</span>
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange((prev) => clamp(prev + step))}
        >
          +
        </Button>
      </div>
    </div>
  );
}

function SizePanel({
  bedrooms,
  setBedrooms,
  ruleId,
  setRuleId,
  disposal,
  setDisposal,
  flow,
  tank,
  surface,
  twice,
  equiv,
  ruleNote,
}: {
  bedrooms: number;
  setBedrooms: (n: number | ((prev: number) => number)) => void;
  ruleId: string;
  setRuleId: (id: string) => void;
  disposal: boolean;
  setDisposal: (v: boolean) => void;
  flow: number;
  tank: number;
  surface: number;
  twice: number;
  equiv: number;
  ruleNote: string;
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-display text-2xl">House load</h2>
        <p className="mt-2 text-sm text-muted">
          Codes size from bedrooms, not from how many people slept there last Tuesday. An expansion attic counts.
        </p>

        <div className="mt-6">
          <Stepper label="Bedrooms" value={bedrooms} unit="" min={1} max={8} onChange={setBedrooms} />
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.14em] text-subtle">Design flow · Table 1</p>
          <div className="mt-2 flex flex-col gap-2">
            {FLOW_RULES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRuleId(item.id)}
                className={cn(
                  "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                  ruleId === item.id
                    ? "border-primary bg-ok-bg"
                    : "border-border hover:border-border-strong",
                )}
              >
                <span className="font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{item.gpdPerBedroom} gpd / bedroom</span>
              </button>
            ))}
          </div>
        </div>

        <label className="mt-6 flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={disposal}
            onChange={(e) => setDisposal(e.target.checked)}
            className="size-4 accent-primary"
          />
          Garbage grinder expected
          <span className="text-xs text-muted">(+1 bedroom on Table 3)</span>
        </label>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-2xl">What Table 3 says</h2>
          <p className="mt-2 text-sm text-muted">{ruleNote}</p>
          <dl className="mt-6 divide-y divide-border">
            <Stat k="Design flow" v={`${flow.toLocaleString()} gpd`} />
            <Stat k="Table 3 equivalent bedrooms" v={`${equiv}`} />
            <Stat k="Minimum tank" v={`${tank.toLocaleString()} gal`} />
            <Stat k="Minimum liquid surface" v={`${surface} ft²`} />
            <Stat k="Two × daily flow (other codes)" v={`${twice.toLocaleString()} gal`} />
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            NY uses the bedroom table, not two-times-flow, and floors at 1,000
            gallons for 1–3 bedrooms. Two compartments, an outlet baffle, and a
            listed effluent filter are construction notes — not extras.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">NY Appendix 75-A Table 3 minimum septic tank capacities</caption>
            <thead className="bg-bg-2 text-left text-xs uppercase tracking-[0.12em] text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Bedrooms</th>
                <th className="px-4 py-3 font-medium">Gallons</th>
                <th className="px-4 py-3 font-medium">Liquid surface</th>
              </tr>
            </thead>
            <tbody>
              {TABLE3.map((row) => {
                const active =
                  row.n === 7 ? equiv > 6 : row.n === 3 ? equiv <= 3 : equiv === row.n;
                return (
                  <tr
                    key={row.bedrooms}
                    className={cn("border-t border-border", active && "bg-ok-bg")}
                  >
                    <td className="px-4 py-3">{row.bedrooms}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.n === 7 ? `+${row.gal}` : row.gal.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.n === 7 ? `+${row.surface} ft²` : `${row.surface} ft²`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SetbackPanel({
  selected,
  onSelect,
  useNy,
  setUseNy,
}: {
  selected: Setback;
  onSelect: (id: string) => void;
  useNy: boolean;
  setUseNy: (v: boolean) => void;
}) {
  const tankFt = setbackFeet(selected, useNy, "tank");
  const fieldFt = setbackFeet(selected, useNy, "field");
  const pitFt = setbackFeet(selected, useNy, "pit");

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setUseNy(true)}
          className={cn(
            "h-11 rounded-sm px-4 text-sm font-medium",
            useNy ? "bg-primary text-primary-fg" : "border border-border bg-surface",
          )}
        >
          NY 75-A Table 2
        </button>
        <button
          type="button"
          onClick={() => setUseNy(false)}
          className={cn(
            "h-11 rounded-sm px-4 text-sm font-medium",
            !useNy ? "bg-primary text-primary-fg" : "border border-border bg-surface",
          )}
        >
          Typical U.S. range
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <LotPlan setback={selected} useNy={useNy} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <ul className="space-y-1 lg:col-span-2">
          {SETBACKS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex h-11 w-full items-center justify-between rounded-sm px-3 text-left text-sm transition-colors",
                  selected.id === item.id
                    ? "bg-primary text-primary-fg"
                    : "bg-surface hover:bg-surface-2",
                )}
              >
                <span>{item.feature}</span>
                {item.source === "practice" ? (
                  <span className="text-xs uppercase tracking-wide opacity-70">practice</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-border bg-surface p-5 sm:p-6 lg:col-span-3">
          <p className="text-xs uppercase tracking-[0.14em] text-subtle">
            {useNy
              ? selected.source === "table2"
                ? "NY Appendix 75-A Table 2"
                : "Not in Table 2"
              : "Typical distance"}
          </p>
          <h2 className="mt-1 font-display text-2xl">{selected.feature}</h2>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-md border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-subtle">Tank</p>
              <p className="mt-1 font-display text-3xl tabular-nums">{tankFt}</p>
              <p className="text-xs text-muted">ft</p>
            </div>
            <div className="rounded-md border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-subtle">Field</p>
              <p className="mt-1 font-display text-3xl tabular-nums">{fieldFt}</p>
              <p className="text-xs text-muted">ft</p>
            </div>
            <div className="rounded-md border border-border bg-bg p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-subtle">Pit</p>
              <p className="mt-1 font-display text-3xl tabular-nums">{useNy ? pitFt : fieldFt}</p>
              <p className="text-xs text-muted">ft</p>
            </div>
          </div>
          {!useNy ? (
            <p className="mt-3 text-xs text-muted">
              Typical ranges {selected.tankRange} ft (tank) / {selected.fieldRange} ft (field).
            </p>
          ) : null}
          <p className="mt-5 text-sm leading-relaxed text-muted">{selected.why}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="px-4 py-3 text-left text-xs uppercase tracking-[0.14em] text-subtle">
            Table 2 — separation distances (feet)
          </caption>
          <thead className="bg-bg-2 text-left text-xs uppercase tracking-[0.12em] text-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Component</th>
              <th className="px-4 py-3 font-medium">Well / suction</th>
              <th className="px-4 py-3 font-medium">Stream / wetland</th>
              <th className="px-4 py-3 font-medium">Dwelling</th>
              <th className="px-4 py-3 font-medium">Property line</th>
            </tr>
          </thead>
          <tbody>
            {TABLE2.map((row) => (
              <tr key={row.component} className="border-t border-border">
                <td className="px-4 py-3">{row.component}</td>
                <td className="px-4 py-3 tabular-nums">{row.well}</td>
                <td className="px-4 py-3 tabular-nums">{row.stream}</td>
                <td className="px-4 py-3 tabular-nums">{row.dwelling}</td>
                <td className="px-4 py-3 tabular-nums">{row.property}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="space-y-1 border-t border-border px-4 py-3 text-xs leading-relaxed text-muted">
          {TABLE2_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SoilPanel({
  percId,
  setPercId,
  width,
  setWidth,
  flow,
  area,
  length,
  basal,
  runs,
  reduced,
  percKind,
  percNote,
  shwtFt,
  rockFt,
}: {
  percId: string;
  setPercId: (id: string) => void;
  width: number;
  setWidth: (n: number) => void;
  flow: number;
  area: number | null;
  length: number | null;
  basal: number | null;
  runs: { count: number; each: number } | null;
  reduced: number | null;
  percKind: "trench" | "mound" | "none";
  percNote: string;
  shwtFt: number;
  rockFt: number;
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-display text-2xl">Perc test · Table 4A</h2>
        <p className="mt-2 text-sm text-muted">
          Stabilized minutes per inch, slowest of at least two holes. Application rate is gpd per ft² of trench bottom.
        </p>
        <div className="mt-5 grid gap-2">
          {PERC_BANDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPercId(item.id)}
              className={cn(
                "flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors",
                percId === item.id
                  ? "border-primary bg-ok-bg"
                  : "border-border hover:border-border-strong",
              )}
            >
              <span className="font-medium">{item.label}</span>
              <span className="font-mono text-xs tabular-nums text-muted">
                {item.rate ? `${item.rate} gpd/ft²` : "unsuitable"}
                {item.kind === "mound" ? " · mound" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-2xl">Field sketch</h2>
          <p className="mt-2 text-sm text-muted">
            Area = design flow ÷ application rate. Gravity laterals cap at 60 ft, so long fields split.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[2, 3].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWidth(w)}
                className={cn(
                  "h-11 rounded-sm px-4 text-sm font-medium",
                  width === w ? "bg-primary text-primary-fg" : "border border-border bg-bg",
                )}
              >
                {w}-ft trench{w === 3 ? " (not NY)" : ""}
              </button>
            ))}
          </div>
          {width === 3 ? (
            <p className="mt-3 text-xs text-warn">NY 75-A caps absorption trenches at 24 inches. Size extras as 24 in.</p>
          ) : null}
          <dl className="mt-6 divide-y divide-border">
            <Stat k="Design flow in play" v={`${flow.toLocaleString()} gpd`} />
            {percKind === "mound" ? (
              <Stat k="Mound basal area (native soil)" v={basal ? `${basal.toLocaleString()} ft²` : "—"} />
            ) : (
              <>
                <Stat
                  k="Infiltrative area"
                  v={area && percKind === "trench" ? `${area.toLocaleString()} ft²` : "Not a conventional field"}
                />
                <Stat
                  k={`Trench length at ${width} ft wide`}
                  v={length ? `${length.toLocaleString()} ft` : "—"}
                />
                <Stat
                  k="With 100% replacement area"
                  v={area && percKind === "trench" ? `${(area * 2).toLocaleString()} ft² reserved` : "—"}
                />
                <Stat
                  k="ETU 33% reduction (if allowed)"
                  v={reduced ? `${reduced.toLocaleString()} ft of trench` : "—"}
                />
              </>
            )}
          </dl>
          {runs && percKind === "trench" ? (
            <div className="mt-4 overflow-hidden rounded-md border border-border">
              <TrenchPlan count={runs.count} each={runs.each} width={width} />
            </div>
          ) : null}
          <p className="mt-5 text-sm leading-relaxed text-muted">{percNote}</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <SoilProfile shwtFt={shwtFt} rockFt={rockFt} />
          <p className="px-4 py-3 text-xs text-muted">
            Water and rock depths are set on Which system. A 24-in trench needs 2 ft of unsaturated soil under the invert and 4 ft above rock.
          </p>
        </div>
      </div>
    </div>
  );
}

function SystemsPanel({
  shwtFt,
  setShwtFt,
  rockFt,
  setRockFt,
  slopePct,
  setSlopePct,
  percLabel,
  fits,
}: {
  shwtFt: number;
  setShwtFt: (n: number | ((prev: number) => number)) => void;
  rockFt: number;
  setRockFt: (n: number | ((prev: number) => number)) => void;
  slopePct: number;
  setSlopePct: (n: number | ((prev: number) => number)) => void;
  percLabel: string;
  fits: ReturnType<typeof siteFit>;
}) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-5">
      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6 lg:col-span-2">
        <h2 className="font-display text-2xl">The lot</h2>
        <p className="mt-2 text-sm text-muted">
          75-A.8 and .9 decide the system from soil, water, rock, and slope — not from a catalog page.
        </p>
        <div className="mt-6 space-y-6">
          <p className="text-sm">
            Perc in play: <span className="font-medium">{percLabel}</span>
            <span className="block text-xs text-muted">Change it on Soil & field.</span>
          </p>
          <Stepper label="Seasonal high water" value={shwtFt} unit="ft" min={0.5} max={12} step={0.5} onChange={setShwtFt} />
          <Stepper label="Depth to bedrock" value={rockFt} unit="ft" min={0.5} max={14} step={0.5} onChange={setRockFt} />
          <Stepper label="Natural slope" value={slopePct} unit="%" min={0} max={20} step={1} onChange={setSlopePct} />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-subtle">
          Raised: original soil 1–2 ft, water ≥ 1 ft down, slope ≤ 15%. Mound: water ≥ 1 ft, rock ≥ 2 ft, perc faster than 120, slope ≤ 12%.
        </p>
      </div>
      <div className="space-y-3 lg:col-span-3">
        {fits.map((item) => (
          <article key={item.id} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl">{item.title}</h3>
              <FitBadge status={item.status} />
            </div>
            <p className="mt-1 font-mono text-xs text-subtle">{item.section}</p>
            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
              {item.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </article>
        ))}
        <p className="text-xs leading-relaxed text-subtle">
          {SYSTEMS.length} paths in 75-A. The county can close any of them. ETU effluent still needs soil.
        </p>
      </div>
    </div>
  );
}

function FitBadge({ status }: { status: FitStatus }) {
  const label = status === "fits" ? "Fits 75-A" : status === "alt" ? "Alternative" : "Does not fit";
  return (
    <span
      className={cn(
        "rounded-sm px-2 py-1 text-xs font-medium",
        status === "fits" && "bg-ok-bg text-ok",
        status === "alt" && "bg-warn-bg text-warn",
        status === "no" && "bg-danger-bg text-danger",
      )}
    >
      {label}
    </span>
  );
}

function GeometryPanel({ gallons, surface }: { gallons: number; surface: number }) {
  return (
    <div className="mt-8 space-y-6">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <TankSection gallons={gallons} surface={surface} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {GEOMETRY.map((item) => (
          <article key={item.title} className="rounded-lg border border-border bg-surface p-5">
            <h2 className="font-display text-xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function CertsPanel() {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <article key={tier.n} className="rounded-lg border border-border bg-surface p-5">
            <p className="font-mono text-xs tabular-nums text-primary">{tier.n}</p>
            <h2 className="mt-2 font-display text-xl">{tier.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{tier.body}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {CERTS.map((cert) => (
          <article key={cert.id} className="rounded-lg border border-border bg-surface p-5">
            <p className="font-mono text-xs tracking-wide text-primary">{cert.mark}</p>
            <h2 className="mt-2 font-display text-xl">{cert.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{cert.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="text-sm font-medium tabular-nums">{v}</dd>
    </div>
  );
}
