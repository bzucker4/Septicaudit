import type { ReactNode } from "react";

/** Passthrough provider — no auth is required for the public ledger. */
export function AuthProvider({ children }: { children: ReactNode }) {
  return children;
}
