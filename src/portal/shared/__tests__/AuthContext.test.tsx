import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as auth from '../auth';
import type { JwtPayload } from '../types';

vi.mock('../auth', () => ({
  silentRefresh: vi.fn(),
  setAccessToken: vi.fn(),
  decodeToken: vi.fn(),
  getAccessToken: vi.fn().mockReturnValue(null),
  postLogout: vi.fn(),
}));

const TEST_USER: JwtPayload = {
  user_id: 1,
  email: 'test@test.com',
  role: 'broadcaster_user',
  exp: 9999999999,
};

const TEST_TOKEN = 'header.payload.sig';

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.mocked(auth.silentRefresh).mockResolvedValue(null);
    vi.mocked(auth.decodeToken).mockReturnValue(TEST_USER);
  });

  it('starts loading=true then resolves to loading=false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('sets user when silent refresh returns a token', async () => {
    vi.mocked(auth.silentRefresh).mockResolvedValue(TEST_TOKEN);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(TEST_USER);
  });

  it('login() sets accessToken and user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.login(TEST_TOKEN));
    expect(result.current.accessToken).toBe(TEST_TOKEN);
    expect(result.current.user).toEqual(TEST_USER);
  });

  it('logout() clears accessToken and user', async () => {
    vi.mocked(auth.silentRefresh).mockResolvedValue(TEST_TOKEN);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.user).toBeTruthy());
    act(() => result.current.logout());
    expect(result.current.accessToken).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
