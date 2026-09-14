import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { FAQS, TALLY_FORM_URL } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({ component: ResourcesPage });

const NOTES = [
  {
    title: "Pumping is not an inspection",
    body: "A pumper can empty a tank and leave baffles, the outlet tee, and the field unexamined. Ask for sludge depth, scum thickness, and a note on the baffles. If those numbers are not on the receipt, you bought a vacuum truck, not a diagnosis.",
  },
  {
    title: "The three-year default",
    body: "For an occupied three-bedroom house with ordinary use, a three-year pump interval is a defensible rule of thumb. Add a disposal, a rental, or a fourth bedroom and pull it in. Stretching to six or eight years is how solids walk into the laterals.",
  },
  {
    title: "What a buyer should demand",
    body: "Lids located and opened. Sludge measured. Field walked. Limitations written down (buried D-box, no access, snow cover). A seller who offers a pump receipt from last spring is offering maintenance, not condition.",
  },
  {
    title: "Design standards are a stack, not a pamphlet",
    body: "EPA publishes the OWTS manual. States set gallons and setbacks. The county stamps the plan, and may be stricter. Table 1 flow, Table 3 tanks, Table 2 setbacks, Table 4A perc, and the 75-A.8 / .9 siting tests live in Design standards. They are a briefing for the permit conversation, not the permit.",
  },
];

function ResourcesPage() {
  const [open, setOpen] = useState<string | null>(FAQS[0]?.q ?? null);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">Ledger notes</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
          Short paper for a buried system.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          No myth-busting blog. Just the few things that change whether you
          pump, inspect, or stop using the field.
        </p>

        <div className="mt-10 space-y-4">
          {NOTES.map((note) => (
            <article key={note.title} className="rounded-lg border border-border bg-surface p-5">
              <h2 className="font-display text-2xl">{note.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{note.body}</p>
            </article>
          ))}
        </div>

        <h2 className="mt-14 font-display text-3xl">Questions we actually get</h2>
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {FAQS.map((item) => {
            const isOpen = open === item.q;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium"
                  onClick={() => setOpen(isOpen ? null : item.q)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <span className="text-subtle">{isOpen ? "–" : "+"}</span>
                </button>
                <p
                  className={cn(
                    "px-4 pb-4 text-sm leading-relaxed text-muted",
                    isOpen ? "block" : "hidden",
                  )}
                >
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-bg-2 p-6">
          <h2 className="font-display text-2xl">Still guessing?</h2>
          <p className="mt-2 text-sm text-muted">
            Run the ten-question ledger. If the score says lids off, book the visit.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/audit">Start the audit</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/standards">Design standards</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={TALLY_FORM_URL}>Book a visit</a>
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
