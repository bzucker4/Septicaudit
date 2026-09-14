import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "ok" | "watch" | "fail" | "muted";

const tones: Record<Tone, string> = {
  default: "bg-surface-2 text-fg",
  ok: "bg-ok-bg text-ok",
  watch: "bg-warn-bg text-warn",
  fail: "bg-danger-bg text-danger",
  muted: "bg-bg-2 text-muted",
};

export function Badge({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
