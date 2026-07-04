import { render } from '@testing-library/react';
import Technology from '../Technology';

describe('Technology', () => {
  it('hides all decorative emoji bullets/icons from assistive tech', () => {
    const { container } = render(<Technology />);
    const emoji = ['📼', '🗄️', '☁️', '🤖', '👤', '✅', '🔒', '🔐'];
    emoji.forEach((glyph) => {
      const el = Array.from(container.querySelectorAll('*')).find(
        (node) => node.textContent === glyph && node.children.length === 0,
      );
      expect(el, `expected to find aria-hidden element for ${glyph}`).toBeTruthy();
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
