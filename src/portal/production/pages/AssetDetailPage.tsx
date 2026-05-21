import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import { StatusBadge } from '../components/StatusBadge';
import type { AssetDetail, AssetStatus } from '../../shared/types';

const WITHDRAWABLE: Set<AssetStatus> = new Set([
  'pending_admin_approval',
  'pending_upload',
  'uploaded',
  'under_review',
  'ready_to_list',
]);

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 flex-1">{value ?? '—'}</dd>
    </div>
  );
}

export function ProductionAssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const { data: asset, isLoading, isError } = useQuery<AssetDetail>({
    queryKey: ['asset', id],
    queryFn: () => apiGet<AssetDetail>(`/api/v1/assets/${id}/`),
    enabled: !!id,
  });

  const withdrawMutation = useMutation({
    mutationFn: () => apiPost(`/api/v1/assets/${id}/withdraw/`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset', id] });
      qc.invalidateQueries({ queryKey: ['production-assets'] });
      setConfirmWithdraw(false);
    },
  });

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (isError || !asset) {
    return (
      <div>
        <Link to="/portal/production/assets" className="text-sm text-indigo-600">← Back to assets</Link>
        <p className="mt-4 text-sm text-red-600">Asset not found or failed to load.</p>
      </div>
    );
  }

  const canWithdraw = WITHDRAWABLE.has(asset.status);

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/portal/production/assets"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to assets
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{asset.title}</h1>
          {asset.original_title && (
            <p className="text-sm text-gray-400 mt-0.5">{asset.original_title}</p>
          )}
        </div>
        <StatusBadge status={asset.status} />
      </div>

      {/* Rejection reason — shown prominently when rejected */}
      {asset.status === 'rejected' && asset.rejection_reason && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-medium text-red-800 mb-1">Submission rejected</p>
          <p className="text-sm text-red-700">{asset.rejection_reason}</p>
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <dl>
          <DetailRow label="Asset type" value={asset.asset_type.replace(/_/g, ' ')} />
          <DetailRow label="Production year" value={asset.production_year} />
          <DetailRow label="Language" value={asset.primary_language?.english_name} />
          <DetailRow label="Country" value={asset.production_country?.name} />
          <DetailRow
            label="Description"
            value={
              asset.description ? (
                <span className="whitespace-pre-wrap">{asset.description}</span>
              ) : null
            }
          />
          <DetailRow
            label="Submitted"
            value={new Date(asset.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          />
          {asset.approved_at && (
            <DetailRow
              label="Approved"
              value={new Date(asset.approved_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            />
          )}
        </dl>
      </div>

      {/* Taxonomy tags — if any */}
      {asset.taxonomy_tags.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Taxonomy tags</h2>
          <div className="flex flex-wrap gap-2">
            {asset.taxonomy_tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                title={tag.english_gloss}
              >
                {tag.term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Withdraw action */}
      {canWithdraw && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Withdraw submission</h2>
          <p className="text-sm text-gray-500 mb-4">
            Withdrawing removes your asset from Didactik's review queue. This cannot be undone.
          </p>
          {!confirmWithdraw ? (
            <button
              type="button"
              onClick={() => setConfirmWithdraw(true)}
              className="px-4 py-2 rounded-md text-sm font-medium text-red-700 border border-red-300 hover:bg-red-50 transition-colors"
            >
              Withdraw asset
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => withdrawMutation.mutate()}
                disabled={withdrawMutation.isPending}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {withdrawMutation.isPending ? 'Withdrawing…' : 'Yes, withdraw'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmWithdraw(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          )}
          {withdrawMutation.isError && (
            <p className="mt-2 text-xs text-red-600">
              {withdrawMutation.error instanceof Error
                ? withdrawMutation.error.message
                : 'Withdraw failed. Please try again.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
