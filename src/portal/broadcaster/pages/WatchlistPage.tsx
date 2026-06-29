import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { WatchlistEntry } from '../../shared/types';

export function BroadcasterWatchlistPage() {
  const { data: watchlist, isLoading } = useQuery<WatchlistEntry[]>({
    queryKey: ['broadcaster-watchlist'],
    queryFn: () => apiGet<WatchlistEntry[]>('/api/v1/broadcaster/watchlist/'),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="font-display mb-1 text-2xl font-bold text-white md:text-3xl">My watchlist</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Titles you have saved for evaluation.</p>

      {isLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}

      {!isLoading && (watchlist?.length ?? 0) > 0 ? (
        <ul className="space-y-3">
          {watchlist!.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4"
            >
              <div>
                <p className="font-display text-lg font-semibold text-white">{entry.title_name}</p>
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
        !isLoading && (
          <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-10 text-center">
            <p className="font-display text-lg text-white">Your watchlist is empty</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Browse the archive and save titles you are evaluating.
            </p>
            <Link
              to="/portal/broadcaster/discover"
              className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              Browse titles
            </Link>
          </div>
        )
      )}
    </div>
  );
}
