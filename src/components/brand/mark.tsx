import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="11"
        width="25"
        height="13"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M3.5 17.5h25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="17.5" r="1.45" fill="currentColor" />
      <circle cx="21" cy="17.5" r="1.45" fill="currentColor" />
      <path
        d="M16 6.5v4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16 6.5c2.4-2.8 6.2-1.8 6.2 1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
