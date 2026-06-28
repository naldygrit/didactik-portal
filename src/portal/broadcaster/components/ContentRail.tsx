import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { AssetListItem } from '../../shared/types';
import { PosterCard } from './PosterCard';

interface Props {
  title: string;
  assets: AssetListItem[];
  onSelect: (asset: AssetListItem) => void;
}

export function ContentRail({ title, assets, onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (assets.length === 0) return null;

  function nudge(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  }

  return (
    <section className="group/rail relative">
      <h2 className="font-display mb-3 px-4 text-lg font-semibold text-[var(--ink)] md:px-8 md:text-xl">
        {title}
      </h2>

      <div
        ref={trackRef}
        className="rail-scroll flex gap-3 overflow-x-auto px-4 pb-2 md:px-8"
      >
        {assets.map((asset) => (
          <PosterCard key={asset.id} asset={asset} onSelect={onSelect} />
        ))}
      </div>

      {/* Scroll arrows: pointer-only, surface on rail hover. */}
      <button
        type="button"
        aria-label={`Scroll ${title} left`}
        onClick={() => nudge(-1)}
        className="absolute left-1 top-[44%] hidden h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-200 hover:bg-black/80 focus-visible:opacity-100 group-hover/rail:opacity-100 md:flex"
      >
        <FiChevronLeft size={22} />
      </button>
      <button
        type="button"
        aria-label={`Scroll ${title} right`}
        onClick={() => nudge(1)}
        className="absolute right-1 top-[44%] hidden h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-200 hover:bg-black/80 focus-visible:opacity-100 group-hover/rail:opacity-100 md:flex"
      >
        <FiChevronRight size={22} />
      </button>
    </section>
  );
}
