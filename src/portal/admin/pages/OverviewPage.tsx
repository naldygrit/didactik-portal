import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import { ageTone, hoursSince, relativeTime } from '../../shared/format';
import type {
  AdminDashboard,
  AdminOrganisations,
  AdminScreenerRequest,
} from '../../shared/types';
import { initials, statusThumbBg } from '../adminUi';
import '../admin.css';
import { DkPageHeading } from '../components/DkPageHeading';
import { DkCardTitle } from '../components/DkCardTitle';

function formatBytes(bytes: number): string {
  const tb = bytes / 1_000_000_000_000;
  if (tb >= 1) return `${tb.toFixed(1)} TB`;
  return `${(bytes / 1_000_000_000).toFixed(0)} GB`;
}

export function AdminOverviewPage() {
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();

  const { data } = useQuery<AdminDashboard>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiGet<AdminDashboard>('/api/v1/admin/dashboard/'),
  });
  const { data: screeners } = useQuery<AdminScreenerRequest[]>({
    queryKey: ['admin-screener-requests'],
    queryFn: () => apiGet<AdminScreenerRequest[]>('/api/v1/admin/screener-requests/'),
  });
  const { data: orgs } = useQuery<AdminOrganisations>({
    queryKey: ['admin-organisations'],
    queryFn: () => apiGet<AdminOrganisations>('/api/v1/admin/organisations/'),
  });

  // Approve / decline straight from the Overview panel (same contract the
  // Screeners page uses), so the queue is actionable without navigating away.
  const approve = useMutation({
    mutationFn: (uuid: string) =>
      apiPost(`/api/v1/admin/screener-requests/${uuid}/approve/`, { access_duration_hours: 48 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-screener-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
  const decline = useMutation({
    mutationFn: (uuid: string) =>
      apiPost(`/api/v1/admin/screener-requests/${uuid}/decline/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-screener-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const triage = data?.triage_queue ?? [];
  const byStatus = data?.content.by_status ?? {};
  const screenerByStatus = data?.screeners.by_status ?? {};
  const screenersApproved = (screenerByStatus.approved ?? 0) + (screenerByStatus.accessed ?? 0);
  const pendingScreeners = (screeners ?? []).filter((r) => r.status === 'pending');
  const overdueScreeners = pendingScreeners.filter((r) => hoursSince(r.requested_at) > 48).length;

  const pcs = orgs?.production_companies ?? [];
  const bcs = orgs?.broadcasters ?? [];
  const unverified = [
    ...pcs
      .filter((o) => o.verification_status !== 'verified')
      .map((o) => ({ id: `pc-${o.id}`, name: o.name, kind: 'Production company', country: o.country, created_at: o.created_at })),
    ...bcs
      .filter((o) => o.verification_status !== 'verified')
      .map((o) => ({ id: `bc-${o.id}`, name: o.name, kind: 'Broadcaster', country: o.country, created_at: o.created_at })),
  ];

  // Production-company activity: most-recently-active first.
  const pcActivity = [...pcs].sort(byLastActivity).slice(0, 4);
  const bcActivity = [...bcs].sort(byLastActivity).slice(0, 4);

  const coverage = data?.rights_coverage ?? [];

  // Subtle, tasteful panel entrance — dense console, not a marketing reveal.
  const panel = {
    hidden: reduce ? {} : { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const } },
  };

  return (
    <div>
      <DkPageHeading title="Overview" subtitle="Platform health and the work waiting on you" />

      {/* Content pipeline — every status, so triage state reads at a glance. */}
      <div className="kpi-row-label">Content pipeline</div>
      <div className="kpi-grid" aria-busy={!data}>
        <Kpi label="Total titles" value={data?.content.total_titles} />
        <Kpi label="Active" value={byStatus.active ?? 0} />
        <Kpi label="Under review" value={byStatus.under_review ?? 0} primary={(byStatus.under_review ?? 0) > 0} />
        <Kpi
          label="Changes requested"
          value={byStatus.changes_requested ?? 0}
          primary={(byStatus.changes_requested ?? 0) > 0}
        />
        <Kpi label="Approved" value={byStatus.approved ?? 0} delta="awaiting activation" />
        <Kpi label="Drafts" value={byStatus.draft ?? 0} small />
      </div>

      {/* Engagement & organisations. Deltas only where a real sub-line exists. */}
      <div className="kpi-row-label">Engagement &amp; organisations</div>
      <div className="kpi-grid" aria-busy={!data}>
        <Kpi
          label="Screeners pending"
          value={data?.screeners.pending_queue}
          delta={overdueScreeners > 0 ? `${overdueScreeners} over 48h` : undefined}
          deltaTone="danger"
          primary
        />
        <Kpi label="Screeners approved" value={screenersApproved} />
        <Kpi label="Production cos" value={data?.organisations.production_companies} />
        <Kpi label="Broadcasters" value={data?.organisations.broadcasters} />
        <Kpi
          label="Awaiting verify"
          value={unverified.length}
          delta={unverified.length > 0 ? 'action needed' : undefined}
          deltaTone="warn"
          primary={unverified.length > 0}
        />
        <Kpi
          label="Storage"
          value={data ? formatBytes(data.storage.total_bytes) : undefined}
          small
        />
      </div>

      <div className="two-col">
        {/* Left column — the admin's work surfaces. */}
        <div>
          <motion.div className="card" variants={panel} initial="hidden" animate="show">
            <div className="card-header">
              <DkCardTitle>Triage queue</DkCardTitle>
              <Link className="card-link" to="/portal/admin/library">
                View library →
              </Link>
            </div>
            {triage.length === 0 ? (
              <div className="page-sub">Nothing to triage. The queue is clear.</div>
            ) : (
              triage.map((row) => {
                const tone = ageTone(row.updated_at);
                return (
                  <div className="triage-row" key={row.slug}>
                    <div className="triage-left">
                      <div className="triage-thumb" style={{ background: statusThumbBg(row.status) }} />
                      <div className="triage-info">
                        <span className="triage-name">{row.name}</span>
                        <span className="triage-meta">
                          {row.production_company} · {humanizeStatus(row.status)}
                        </span>
                      </div>
                    </div>
                    <div className="triage-right">
                      <span className={`age ${tone}`}>{relativeTime(row.updated_at)}</span>
                      <Link
                        className="btn-sm"
                        to={`/portal/admin/library?title=${encodeURIComponent(row.slug)}`}
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>

          <motion.div className="card" variants={panel} initial="hidden" animate="show">
            <div className="card-header">
              <DkCardTitle>Screeners pending</DkCardTitle>
              <Link className="card-link" to="/portal/admin/screeners">
                View all →
              </Link>
            </div>
            {pendingScreeners.length === 0 ? (
              <div className="page-sub">No pending screener requests.</div>
            ) : (
              pendingScreeners.map((req) => {
                const tone = ageTone(req.requested_at);
                return (
                  <div className="triage-row" key={req.uuid}>
                    <div className="triage-left">
                      <div className="triage-info">
                        <span className="triage-name">{req.title_name}</span>
                        <span className="triage-meta">
                          {req.broadcaster.name}
                          {req.territory_interest.length > 0 &&
                            ` · ${req.territory_interest.join(', ')}`}
                        </span>
                      </div>
                    </div>
                    <div className="triage-right">
                      <span className={`age ${tone}`}>{relativeTime(req.requested_at)}</span>
                      <button
                        type="button"
                        className="btn-sm btn-primary"
                        disabled={approve.isPending}
                        onClick={() => approve.mutate(req.uuid)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-sm"
                        disabled={decline.isPending}
                        onClick={() => decline.mutate(req.uuid)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>

          <motion.div className="card" variants={panel} initial="hidden" animate="show">
            <div className="card-header">
              <DkCardTitle>Organisations awaiting verification</DkCardTitle>
            </div>
            {unverified.length === 0 ? (
              <div className="page-sub">Every organisation is verified.</div>
            ) : (
              unverified.map((o) => (
                <div className="triage-row" key={o.id}>
                  <div className="triage-left">
                    <div
                      className="org-avatar"
                      style={{ background: 'var(--bg-warning)', color: 'var(--text-warning)' }}
                    >
                      {initials(o.name)}
                    </div>
                    <div className="triage-info" style={{ marginLeft: 8 }}>
                      <span className="triage-name">{o.name}</span>
                      <span className="triage-meta">
                        {o.kind} · {o.country} · Applied {relativeTime(o.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="triage-right">
                    <Link
                      className="btn-sm btn-primary"
                      to={
                        o.kind === 'Broadcaster'
                          ? '/portal/admin/broadcasters'
                          : '/portal/admin/production'
                      }
                    >
                      Verify
                    </Link>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>

        {/* Right column — context: org activity + rights coverage. */}
        <div>
          <motion.div className="card" variants={panel} initial="hidden" animate="show">
            <div className="card-header">
              <DkCardTitle>Production company activity</DkCardTitle>
              <Link className="card-link" to="/portal/admin/production">
                View all →
              </Link>
            </div>
            {pcActivity.map((o) => (
              <div className="stat-row" key={o.id}>
                <span className="stat-label">{o.name}</span>
                <span className={`activity-badge ${activityClass(o.last_activity)}`}>
                  {relativeTime(o.last_activity)} · {o.title_count} title
                  {o.title_count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div className="card" variants={panel} initial="hidden" animate="show">
            <div className="card-header">
              <DkCardTitle>Broadcaster activity</DkCardTitle>
              <Link className="card-link" to="/portal/admin/broadcasters">
                View all →
              </Link>
            </div>
            {bcActivity.map((o) => (
              <div className="stat-row" key={o.id}>
                <span className="stat-label">{o.name}</span>
                <span className={`activity-badge ${activityClass(o.last_activity)}`}>
                  {relativeTime(o.last_activity)} · {o.screener_request_count} screener req
                  {o.screener_request_count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div className="card" variants={panel} initial="hidden" animate="show">
            <div className="card-header">
              <DkCardTitle>Rights coverage by territory</DkCardTitle>
            </div>
            <div className="bar-wrap">
              {coverage.map((c) => (
                <div className="bar-row" key={c.territory}>
                  <span className="bar-label">{c.territory}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="bar-pct">{c.pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function activityClass(iso: string | null): string {
  const h = hoursSince(iso);
  if (iso && h <= 72) return 'active';
  return '';
}

function byLastActivity(a: { last_activity: string | null }, b: { last_activity: string | null }): number {
  const ta = a.last_activity ? new Date(a.last_activity).getTime() : 0;
  const tb = b.last_activity ? new Date(b.last_activity).getTime() : 0;
  return tb - ta;
}

function humanizeStatus(value: string): string {
  const spaced = value.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function Kpi({
  label,
  value,
  delta,
  deltaTone,
  small,
  primary,
}: {
  label: string;
  value: number | string | undefined;
  delta?: string;
  deltaTone?: 'up' | 'warn' | 'danger';
  small?: boolean;
  primary?: boolean;
}) {
  return (
    <div className={`kpi${primary ? ' primary' : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-val" style={small ? { fontSize: 15 } : undefined}>
        {value ?? '—'}
      </div>
      {/* Reference shows a delta line on every KPI; we only render one where a
          real, derived sub-line exists (no fabricated numbers). */}
      {delta && <div className={`kpi-delta ${deltaTone ?? ''}`}>{delta}</div>}
    </div>
  );
}
