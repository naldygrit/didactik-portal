import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { apiGet } from '../../shared/apiHelpers';
import { ageTone, relativeTime } from '../../shared/format';
import type { AdminOrganisations, AdminProductionCompanyRow } from '../../shared/types';
import { initials } from '../adminUi';
import '../admin.css';

type Filter = 'all' | 'verified' | 'unverified';

export function AdminProductionCompaniesPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [searchParams] = useSearchParams();

  // The sidebar "Verifications" item routes here with ?filter=unverified.
  const urlFilter = searchParams.get('filter');
  useEffect(() => {
    if (urlFilter === 'unverified' || urlFilter === 'verified') setFilter(urlFilter);
  }, [urlFilter]);

  const { data, isLoading } = useQuery<AdminOrganisations>({
    queryKey: ['admin-organisations'],
    queryFn: () => apiGet<AdminOrganisations>('/api/v1/admin/organisations/'),
  });

  const rows = (data?.production_companies ?? []).filter((c) => {
    const verified = c.verification_status === 'verified';
    if (filter === 'verified' && !verified) return false;
    if (filter === 'unverified' && verified) return false;
    return !q || c.name.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Production companies</div>
        <div className="page-sub">All registered production companies on the platform</div>
      </div>

      <div className="filter-bar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies…" />
        <select className="status-select" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {isLoading && <div className="page-sub">Loading…</div>}
      {data && rows.length === 0 && <div className="page-sub">No companies match.</div>}

      {rows.length > 0 && (
        <table className="org-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Country</th>
              <th>Titles</th>
              <th>Active titles</th>
              <th>Last submission</th>
              <th>Screener reqs</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <Row key={c.id} c={c} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Row({ c }: { c: AdminProductionCompanyRow }) {
  const verified = c.verification_status === 'verified';
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            className="org-avatar"
            style={
              verified
                ? undefined
                : { background: 'var(--bg-warning)', color: 'var(--text-warning)' }
            }
          >
            {initials(c.name)}
          </div>
          <div style={{ fontWeight: 500, fontSize: 12 }}>{c.name}</div>
        </div>
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.country}</td>
      <td style={{ fontSize: 12, fontWeight: 500 }}>{c.title_count}</td>
      <td
        style={{
          fontSize: 12,
          color: c.active_title_count > 0 ? 'var(--text-success)' : 'var(--text-muted)',
        }}
      >
        {c.active_title_count}
      </td>
      <td>
        <span className={`age ${verified ? '' : ageTone(c.last_activity)}`}>
          {relativeTime(c.last_activity)}
        </span>
      </td>
      <td
        style={{
          fontSize: 12,
          textAlign: 'center',
          color: c.screener_request_count > 0 ? 'var(--text-accent)' : 'var(--text-muted)',
        }}
      >
        {c.screener_request_count}
      </td>
      <td>
        <span className={`verified-badge ${verified ? 'verified-yes' : 'verified-no'}`}>
          {verified ? 'Verified' : 'Pending'}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          {!verified && (
            <button type="button" className="btn-sm btn-primary" disabled title="Verification endpoint pending">
              Verify
            </button>
          )}
          <button type="button" className="btn-sm">
            View
          </button>
        </div>
      </td>
    </tr>
  );
}
