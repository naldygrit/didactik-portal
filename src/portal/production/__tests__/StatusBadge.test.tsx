import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../components/StatusBadge';
import type { AssetStatus } from '../../shared/types';

const cases: { status: AssetStatus; label: string; colorClass: string }[] = [
  { status: 'pending_admin_approval', label: 'Pending Approval', colorClass: 'bg-yellow-100' },
  { status: 'pending_upload',         label: 'Pending Upload',   colorClass: 'bg-yellow-100' },
  { status: 'uploaded',               label: 'Uploaded',         colorClass: 'bg-blue-100' },
  { status: 'under_review',           label: 'Under Review',     colorClass: 'bg-indigo-100' },
  { status: 'ready_to_list',          label: 'Ready to List',    colorClass: 'bg-green-100' },
  { status: 'withdrawn',              label: 'Withdrawn',        colorClass: 'bg-gray-100' },
  { status: 'rejected',               label: 'Rejected',         colorClass: 'bg-red-100' },
];

describe('StatusBadge', () => {
  cases.forEach(({ status, label, colorClass }) => {
    it(`renders correct label for ${status}`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeDefined();
    });

    it(`applies correct colour class for ${status}`, () => {
      const { container } = render(<StatusBadge status={status} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain(colorClass);
    });
  });
});
