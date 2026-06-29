// Poster/media helpers live in shared/media so production can reuse them.
// Re-exported here so existing broadcaster imports ('../posters') keep working
// for any Asset-shaped callers, while the Title-shaped helpers below back the
// migrated broadcaster browse surface (screener model).
export * from '../shared/media';

import type { Title } from '../shared/types';

// Deterministic placeholder artwork derived from a Title's slug. Real key art
// (proxy stills) replaces these later behind the same functions. We keep the
// shared/media hashing approach (picsum seed) but key off slug, which is stable
// and unique per title in the new model.
function titleSeed(title: Pick<Title, 'slug'>): string {
  return title.slug || 'title';
}

/** Portrait poster (2:3) for browse rail cards. */
export function titlePosterUrl(title: Pick<Title, 'slug'>): string {
  return `https://picsum.photos/seed/${titleSeed(title)}/400/600`;
}

/** Wide backdrop (16:9) for hero/detail. */
export function titleBackdropUrl(title: Pick<Title, 'slug'>): string {
  return `https://picsum.photos/seed/${titleSeed(title)}-wide/1600/900`;
}

// Human labels for the new free-text title_type. The backend sends snake_case
// codes (e.g. 'feature_film'); fall back to a title-cased version of anything
// unmapped so new types render gracefully without a code change.
const TITLE_TYPE_LABELS: Record<string, string> = {
  feature_film: 'Feature Film',
  short_film: 'Short Film',
  documentary: 'Documentary',
  tv_episode: 'TV Episode',
  series: 'Series',
  music_video: 'Music Video',
  broadcast_recording: 'Broadcast',
  interview: 'Interview',
  other: 'Other',
};

export function titleTypeLabel(type: string): string {
  if (TITLE_TYPE_LABELS[type]) return TITLE_TYPE_LABELS[type];
  return type
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}
