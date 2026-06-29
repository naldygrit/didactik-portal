import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '../../shared/apiHelpers';
import { ageTone, relativeTime } from '../../shared/format';
import type { AdminTitle, TitleStatus } from '../../shared/types';
import { humanize, scoreFillClass, statusDotClass } from '../adminUi';
import '../admin.css';

const STATUS_OPTIONS: TitleStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'changes_requested',
  'approved',
  'active',
  'suspended',
  'archived',
];

export function AdminLibraryPage() {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TitleStatus>('all');
  const [searchParams] = useSearchParams();
  const highlightSlug = searchParams.get('title');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AdminTitle[]>({
    queryKey: ['admin-titles'],
    queryFn: () => apiGet<AdminTitle[]>('/api/v1/admin/titles/'),
  });

  const changeStatus = useMutation({
    mutationFn: ({ slug, status, note }: { slug: string; status: TitleStatus; note?: string }) =>
      apiPatch(`/api/v1/admin/titles/${slug}/status/`, note ? { status, note } : { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-titles'] }),
  });

  function handleStatusChange(title: AdminTitle, next: TitleStatus) {
    if (next === title.status) return;
    let note: string | undefined;
    if (next === 'changes_requested') {
      // The note is shown to the producer; capture it before transitioning.
      note = window.prompt('What changes should the producer make?') ?? '';
      if (!note.trim()) return;
    }
    changeStatus.mutate({ slug: title.slug, status: next, note });
  }

  const rows = (data ?? []).filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      t.name.toLowerCase().includes(needle) ||
      (t.production_company?.name ?? '').toLowerCase().includes(needle)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Library</div>
        <div className="page-sub">Every title on the platform</div>
      </div>

      <div className="filter-bar">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter titles, producers…"
        />
        <select
          className="status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | TitleStatus)}
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div className="page-sub">Loading…</div>}
      {data && rows.length === 0 && <div className="page-sub">No titles match.</div>}

      {rows.length > 0 && (
        <table className="lib-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Producer</th>
              <th>Score</th>
              <th>Time in status</th>
              <th>Status</th>
              <th>Screeners</th>
              <th>Change status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              // status_changed_at is the truest "time in status"; fall back to
              // updated_at when the title hasn't transitioned yet.
              const since = t.status_changed_at ?? t.updated_at;
              const tone = t.status === 'submitted' || t.status === 'under_review' ? ageTone(since) : '';
              return (
                <tr
                  key={t.slug}
                  style={highlightSlug === t.slug ? { background: 'var(--surface-2)' } : undefined}
                >
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{t.name}</div>
                    <div className="title-type">
                      {humanize(t.title_type)}
                      {t.production_year ? ` · ${t.production_year}` : ''}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {t.production_company?.name ?? '—'}
                  </td>
                  <td>
                    <div className="score-bar">
                      <div className="score-track">
                        <div
                          className={`score-fill ${scoreFillClass(t.metadata_score)}`}
                          style={{ width: `${t.metadata_score}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {t.metadata_score}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`age ${tone}`}>{relativeTime(since, humanize(t.status))}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div className={`status-dot ${statusDotClass(t.status)}`} />
                      <span style={{ fontSize: 12 }}>{humanize(t.status)}</span>
                    </div>
                  </td>
                  {/* The admin Title projection carries no per-title screener
                      count, so we honestly render an em dash rather than fake one. */}
                  <td style={{ fontSize: 12, textAlign: 'center', color: 'var(--text-muted)' }}>—</td>
                  <td>
                    <select
                      className="status-select"
                      value={t.status}
                      disabled={changeStatus.isPending}
                      onChange={(e) => handleStatusChange(t, e.target.value as TitleStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {humanize(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
