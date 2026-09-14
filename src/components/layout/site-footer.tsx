import { Link } from "@tanstack/react-router";
import { Mark } from "@/components/brand/mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Mark className="size-7" />
            <span className="font-display text-lg">SepticAudit</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            A scored septic ledger for homeowners, buyers, and operators. The
            online audit is a briefing. The inspection is still lids off, in
            the ground.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">Ledger</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/audit" className="text-muted hover:text-fg">
                Free health audit
              </Link>
            </li>
            <li>
              <Link to="/report" className="text-muted hover:text-fg">
                Latest report
              </Link>
            </li>
            <li>
              <Link to="/book" className="text-muted hover:text-fg">
                Book a field visit
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">Firm</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/services" className="text-muted hover:text-fg">
                Services
              </Link>
            </li>
            <li>
              <Link to="/resources" className="text-muted hover:text-fg">
                Ledger notes
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-subtle sm:px-6">
          SepticAudit self-audits are educational. They are not a certified
          inspection, a permit, or a warranty of any system.
        </p>
      </div>
    </footer>
  );
}
