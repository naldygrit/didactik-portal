import { getAccessToken, silentRefresh, setAccessToken } from './auth';

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (response.status !== 401) return response;

  // Access token expired — attempt silent refresh and retry once.
  const newToken = await silentRefresh();
  if (!newToken) return response;

  setAccessToken(newToken);
  headers.set('Authorization', `Bearer ${newToken}`);
  return fetch(input, { ...init, credentials: 'include', headers });
}
