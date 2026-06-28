// Deterministic placeholder artwork for catalogue titles. Real masters live in
// B2; until proxy stills are wired (a later phase), we derive a stable image
// per title from its slug so the browse grid looks like a real catalogue rather
// than empty tiles.
import type { AssetListItem } from '../shared/types';

function slug(asset: Pick<AssetListItem, 'id' | 'title'>): string {
  return `${asset.id}-${asset.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

/** Portrait poster (2:3) for rail cards. */
export function posterUrl(asset: Pick<AssetListItem, 'id' | 'title'>): string {
  return `https://picsum.photos/seed/${slug(asset)}/400/600`;
}

/** Wide backdrop (16:9) for the billboard hero. */
export function backdropUrl(asset: Pick<AssetListItem, 'id' | 'title'>): string {
  return `https://picsum.photos/seed/${slug(asset)}-wide/1600/900`;
}

const TYPE_LABELS: Record<AssetListItem['asset_type'], string> = {
  feature_film: 'Feature Film',
  short_film: 'Short Film',
  documentary: 'Documentary',
  tv_episode: 'TV Episode',
  music_video: 'Music Video',
  broadcast_recording: 'Broadcast',
  interview: 'Interview',
  other: 'Other',
};

export function assetTypeLabel(type: AssetListItem['asset_type']): string {
  return TYPE_LABELS[type] ?? 'Title';
}
