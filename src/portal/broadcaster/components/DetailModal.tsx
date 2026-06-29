import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import type { Title } from '../../shared/types';
import { titleTypeLabel, titleBackdropUrl } from '../posters';
import { ScreenerPanel } from './ScreenerPanel';

interface Props {
  title: Title | null;
  onClose: () => void;
}

export function DetailModal({ title, onClose }: Props) {
  const reduce = useReducedMotion();
  const [showScreener, setShowScreener] = useState(false);

  useEffect(() => {
    if (!title) return;
    setShowScreener(false);
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [title, onClose]);

  const meta = title
    ? [
        titleTypeLabel(title.title_type),
        title.production_year,
        title.original_language?.english_name,
        title.country_of_origin?.name,
        title.production_company?.name,
      ]
        .filter(Boolean)
        .join('  ·  ')
    : '';

  const blurb = title ? title.synopsis || title.logline || '' : '';

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title.name}
            className="portal-cinema relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl md:rounded-2xl"
            initial={reduce ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 w-full md:h-60">
              <img
                src={titleBackdropUrl(title)}
                alt=""
                className="h-full w-full object-cover opacity-45"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(83,67,253,0.10) 0%, rgba(11,11,15,0.30) 40%, rgba(11,11,15,1) 100%)',
                }}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5 md:p-7">
              <div>
                <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
                  {title.name}
                </h2>
                {title.original_title && title.original_title !== title.name && (
                  <p className="text-sm italic text-[var(--muted)]">{title.original_title}</p>
                )}
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--accent-2)]">
                  {meta}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-[var(--ink)]/85">{blurb}</p>

              {(title.genres.length > 0 || title.cultural_tags.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {title.genres.map((g) => (
                    <span
                      key={`g-${g.id}`}
                      className="rounded-full bg-[var(--surface-hover)] px-3 py-1 text-xs text-[var(--ink)]/80"
                    >
                      {g.name}
                    </span>
                  ))}
                  {title.cultural_tags.map((t) => (
                    <span
                      key={`c-${t.id}`}
                      className="rounded-full bg-[var(--surface-hover)] px-3 py-1 text-xs text-[var(--ink)]/80"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowScreener(true)}
                  className="btn-gradient inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold"
                >
                  Request screener
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-[var(--ink)]/80 hover:text-white"
                >
                  Close
                </button>
              </div>

              {showScreener && <ScreenerPanel slug={title.slug} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
