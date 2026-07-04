import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '../../shared/apiHelpers';
import { ageTone, relativeTime } from '../../shared/format';
import type { AdminTitle, TitleStatus } from '../../shared/types';
import { humanize, scoreFillClass, statusDotClass } from '../adminUi';
import '../admin.css';
import { DkPageHeading } from '../components/DkPageHeading';
import { DkField } from '../../../components/dk/DkField';

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightSlug = searchParams.get('title');
  const queryClient = useQueryClient();

  // Follow ?status=<x> from the sidebar ("Under review"), and reset to "all"
  // when navigating to plain Library — otherwise the filter stays sticky.
  const urlStatus = searchParams.get('status');
  useEffect(() => {
    setStatusFilter(urlStatus ? (urlStatus as TitleStatus) : 'all');
  }, [urlStatus]);

  // Clear the active status filter from both the local state and the URL, so
  // the chip always resets the list to "all titles" in one click.
  function clearStatusFilter() {
    setStatusFilter('all');
    if (urlStatus) {
      const next = new URLSearchParams(searchParams);
      next.delete('status');
      setSearchParams(next, { replace: true });
    }
  }

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

  // Bulk moderation across the selected rows.
  function bulkApprove() {
    selected.forEach((slug) => changeStatus.mutate({ slug, status: 'approved' }));
    setSelected(new Set());
  }
  function bulkRequestChanges() {
    const note = window.prompt('What changes should the producers make? (applied to all selected)');
    if (!note || !note.trim()) return;
    selected.forEach((slug) => changeStatus.mutate({ slug, status: 'changes_requested', note }));
    setSelected(new Set());
  }
  function toggleRow(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
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
      <DkPageHeading title="Library" subtitle="Every title submitted to Didactik" />

      <div className="filter-bar">
        <DkField label="Filter titles, producers" visuallyHiddenLabel className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter titles, producers…"
          />
        </DkField>
        <DkField label="Filter by status" visuallyHiddenLabel>
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
        </DkField>
      </div>

      {statusFilter !== 'all' && (
        <div className="filter-chip-row">
          <span className="filter-chip">
            <span className="chip-label">Filtered: {humanize(statusFilter)}</span>
            <button type="button" aria-label="Clear filter" onClick={clearStatusFilter}>
              ×
            </button>
          </span>
        </div>
      )}

      {isLoading && (
        <div className="page-sub" role="status" aria-live="polite">
          Loading…
        </div>
      )}
      {data && rows.length === 0 && (
        <div className="empty-state">
          {statusFilter !== 'all' || q ? (
            <>
              <div className="empty-state-title">No titles match this filter.</div>
              <div className="empty-state-hint">Clear the filter to see all titles.</div>
              <button
                type="button"
                className="btn-sm"
                onClick={() => {
                  setQ('');
                  clearStatusFilter();
                }}
              >
                Clear filter
              </button>
            </>
          ) : (
            <>
              <div className="empty-state-title">No titles yet.</div>
              <div className="empty-state-hint">
                Submitted titles from production companies will appear here.
              </div>
            </>
          )}
        </div>
      )}

      {selected.size > 0 && (
        <div className="bulk-bar" role="status" aria-live="polite">
          <span className="bulk-count">{selected.size} selected</span>
          <button type="button" className="btn-sm btn-primary" onClick={bulkApprove}>
            Approve all
          </button>
          <button type="button" className="btn-sm" onClick={bulkRequestChanges}>
            Request changes
          </button>
          <button
            type="button"
            className="bulk-clear"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <table className="lib-table" aria-label="Library">
          <thead>
            <tr>
              <th className="check-col">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={selected.size === rows.length && rows.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(rows.map((t) => t.slug)) : new Set())
                  }
                />
              </th>
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
                  style={
                    selected.has(t.slug) || highlightSlug === t.slug
                      ? { background: 'var(--surface-2)' }
                      : undefined
                  }
                >
                  <td className="check-col">
                    <input
                      type="checkbox"
                      aria-label={`Select ${t.name}`}
                      checked={selected.has(t.slug)}
                      onChange={() => toggleRow(t.slug)}
                    />
                  </td>
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
