import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { BroadcasterDashboard, Title } from '../../shared/types';
import { Billboard } from '../components/Billboard';
import { ContentRail } from '../components/ContentRail';
import { DetailModal } from '../components/DetailModal';

export function BroadcasterDashboardPage() {
  const [selected, setSelected] = useState<Title | null>(null);

  const { data, isLoading, isError } = useQuery<Title[]>({
    queryKey: ['broadcaster-titles'],
    queryFn: () => apiGet<Title[]>('/api/v1/broadcaster/titles/'),
  });
  const { data: interests } = useQuery<string[]>({
    queryKey: ['me-interests'],
    queryFn: () => apiGet<string[]>('/api/v1/me/interests/'),
  });
  const { data: dashboard } = useQuery<BroadcasterDashboard>({
    queryKey: ['broadcaster-dashboard'],
    queryFn: () => apiGet<BroadcasterDashboard>('/api/v1/broadcaster/dashboard/'),
  });
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
      {dashboard && <ActivityStrip dashboard={dashboard} />}
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
