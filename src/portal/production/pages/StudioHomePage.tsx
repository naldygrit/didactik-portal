import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { thumbUrl } from '../../shared/media';
import { TitleStatusBadge } from '../components/TitleStatusBadge';
import type { MeResponse, ProductionDashboard, ProductionTitle } from '../../shared/types';

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// The TuneCore release-dashboard home: a health strip on top, the company's
// release list as the centerpiece (they live here), then screener + watch
// context. This is catalogue management, not project editing.
export function ProductionStudioHomePage() {
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

  const company = me?.profile?.production_company?.name ?? 'Your studio';
  const health = dashboard?.catalogue_health;
  const screeners = dashboard?.screener_activity;
  const watched = dashboard?.watched_titles ?? [];

  // Lead with the releases that need work, then the rest; most-recent first.
  const releases = [...(titles ?? [])].sort((a, b) => {
    const aw = a.metadata_score < 60 ? 0 : 1;
    const bw = b.metadata_score < 60 ? 0 : 1;
    if (aw !== bw) return aw - bw;
    return (b.updated_at ?? '').localeCompare(a.updated_at ?? '');
  });
  const topReleases = releases.slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">{company}</h1>
          <p className="mt-0.5 text-sm text-gray-500">Your release catalogue</p>
        </div>
        <Link
          to="/portal/production/submit"
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
          style={{ backgroundColor: '#5343fd' }}
        >
          Submit a title
        </Link>
      </header>

      {/* Health strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Titles" value={health ? String(health.total_titles) : '—'} />
        <Stat
          label="Need attention"
          value={health ? String(health.needs_attention) : '—'}
          accent={(health?.needs_attention ?? 0) > 0}
        />
        <Stat
          label="Avg completeness"
          value={health ? String(health.average_metadata_score) : '—'}
        />
        <Stat label="Screener interest" value={screeners ? String(screeners.total) : '—'} />
      </div>

      {/* Releases — the centerpiece */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-gray-900">Your releases</h2>
          <Link
            to="/portal/production/assets"
            className="text-sm font-medium text-[#5343fd] hover:opacity-80"
          >
            Manage catalogue →
          </Link>
        </div>

        {titles === undefined ? (
          <p className="text-sm text-gray-500">Loading releases…</p>
        ) : topReleases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center">
            <p className="text-sm font-medium text-gray-900">No titles yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Submit your first title to start building your catalogue.
            </p>
            <Link
              to="/portal/production/submit"
              className="mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: '#5343fd' }}
            >
              Submit a title
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {topReleases.map((t) => (
              <Link
                key={t.slug}
                to={`/portal/production/assets/${t.slug}`}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <img
                  src={thumbUrl({ id: t.id, title: t.name })}
                  alt=""
                  className="h-11 w-[72px] shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    {titleCase(t.title_type)}
                    {t.production_year ? ` · ${t.production_year}` : ''}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <TitleStatusBadge status={t.status} />
                </div>
                <div className="hidden w-32 md:block">
                  <CompletenessBar score={t.metadata_score} />
                </div>
                <div className="w-24 shrink-0 text-right text-sm tabular-nums text-gray-500">
                  {t.screener_request_count}
                  <span className="hidden lg:inline">
                    {' '}
                    {t.screener_request_count === 1 ? 'screener' : 'screeners'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Context row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Broadcasters watching
          </h2>
          {watched.length > 0 ? (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {watched.map((t) => (
                <li key={t.slug} className="flex items-center justify-between gap-4 px-4 py-3">
                  <Link
                    to={`/portal/production/assets/${t.slug}`}
                    className="min-w-0 truncate font-medium text-gray-900 hover:text-[#5343fd]"
                  >
                    {t.name}
                  </Link>
                  <span className="shrink-0 text-sm tabular-nums text-gray-500">
                    {t.watchers} watching
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
              <p className="text-sm text-gray-500">
                No broadcasters watching yet. Active titles surface to broadcasters.
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">Screener activity</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            {screeners ? (
              <>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{screeners.total}</span> screener{' '}
                  {screeners.total === 1 ? 'request' : 'requests'} across your catalogue.
                </p>
                {Object.keys(screeners.by_status).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(screeners.by_status).map(([status, count]) => (
                      <span
                        key={status}
                        className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                      >
                        {titleCase(status)}
                        <span className="tabular-nums text-gray-900">{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading…</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p
        className="mt-1 font-display text-2xl font-bold tabular-nums text-gray-900"
        style={accent ? { color: '#5343fd' } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

// Metadata completeness as a bar, the professional-catalogue cue: high reads
// confident, low reads as work to do.
function CompletenessBar({ score }: { score: number }) {
  const tone = score >= 80 ? '#3b6d11' : score >= 50 ? '#b8860b' : '#a32d2d';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: tone }} />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-gray-500">{score}</span>
    </div>
  );
}
