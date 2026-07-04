import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('hides decorative contact/social icons from assistive tech', () => {
    const { container } = render(<Footer />);
    // Text labels already convey the same info; icons would otherwise be
    // announced redundantly alongside them.
    screen.getByText('emem@didactikmedia.com');
    screen.getByText('Lagos, Nigeria');
    screen.getByText('@didactikmedia');

    const hiddenIcons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(hiddenIcons.length).toBe(4);
  });
});
