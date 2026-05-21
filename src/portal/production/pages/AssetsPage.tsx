import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { StatusBadge } from '../components/StatusBadge';
import type { AssetListItem, AssetStatus } from '../../shared/types';

const STATUS_OPTIONS: { value: AssetStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending_admin_approval', label: 'Pending Approval' },
  { value: 'pending_upload', label: 'Pending Upload' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'ready_to_list', label: 'Ready to List' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'rejected', label: 'Rejected' },
];

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function ProductionAssetsPage() {
  const [statusFilter, setStatusFilter] = useState<AssetStatus | ''>('');
  const [titleFilter, setTitleFilter] = useState('');

  const { data: assets, isLoading, isError } = useQuery<AssetListItem[]>({
    queryKey: ['production-assets'],
    queryFn: () => apiGet<AssetListItem[]>('/api/v1/assets/'),
  });

  const filtered = (assets ?? []).filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (titleFilter && !a.title.toLowerCase().includes(titleFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Assets</h1>
        <Link
          to="/portal/production/submit"
          className="px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: '#5343fd' }}
        >
          Submit new asset
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
          onChange={(e) => setStatusFilter(e.target.value as AssetStatus | '')}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500">Loading assets…</p>
      )}

      {isError && (
        <p className="text-sm text-red-600">Failed to load assets. Please refresh.</p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base">
            {assets?.length === 0
              ? 'No assets yet. Submit your first asset to get started.'
              : 'No assets match the current filters.'}
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
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {asset.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">
                    {asset.asset_type.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {asset.production_year ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {daysSince(asset.created_at) === 0
                      ? 'Today'
                      : `${daysSince(asset.created_at)}d ago`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/portal/production/assets/${asset.id}`}
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
