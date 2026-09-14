import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { newAuditId } from "@/lib/audit/engine";
import { saveBooking, type Booking } from "@/lib/audit/store";
import { SERVICES } from "@/lib/content";

export const Route = createFileRoute("/book")({ component: BookPage });

function BookPage() {
  const [sent, setSent] = useState<Booking | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const booking: Booking = {
      id: newAuditId(),
      createdAt: new Date().toISOString(),
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
      service: String(data.get("service") ?? "").trim(),
      window: String(data.get("window") ?? "").trim(),
      notes: String(data.get("notes") ?? "").trim(),
    };
    if (!booking.name || !booking.email || !booking.address || !booking.service) return;
    saveBooking(booking);
    setSent(booking);
  }

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">Field visit</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
            Put a technician on the lot.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Tell us the address and what you need. We reply with a window, not
            a chatbot. If you already ran the ledger, mention the report id.
          </p>
          <img
            src="/images/drainfield.jpg"
            alt="Lawn with a subtle drainfield depression"
            className="mt-8 aspect-photo w-full rounded-lg object-cover"
            crossOrigin="anonymous"
          />
        </div>

        {sent ? (
          <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">Request filed</p>
            <h2 className="mt-2 font-display text-3xl">We have the lot on the board.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Reference <span className="font-mono text-fg">{sent.id}</span>. A
              scheduler will reach {sent.email}
              {sent.phone ? ` or ${sent.phone}` : ""} about {sent.address}.
            </p>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-border py-2">
                <dt className="text-muted">Service</dt>
                <dd>{sent.service}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border py-2">
                <dt className="text-muted">Window</dt>
                <dd>{sent.window || "First available"}</dd>
              </div>
            </dl>
            <Button className="mt-6" type="button" variant="secondary" onClick={() => setSent(null)}>
              File another request
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" required autoComplete="name" />
              <Field label="Email" name="email" type="email" required autoComplete="email" />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
              <div className="sm:col-span-2">
                <Field label="Property address" name="address" required autoComplete="street-address" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="service">Service</Label>
                <select
                  id="service"
                  name="service"
                  required
                  defaultValue=""
                  className="mt-1.5 h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {SERVICES.map((service) => (
                    <option key={service.id} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="window">Preferred window</Label>
                <select
                  id="window"
                  name="window"
                  defaultValue="First available"
                  className="mt-1.5 h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <option>First available</option>
                  <option>This week</option>
                  <option>Next week</option>
                  <option>Before a closing date</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  className="mt-1.5"
                  placeholder="Report id, symptoms, closing date, lid locations…"
                />
              </div>
            </div>
            <Button type="submit" className="mt-6 w-full sm:w-auto">
              Submit the request
            </Button>
            <p className="mt-3 text-xs text-subtle">
              Stored on this device for the demo. A live dispatch desk would take it from here.
            </p>
          </form>
        )}
      </div>
    </SiteShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-1.5"
      />
    </div>
  );
}
