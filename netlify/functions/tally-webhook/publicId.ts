/** Matches client `newAuditId()` shape: SA-YYYY-NNNN */
export function newPublicId(now = new Date()): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  const y = now.getFullYear();
  return `SA-${y}-${n}`;
}
