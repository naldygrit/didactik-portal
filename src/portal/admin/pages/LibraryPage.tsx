import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { assetTypeLabel } from '../../shared/media';
import type { AssetListItem, AssetStatus } from '../../shared/types';

const hairline = { borderColor: 'var(--hairline)' };

const STATUS_DOT: Record<AssetStatus, string> = {
  ready_to_list: 'bg-emerald-400',
  under_review: 'bg-indigo-400',
  uploaded: 'bg-sky-400',
  pending_upload: 'bg-amber-400',
  pending_admin_approval: 'bg-amber-400',
  withdrawn: 'bg-zinc-500',
  rejected: 'bg-red-400',
};

function statusLabel(s: AssetStatus): string {
  return s.replace(/_/g, ' ');
}

export function AdminLibraryPage() {
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery<AssetListItem[]>({
    queryKey: ['assets'],
    queryFn: () => apiGet<AssetListItem[]>('/api/v1/assets/'),
  });

  const rows = (data ?? []).filter((a) => !q || a.title.toLowerCase().includes(q.toLowerCase()));

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
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Producer</th>
                <th className="px-4 py-2.5 text-right font-medium">Year</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr
                  key={a.id}
                  className="transition-colors hover:bg-[var(--surface-hover)]"
                  style={i === 0 ? undefined : { borderTop: '1px solid var(--hairline)' }}
                >
                  <td className="px-4 py-3 text-[var(--ink)]">{a.title}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{assetTypeLabel(a.asset_type)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-[var(--muted)]">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[a.status] ?? 'bg-zinc-500'}`} />
                      <span className="capitalize">{statusLabel(a.status)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{a.production_company?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--muted)]">
                    {a.production_year ?? '—'}
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
