import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { TitleStatusBadge, TITLE_STATUS_OPTIONS } from '../components/TitleStatusBadge';
import { thumbUrl } from '../../shared/media';
import type { ProductionTitle, TitleStatus } from '../../shared/types';

export function ProductionAssetsPage() {
  const [statusFilter, setStatusFilter] = useState<TitleStatus | ''>('');
  const [titleFilter, setTitleFilter] = useState('');

  const { data: titles, isLoading, isError } = useQuery<ProductionTitle[]>({
    queryKey: ['production-titles'],
    queryFn: () => apiGet<ProductionTitle[]>('/api/v1/production/titles/'),
  });

  const filtered = (titles ?? []).filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (titleFilter && !t.name.toLowerCase().includes(titleFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Your catalogue</h1>
        <Link
          to="/portal/production/submit"
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          style={{ backgroundColor: '#5343fd' }}
        >
          Submit a title
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Filter by title…"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TitleStatus | '')}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All statuses</option>
          {TITLE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500">Loading titles…</p>
      )}

      {isError && (
        <p className="text-sm text-red-600">Failed to load titles. Please refresh.</p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base">
            {titles?.length === 0
              ? 'No titles yet. Submit your first title to get started.'
              : 'No titles match the current filters.'}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Metadata</th>
                <th className="px-4 py-3 text-right">Screener interest</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((title) => (
                <tr key={title.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={thumbUrl({ id: title.id, title: title.name })}
                        alt=""
                        className="h-9 w-16 shrink-0 rounded object-cover"
                      />
                      <span className="max-w-xs truncate font-medium text-gray-900">{title.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">
                    {title.title_type.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <TitleStatusBadge status={title.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                    {title.metadata_score}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                    {title.screener_request_count}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/portal/production/assets/${title.slug}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View →
                    </Link>
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
