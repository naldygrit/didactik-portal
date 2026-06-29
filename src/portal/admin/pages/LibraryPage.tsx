import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '../../shared/apiHelpers';
import type { AdminTitle, TitleStatus } from '../../shared/types';

const hairline = { borderColor: 'var(--hairline)' };

const STATUS_DOT: Record<TitleStatus, string> = {
  draft: 'bg-zinc-500',
  submitted: 'bg-amber-400',
  under_review: 'bg-indigo-400',
  changes_requested: 'bg-orange-400',
  approved: 'bg-sky-400',
  active: 'bg-emerald-400',
  suspended: 'bg-red-400',
  archived: 'bg-zinc-600',
};

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

function statusLabel(s: string): string {
  return s.replace(/_/g, ' ');
}

export function AdminLibraryPage() {
  const [q, setQ] = useState('');
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

  const rows = (data ?? []).filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--ink)]">Library</h1>
          <p className="text-sm text-[var(--muted)]">Every title on the platform.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter titles…"
          className="rounded-md border bg-[var(--surface-raised)] px-3 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          style={hairline}
        />
      </div>

      {isLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}

      {data && rows.length === 0 && <p className="text-sm text-[var(--muted)]">No titles match.</p>}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border" style={hairline}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-[var(--muted)]" style={hairline}>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Producer</th>
                <th className="px-4 py-2.5 text-right font-medium">Score</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Change status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr
                  key={t.slug}
                  className="transition-colors hover:bg-[var(--surface-hover)]"
                  style={{
                    ...(i === 0 ? undefined : { borderTop: '1px solid var(--hairline)' }),
                    ...(highlightSlug === t.slug ? { background: 'var(--surface-hover)' } : {}),
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="text-[var(--ink)]">{t.name}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {statusLabel(t.title_type)}
                      {t.production_year ? ` · ${t.production_year}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {t.production_company?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--muted)]">
                    {t.metadata_score}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[t.status] ?? 'bg-zinc-500'}`} />
                      <span className="capitalize">{statusLabel(t.status)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={t.status}
                      disabled={changeStatus.isPending}
                      onChange={(e) => handleStatusChange(t, e.target.value as TitleStatus)}
                      className="rounded-md border bg-[var(--surface-raised)] px-2 py-1.5 text-xs capitalize text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50"
                      style={hairline}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
