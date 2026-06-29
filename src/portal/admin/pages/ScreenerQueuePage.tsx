import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import { ageTone, relativeTime } from '../../shared/format';
import type { AdminScreenerRequest } from '../../shared/types';
import { humanize } from '../adminUi';
import '../admin.css';

const PURPOSE_LABELS: Record<string, string> = {
  acquisition_evaluation: 'Acquisition evaluation',
  programming_review: 'Programming review',
  co_production_interest: 'Co-production interest',
  archival_research: 'Archival research',
};

type Tab = 'all' | 'pending' | 'approved' | 'declined';

const PILL_CLASS: Record<string, string> = {
  pending: 'pill-pending',
  approved: 'pill-approved',
  accessed: 'pill-approved',
  declined: 'pill-declined',
  expired: 'pill-declined',
};

// Per-tab empty states: a heading plus what it means, so a clear tab never reads
// as a blank screen.
const EMPTY_COPY: Record<Tab, { title: string; hint: string }> = {
  pending: { title: 'No requests waiting.', hint: 'New broadcaster requests land here for review.' },
  approved: { title: 'No approved requests yet.', hint: 'Requests you approve will show here.' },
  declined: { title: 'No declined requests.', hint: 'Requests you decline or that expire will show here.' },
  all: { title: 'No screener requests yet.', hint: 'Broadcaster requests will appear here once they come in.' },
};

export function AdminScreenerQueuePage() {
  const queryClient = useQueryClient();
  // Default to the actionable queue — clearing pending requests is the job.
  const [tab, setTab] = useState<Tab>('pending');
  // Per-request approve duration (hours) and decline reason, kept local until acted on.
  const [hours, setHours] = useState<Record<string, number>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<AdminScreenerRequest[]>({
    queryKey: ['admin-screener-requests'],
    queryFn: () => apiGet<AdminScreenerRequest[]>('/api/v1/admin/screener-requests/'),
  });

  const approve = useMutation({
    mutationFn: ({ uuid, access_duration_hours }: { uuid: string; access_duration_hours: number }) =>
      apiPost(`/api/v1/admin/screener-requests/${uuid}/approve/`, { access_duration_hours }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-screener-requests'] }),
  });

  const decline = useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) =>
      apiPost(`/api/v1/admin/screener-requests/${uuid}/decline/`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-screener-requests'] }),
  });

  const all = data ?? [];
  const counts = {
    all: all.length,
    pending: all.filter((r) => r.status === 'pending').length,
    approved: all.filter((r) => r.status === 'approved' || r.status === 'accessed').length,
    declined: all.filter((r) => r.status === 'declined' || r.status === 'expired').length,
  };

  const rows = all.filter((r) => {
    if (tab === 'all') return true;
    if (tab === 'pending') return r.status === 'pending';
    if (tab === 'approved') return r.status === 'approved' || r.status === 'accessed';
    return r.status === 'declined' || r.status === 'expired';
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Screeners</div>
        <div className="page-sub">
          Approve or decline broadcaster screener requests ({counts.pending} pending)
        </div>
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          Pending ({counts.pending})
        </button>
        <button type="button" className={`tab ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>
          Approved ({counts.approved})
        </button>
        <button type="button" className={`tab ${tab === 'declined' ? 'active' : ''}`} onClick={() => setTab('declined')}>
          Declined ({counts.declined})
        </button>
        <button type="button" className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All ({counts.all})
        </button>
      </div>

      {isLoading && <div className="page-sub">Loading…</div>}
      {data && rows.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">{EMPTY_COPY[tab].title}</div>
          <div className="empty-state-hint">{EMPTY_COPY[tab].hint}</div>
        </div>
      )}

      {rows.map((req) => {
        const isPending = req.status === 'pending';
        const tone = ageTone(req.requested_at);
        const territory = req.territory_interest.length > 0 ? req.territory_interest.join(', ') : '—';
        return (
          <div className="screener-card" key={req.uuid} style={isPending ? undefined : { opacity: 0.85 }}>
            <div className="screener-header">
              <div>
                <div className="screener-title">{req.title_name}</div>
                <div className="screener-meta">
                  {req.broadcaster.name} · {PURPOSE_LABELS[req.purpose] ?? humanize(req.purpose)} · Territories:{' '}
                  {territory}
                </div>
              </div>
              <span className={`status-pill ${PILL_CLASS[req.status] ?? 'pill-pending'}`}>
                {humanize(req.status)}
              </span>
            </div>

            {req.message_to_producer && (
              <div className="screener-msg">“{req.message_to_producer}”</div>
            )}

            {isPending ? (
              <div className="screener-actions">
                <label className="access-input">
                  Access (hours)
                  <input
                    type="number"
                    min={1}
                    value={hours[req.uuid] ?? 48}
                    onChange={(e) => setHours((h) => ({ ...h, [req.uuid]: Number(e.target.value) }))}
                  />
                </label>
                <button
                  type="button"
                  className="btn-sm btn-primary"
                  disabled={approve.isPending}
                  onClick={() =>
                    approve.mutate({ uuid: req.uuid, access_duration_hours: hours[req.uuid] ?? 48 })
                  }
                >
                  Approve
                </button>
                <input
                  className="decline-input"
                  value={reasons[req.uuid] ?? ''}
                  onChange={(e) => setReasons((r) => ({ ...r, [req.uuid]: e.target.value }))}
                  placeholder="Decline reason (optional)"
                />
                <button
                  type="button"
                  className="btn-sm btn-danger"
                  disabled={decline.isPending}
                  onClick={() => decline.mutate({ uuid: req.uuid, reason: reasons[req.uuid] ?? '' })}
                >
                  Decline
                </button>
                <span className={`age ${tone}`} style={{ marginLeft: 'auto' }}>
                  {relativeTime(req.requested_at, 'requested')}
                </span>
              </div>
            ) : (
              <div className="page-sub">
                {req.access_expires_at &&
                  `Access expires ${new Date(req.access_expires_at).toLocaleDateString('en-GB')}`}
                {req.access_count > 0 && ` · ${req.access_count} views`}
                {req.reviewed_at && ` · reviewed ${relativeTime(req.reviewed_at)}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
