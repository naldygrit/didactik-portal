// Builds an unsigned, decode-only JWT for the mock layer. jwt-decode never
// verifies the signature, so a base64url-encoded payload is all the app needs.
// When the real archive backend is wired in, MSW is disabled and genuine
// signed tokens flow through unchanged.
import type { JwtPayload } from '../portal/shared/types';

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function encodeMockJwt(payload: Omit<JwtPayload, 'exp'>): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(new Date('2030-01-01T00:00:00Z').getTime() / 1000);
  const body = base64url(JSON.stringify({ ...payload, exp }));
  return `${header}.${body}.mock-signature`;
}
