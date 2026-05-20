import { apiFetch } from '../api';
import * as auth from '../auth';

vi.mock('../auth', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  silentRefresh: vi.fn(),
}));

describe('apiFetch', () => {
  beforeEach(() => {
    vi.mocked(auth.getAccessToken).mockReturnValue('test-token');
    vi.mocked(auth.silentRefresh).mockResolvedValue(null);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200 } as Response),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('injects Authorization Bearer header from in-memory token', async () => {
    await apiFetch('/api/v1/assets/');
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('retries with refreshed token on 401', async () => {
    const newToken = 'refreshed-token';
    vi.mocked(auth.silentRefresh).mockResolvedValue(newToken);
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ status: 401 } as Response)
        .mockResolvedValueOnce({ status: 200 } as Response),
    );
    await apiFetch('/api/v1/assets/');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    expect(auth.setAccessToken).toHaveBeenCalledWith(newToken);
  });

  it('returns 401 response without retry when no refresh token available', async () => {
    vi.mocked(auth.silentRefresh).mockResolvedValue(null);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 401 } as Response),
    );
    const response = await apiFetch('/api/v1/assets/');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
});
