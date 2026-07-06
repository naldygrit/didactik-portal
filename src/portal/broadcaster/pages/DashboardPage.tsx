import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { apiGet } from '../../shared/apiHelpers';
import type { BroadcasterDashboard, Title } from '../../shared/types';
import { Billboard } from '../components/Billboard';
import { ContentRail } from '../components/ContentRail';
import { PosterCard } from '../components/PosterCard';
import { DetailModal } from '../components/DetailModal';
import { useRecentlyViewed } from '../RecentlyViewedContext';
import { titleBackdropUrl, titleTypeLabel } from '../posters';

export function BroadcasterDashboardPage() {
  const [selected, setSelected] = useState<Title | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce so we send one request after typing settles, not one per keystroke.
  const [query, setQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setQuery(searchTerm.trim()), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);
  const searching = query.length > 0;

  const { data, isLoading, isError } = useQuery<Title[]>({
    queryKey: ['broadcaster-titles'],
    queryFn: () => apiGet<Title[]>('/api/v1/broadcaster/titles/'),
  });
  // Same server-side ?q= contract DiscoverPage uses (trigram, diacritic-
  // insensitive, matches synopsis/logline too) — only fetched while actively
  // searching, so it doesn't duplicate the unfiltered list above.
  const { data: searchResults, isLoading: searchLoading } = useQuery<Title[]>({
    queryKey: ['broadcaster-titles', 'search', query],
    queryFn: () => apiGet<Title[]>(`/api/v1/broadcaster/titles/?q=${encodeURIComponent(query)}`),
    enabled: searching,
    placeholderData: keepPreviousData,
  });
  const { data: interests } = useQuery<string[]>({
    queryKey: ['me-interests'],
    queryFn: () => apiGet<string[]>('/api/v1/me/interests/'),
  });
  const { data: dashboard } = useQuery<BroadcasterDashboard>({
    queryKey: ['broadcaster-dashboard'],
    queryFn: () => apiGet<BroadcasterDashboard>('/api/v1/broadcaster/dashboard/'),
  });
  const { recentlyViewed } = useRecentlyViewed();
  const personalized = (interests?.length ?? 0) > 0;

  if (isLoading) return <BrowseSkeleton />;

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-display text-xl text-white">No titles available yet</p>
        <p className="text-sm text-[var(--muted)]">
          New work appears here as production companies list it for licensing.
        </p>
      </div>
    );
  }

  // Lead with a featured title when one is flagged; otherwise the first title.
  const featured = data.find((t) => t.is_featured) ?? data[0];
  const rest = data.filter((t) => t.slug !== featured.slug);
  const rails: { title: string; titles: Title[] }[] = [
    { title: 'Available to license', titles: data },
    { title: 'Documentaries', titles: data.filter((t) => t.title_type === 'documentary') },
    { title: 'Feature films', titles: data.filter((t) => t.title_type === 'feature_film') },
    { title: 'More to explore', titles: rest },
  ];

  return (
    <div className="pb-16">
      <div className="px-4 pt-4 md:px-8">
        <div className="relative max-w-md">
          <FiSearch
            aria-hidden="true"
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search titles, languages, countries…"
            aria-label="Search the catalogue"
            className="w-full rounded-lg border border-white/12 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {dashboard && <ActivityStrip dashboard={dashboard} />}

      {searching ? (
        <div className="px-4 pt-6 md:px-8">
          <h2 className="font-display mb-3 text-lg font-semibold text-white md:text-xl">
            {searchLoading ? 'Searching…' : `Results for "${query}"`}
          </h2>
          {!searchLoading && (searchResults?.length ?? 0) === 0 && (
            <p className="text-sm text-[var(--muted)]">No titles match that search.</p>
          )}
          <div className="flex flex-wrap gap-3">
            {(searchResults ?? []).map((t) => (
              <PosterCard key={t.slug} title={t} onSelect={setSelected} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <Billboard title={featured} onSelect={setSelected} />
          <div className="-mt-6 space-y-8 md:-mt-10">
            {/* Personalisation prompt / status */}
            <Link
              to="/portal/broadcaster/onboarding"
              className="mx-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[var(--surface-raised)] px-4 py-3 text-sm transition-colors hover:border-white/20 md:mx-8"
            >
              <span className="text-[var(--ink)]/85">
                {personalized
                  ? 'Showing titles matched to your picks.'
                  : 'Tell us what you are in the market for and we will lead with titles that fit.'}
              </span>
              <span className="shrink-0 font-medium text-[var(--accent-2)]">
                {personalized ? 'Tune picks' : 'Personalise'}
              </span>
            </Link>

            {recentlyViewed.length > 0 && (
              <section className="mx-4 md:mx-8">
                <h2 className="mb-3 text-base font-bold text-white">Recently viewed</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {recentlyViewed.map((t) => (
                    <Link
                      key={t.slug}
                      to={`/portal/broadcaster/discover/${t.slug}`}
                      className="group min-w-[150px] max-w-[150px] md:min-w-[180px] md:max-w-[180px]"
                    >
                      <div
                        className="aspect-video w-full rounded-lg bg-cover bg-center ring-1 ring-white/10 transition-transform group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url(${titleBackdropUrl(t)})` }}
                      />
                      <div className="mt-1.5 truncate text-sm font-medium text-white/90">{t.name}</div>
                      <div className="truncate text-xs text-[var(--muted)]">
                        {titleTypeLabel(t.title_type)}
                        {t.production_year ? ` · ${t.production_year}` : ''}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {rails.map((rail) => (
              <ContentRail
                key={rail.title}
                title={rail.title}
                titles={rail.titles}
                onSelect={setSelected}
              />
            ))}

            {dashboard && dashboard.rights_opening_soon.length > 0 && (
              <OpeningSoonPanel windows={dashboard.rights_opening_soon} />
            )}
          </div>
        </>
      )}
      <DetailModal title={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

// First-party demand/availability cue. NOT a YouTube/audience metric: it surfaces
// the broadcaster's own watchlist + screener state and the rights opening in
// their operating territories.
function ActivityStrip({ dashboard }: { dashboard: BroadcasterDashboard }) {
  const byStatus = dashboard.activity.screener_requests_by_status;
  const items: { label: string; value: number; to: string; tone: string }[] = [
    { label: 'New in your territories', value: dashboard.rights_opening_soon.length, to: '/portal/broadcaster/discover', tone: '#22c55e' },
    { label: 'On your watchlist', value: dashboard.activity.watchlist_count, to: '/portal/broadcaster/watchlist', tone: 'var(--accent-2)' },
    { label: 'Pending screeners', value: byStatus.pending ?? 0, to: '/portal/broadcaster/screeners', tone: '#f59e0b' },
    { label: 'Active screeners', value: (byStatus.approved ?? 0) + (byStatus.accessed ?? 0), to: '/portal/broadcaster/screeners', tone: '#22c55e' },
  ];
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-white/5 bg-[var(--surface-raised)]/60 px-4 py-3 md:px-8">
      {items.map((it) => (
        <Link key={it.label} to={it.to} className="flex items-center gap-2 text-sm">
          <span className="text-lg font-bold tabular-nums" style={{ color: it.tone }}>
            {it.value}
          </span>
          <span className="text-[var(--muted)] transition-colors hover:text-white">{it.label}</span>
        </Link>
      ))}
    </div>
  );
}

function OpeningSoonPanel({
  windows,
}: {
  windows: BroadcasterDashboard['rights_opening_soon'];
}) {
  return (
    <section className="mx-4 md:mx-8">
      <h2 className="mb-1 text-base font-bold text-white">Opening soon in your territories</h2>
      <p className="mb-3 text-xs text-[var(--muted)]">
        Rights becoming available where you operate. Request a screener before the window opens.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {windows.map((w) => (
          <Link
            key={`${w.title_slug}-${w.territory}-${w.rights_type}`}
            to={`/portal/broadcaster/discover/${w.title_slug}`}
            className="min-w-[220px] rounded-xl border border-white/8 bg-[var(--surface-raised)] px-4 py-3 transition-colors hover:border-white/20"
          >
            <div className="truncate text-sm font-semibold text-white">{w.title_name}</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">{w.territory}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                {w.rights_type}
              </span>
              {w.available_from && (
                <span className="text-[11px] text-[#22c55e]">
                  {new Date(w.available_from).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BrowseSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="min-h-[62vh] w-full bg-[var(--surface-raised)] md:min-h-[70vh]" />
      <div className="space-y-8 px-4 pt-8 md:px-8">
        {[0, 1].map((row) => (
          <div key={row} className="space-y-3">
            <div className="h-5 w-40 rounded bg-[var(--surface-raised)]" />
            <div className="flex gap-3">
              {[0, 1, 2, 3, 4, 5].map((c) => (
                <div
                  key={c}
                  className="aspect-[2/3] w-[150px] shrink-0 rounded-lg bg-[var(--surface-raised)] md:w-[180px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
