import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { ScreenerStatus, ScreenerSummary, WatchlistEntry } from '../../shared/types';

const STATUS_LABELS: Record<ScreenerStatus, string> = {
  pending: 'Pending approval',
  approved: 'Approved',
  declined: 'Declined',
  expired: 'Expired',
  accessed: 'Accessed',
};

const STATUS_STYLES: Record<ScreenerStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  declined: 'bg-red-500/15 text-red-400',
  expired: 'bg-white/5 text-[var(--muted)]',
  accessed: 'bg-[var(--accent-2)]/15 text-[var(--accent-2)]',
};

function StatusBadge({ status }: { status: ScreenerStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.expired}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function BroadcasterLicensesPage() {
  const { data: watchlist, isLoading: watchlistLoading } = useQuery<WatchlistEntry[]>({
    queryKey: ['broadcaster-watchlist'],
    queryFn: () => apiGet<WatchlistEntry[]>('/api/v1/broadcaster/watchlist/'),
  });
  const { data: screeners, isLoading: screenersLoading } = useQuery<ScreenerSummary[]>({
    queryKey: ['broadcaster-screener-requests'],
    queryFn: () => apiGet<ScreenerSummary[]>('/api/v1/broadcaster/screener-requests/'),
  });

  const isLoading = watchlistLoading || screenersLoading;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="font-display mb-1 text-2xl font-bold text-white md:text-3xl">My activity</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Titles you are watching and screeners you have requested.
      </p>

      {isLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}

      {!isLoading && (
        <div className="space-y-10">
          {/* ── Watchlist ───────────────────────────────────────────────── */}
          <section>
            <h2 className="font-display mb-3 text-lg font-semibold text-white">Watchlist</h2>
            {watchlist && watchlist.length > 0 ? (
              <ul className="space-y-3">
                {watchlist.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4"
                  >
                    <div>
                      <p className="font-display text-lg font-semibold text-white">
                        {entry.title_name}
                      </p>
                      {entry.internal_note && (
                        <p className="text-xs text-[var(--muted)]">{entry.internal_note}</p>
                      )}
                    </div>
                    {entry.priority && (
                      <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--ink)]/80">
                        {entry.priority} priority
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-8 text-center">
                <p className="font-display text-lg text-white">Nothing watched yet</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Add titles to your watchlist as you browse.
                </p>
              </div>
            )}
          </section>

          {/* ── Screener requests ───────────────────────────────────────── */}
          <section>
            <h2 className="font-display mb-3 text-lg font-semibold text-white">
              Screener requests
            </h2>
            {screeners && screeners.length > 0 ? (
              <ul className="space-y-3">
                {screeners.map((req) => (
                  <li
                    key={req.uuid}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4"
                  >
                    <div>
                      <p className="font-display text-lg font-semibold text-white">
                        {req.title_name}
                      </p>
                      <p className="text-xs capitalize text-[var(--muted)]">
                        {req.purpose.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-8 text-center">
                <p className="font-display text-lg text-white">No screener requests yet</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Request a screener from any title to start your review.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
