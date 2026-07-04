import { render, screen } from '@testing-library/react';
import SustainabilityStrip from '../SustainabilityStrip';

describe('SustainabilityStrip', () => {
  it('hides the decorative emoji, keeping the adjacent text label as the real content', () => {
    render(<SustainabilityStrip />);
    const emoji = screen.getByText('🌱');
    expect(emoji).toHaveAttribute('aria-hidden', 'true');
    screen.getByText('Climate-Positive Digital Archive');
  });
});
