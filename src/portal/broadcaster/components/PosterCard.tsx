import { motion, useReducedMotion } from 'framer-motion';
import type { Title } from '../../shared/types';
import { titleTypeLabel, titlePosterUrl } from '../posters';

interface Props {
  title: Title;
  onSelect: (title: Title) => void;
}

// Strong ease-out curve (emil): instant response, settles smoothly.
const EASE = [0.23, 1, 0.32, 1] as const;

export function PosterCard({ title, onSelect }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(title)}
      className="group relative aspect-[2/3] w-[150px] shrink-0 overflow-hidden rounded-lg bg-[var(--surface-raised)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)] md:w-[180px]"
      whileHover={reduce ? undefined : { scale: 1.06, y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.22, ease: EASE }}
      aria-label={`${title.name}, ${titleTypeLabel(title.title_type)}. View details.`}
    >
      {/* Placeholder image, muted so it reads as texture under the title rather
          than as literal (mismatched) content. Swapped for real key art later. */}
      <img
        src={titlePosterUrl(title)}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-200 group-hover:opacity-55"
      />
      {/* Brand-tinted scrim: dark at the base for title legibility. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(83,67,253,0.12) 0%, rgba(11,11,15,0.35) 45%, rgba(11,11,15,0.96) 100%)',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--accent-2)]">
          {titleTypeLabel(title.title_type)}
        </p>
        <p className="font-display mt-0.5 text-sm font-semibold leading-tight text-white">
          {title.name}
        </p>
        {/* Extra meta surfaces on hover — and on keyboard focus, since the
            card itself is the only focusable element (a group-hover-only
            reveal would otherwise never be seen by keyboard users tabbing
            through the rail). */}
        <p className="mt-0.5 max-h-0 overflow-hidden text-[11px] text-[var(--muted)] opacity-0 transition-all duration-200 group-hover:max-h-8 group-hover:opacity-100 group-focus-visible:max-h-8 group-focus-visible:opacity-100">
          {[title.production_year, title.country_of_origin?.name].filter(Boolean).join(' · ')}
        </p>
      </div>
    </motion.button>
  );
}
