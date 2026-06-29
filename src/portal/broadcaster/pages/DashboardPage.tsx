import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { Title } from '../../shared/types';
import { Billboard } from '../components/Billboard';
import { ContentRail } from '../components/ContentRail';
import { DetailModal } from '../components/DetailModal';

export function BroadcasterDashboardPage() {
  const [selected, setSelected] = useState<Title | null>(null);

  const { data, isLoading, isError } = useQuery<Title[]>({
    queryKey: ['broadcaster-titles'],
    queryFn: () => apiGet<Title[]>('/api/v1/broadcaster/titles/'),
  });
  const { data: interests } = useQuery<string[]>({
    queryKey: ['me-interests'],
    queryFn: () => apiGet<string[]>('/api/v1/me/interests/'),
  });
  const personalized = (interests?.length ?? 0) > 0;

  if (isLoading) return <BrowseSkeleton />;

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-display text-xl text-white">No titles available yet</p>
        <p className="text-sm text-[var(--muted)]">
          New work appears here as production companies list it for licensing.
        </p>
      </div>
    );
  }

  // Lead with a featured title when one is flagged; otherwise the first title.
  const featured = data.find((t) => t.is_featured) ?? data[0];
  const rest = data.filter((t) => t.slug !== featured.slug);
  const rails: { title: string; titles: Title[] }[] = [
    { title: 'Available to license', titles: data },
    { title: 'Documentaries', titles: data.filter((t) => t.title_type === 'documentary') },
    { title: 'Feature films', titles: data.filter((t) => t.title_type === 'feature_film') },
    { title: 'More to explore', titles: rest },
  ];

  return (
    <div className="pb-16">
      <Billboard title={featured} onSelect={setSelected} />
      <div className="-mt-6 space-y-8 md:-mt-10">
        {/* Personalisation prompt / status */}
        <Link
          to="/portal/broadcaster/onboarding"
          className="mx-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[var(--surface-raised)] px-4 py-3 text-sm transition-colors hover:border-white/20 md:mx-8"
        >
          <span className="text-[var(--ink)]/85">
            {personalized
              ? 'Showing titles matched to your picks.'
              : 'Tell us what you are in the market for and we will lead with titles that fit.'}
          </span>
          <span className="shrink-0 font-medium text-[var(--accent-2)]">
            {personalized ? 'Tune picks' : 'Personalise'}
          </span>
        </Link>

        {rails.map((rail) => (
          <ContentRail
            key={rail.title}
            title={rail.title}
            titles={rail.titles}
            onSelect={setSelected}
          />
        ))}
      </div>
      <DetailModal title={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function BrowseSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="min-h-[62vh] w-full bg-[var(--surface-raised)] md:min-h-[70vh]" />
      <div className="space-y-8 px-4 pt-8 md:px-8">
        {[0, 1].map((row) => (
          <div key={row} className="space-y-3">
            <div className="h-5 w-40 rounded bg-[var(--surface-raised)]" />
            <div className="flex gap-3">
              {[0, 1, 2, 3, 4, 5].map((c) => (
                <div
                  key={c}
                  className="aspect-[2/3] w-[150px] shrink-0 rounded-lg bg-[var(--surface-raised)] md:w-[180px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
