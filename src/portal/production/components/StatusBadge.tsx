import type { AssetStatus } from '../../shared/types';

const CONFIG: Record<AssetStatus, { label: string; classes: string }> = {
  pending_admin_approval: { label: 'Pending Approval', classes: 'bg-yellow-100 text-yellow-800' },
  pending_upload:         { label: 'Pending Upload',   classes: 'bg-yellow-100 text-yellow-700' },
  uploaded:               { label: 'Uploaded',         classes: 'bg-blue-100 text-blue-800' },
  under_review:           { label: 'Under Review',     classes: 'bg-indigo-100 text-indigo-800' },
  ready_to_list:          { label: 'Ready to List',    classes: 'bg-green-100 text-green-800' },
  withdrawn:              { label: 'Withdrawn',        classes: 'bg-gray-100 text-gray-600' },
  rejected:               { label: 'Rejected',         classes: 'bg-red-100 text-red-700' },
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  const cfg = CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}
