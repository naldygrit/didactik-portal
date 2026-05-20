import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardRedirect } from '../DashboardRedirect';
import * as AuthContextModule from '../AuthContext';
import type { JwtPayload } from '../types';

vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}));

function renderWithUser(user: JwtPayload | null) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    accessToken: user ? 'token' : null,
    user,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
  render(
    <MemoryRouter initialEntries={['/portal']}>
      <Routes>
        <Route path="/portal" element={<DashboardRedirect />} />
        <Route path="/portal/login" element={<div>Login</div>} />
        <Route
          path="/portal/broadcaster/dashboard"
          element={<div>Broadcaster Dashboard</div>}
        />
        <Route
          path="/portal/production/dashboard"
          element={<div>Production Dashboard</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DashboardRedirect', () => {
  it('redirects unauthenticated user to login', () => {
    renderWithUser(null);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('redirects broadcaster_user to broadcaster dashboard', () => {
    renderWithUser({
      user_id: 1,
      email: 'b@test.com',
      role: 'broadcaster_user',
      exp: 9999999999,
    });
    expect(screen.getByText('Broadcaster Dashboard')).toBeInTheDocument();
  });

  it('redirects production_company_user to production dashboard', () => {
    renderWithUser({
      user_id: 2,
      email: 'p@test.com',
      role: 'production_company_user',
      exp: 9999999999,
    });
    expect(screen.getByText('Production Dashboard')).toBeInTheDocument();
  });
});
