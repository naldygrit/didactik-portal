import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { StatusBadge } from '../../production/components/StatusBadge';
import type { AssetDetail } from '../../shared/types';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 flex-1">{value ?? '—'}</dd>
    </div>
  );
}

export function BroadcasterAssetDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: asset, isLoading, isError } = useQuery<AssetDetail>({
    queryKey: ['broadcaster-asset', id],
    queryFn: () => apiGet<AssetDetail>(`/api/v1/assets/${id}/`),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (isError || !asset) {
    return (
      <div>
        <Link to="/portal/broadcaster/discover" className="text-sm text-indigo-600">
          ← Back to discover
        </Link>
        <p className="mt-4 text-sm text-red-600">Asset not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/portal/broadcaster/discover"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to discover
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

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <dl>
          <DetailRow label="Asset type" value={asset.asset_type.replace(/_/g, ' ')} />
          <DetailRow label="Production year" value={asset.production_year} />
          <DetailRow label="Language" value={asset.primary_language?.english_name} />
          <DetailRow label="Country" value={asset.production_country?.name} />
          <DetailRow label="Production company" value={asset.production_company?.name} />
          {asset.description && (
            <DetailRow
              label="Description"
              value={<span className="whitespace-pre-wrap">{asset.description}</span>}
            />
          )}
        </dl>
      </div>

      {/* Taxonomy tags */}
      {asset.taxonomy_tags.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Content taxonomy</h2>
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

      {/* Licensing enquiry */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Licensing enquiry</h2>
        <p className="text-sm text-gray-500 mb-4">
          Interested in licensing rights to this content? Contact Didactik's rights team.
        </p>
        <a
          href={`mailto:rights@didactikmedia.com?subject=Licensing enquiry — ${encodeURIComponent(asset.title)}&body=Asset ID: ${asset.id}%0A%0APlease describe your licensing requirements:`}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: '#5343fd' }}
        >
          Request licensing
        </a>
      </div>
    </div>
  );
}
