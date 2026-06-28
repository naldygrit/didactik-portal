import { motion, useReducedMotion } from 'framer-motion';
import type { AssetListItem } from '../../shared/types';
import { assetTypeLabel, posterUrl } from '../posters';

interface Props {
  asset: AssetListItem;
  onSelect: (asset: AssetListItem) => void;
}

// Strong ease-out curve (emil): instant response, settles smoothly. Used for
// the hover lift and the press.
const EASE = [0.23, 1, 0.32, 1] as const;

export function PosterCard({ asset, onSelect }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(asset)}
      className="group relative w-[150px] shrink-0 overflow-hidden rounded-lg bg-[var(--surface-raised)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)] md:w-[180px]"
      whileHover={reduce ? undefined : { scale: 1.06, y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.22, ease: EASE }}
      aria-label={`${asset.title}, ${assetTypeLabel(asset.asset_type)}. View details.`}
    >
      <img
        src={posterUrl(asset)}
        alt=""
        loading="lazy"
        className="aspect-[2/3] w-full object-cover"
      />

      {/* Hover scrim + quick facts. Revealed on pointer hover; on touch the tap
          opens the detail view directly. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <p className="font-display text-sm font-semibold leading-tight text-white">
          {asset.title}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">
          {[assetTypeLabel(asset.asset_type), asset.production_year, asset.production_country?.name]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </motion.button>
  );
}
