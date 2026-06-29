import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { thumbUrl } from '../../shared/media';
import { TitleStatusBadge } from '../components/TitleStatusBadge';
import type { ProductionDashboard, ProductionTitle } from '../../shared/types';

export function ProductionAnalyticsPage() {
  const { data: titles, isLoading } = useQuery<ProductionTitle[]>({
    queryKey: ['production-titles'],
    queryFn: () => apiGet<ProductionTitle[]>('/api/v1/production/titles/'),
  });
  const { data: dashboard } = useQuery<ProductionDashboard>({
    queryKey: ['production-dashboard'],
    queryFn: () => apiGet<ProductionDashboard>('/api/v1/production/dashboard/'),
  });

  const rows = titles ?? [];
  // Watcher counts come from the dashboard's watched_titles, keyed by slug.
  const watchersBySlug = new Map((dashboard?.watched_titles ?? []).map((w) => [w.slug, w.watchers]));

  const totalScreeners = dashboard?.screener_activity.total ?? 0;
  const titlesWithInterest = rows.filter((t) => t.screener_request_count > 0).length;
  const totalWatchers = (dashboard?.watched_titles ?? []).reduce((s, w) => s + w.watchers, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">How broadcasters are responding to your catalogue.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Screener requests" value={String(totalScreeners)} />
        <Stat label="Titles with interest" value={String(titlesWithInterest)} />
        <Stat label="Broadcasters watching" value={String(totalWatchers)} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">By title</h2>
        {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {titles && rows.length === 0 && <p className="text-sm text-gray-500">No titles yet.</p>}
        {rows.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Screeners</th>
                  <th className="px-4 py-3 text-right font-medium">Watching</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((t) => (
                  <tr key={t.slug} className="text-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={thumbUrl({ id: t.id, title: t.name })}
                          alt=""
                          className="h-9 w-16 shrink-0 rounded object-cover"
                        />
                        <span className="font-medium text-gray-900">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TitleStatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{t.screener_request_count}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                      {watchersBySlug.get(t.slug) ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
