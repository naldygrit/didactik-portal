import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { ScreenerStatus, ScreenerSummary } from '../../shared/types';

// Display groups, in the order an evaluator works them.
const GROUPS: { key: ScreenerStatus[]; label: string }[] = [
  { key: ['pending'], label: 'Awaiting review' },
  { key: ['approved', 'accessed'], label: 'Access approved' },
  { key: ['expired'], label: 'Expired' },
  { key: ['declined'], label: 'Declined' },
];

function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function BroadcasterScreenerRequestsPage() {
  const { data: screeners, isLoading } = useQuery<ScreenerSummary[]>({
    queryKey: ['broadcaster-screener-requests'],
    queryFn: () => apiGet<ScreenerSummary[]>('/api/v1/broadcaster/screener-requests/'),
  });

  const all = screeners ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="font-display mb-1 text-2xl font-bold text-white md:text-3xl">
        Screener requests
      </h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Track your evaluation requests and access approved screeners.
      </p>

      {isLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}

      {!isLoading && all.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-10 text-center">
          <p className="font-display text-lg text-white">No screener requests yet</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Request a screener from any title to start your review.
          </p>
          <Link
            to="/portal/broadcaster/discover"
            className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Browse titles
          </Link>
        </div>
      )}

      {!isLoading &&
        GROUPS.map((group) => {
          const items = all.filter((r) => group.key.includes(r.status));
          if (items.length === 0) return null;
          const approved = group.key.includes('approved');
          return (
            <section key={group.label} className="mb-8">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                {group.label}
              </h2>
              <ul className="space-y-3">
                {items.map((req) => {
                  const expires = fmtDate(req.access_expires_at);
                  return (
                    <li
                      key={req.uuid}
                      className="flex items-center justify-between gap-4 rounded-xl border bg-[var(--surface-raised)] p-4"
                      style={{ borderColor: approved ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)' }}
                    >
                      <div>
                        <p className="font-display text-lg font-semibold text-white">
                          {req.title_name}
                        </p>
                        <p className="text-xs capitalize text-[var(--muted)]">
                          {req.purpose.replace(/_/g, ' ')}
                        </p>
                        {approved && expires && (
                          <p className="mt-1 text-xs text-emerald-400">Access expires {expires}</p>
                        )}
                      </div>
                      {approved ? (
                        <button
                          type="button"
                          className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                          style={{ background: '#16a34a' }}
                        >
                          Access screener
                        </button>
                      ) : (
                        <Link
                          to={`/portal/broadcaster/discover/${req.title_slug}`}
                          className="shrink-0 text-sm font-medium text-[var(--accent-2)]"
                        >
                          View title →
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
    </div>
  );
}
