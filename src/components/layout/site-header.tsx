import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Mark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { TALLY_FORM_URL } from "@/lib/content";
import { cn } from "@/lib/utils";

const NAV: Array<{ label: string; to?: "/audit" | "/standards" | "/services" | "/resources"; href?: string }> = [
  { to: "/audit", label: "Free audit" },
  { to: "/standards", label: "Standards" },
  { to: "/services", label: "Services" },
  { to: "/resources", label: "Ledger notes" },
  { href: TALLY_FORM_URL, label: "Book a visit" },
];

function NavItem({
  item,
  className,
  onClick,
}: {
  item: (typeof NAV)[number];
  className: string;
  onClick?: () => void;
}) {
  if (item.href) {
    return (
      <a href={item.href} className={className} onClick={onClick}>
        {item.label}
      </a>
    );
  }
  return (
    <Link to={item.to ?? "/"} className={className} onClick={onClick}>
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Mark className="size-8" />
          <span className="font-display text-lg tracking-tight text-fg">SepticAudit</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              className="text-sm text-muted transition-colors hover:text-fg"
            />
          ))}
          <Button asChild size="sm">
            <Link to="/audit">Start the ledger</Link>
          </Button>
        </nav>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-sm lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-surface lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {NAV.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              className="flex h-11 items-center text-sm text-fg"
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
