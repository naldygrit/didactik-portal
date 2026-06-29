import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from './types';

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function decodeToken(token: string): JwtPayload {
  return jwtDecode<JwtPayload>(token);
}

export async function silentRefresh(): Promise<string | null> {
  const response = await fetch('/api/v1/auth/refresh/', {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) return null;
  const data = await response.json() as { access: string };
  return data.access;
}

export async function postLogin(
  username: string,
  password: string,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch('/api/v1/auth/login/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    // Network-level failure: backend down (real mode) or mock worker inactive.
    throw new Error('Cannot reach the server. Start the backend, or turn on mock mode and reload.');
  }
  if (response.status === 401) {
    throw new Error('Wrong username or password.');
  }
  if (!response.ok) {
    // 5xx / proxy error: the API is reachable but not answering (often a dead
    // :8000 behind the Vite proxy, or an inactive mock worker).
    throw new Error(`Login failed (${response.status}). The API may be unreachable.`);
  }
  const data = await response.json() as { access: string };
  return data.access;
}

export async function postLogout(): Promise<void> {
  await fetch('/api/v1/auth/logout/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${_accessToken ?? ''}`,
    },
  });
  _accessToken = null;
}
