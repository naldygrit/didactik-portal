import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header mobile menu', () => {
  it('links the toggle to the panel via aria-controls/id, tracking aria-expanded', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const panelId = toggle.getAttribute('aria-controls')!;
    expect(document.getElementById(panelId)).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when a mobile nav link is clicked', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Two "Home" links exist (desktop nav is just hidden via CSS, not
    // unmounted) — the mobile one is the second.
    const homeLinks = screen.getAllByRole('link', { name: 'Home' });
    fireEvent.click(homeLinks[homeLinks.length - 1]);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
