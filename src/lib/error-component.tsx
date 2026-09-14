import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function AppErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-4 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-subtle">Ledger fault</p>
      <h1 className="mt-3 font-display text-3xl tracking-tight text-fg">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {error.message || "The page could not be loaded. Try again from the home ledger."}
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
