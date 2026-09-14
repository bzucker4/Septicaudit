import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { TALLY_FORM_URL } from "@/lib/content";

export const Route = createFileRoute("/book")({ component: BookPage });

function BookPage() {
  return (
    <SiteShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">Field visit</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
            Put a technician on the lot.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            File a service and inspection report: address, tank, gallons pumped,
            notes, and site photos. We reply with a window, not a chatbot.
          </p>
          <div className="mt-6">
            <Button asChild>
              <a href={TALLY_FORM_URL}>Open the inspection report</a>
            </Button>
          </div>
          <img
            src="/images/drainfield.jpg"
            alt="Lawn with a subtle drainfield depression"
            className="mt-8 aspect-photo w-full rounded-lg object-cover"
            crossOrigin="anonymous"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <iframe
            src="https://tally.so/embed/dWyO7y?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
            title="SepticAudit service and inspection report"
            loading="lazy"
            className="min-h-[44rem] w-full border-0"
          />
        </div>
      </div>
    </SiteShell>
  );
}
