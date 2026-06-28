import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { apiGet } from '../../shared/apiHelpers';
import type { AssetDetail, AssetListItem } from '../../shared/types';
import { assetTypeLabel, backdropUrl } from '../posters';

interface Props {
  asset: AssetListItem | null;
  onClose: () => void;
}

export function DetailModal({ asset, onClose }: Props) {
  const reduce = useReducedMotion();
  const [bidNote, setBidNote] = useState(false);

  const { data } = useQuery<AssetDetail>({
    queryKey: ['asset', asset?.id],
    queryFn: () => apiGet<AssetDetail>(`/api/v1/assets/${asset!.id}/`),
    enabled: asset !== null,
  });

  useEffect(() => {
    if (!asset) return;
    setBidNote(false);
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [asset, onClose]);

  const meta = asset
    ? [
        assetTypeLabel(asset.asset_type),
        asset.production_year,
        asset.primary_language?.english_name,
        asset.production_country?.name,
        asset.production_company?.name,
      ]
        .filter(Boolean)
        .join('  ·  ')
    : '';

  return (
    <AnimatePresence>
      {asset && (
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
            aria-label={asset.title}
            className="portal-cinema relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl md:rounded-2xl"
            initial={reduce ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 w-full md:h-60">
              <img
                src={backdropUrl(asset)}
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
                  {asset.title}
                </h2>
                {asset.original_title && asset.original_title !== asset.title && (
                  <p className="text-sm italic text-[var(--muted)]">{asset.original_title}</p>
                )}
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--accent-2)]">
                  {meta}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-[var(--ink)]/85">
                {data?.description ?? 'Loading…'}
              </p>

              {data && data.taxonomy_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.taxonomy_tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full bg-[var(--surface-hover)] px-3 py-1 text-xs text-[var(--ink)]/80"
                      title={t.english_gloss}
                    >
                      {t.term}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setBidNote(true)}
                  className="btn-gradient inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold"
                >
                  Place a bid
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-[var(--ink)]/80 hover:text-white"
                >
                  Close
                </button>
              </div>

              {bidNote && (
                <p className="text-xs text-[var(--muted)]">
                  Competitive bidding lands in the next build: place an offer within the
                  producer's licensing range and see where it stands against rival bids.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
