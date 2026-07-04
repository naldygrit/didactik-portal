import { render, screen } from '@testing-library/react';
import { PipelineTracker } from '../components/PipelineTracker';

describe('PipelineTracker', () => {
  it('groups the stages as an accessible list', () => {
    render(<PipelineTracker status="under_review" />);
    expect(screen.getByRole('list', { name: 'Submission pipeline' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });

  it('marks only the current stage aria-current="step", with a matching label', () => {
    render(<PipelineTracker status="under_review" />);
    const current = screen.getByRole('listitem', { name: 'Under Review — current step' });
    expect(current).toHaveAttribute('aria-current', 'step');

    const others = screen.getAllByRole('listitem').filter((el) => el !== current);
    others.forEach((el) => expect(el).not.toHaveAttribute('aria-current'));
  });

  it('labels earlier stages as completed and later stages as not yet reached', () => {
    render(<PipelineTracker status="under_review" />);
    expect(screen.getByRole('listitem', { name: 'Draft — completed' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Submitted — completed' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Approved — not yet reached' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Active — not yet reached' })).toBeInTheDocument();
  });

  it('describes the changes-requested hold state with its own label text', () => {
    render(<PipelineTracker status="changes_requested" />);
    expect(
      screen.getByRole('listitem', { name: 'Changes Requested — current step' }),
    ).toHaveAttribute('aria-current', 'step');
  });
});
