import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { AssetListItem } from '../../shared/types';
import { Billboard } from '../components/Billboard';
import { ContentRail } from '../components/ContentRail';
import { DetailModal } from '../components/DetailModal';

export function BroadcasterDashboardPage() {
  const [selected, setSelected] = useState<AssetListItem | null>(null);

  const { data, isLoading, isError } = useQuery<AssetListItem[]>({
    queryKey: ['assets'],
    queryFn: () => apiGet<AssetListItem[]>('/api/v1/assets/'),
  });

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

  const [featured, ...rest] = data;
  const rails: { title: string; assets: AssetListItem[] }[] = [
    { title: 'Ready to license', assets: data },
    { title: 'Documentaries', assets: data.filter((a) => a.asset_type === 'documentary') },
    { title: 'Feature films', assets: data.filter((a) => a.asset_type === 'feature_film') },
    { title: 'More to explore', assets: rest },
  ];

  return (
    <div className="pb-16">
      <Billboard asset={featured} onSelect={setSelected} />
      <div className="-mt-6 space-y-8 md:-mt-10">
        {rails.map((rail) => (
          <ContentRail key={rail.title} title={rail.title} assets={rail.assets} onSelect={setSelected} />
        ))}
      </div>
      <DetailModal asset={selected} onClose={() => setSelected(null)} />
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
