import { render, screen } from '@testing-library/react';
import { ScoreRing } from '../components/ScoreRing';

describe('ScoreRing', () => {
  it('exposes the score as an accessible meter, not just visible ring/text', () => {
    render(<ScoreRing score={73} />);
    const meter = screen.getByRole('meter', { name: 'Metadata completeness: 73%' });
    expect(meter).toHaveAttribute('aria-valuenow', '73');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });
});
