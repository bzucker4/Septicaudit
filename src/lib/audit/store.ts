import type { AuditResult } from "./types";

const AUDIT_KEY = "septicaudit.latest";
const BOOKING_KEY = "septicaudit.bookings";

export type Booking = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  window: string;
  notes: string;
};

export function saveAudit(result: AuditResult) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUDIT_KEY, JSON.stringify(result));
}

export function loadAudit(): AuditResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuditResult;
  } catch {
    return null;
  }
}

export function saveBooking(booking: Booking) {
  if (typeof window === "undefined") return;
  const all = loadBookings();
  localStorage.setItem(BOOKING_KEY, JSON.stringify([booking, ...all].slice(0, 20)));
}

export function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
