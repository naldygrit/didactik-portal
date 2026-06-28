import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { money, licenseTypeLabel } from '../../shared/format';
import type { AssetListItem, Deal, DealDeskItem } from '../../shared/types';

const hairline = { borderColor: 'var(--hairline)' };

export function AdminOverviewPage() {
  const { data: assets } = useQuery<AssetListItem[]>({
    queryKey: ['assets'],
    queryFn: () => apiGet<AssetListItem[]>('/api/v1/assets/'),
  });
  const { data: desk } = useQuery<DealDeskItem[]>({
    queryKey: ['deals-desk'],
    queryFn: () => apiGet<DealDeskItem[]>('/api/v1/admin/deals-desk/'),
  });
  const { data: deals } = useQuery<Deal[]>({
    queryKey: ['deals'],
    queryFn: () => apiGet<Deal[]>('/api/v1/deals/'),
  });

  const listed = (assets ?? []).filter((a) => a.status === 'ready_to_list').length;
  const awaiting = (desk ?? []).filter((d) => !d.deal);
  const gmv = (deals ?? []).reduce((s, d) => s + d.amount, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-lg font-semibold text-[var(--ink)]">Overview</h1>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Listed" value={listed} />
        <Metric label="Awaiting acceptance" value={awaiting.length} highlight={awaiting.length > 0} />
        <Metric label="Deals closed" value={deals?.length ?? 0} />
        <Metric label="GMV" value={money(gmv, 'USD')} mono />
      </div>

      {/* Acceptance queue */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-[var(--ink)]">Awaiting your acceptance</h2>
          <Link to="/portal/admin/deals" className="text-xs text-[var(--accent)] hover:underline">
            Deals desk
          </Link>
        </div>
        {awaiting.length > 0 ? (
          <ul className="overflow-hidden rounded-lg border" style={hairline}>
            {awaiting.map((row, i) => (
              <li
                key={row.asset_id}
                className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
                style={i === 0 ? undefined : { borderTop: '1px solid var(--hairline)' }}
              >
                <span className="text-[var(--ink)]">{row.title}</span>
                <span className="font-mono tabular-nums text-[var(--muted)]">
                  {row.top_broadcaster} · {row.top_amount !== null ? money(row.top_amount, row.currency) : '—'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">Nothing awaiting. The desk is clear.</p>
        )}
      </section>

      {/* Recent deals */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-[var(--ink)]">Recent deals</h2>
        {deals && deals.length > 0 ? (
          <ul className="overflow-hidden rounded-lg border" style={hairline}>
            {deals.map((deal, i) => (
              <li
                key={deal.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
                style={i === 0 ? undefined : { borderTop: '1px solid var(--hairline)' }}
              >
                <span className="text-[var(--ink)]">{deal.asset_title}</span>
                <span className="text-[var(--muted)]">
                  {licenseTypeLabel(deal.license_type)} · {deal.broadcaster_name} ·{' '}
                  <span className="font-mono tabular-nums text-[var(--ink)]">
                    {money(deal.amount, deal.currency)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">No deals closed yet.</p>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border p-4" style={hairline}>
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${mono ? 'font-mono' : ''}`}
        style={{ color: highlight ? 'var(--accent)' : 'var(--ink)' }}
      >
        {value}
      </p>
    </div>
  );
}
