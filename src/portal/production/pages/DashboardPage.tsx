import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { TitleStatusBadge } from '../components/TitleStatusBadge';
import type {
  MeResponse,
  ProductionDashboard,
  ProductionRightsWindow,
  ProductionScreenerRequest,
  ProductionTitle,
} from '../../shared/types';

const BRAND = '#5343fd';

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const PURPOSE_LABELS: Record<string, string> = {
  acquisition_evaluation: 'Acquisition evaluation',
  programming_review: 'Programming review',
  co_production_interest: 'Co-production interest',
  archival_research: 'Archival research',
};
function purposeLabel(p: string): string {
  return PURPOSE_LABELS[p] ?? titleCase(p);
}

// The seller-studio home. A 6-up KPI strip on top, then a two-column body:
// left holds the action surfaces (needs attention, recent screener requests),
// right holds the demand context (broadcaster watchlists and a first-party
// territory-interest panel). Everything is wired to the real production API.
export function ProductionDashboardPage() {
  const { data: me } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiGet<MeResponse>('/api/v1/auth/me/'),
  });
  const { data: dashboard } = useQuery<ProductionDashboard>({
    queryKey: ['production-dashboard'],
    queryFn: () => apiGet<ProductionDashboard>('/api/v1/production/dashboard/'),
  });
  const { data: titles } = useQuery<ProductionTitle[]>({
    queryKey: ['production-titles'],
    queryFn: () => apiGet<ProductionTitle[]>('/api/v1/production/titles/'),
  });
  // All of the company's rights windows (every title), for the territory panel.
  const { data: rightsWindows } = useQuery<ProductionRightsWindow[]>({
    queryKey: ['production-rights-windows', 'all'],
    queryFn: () => apiGet<ProductionRightsWindow[]>('/api/v1/production/rights-windows/'),
  });

  const company = me?.profile?.production_company?.name ?? 'your studio';
  const health = dashboard?.catalogue_health;
  const screenerActivity = dashboard?.screener_activity;
  const watched = dashboard?.watched_titles ?? [];
  const allTitles = titles ?? [];

  const active = allTitles.filter((t) => t.status === 'active');
  const underReview = allTitles.filter((t) => t.status === 'under_review');
  const needsWork = allTitles
    .filter((t) => ['changes_requested', 'draft'].includes(t.status) || t.metadata_score < 60)
    .sort((a, b) => a.metadata_score - b.metadata_score);
  const pendingScreeners = screenerActivity?.by_status.pending ?? 0;

  const kpis: { label: string; value: string; sub: string; accent?: string; alert?: boolean }[] = [
    { label: 'Total titles', value: health ? String(health.total_titles) : '—', sub: 'in your catalogue' },
    {
      label: 'Active',
      value: health ? String(active.length) : '—',
      sub: 'visible to broadcasters',
      accent: '#16a34a',
    },
    { label: 'Under review', value: health ? String(underReview.length) : '—', sub: 'with the Didactik team' },
    {
      label: 'Needs attention',
      value: health ? String(needsWork.length) : '—',
      sub: 'action required',
      alert: needsWork.length > 0,
    },
    {
      label: 'Screener requests',
      value: screenerActivity ? String(screenerActivity.total) : '—',
      sub: `${pendingScreeners} pending`,
      accent: BRAND,
    },
    {
      label: 'Avg metadata score',
      value: health ? `${health.average_metadata_score}%` : '—',
      sub: 'catalogue quality',
      accent: (health?.average_metadata_score ?? 0) >= 75 ? '#16a34a' : '#b45309',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-7">
        <h1 className="font-display text-2xl font-bold text-gray-900">Welcome back, {company}</h1>
        <p className="mt-0.5 text-sm text-gray-500">Here is how your catalogue is performing.</p>
      </header>

      {/* KPI strip */}
      <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{k.label}</div>
            <div
              className="mt-1.5 text-2xl font-bold leading-none tabular-nums"
              style={{ color: k.alert ? '#b91c1c' : k.accent ?? '#111827' }}
            >
              {k.value}
            </div>
            <div className="mt-1 text-[11px] text-gray-400">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left column: action surfaces */}
        <div className="flex flex-col gap-5">
          <NeedsAttentionCard titles={titles} needsWork={needsWork} />
          <RecentScreenerRequestsCard />
        </div>

        {/* Right column: demand context */}
        <div className="flex flex-col gap-5">
          <WatchlistsCard watched={watched} />
          <TerritoryInterestCard
            watched={watched}
            rightsWindows={rightsWindows}
          />
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">{children}</section>
  );
}

function NeedsAttentionCard({
  titles,
  needsWork,
}: {
  titles: ProductionTitle[] | undefined;
  needsWork: ProductionTitle[];
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Needs attention</h2>
        <Link to="/portal/production/assets" className="text-xs font-medium" style={{ color: BRAND }}>
          View all →
        </Link>
      </div>
      {titles === undefined ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : needsWork.length === 0 ? (
        <p className="py-2 text-sm text-gray-500">
          Everything is in good shape. No titles need attention right now.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {needsWork.map((t) => (
            <li key={t.slug}>
              <Link
                to={`/portal/production/assets/${t.slug}`}
                className="flex items-center gap-3 py-2.5 transition-colors hover:bg-gray-50"
              >
                <div className="h-7 w-11 shrink-0 rounded bg-gray-100" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs" style={{ color: t.status === 'changes_requested' ? '#b91c1c' : '#9ca3af' }}>
                    {t.status === 'changes_requested'
                      ? 'Changes requested by the Didactik team'
                      : `Metadata score ${t.metadata_score}%, improve visibility`}
                  </div>
                </div>
                <TitleStatusBadge status={t.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RecentScreenerRequestsCard() {
  // The dashboard aggregate carries counts but not the individual requests; we
  // gather recent requests across the company's titles from the per-title
  // screener-requests endpoint (still territory-only, no broadcaster identity).
  const { data: titles } = useQuery<ProductionTitle[]>({
    queryKey: ['production-titles'],
    queryFn: () => apiGet<ProductionTitle[]>('/api/v1/production/titles/'),
  });
  const slugs = (titles ?? []).filter((t) => t.screener_request_count > 0).map((t) => t.slug);

  const { data: requestLists } = useQuery<{ slug: string; requests: ProductionScreenerRequest[] }[]>({
    queryKey: ['production-recent-screeners', slugs],
    enabled: slugs.length > 0,
    queryFn: async () => {
      const lists = await Promise.all(
        slugs.map(async (slug) => ({
          slug,
          requests: await apiGet<ProductionScreenerRequest[]>(
            `/api/v1/production/titles/${slug}/screener-requests/`,
          ),
        })),
      );
      return lists;
    },
  });

  const nameBySlug = new Map((titles ?? []).map((t) => [t.slug, t.name]));
  const recent = (requestLists ?? [])
    .flatMap((l) => l.requests.map((r) => ({ ...r, slug: l.slug })))
    .sort((a, b) => b.requested_at.localeCompare(a.requested_at))
    .slice(0, 4);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Recent screener requests</h2>
        <Link to="/portal/production/screeners" className="text-xs font-medium" style={{ color: BRAND }}>
          View all →
        </Link>
      </div>
      {slugs.length === 0 ? (
        <p className="py-2 text-sm text-gray-500">No screener requests on your catalogue yet.</p>
      ) : recent.length === 0 ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {recent.map((r) => (
            <li key={r.uuid} className="flex items-center gap-3 py-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: r.status === 'pending' ? '#b45309' : r.status === 'approved' ? '#16a34a' : '#9ca3af' }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900">
                  {nameBySlug.get(r.slug) ?? r.slug}
                </div>
                <div className="truncate text-xs text-gray-400">
                  {r.territory_interest.length > 0 ? r.territory_interest.join(', ') : 'No territory specified'}
                  {' · '}
                  {purposeLabel(r.purpose)}
                </div>
              </div>
              <span className="shrink-0 text-xs capitalize text-gray-500">{r.status}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="pt-3 text-xs text-gray-400">
        Broadcaster identity is revealed when a deal progresses to negotiation.
      </p>
    </Card>
  );
}

function WatchlistsCard({ watched }: { watched: ProductionDashboard['watched_titles'] }) {
  return (
    <Card>
      <h2 className="mb-3 text-sm font-bold text-gray-900">Broadcaster watchlists</h2>
      {watched.length === 0 ? (
        <p className="py-2 text-sm text-gray-500">
          No broadcasters watching yet. Active titles surface to broadcasters.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {watched.map((t) => (
            <li key={t.slug} className="flex items-center justify-between gap-3 py-2">
              <Link
                to={`/portal/production/assets/${t.slug}`}
                className="min-w-0 truncate text-sm font-medium text-gray-900 hover:opacity-80"
              >
                {t.name}
              </Link>
              <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: BRAND }}>
                {t.watchers}
                <span className="ml-1 text-xs font-normal text-gray-400">
                  watching
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// First-party replacement for the reference's YouTube territory signal. We do
// NOT hold audience data. Instead we surface OUR demand signal: per territory,
// how many broadcaster watchlist slots sit on titles that offer a rights window
// in that territory, shown against whether the rights are still available. All
// data is first-party (watched_titles + the company's own rights windows).
function TerritoryInterestCard({
  watched,
  rightsWindows,
}: {
  watched: ProductionDashboard['watched_titles'];
  rightsWindows: ProductionRightsWindow[] | undefined;
}) {
  const watchersBySlug = new Map(watched.map((w) => [w.slug, w.watchers]));

  // Aggregate per territory across all of the company's rights windows.
  const byTerritory = new Map<
    string,
    { interest: number; anyAvailable: boolean; anyLicensed: boolean }
  >();
  for (const w of rightsWindows ?? []) {
    const prev = byTerritory.get(w.territory) ?? { interest: 0, anyAvailable: false, anyLicensed: false };
    prev.interest += watchersBySlug.get(w.title) ?? 0;
    if (w.availability === 'available') prev.anyAvailable = true;
    if (w.availability === 'licensed') prev.anyLicensed = true;
    byTerritory.set(w.territory, prev);
  }

  const rows = [...byTerritory.entries()]
    .map(([territory, v]) => ({ territory, ...v }))
    .sort((a, b) => b.interest - a.interest || a.territory.localeCompare(b.territory));
  const maxInterest = Math.max(1, ...rows.map((r) => r.interest));

  return (
    <Card>
      <h2 className="text-sm font-bold text-gray-900">Territory interest</h2>
      <p className="mb-3 text-xs text-gray-400">
        Broadcaster demand on your titles, by territory, against rights availability.
      </p>
      {rightsWindows === undefined ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="py-2 text-sm text-gray-500">
          No rights windows yet. Add territory windows to see where demand lands.
        </p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => {
            const availLabel = r.anyAvailable ? 'Available' : 'Licensed';
            const availColour = r.anyAvailable ? '#16a34a' : '#9ca3af';
            return (
              <div key={r.territory} className="flex items-center gap-2.5">
                <div className="w-24 shrink-0 truncate text-xs text-gray-700">{r.territory}</div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(6, (r.interest / maxInterest) * 100)}%`,
                      background: r.anyAvailable ? BRAND : '#16a34a',
                    }}
                  />
                </div>
                <div className="w-16 shrink-0 text-right text-[10px]" style={{ color: availColour }}>
                  {availLabel}
                </div>
                <div className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-700">
                  {r.interest}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Link
        to="/portal/production/assets"
        className="mt-3 inline-block text-xs font-medium"
        style={{ color: BRAND }}
      >
        Manage rights coverage →
      </Link>
    </Card>
  );
}
