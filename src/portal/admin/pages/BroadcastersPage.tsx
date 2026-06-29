import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import { hoursSince, relativeTime } from '../../shared/format';
import type { AdminBroadcasterRow, AdminOrganisations } from '../../shared/types';
import { humanize, initials } from '../adminUi';
import '../admin.css';

export function AdminBroadcastersPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');

  const qc = useQueryClient();
  const { data, isLoading } = useQuery<AdminOrganisations>({
    queryKey: ['admin-organisations'],
    queryFn: () => apiGet<AdminOrganisations>('/api/v1/admin/organisations/'),
  });
  const verify = useMutation({
    mutationFn: (id: number) =>
      apiPost(`/api/v1/admin/organisations/broadcasters/${id}/verify/`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-organisations'] }),
  });

  const broadcasters = data?.broadcasters ?? [];
  const categories = Array.from(new Set(broadcasters.map((b) => b.category))).sort();

  const rows = broadcasters.filter((b) => {
    if (category !== 'all' && b.category !== category) return false;
    return !q || b.name.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Broadcasters</div>
        <div className="page-sub">Broadcasters registered on Didactik</div>
      </div>

      <div className="filter-bar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search broadcasters…" />
        <select className="status-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All types</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {humanize(c)}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div className="page-sub">Loading…</div>}
      {data && rows.length === 0 && (
        <div className="empty-state">
          {category !== 'all' || q ? (
            <>
              <div className="empty-state-title">No broadcasters match this filter.</div>
              <div className="empty-state-hint">Clear the search or type filter to see all broadcasters.</div>
              <button
                type="button"
                className="btn-sm"
                onClick={() => {
                  setQ('');
                  setCategory('all');
                }}
              >
                Clear filter
              </button>
            </>
          ) : (
            <>
              <div className="empty-state-title">No broadcasters yet.</div>
              <div className="empty-state-hint">Registered broadcasters will appear here.</div>
            </>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <table className="org-table">
          <thead>
            <tr>
              <th>Broadcaster</th>
              <th>Type</th>
              <th>Country</th>
              <th>Last active</th>
              <th className="num">Screener reqs</th>
              <th className="num">Watchlists</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <Row key={b.id} b={b} onVerify={() => verify.mutate(b.id)} verifying={verify.isPending} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Row({
  b,
  onVerify,
  verifying,
}: {
  b: AdminBroadcasterRow;
  onVerify: () => void;
  verifying: boolean;
}) {
  const verified = b.verification_status === 'verified';
  const activeTone = b.last_activity && hoursSince(b.last_activity) <= 72 ? 'active' : '';
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            className="org-avatar"
            style={
              verified
                ? { background: 'var(--bg-pro)', color: 'var(--text-pro)' }
                : { background: 'var(--bg-warning)', color: 'var(--text-warning)' }
            }
          >
            {initials(b.name)}
          </div>
          <div style={{ fontWeight: 500, fontSize: 12 }}>{b.name}</div>
        </div>
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{humanize(b.category)}</td>
      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.country}</td>
      <td>
        <span className={`activity-badge ${activeTone}`}>{relativeTime(b.last_activity)}</span>
      </td>
      <td
        className="num"
        style={{
          fontSize: 12,
          color: b.screener_request_count > 0 ? 'var(--text-accent)' : 'var(--text-muted)',
        }}
      >
        {b.screener_request_count}
      </td>
      <td className="num" style={{ fontSize: 12 }}>
        {b.watchlist_count}
      </td>
      <td>
        <span className={`verified-badge ${verified ? 'verified-yes' : 'verified-no'}`}>
          {verified ? 'Verified' : 'Pending'}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          {!verified && (
            <button type="button" className="btn-sm btn-primary" onClick={onVerify} disabled={verifying}>
              Verify
            </button>
          )}
          <button type="button" className="btn-sm">
            View broadcaster
          </button>
        </div>
      </td>
    </tr>
  );
}
