import type { AssetListItem } from './types';

// Deterministic placeholder artwork derived from a title's slug. Real key art
// (proxy stills) replaces these later behind the same functions.
function slug(asset: Pick<AssetListItem, 'id' | 'title'>): string {
  return `${asset.id}-${asset.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

/** Portrait poster (2:3) for browse rail cards. */
export function posterUrl(asset: Pick<AssetListItem, 'id' | 'title'>): string {
  return `https://picsum.photos/seed/${slug(asset)}/400/600`;
}

/** Wide backdrop (16:9) for hero/detail. */
export function backdropUrl(asset: Pick<AssetListItem, 'id' | 'title'>): string {
  return `https://picsum.photos/seed/${slug(asset)}-wide/1600/900`;
}

/** Small landscape thumbnail (16:9) for Studio catalogue rows. */
export function thumbUrl(asset: Pick<AssetListItem, 'id' | 'title'>): string {
  return `https://picsum.photos/seed/${slug(asset)}-wide/320/180`;
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
