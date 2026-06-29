import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { Title } from '../../shared/types';
import { titleTypeLabel } from '../posters';
import { ScreenerPanel } from '../components/ScreenerPanel';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 flex-1">{value ?? '—'}</dd>
    </div>
  );
}

export function BroadcasterAssetDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: title, isLoading, isError } = useQuery<Title>({
    queryKey: ['broadcaster-title', slug],
    queryFn: () => apiGet<Title>(`/api/v1/broadcaster/titles/${slug}/`),
    enabled: !!slug,
  });

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (isError || !title) {
    return (
      <div>
        <Link to="/portal/broadcaster/discover" className="text-sm text-indigo-600">
          ← Back to discover
        </Link>
        <p className="mt-4 text-sm text-red-600">Title not found or failed to load.</p>
      </div>
    );
  }

  const blurb = title.synopsis || title.logline || '';

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
          <h1 className="text-2xl font-semibold text-gray-900">{title.name}</h1>
          {title.original_title && title.original_title !== title.name && (
            <p className="text-sm text-gray-400 mt-0.5">{title.original_title}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <dl>
          <DetailRow label="Type" value={titleTypeLabel(title.title_type)} />
          <DetailRow label="Production year" value={title.production_year} />
          <DetailRow label="Language" value={title.original_language?.english_name} />
          <DetailRow label="Country" value={title.country_of_origin?.name} />
          <DetailRow label="Production company" value={title.production_company?.name} />
          {blurb && (
            <DetailRow
              label="Synopsis"
              value={<span className="whitespace-pre-wrap">{blurb}</span>}
            />
          )}
        </dl>
      </div>

      {/* Genres + cultural tags */}
      {(title.genres.length > 0 || title.cultural_tags.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Genres &amp; themes</h2>
          <div className="flex flex-wrap gap-2">
            {title.genres.map((g) => (
              <span
                key={`g-${g.id}`}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                {g.name}
              </span>
            ))}
            {title.cultural_tags.map((t) => (
              <span
                key={`c-${t.id}`}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rights availability + screener request + watchlist */}
      <div className="portal-cinema rounded-xl mb-6">
        <ScreenerPanel slug={title.slug} />
      </div>

      {/* Licensing enquiry — separate deferred API; mailto fallback for now. */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Licensing enquiry</h2>
        <p className="text-sm text-gray-500 mb-4">
          Interested in licensing rights to this content? Contact Didactik's rights team.
        </p>
        <a
          href={`mailto:rights@didactikmedia.com?subject=Licensing enquiry — ${encodeURIComponent(title.name)}&body=Title: ${encodeURIComponent(title.slug)}%0A%0APlease describe your licensing requirements:`}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: '#5343fd' }}
        >
          Request licensing
        </a>
      </div>
    </div>
  );
}
