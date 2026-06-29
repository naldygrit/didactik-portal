import { apiFetch } from './api';

// DRF returns absolute pagination URLs (e.g. http://localhost:8000/api/v1/search/?page=2).
// Strip the origin so the request routes through the Vite proxy.
export function paginationPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<{ data: T; status: number }> {
  const res = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json() as T;
  return { data, status: res.status };
}

export async function apiPatch<T>(path: string, body: unknown): Promise<{ data: T; status: number }> {
  const res = await apiFetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json() as T;
  return { data, status: res.status };
}

// DELETE returns 204 No Content (empty body), so we surface only the status.
export async function apiDelete(path: string): Promise<{ status: number }> {
  const res = await apiFetch(path, { method: 'DELETE' });
  return { status: res.status };
}
