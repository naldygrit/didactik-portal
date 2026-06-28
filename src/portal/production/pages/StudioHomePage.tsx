import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { money, licenseTypeLabel } from '../../shared/format';
import { thumbUrl } from '../../shared/media';
import type { AssetListItem, Deal, MeResponse } from '../../shared/types';

export function ProductionStudioHomePage() {
  const { data: me } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiGet<MeResponse>('/api/v1/auth/me/'),
  });
  const { data: assets } = useQuery<AssetListItem[]>({
    queryKey: ['production-assets'],
    queryFn: () => apiGet<AssetListItem[]>('/api/v1/assets/'),
  });
  const { data: deals } = useQuery<Deal[]>({
    queryKey: ['deals'],
    queryFn: () => apiGet<Deal[]>('/api/v1/deals/'),
  });

  const company = me?.profile?.production_company?.name ?? 'Your studio';
  const titleCount = assets?.length ?? 0;
  const listed = (assets ?? []).filter((a) => a.status === 'ready_to_list').length;
  const earned = (deals ?? []).reduce((sum, d) => sum + d.amount, 0);

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

      {/* At a glance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Titles in catalogue" value={String(titleCount)} />
        <Stat label="Listed for licensing" value={String(listed)} />
        <Stat label="Total earned" value={money(earned, 'USD')} accent />
      </div>

      {/* Recent licences */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recently licensed</h2>
          <Link to="/portal/production/earnings" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Earnings
          </Link>
        </div>
        {deals && deals.length > 0 ? (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
            {deals.map((deal) => (
              <li key={deal.id} className="flex items-center gap-4 px-4 py-3">
                <img
                  src={thumbUrl({ id: deal.asset_id, title: deal.asset_title })}
                  alt=""
                  className="h-10 w-16 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-grow">
                  <p className="truncate font-medium text-gray-900">{deal.asset_title}</p>
                  <p className="text-xs text-gray-500">
                    {licenseTypeLabel(deal.license_type)} · {deal.broadcaster_name}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">{money(deal.amount, deal.currency)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
            <p className="text-sm text-gray-500">No licences yet. Listed titles appear to broadcasters to bid on.</p>
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
