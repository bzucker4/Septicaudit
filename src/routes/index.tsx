import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck, Droplets, FileSearch, Shield } from "lucide-react";
import { SystemSchematic } from "@/components/audit/system-schematic";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { SERVICES, STEPS, TALLY_FORM_URL } from "@/lib/content";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Field ledger · Western New York
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.08] tracking-tight text-fg sm:text-6xl">
          Know the ground before it fails.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          SepticAudit turns a buried tank and field into a scored briefing:
          occupancy, pumping, symptoms, site. Buy, sell, or pump with
          the lids in mind, not a guess — across Western NY.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/audit">
              Start a free audit
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href={TALLY_FORM_URL}>Request a sample / Book inspection</a>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <figure className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm shadow-slate-900/5">
          <img
            src="/images/hero.jpg"
            alt="Rural Western New York property with a broad lawn and wood line"
            className="aspect-video w-full object-cover"
            crossOrigin="anonymous"
          />
          <figcaption className="flex items-center justify-between gap-4 px-4 py-3.5 text-xs text-muted sm:px-5">
            <span>The system is under the lawn. The ledger is above it.</span>
            <span className="hidden font-mono tabular-nums sm:inline">SA-LEDGER</span>
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {[
            { k: "12", l: "points in a field inspection" },
            { k: "3 yr", l: "default pump interval for an occupied house" },
            { k: "10", l: "questions in the online ledger" },
          ].map((item) => (
            <div key={item.l} className="bg-surface px-5 py-7 sm:px-6">
              <div className="font-display text-3xl tabular-nums text-fg">{item.k}</div>
              <p className="mt-1.5 text-sm text-muted">{item.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">How the ledger works</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
          Interview first. Lids second.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className="rounded-lg border border-border bg-surface p-6 shadow-sm shadow-slate-900/5"
            >
              <p className="font-mono text-xs tabular-nums text-primary">{step.n}</p>
              <h3 className="mt-4 font-display text-xl">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-bg-2">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-subtle">The buried layout</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">
              Tank, d-box, laterals. That is the whole machine.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
              Wastewater hits a two-chamber tank. Solids stay. Liquid moves to a
              distribution box, then into laterals under the lawn. Most
              “surprises” at closing are a full tank, a crushed baffle, or a
              field that has been driven on for years.
            </p>
            <ul className="mt-8 space-y-3.5 text-sm text-fg">
              <li className="flex gap-3">
                <Droplets className="mt-0.5 size-4 shrink-0 text-primary" />
                Pumping removes sludge. It does not inspect a field.
              </li>
              <li className="flex gap-3">
                <FileSearch className="mt-0.5 size-4 shrink-0 text-primary" />
                An inspection opens lids and walks the ground.
              </li>
              <li className="flex gap-3">
                <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
                A sale needs the second thing, on paper.
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm shadow-slate-900/5 sm:p-7">
            <SystemSchematic grade="watch" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-xl border border-border bg-surface p-7 shadow-sm shadow-slate-900/5 sm:p-10">
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">Codes, not folklore</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight">
            Explore NY Appendix 75-A design standards
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Design flow, Table 3 tanks, Table 2 setbacks, perc-to-trench, and
            which 75-A system the lot can actually take: trench, raised,
            mound, or a pretreatment path.
          </p>
          <div className="mt-7">
            <Button asChild>
              <Link to="/standards">Open the standards ledger</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-subtle">Field work</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">Services on the lot</h2>
          </div>
          <Link to="/services" className="hidden text-sm text-primary hover:underline sm:inline">
            All services
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <article
              key={service.id}
              className="flex flex-col rounded-lg border border-border bg-surface p-6 shadow-sm shadow-slate-900/5"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-subtle">{service.kicker}</p>
              <h3 className="mt-2.5 font-display text-2xl">{service.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{service.summary}</p>
              <p className="mt-5 text-xs text-subtle">{service.turnaround}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 pb-20 sm:px-6">
        <div className="grid overflow-hidden rounded-xl border border-border bg-surface shadow-sm shadow-slate-900/5 lg:grid-cols-2">
          <img
            src="/images/clipboard.jpg"
            alt="Inspection clipboard on a work-truck tailgate"
            className="aspect-photo h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="flex flex-col justify-center p-7 sm:p-12">
            <ClipboardCheck className="size-6 text-primary" />
            <h2 className="mt-5 font-display text-3xl tracking-tight">
              A report you can hand to a buyer, or keep in the kitchen drawer.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              The online ledger writes a scored report from your answers. A
              field inspection replaces guesses with measurements. Either way,
              you leave with paper, not a vibe.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/report">View a sample report</Link>
              </Button>
              <Button asChild variant="secondary">
                <a href={TALLY_FORM_URL}>Book a field inspection</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
