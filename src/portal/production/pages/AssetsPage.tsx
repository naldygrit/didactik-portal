import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { thumbUrl } from '../../shared/media';
import { TitleStatusBadge } from '../components/TitleStatusBadge';
import { ScoreRing } from '../components/ScoreRing';
import type { ProductionDashboard, ProductionTitle, TitleStatus } from '../../shared/types';

const BRAND = '#5343fd';

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// The status filter pills, in the order the reference shows them. "All" has no
// status; the rest carry a live count beside the label.
const FILTERS: ('all' | TitleStatus)[] = [
  'all',
  'active',
  'under_review',
  'changes_requested',
  'submitted',
  'draft',
];

export function ProductionAssetsPage() {
  const [filter, setFilter] = useState<'all' | TitleStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce so we hit the search API once typing settles, not per keystroke.
  const [query, setQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setQuery(searchTerm.trim()), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Server-side ?q= search (trigram; matches name/synopsis/logline). The status
  // pills then filter client-side over the search results. keepPreviousData
  // avoids a flash of empty while a new query refetches.
  const { data: titles, isLoading, isError } = useQuery<ProductionTitle[]>({
    queryKey: ['production-titles', query],
    queryFn: () =>
      apiGet<ProductionTitle[]>(
        `/api/v1/production/titles/${query ? `?q=${encodeURIComponent(query)}` : ''}`,
      ),
    placeholderData: keepPreviousData,
  });
  // Watchlist counts per title, keyed by slug, for the card stat cluster.
  const { data: dashboard } = useQuery<ProductionDashboard>({
    queryKey: ['production-dashboard'],
    queryFn: () => apiGet<ProductionDashboard>('/api/v1/production/dashboard/'),
  });

  const all = titles ?? [];
  const watchersBySlug = new Map((dashboard?.watched_titles ?? []).map((w) => [w.slug, w.watchers]));
  const counts = new Map<TitleStatus, number>();
  for (const t of all) counts.set(t.status, (counts.get(t.status) ?? 0) + 1);

  const shown = filter === 'all' ? all : all.filter((t) => t.status === filter);
  const activeCount = counts.get('active') ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My catalogue</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {all.length} {all.length === 1 ? 'title' : 'titles'}, {activeCount} active
          </p>
        </div>
        <Link
          to="/portal/production/submit"
          className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
          style={{ backgroundColor: BRAND }}
        >
          Submit a title
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search your titles…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Status filter pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = filter === f;
          const count = f === 'all' ? all.length : counts.get(f) ?? 0;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-full border px-3.5 py-1.5 text-xs transition-colors"
              style={{
                borderColor: isActive ? BRAND : '#e5e7eb',
                background: isActive ? '#ede9fe' : '#fff',
                color: isActive ? BRAND : '#6b7280',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {f === 'all' ? 'All' : titleCase(f)}
              <span className="ml-1.5 font-bold tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading titles…</p>}
      {isError && <p className="text-sm text-red-600">Failed to load titles. Please refresh.</p>}

      {!isLoading && !isError && shown.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-16 text-center">
          <p className="text-sm font-medium text-gray-900">
            {all.length === 0 ? 'No titles yet.' : 'No titles match this filter.'}
          </p>
          {all.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Submit your first title to start building your catalogue.
            </p>
          )}
        </div>
      )}

      {/* Title cards */}
      <div className="flex flex-col gap-2.5">
        {shown.map((t) => (
          <Link
            key={t.slug}
            to={`/portal/production/assets/${t.slug}`}
            className="group flex items-center gap-4 rounded-xl border bg-white px-5 py-4 shadow-sm transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-px hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
            style={{ borderColor: '#e5e7eb' }}
          >
            <img
              src={thumbUrl({ id: t.id, title: t.name })}
              alt=""
              className="h-9 w-14 shrink-0 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-gray-900">{t.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {titleCase(t.title_type)}
                  {t.production_year ? ` · ${t.production_year}` : ''}
                </span>
              </div>
              {t.logline && <div className="truncate text-xs text-gray-500">{t.logline}</div>}
            </div>
            <div className="hidden shrink-0 items-center gap-5 sm:flex">
              <Stat label="Score">
                <ScoreRing score={t.metadata_score} size={28} />
              </Stat>
              <Stat label="Screeners">
                <span className="text-base font-bold tabular-nums" style={{ color: BRAND }}>
                  {t.screener_request_count}
                </span>
              </Stat>
              <Stat label="Watchlists">
                <span className="text-base font-bold tabular-nums text-gray-700">
                  {watchersBySlug.get(t.slug) ?? 0}
                </span>
              </Stat>
              <TitleStatusBadge status={t.status} />
            </div>
            <span className="shrink-0 text-lg text-gray-300 transition-colors group-hover:text-gray-500">
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="mb-1 text-[11px] text-gray-400">{label}</div>
      <div className="flex h-7 items-center justify-center">{children}</div>
    </div>
  );
}
