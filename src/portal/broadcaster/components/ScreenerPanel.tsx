import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import type {
  RightsRow,
  RightsType,
  ScreenerPurpose,
  ScreenerSummary,
  WatchlistEntry,
} from '../../shared/types';

interface Props {
  slug: string;
}

const PURPOSE_OPTIONS: { value: ScreenerPurpose; label: string }[] = [
  { value: 'acquisition_evaluation', label: 'Acquisition evaluation' },
  { value: 'programming_review', label: 'Programming review' },
  { value: 'co_production_interest', label: 'Co-production interest' },
  { value: 'archival_research', label: 'Archival research' },
];

const RIGHTS_TYPE_LABELS: Record<RightsType, string> = {
  broadcast: 'Broadcast',
  svod: 'SVOD',
  avod: 'AVOD',
  tvod: 'TVOD',
  theatrical: 'Theatrical',
  all: 'All rights',
};

// "Opens 29 Jul 2026" — short, locale-stable date for an availability window.
function formatOpens(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ScreenerPanel({ slug }: Props) {
  const [purpose, setPurpose] = useState<ScreenerPurpose>('acquisition_evaluation');
  const [message, setMessage] = useState('');

  const { data: rights, isLoading: rightsLoading } = useQuery<RightsRow[]>({
    queryKey: ['title-rights', slug],
    queryFn: () => apiGet<RightsRow[]>(`/api/v1/broadcaster/titles/${slug}/rights/`),
  });

  const requestScreener = useMutation({
    mutationFn: async () => {
      const { data, status } = await apiPost<ScreenerSummary | { detail?: string }>(
        '/api/v1/broadcaster/screener-requests/',
        { title_slug: slug, purpose, message_to_producer: message },
      );
      if (status >= 400) {
        throw new Error((data as { detail?: string }).detail ?? 'Screener request failed.');
      }
      return data as ScreenerSummary;
    },
  });

  const addToWatchlist = useMutation({
    mutationFn: async () => {
      const { data, status } = await apiPost<WatchlistEntry | { detail?: string }>(
        '/api/v1/broadcaster/watchlist/',
        { title_slug: slug },
      );
      if (status >= 400) {
        throw new Error((data as { detail?: string }).detail ?? 'Could not add to watchlist.');
      }
      return data as WatchlistEntry;
    },
  });

  const requested = requestScreener.isSuccess;
  const watchlisted = addToWatchlist.isSuccess;

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4">
      {/* ── Territory rights availability ─────────────────────────────────── */}
      <div>
        <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
          Rights availability
        </span>
        {rightsLoading ? (
          <div className="mt-2 h-16 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
        ) : rights && rights.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {rights.map((row, i) => (
              <li
                key={`${row.territory}-${row.rights_type}-${i}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-hover)] px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-[var(--ink)]/85">
                  <span className="text-white">{row.territory}</span>
                  <span className="text-[var(--muted)]"> · {RIGHTS_TYPE_LABELS[row.rights_type]}</span>
                  {row.available_from && row.availability === 'available' && (
                    <span className="text-[var(--muted)]">
                      {' '}
                      · Opens {formatOpens(row.available_from)}
                    </span>
                  )}
                </span>
                {row.availability === 'available' ? (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    Available
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
                    Licensed
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted)]">
            No territory rights listed yet for this title.
          </p>
        )}
      </div>

      {/* ── Request a screener ────────────────────────────────────────────── */}
      <div className="space-y-2">
        {requested ? (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            Screener requested — pending approval.
          </p>
        ) : (
          <>
            <label htmlFor={`purpose-${slug}`} className="block text-xs text-[var(--muted)]">
              Request a screener
            </label>
            <select
              id={`purpose-${slug}`}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as ScreenerPurpose)}
              className="w-full rounded-lg border border-white/15 bg-[var(--surface)] px-3 py-2 text-sm text-white focus:border-[var(--accent-2)] focus:outline-none"
            >
              {PURPOSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message to the producer (optional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-white/15 bg-[var(--surface)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted)] focus:border-[var(--accent-2)] focus:outline-none"
            />
            <button
              type="button"
              disabled={requestScreener.isPending}
              onClick={() => requestScreener.mutate()}
              className="btn-gradient w-full rounded-lg px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {requestScreener.isPending ? 'Requesting…' : 'Request screener'}
            </button>
            {requestScreener.isError && (
              <p className="text-xs text-red-400">{(requestScreener.error as Error).message}</p>
            )}
          </>
        )}
      </div>

      {/* ── Watchlist toggle ──────────────────────────────────────────────── */}
      <div>
        <button
          type="button"
          disabled={addToWatchlist.isPending || watchlisted}
          onClick={() => addToWatchlist.mutate()}
          className="w-full rounded-lg border border-white/15 px-5 py-2 text-sm font-medium text-[var(--ink)]/85 transition-colors hover:border-white/30 hover:text-white disabled:cursor-default disabled:opacity-80"
        >
          {watchlisted
            ? '✓ On your watchlist'
            : addToWatchlist.isPending
              ? 'Adding…'
              : 'Add to watchlist'}
        </button>
        {addToWatchlist.isError && (
          <p className="mt-1 text-xs text-red-400">{(addToWatchlist.error as Error).message}</p>
        )}
      </div>
    </div>
  );
}
