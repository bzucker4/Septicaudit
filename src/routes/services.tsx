import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { SERVICES, TALLY_FORM_URL } from "@/lib/content";

export const Route = createFileRoute("/services")({ component: ServicesPage });

function ServicesPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">On the lot</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
          Inspections, not guesses.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          We write condition, not cheerleading. Every visit opens what can be
          opened, walks the field, and leaves a letter you can file.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {SERVICES.map((service) => (
            <article key={service.id} className="flex flex-col rounded-lg border border-border bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-subtle">{service.kicker}</p>
              <h2 className="mt-2 font-display text-2xl">{service.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{service.summary}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-subtle">{service.turnaround}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid overflow-hidden rounded-xl border border-border lg:grid-cols-2">
          <img
            src="/images/riser.jpg"
            alt="Concrete septic riser lid set in grass"
            className="aspect-photo w-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="flex flex-col justify-center bg-surface p-6 sm:p-10">
            <h2 className="font-display text-3xl tracking-tight">If you cannot find the lids, that is the first finding.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Buried lids are common on older lots. We locate, open, and photograph.
              Do not guess with a shovel over a tank.
            </p>
            <div className="mt-6">
              <Button asChild>
                <a href={TALLY_FORM_URL}>Request a visit</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
