// Shared presentational helpers for the admin (control room) pages. Pure
// mappings from data to the reference design's class vocabulary — no markup, so
// each page can compose them however its layout needs.
import type { TitleStatus } from '../shared/types';

// Map a title's editorial status to the muted status-dot colour class the
// reference uses (green active, blue approved, amber submitted, purple review…).
const STATUS_DOT_CLASS: Record<TitleStatus, string> = {
  draft: 'dot-gray',
  submitted: 'dot-amber',
  under_review: 'dot-purple',
  changes_requested: 'dot-amber',
  approved: 'dot-blue',
  active: 'dot-green',
  suspended: 'dot-gray',
  archived: 'dot-gray',
};

export function statusDotClass(status: string): string {
  return STATUS_DOT_CLASS[status as TitleStatus] ?? 'dot-gray';
}

// A status colour for the small placeholder thumbnail block (no images exist):
// reuse the bg-* token that reads as that status's urgency.
const STATUS_THUMB_BG: Record<string, string> = {
  submitted: 'var(--bg-warning)',
  under_review: 'var(--bg-accent)',
  changes_requested: 'var(--bg-warning)',
  approved: 'var(--bg-accent)',
  active: 'var(--bg-success)',
};

export function statusThumbBg(status: string): string {
  return STATUS_THUMB_BG[status] ?? 'var(--surface-2)';
}

// Human label for a snake_case enum value: "under_review" -> "Under review".
export function humanize(value: string): string {
  const spaced = value.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Score-bar fill class by completeness band, matching the reference thresholds.
export function scoreFillClass(score: number): 'high' | 'mid' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}

// Two-letter avatar initials from an organisation name.
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
