import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import type { Title } from '../../shared/types';
import { titleTypeLabel, titleBackdropUrl } from '../posters';
import { ScreenerPanel } from './ScreenerPanel';
import { ExpressInterestForm } from './ExpressInterestForm';
import { BidPanel } from './BidPanel';

interface Props {
  title: Title | null;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function DetailModal({ title, onClose }: Props) {
  const reduce = useReducedMotion();
  const [showScreener, setShowScreener] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Only modal in the codebase — a focus trap/restore hook isn't justified
  // for one consumer (Phase 1's "copy it twice before you extract" rule).
  useEffect(() => {
    if (!title) return;
    setShowScreener(false);

    // Remember the poster card that opened this, and move focus into the
    // dialog — otherwise a keyboard user's focus silently lands on <body>.
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previouslyFocusedRef.current?.focus();
    };
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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title.name}
            tabIndex={-1}
            className="portal-cinema relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl md:rounded-2xl focus:outline-none"
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

              {/* Acquisition: express interest and make a priced offer, shown
                  alongside the screener so a buyer can act on the title here. */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <BidPanel slug={title.slug} />
                <ExpressInterestForm slug={title.slug} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
