// Poster/media helpers live in shared/media so production can reuse them.
// Re-exported here so existing broadcaster imports ('../posters') keep working
// for any Asset-shaped callers, while the Title-shaped helpers below back the
// migrated broadcaster browse surface (screener model).
export * from '../shared/media';

import type { Title } from '../shared/types';

function titleSlug(title: Pick<Title, 'slug'>): string {
  return title.slug || 'title';
}

// Deterministic hue from the slug so each title gets a stable, distinct — but
// always dark and cinematic — fallback tone.
function titleHue(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Self-hosted portrait poster (2:3). Real art if present, else 404s silently. */
export function titlePosterUrl(title: Pick<Title, 'slug'>): string {
  return `/images/posters/${titleSlug(title)}.jpg`;
}

/** Self-hosted wide backdrop (16:9). */
export function titleBackdropUrl(title: Pick<Title, 'slug'>): string {
  return `/images/backdrops/${titleSlug(title)}.jpg`;
}

/**
 * Owned, deterministic gradient shown when a title has no real key-art file yet.
 * No external service, no stock photo — renders offline and is 100% ours.
 */
export function titleGradient(title: Pick<Title, 'slug'>): string {
  const h = titleHue(titleSlug(title));
  return `linear-gradient(150deg, hsl(${h} 42% 20%) 0%, hsl(${(h + 45) % 360} 48% 9%) 100%)`;
}

/**
 * Portrait poster background for rail cards. Real, licence-verified art at
 * public/images/posters/<slug>.jpg is used when present; otherwise the layered
 * gradient shows through (a missing file 404s silently — no broken image, no
 * external request). Drop CC0/PD or partner-cleared art in that folder to use it,
 * and record its source + licence in public/images/ATTRIBUTIONS.md.
 */
export function titlePosterBg(title: Pick<Title, 'slug'>): string {
  return `url(${titlePosterUrl(title)}) center/cover no-repeat, ${titleGradient(title)}`;
}

/** Wide backdrop background for hero/detail — same real-art-or-gradient rule. */
export function titleBackdropBg(title: Pick<Title, 'slug'>): string {
  return `url(${titleBackdropUrl(title)}) center/cover no-repeat, ${titleGradient(title)}`;
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
