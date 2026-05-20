import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import * as AuthContextModule from '../AuthContext';
import type { JwtPayload } from '../types';

vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}));

function mockAuth(overrides: Partial<{
  loading: boolean;
  user: JwtPayload | null;
  accessToken: string | null;
}> = {}) {
  vi.mocked(AuthContextModule.useAuth).mockReturnValue({
    accessToken: null,
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
}

describe('ProtectedRoute', () => {
  it('renders children when isAllowed and not loading', () => {
    mockAuth();
    render(
      <MemoryRouter>
        <ProtectedRoute isAllowed={true}>
          <div>Protected</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('renders nothing while loading', () => {
    mockAuth({ loading: true });
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute isAllowed={true}>
          <div>Protected</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('redirects to given path when not allowed', () => {
    mockAuth();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAllowed={false} redirectTo="/login">
                <div>Protected</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
