import { Link } from "@tanstack/react-router";
import { Mark } from "@/components/brand/mark";
import { CONTACT_EMAIL, COVERAGE, TALLY_FORM_URL } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Mark className="size-7" />
            <span className="font-display text-lg tracking-tight">SepticAudit</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A scored septic ledger for homeowners, buyers, and operators in
            Western New York. The online audit is a briefing. The inspection is
            still lids off, in the ground.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{COVERAGE}</p>
          <p className="mt-5 text-sm">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-primary hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">Ledger</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <Link to="/audit" className="text-muted transition-colors hover:text-fg">
                Free health audit
              </Link>
            </li>
            <li>
              <Link to="/standards" className="text-muted transition-colors hover:text-fg">
                Design standards
              </Link>
            </li>
            <li>
              <Link to="/report" className="text-muted transition-colors hover:text-fg">
                Sample report
              </Link>
            </li>
            <li>
              <a
                href={TALLY_FORM_URL}
                className="text-muted transition-colors hover:text-fg"
              >
                Request a sample / Book inspection
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">Firm</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <Link to="/services" className="text-muted transition-colors hover:text-fg">
                Services
              </Link>
            </li>
            <li>
              <Link to="/resources" className="text-muted transition-colors hover:text-fg">
                Ledger notes
              </Link>
            </li>
            <li>
              <Link to="/book" className="text-muted transition-colors hover:text-fg">
                Book a visit
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-muted transition-colors hover:text-fg"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-relaxed text-subtle sm:px-6">
          SepticAudit self-audits are educational. They are not a certified
          inspection, a permit, or a warranty of any system. Serving Western NY.
        </p>
      </div>
    </footer>
  );
}
