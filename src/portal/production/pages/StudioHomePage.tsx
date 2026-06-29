import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { MeResponse, ProductionDashboard } from '../../shared/types';

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProductionStudioHomePage() {
  const { data: me } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiGet<MeResponse>('/api/v1/auth/me/'),
  });
  const { data: dashboard } = useQuery<ProductionDashboard>({
    queryKey: ['production-dashboard'],
    queryFn: () => apiGet<ProductionDashboard>('/api/v1/production/dashboard/'),
  });

  const company = me?.profile?.production_company?.name ?? 'Your studio';
  const health = dashboard?.catalogue_health;
  const screeners = dashboard?.screener_activity;
  const watched = dashboard?.watched_titles ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Channel header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Studio</p>
          <h1 className="font-display text-3xl font-bold text-gray-900">{company}</h1>
        </div>
        <Link
          to="/portal/production/submit"
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          style={{ backgroundColor: '#5343fd' }}
        >
          Submit a title
        </Link>
      </header>

      {/* Catalogue health at a glance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Titles in catalogue" value={health ? String(health.total_titles) : '—'} />
        <Stat
          label="Need attention"
          value={health ? String(health.needs_attention) : '—'}
          accent={(health?.needs_attention ?? 0) > 0}
        />
        <Stat
          label="Avg metadata score"
          value={health ? String(health.average_metadata_score) : '—'}
        />
      </div>

      {/* Catalogue by status */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Catalogue by status</h2>
          <Link to="/portal/production/assets" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Manage catalogue
          </Link>
        </div>
        {health ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(health.by_status).map(([status, count]) => (
              <span
                key={status}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500"
              >
                {titleCase(status)}
                <span className="font-mono tabular-nums text-gray-900">{count}</span>
              </span>
            ))}
            {Object.keys(health.by_status).length === 0 && (
              <p className="text-sm text-gray-500">No titles yet.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading…</p>
        )}
      </section>

      {/* Screener activity */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Screener activity</h2>
        {screeners ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{screeners.total}</span>{' '}
              screener {screeners.total === 1 ? 'request' : 'requests'} across your catalogue.
            </p>
            {Object.keys(screeners.by_status).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(screeners.by_status).map(([status, count]) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                  >
                    {titleCase(status)}
                    <span className="font-mono tabular-nums text-gray-900">{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading…</p>
        )}
      </section>

      {/* Titles broadcasters are watching */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Most watched</h2>
        {watched.length > 0 ? (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
            {watched.map((t) => (
              <li key={t.slug} className="flex items-center justify-between gap-4 px-4 py-3">
                <Link
                  to={`/portal/production/assets/${t.slug}`}
                  className="min-w-0 truncate font-medium text-gray-900 hover:text-indigo-600"
                >
                  {t.name}
                </Link>
                <span className="shrink-0 text-sm text-gray-500">
                  {t.watchers} {t.watchers === 1 ? 'broadcaster' : 'broadcasters'} watching
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
            <p className="text-sm text-gray-500">
              No broadcasters watching yet. Active titles appear to broadcasters to discover.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-bold ${accent ? '' : 'text-gray-900'}`}
        style={accent ? { color: '#5343fd' } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
