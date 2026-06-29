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
  const [searchParams, setSearchParams] = useSearchParams();

  // Follow the sidebar's ?filter (Verifications -> unverified), and reset to
  // "all" when navigating to plain Production companies — no sticky filter.
  const urlFilter = searchParams.get('filter');
  useEffect(() => {
    setFilter(urlFilter === 'unverified' || urlFilter === 'verified' ? urlFilter : 'all');
  }, [urlFilter]);

  // Clear the verification filter from both local state and the URL, so the chip
  // resets the list to all companies in one click.
  function clearFilter() {
    setFilter('all');
    if (urlFilter) {
      const next = new URLSearchParams(searchParams);
      next.delete('filter');
      setSearchParams(next, { replace: true });
    }
  }

  const FILTER_LABEL: Record<Exclude<Filter, 'all'>, string> = {
    verified: 'Verified',
    unverified: 'Unverified',
  };

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
        <div className="page-sub">Production companies registered on Didactik</div>
      </div>

      <div className="filter-bar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies…" />
        <select className="status-select" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {filter !== 'all' && (
        <div className="filter-chip-row">
          <span className="filter-chip">
            <span className="chip-label">Filtered: {FILTER_LABEL[filter]}</span>
            <button type="button" aria-label="Clear filter" onClick={clearFilter}>
              ×
            </button>
          </span>
        </div>
      )}

      {isLoading && <div className="page-sub">Loading…</div>}
      {data && rows.length === 0 && (
        <div className="empty-state">
          {filter !== 'all' || q ? (
            <>
              <div className="empty-state-title">No companies match this filter.</div>
              <div className="empty-state-hint">Clear the filter to see all companies.</div>
              <button
                type="button"
                className="btn-sm"
                onClick={() => {
                  setQ('');
                  clearFilter();
                }}
              >
                Clear filter
              </button>
            </>
          ) : (
            <>
              <div className="empty-state-title">No production companies yet.</div>
              <div className="empty-state-hint">Registered companies will appear here.</div>
            </>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <table className="org-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Country</th>
              <th className="num">Titles</th>
              <th className="num">Active titles</th>
              <th>Last submission</th>
              <th className="num">Screener reqs</th>
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
      <td className="num" style={{ fontSize: 12, fontWeight: 500 }}>
        {c.title_count}
      </td>
      <td
        className="num"
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
        className="num"
        style={{
          fontSize: 12,
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
            View company
          </button>
        </div>
      </td>
    </tr>
  );
}
