import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import OurWork from '../OurWork';

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <OurWork />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('OurWork', () => {
  it('marks up the 4 process steps as a real ordered list', () => {
    renderPage();
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });

  it('hides the redundant "01"-style number glyph now that the list conveys order', () => {
    renderPage();
    const glyph = screen.getByText('01');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
  });
});
