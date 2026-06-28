import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { money } from '../../shared/format';
import { thumbUrl } from '../../shared/media';
import { StatusBadge } from '../components/StatusBadge';
import type { ProductionTitleStat } from '../../shared/types';

export function ProductionAnalyticsPage() {
  const { data, isLoading } = useQuery<ProductionTitleStat[]>({
    queryKey: ['title-stats'],
    queryFn: () => apiGet<ProductionTitleStat[]>('/api/v1/production/title-stats/'),
  });

  const stats = data ?? [];
  const totalBids = stats.reduce((s, t) => s + t.bid_count, 0);
  const withInterest = stats.filter((t) => t.bid_count > 0).length;
  const licensed = stats.filter((t) => t.licensed_amount !== null).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">How broadcasters are responding to your catalogue.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Bids received" value={String(totalBids)} />
        <Stat label="Titles attracting bids" value={String(withInterest)} />
        <Stat label="Licensed" value={String(licensed)} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">By title</h2>
        {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {data && stats.length === 0 && <p className="text-sm text-gray-500">No titles yet.</p>}
        {stats.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Bids</th>
                  <th className="px-4 py-3 text-right font-medium">Top bid</th>
                  <th className="px-4 py-3 text-right font-medium">Licensed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.map((t) => (
                  <tr key={t.asset_id} className="text-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={thumbUrl({ id: t.asset_id, title: t.title })}
                          alt=""
                          className="h-9 w-16 shrink-0 rounded object-cover"
                        />
                        <span className="font-medium text-gray-900">{t.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{t.bid_count}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                      {t.top_amount !== null ? money(t.top_amount, t.currency) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                      {t.licensed_amount !== null ? money(t.licensed_amount, t.currency) : '—'}
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
