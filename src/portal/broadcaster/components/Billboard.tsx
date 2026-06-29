import { motion, useReducedMotion } from 'framer-motion';
import type { Title } from '../../shared/types';
import { titleTypeLabel, titleBackdropUrl } from '../posters';

interface Props {
  title: Title;
  onSelect: (title: Title) => void;
}

export function Billboard({ title, onSelect }: Props) {
  const reduce = useReducedMotion();

  // The Title projection carries logline + synopsis, so no extra fetch is
  // needed for the hero copy (the old Asset model required a detail fetch).
  const meta = [
    titleTypeLabel(title.title_type),
    title.production_year,
    title.original_language?.english_name,
    title.country_of_origin?.name,
  ]
    .filter(Boolean)
    .join('  ·  ');

  const blurb = title.synopsis || title.logline || '';

  return (
    <section className="relative isolate min-h-[62vh] w-full overflow-hidden md:min-h-[70vh]">
      <img
        src={titleBackdropUrl(title)}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      {/* Scrims: darken left and bottom so the copy holds WCAG contrast. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/70 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex min-h-[62vh] max-w-2xl flex-col justify-end gap-4 px-4 pb-14 md:min-h-[70vh] md:px-8 md:pb-20"
      >
        <h1 className="font-display text-4xl font-bold leading-[1.05] text-white text-balance md:text-6xl">
          {title.name}
        </h1>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent-2)]">
          {meta}
        </p>
        <p className="line-clamp-3 max-w-xl text-sm text-[var(--ink)]/85 md:text-base">
          {blurb}
        </p>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => onSelect(title)}
            className="btn-gradient inline-flex items-center rounded-full px-7 py-3 text-sm font-semibold"
          >
            View details
          </button>
        </div>
      </motion.div>
    </section>
  );
}
