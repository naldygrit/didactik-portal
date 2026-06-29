export function money(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Urgency tiers for an age badge: how stale is this item, and how worried
// should the admin be. `danger` ≈ overdue, `warn` ≈ getting old, `''` ≈ fresh.
export type AgeTone = 'danger' | 'warn' | '';

// Compact "time since" string from an ISO timestamp, sized for dense table/queue
// cells: "2h ago", "6 days", "3 wks". `prefix` (e.g. a status) prepends, so a
// Library cell can read "Submitted 6 days". Returns '—' for missing input.
export function relativeTime(iso: string | null | undefined, prefix?: string): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const label = formatAge(Date.now() - then);
  return prefix ? `${prefix} ${label}` : label;
}

// Hours elapsed since an ISO timestamp (used to count "N over 48h" pending
// screeners). Returns 0 for missing/invalid input.
export function hoursSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return (Date.now() - then) / 3_600_000;
}

// Urgency tier for an age badge, in days: >5d danger, >2d warn, else fresh.
export function ageTone(iso: string | null | undefined): AgeTone {
  const h = hoursSince(iso);
  if (h > 120) return 'danger';
  if (h > 48) return 'warn';
  return '';
}

function formatAge(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 21) return `${days} days`;
  return `${Math.floor(days / 7)} wks`;
}
