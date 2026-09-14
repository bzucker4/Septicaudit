import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, TALLY_FORM_URL } from "@/lib/content";

export const Route = createFileRoute("/book")({ component: BookPage });

function BookPage() {
  return (
    <SiteShell>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">
            Western NY · Field visit
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            Request a sample or book an inspection.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            File a service and inspection report: address, tank, gallons pumped,
            notes, and site photos. Prefer a sample of our report style first?
            Say so in the form — we reply with a window, not a chatbot.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>Transfer inspections for closings</li>
            <li>Maintenance audits and failure diagnostics</li>
            <li>Compliance letters for towns and lenders</li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <a href={TALLY_FORM_URL}>Open booking form</a>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/report">View sample report</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted">
            Questions before you book?{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-primary hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <img
            src="/images/drainfield.jpg"
            alt="Lawn with a subtle drainfield depression"
            className="mt-10 aspect-photo w-full rounded-lg border border-border object-cover shadow-sm shadow-slate-900/5"
            crossOrigin="anonymous"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm shadow-slate-900/5">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-subtle">
              Inspection request
            </p>
            <p className="mt-1 text-sm text-muted">
              Same form for sample requests and lids-off bookings.
            </p>
          </div>
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
