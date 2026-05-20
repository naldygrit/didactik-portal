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
  const response = await fetch('/api/v1/auth/login/', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error('Invalid credentials');
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
