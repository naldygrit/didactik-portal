import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import * as auth from '../auth';
import * as AuthContextModule from '../AuthContext';
import type { JwtPayload } from '../types';

vi.mock('../auth', () => ({
  postLogin: vi.fn(),
  decodeToken: vi.fn(),
}));

vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    logout: vi.fn(),
    accessToken: null,
    user: null,
    loading: false,
  })),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/portal/login']}>
      <Routes>
        <Route path="/portal/login" element={<LoginPage />} />
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

describe('LoginPage', () => {
  it('renders username, password fields and sign-in button', () => {
    renderLoginPage();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays error message on failed login', async () => {
    vi.mocked(auth.postLogin).mockRejectedValue(new Error('Invalid credentials'));
    renderLoginPage();
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'bad' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'bad' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: /sign in/i }).closest('form')!,
    );
    await waitFor(() => {
      expect(
        screen.getByText('Invalid username or password.'),
      ).toBeInTheDocument();
    });
  });

  it('navigates to broadcaster dashboard on successful broadcaster login', async () => {
    const FAKE_TOKEN = 'header.payload.sig';
    const fakeUser: JwtPayload = {
      user_id: 1,
      email: 'b@test.com',
      role: 'broadcaster_user',
      exp: 9999999999,
    };
    vi.mocked(auth.postLogin).mockResolvedValue(FAKE_TOKEN);
    vi.mocked(auth.decodeToken).mockReturnValue(fakeUser);
    renderLoginPage();
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'broadcaster' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'pass' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: /sign in/i }).closest('form')!,
    );
    await waitFor(() => {
      expect(screen.getByText('Broadcaster Dashboard')).toBeInTheDocument();
    });
  });
});
