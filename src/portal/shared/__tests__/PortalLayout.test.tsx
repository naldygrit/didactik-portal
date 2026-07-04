import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortalLayout } from '../PortalLayout';

vi.mock('../auth', () => ({
  postLogout: vi.fn(),
}));

vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { email: 'test@didactikmedia.com' },
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
  })),
}));

vi.mock('../apiHelpers', () => ({
  apiGet: vi.fn().mockResolvedValue({}),
}));

function renderAt(initialPath: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<PortalLayout />}>
            <Route path="*" element={<div>page content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe.each([
  ['broadcaster (cinema)', '/portal/broadcaster/dashboard'],
  ['admin (control)', '/portal/admin/overview'],
  ['production', '/portal/production/dashboard'],
])('PortalLayout mobile nav — %s', (_name, path) => {
  it('starts closed, with the toggle correctly reflecting aria-expanded=false', () => {
    renderAt(path);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the mobile nav panel and flips aria-expanded on click, closes again on a second click', () => {
    renderAt(path);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation menu' });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(toggle.getAttribute('aria-controls')!)).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape', () => {
    renderAt(path);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation menu' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('PortalLayout admin sidebar', () => {
  it('wraps AdminSidebarNav in a <nav> landmark', () => {
    renderAt('/portal/admin/overview');
    expect(screen.getAllByRole('navigation', { name: 'Admin' }).length).toBeGreaterThan(0);
  });

  it('marks the active admin nav item aria-current="page"', () => {
    renderAt('/portal/admin/overview');
    const overviewLink = screen.getAllByRole('link', { name: /Overview/ })[0];
    expect(overviewLink).toHaveAttribute('aria-current', 'page');
  });
});
