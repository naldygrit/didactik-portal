import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { AdminRevenue } from '../../shared/types';
import '../admin.css';

function money(amount: string | number, currency = 'USD'): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  return `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function AdminRevenuePage() {
  const { data } = useQuery<AdminRevenue>({
    queryKey: ['admin-revenue'],
    queryFn: () => apiGet<AdminRevenue>('/api/v1/admin/revenue/'),
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Revenue</div>
        <div className="page-sub">
          Gross licence value and Didactik's commission across closed deals.
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi">
          <div className="kpi-label">Deals closed</div>
          <div className="kpi-val">{data?.deal_count ?? '—'}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Gross licence value</div>
          <div className="kpi-val">{data ? money(data.gmv) : '—'}</div>
        </div>
        <div className="kpi primary">
          <div className="kpi-label">Didactik commission</div>
          <div className="kpi-val">{data ? money(data.commission) : '—'}</div>
        </div>
      </div>

      <div className="card-title" style={{ margin: '18px 0 8px' }}>
        Recent deals
      </div>
      {data && data.recent_deals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No deals yet.</div>
          <div className="empty-state-hint">
            Closed licence deals and their commission will appear here.
          </div>
        </div>
      ) : (
        <table className="lib-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Broadcaster</th>
              <th>Producer</th>
              <th>Territory</th>
              <th className="num">Licence fee</th>
              <th className="num">Commission</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recent_deals ?? []).map((d) => (
              <tr key={d.uuid}>
                <td>
                  <div style={{ fontWeight: 500, fontSize: 12 }}>{d.title_name}</div>
                  <div className="title-type">
                    {d.license_type === 'exclusive' ? 'Exclusive' : 'Non-exclusive'} ·{' '}
                    {d.rights_type.toUpperCase()}
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.broadcaster_name}</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {d.production_company_name}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.territory}</td>
                <td className="num" style={{ fontSize: 12, fontWeight: 500 }}>
                  {money(d.amount, d.currency)}
                </td>
                <td className="num" style={{ fontSize: 12, color: 'var(--text-accent)', fontWeight: 600 }}>
                  {money(d.commission_amount, d.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
