import type { TitleStatus } from '../../shared/types';

// Light-themed badge for the production (YouTube Studio) surfaces. Distinct from
// the Asset-based StatusBadge (used by the submission wizard catalogue) — this
// one renders the editorial Title lifecycle the screener model uses.
const CONFIG: Record<TitleStatus, { label: string; classes: string }> = {
  draft:             { label: 'Draft',             classes: 'bg-gray-100 text-gray-600' },
  submitted:         { label: 'Submitted',         classes: 'bg-amber-100 text-amber-800' },
  under_review:      { label: 'Under Review',      classes: 'bg-indigo-100 text-indigo-800' },
  changes_requested: { label: 'Changes Requested', classes: 'bg-orange-100 text-orange-800' },
  approved:          { label: 'Approved',          classes: 'bg-sky-100 text-sky-800' },
  active:            { label: 'Active',            classes: 'bg-green-100 text-green-800' },
  suspended:         { label: 'Suspended',         classes: 'bg-red-100 text-red-700' },
  archived:          { label: 'Archived',          classes: 'bg-gray-100 text-gray-500' },
};

export const TITLE_STATUS_OPTIONS: { value: TitleStatus; label: string }[] = (
  Object.keys(CONFIG) as TitleStatus[]
).map((value) => ({ value, label: CONFIG[value].label }));

export function TitleStatusBadge({ status }: { status: TitleStatus }) {
  const cfg = CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}
