import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../handlers';
import { bids, session, users } from '../db';
import type { AssetListItem, BidBoard, MeResponse, SearchAsset } from '../../portal/shared/types';

// Runtime smoke test for the mock layer: drives the same handlers the browser
// worker uses, proving login, role-scoped visibility, search and suggest behave
// as the real /api/v1 contract should.
const server = setupServer(...handlers);
// Relative handler paths resolve against the jsdom origin, so requests must use
// the same origin to match.
const BASE = location.origin;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  session.current = null;
});
afterAll(() => server.close());

async function login(username: string): Promise<string> {
  const res = await fetch(`${BASE}/api/v1/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'demo' }),
  });
  expect(res.status).toBe(200);
  const { access } = (await res.json()) as { access: string };
  expect(access.split('.')).toHaveLength(3);
  return access;
}

describe('mock auth', () => {
  it('rejects bad credentials', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'broadcaster', password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 on /me when logged out', async () => {
    const res = await fetch(`${BASE}/api/v1/auth/me/`);
    expect(res.status).toBe(401);
  });

  it('logs in and returns the broadcaster profile', async () => {
    await login('broadcaster');
    const me = (await (await fetch(`${BASE}/api/v1/auth/me/`)).json()) as MeResponse;
    expect(me.profile?.role).toBe('broadcaster_user');
    expect(me.profile?.broadcaster?.name).toBe('Canal+ International');
  });
});

describe('role-scoped asset visibility', () => {
  it('broadcaster sees only ready_to_list assets', async () => {
    await login('broadcaster');
    const assets = (await (await fetch(`${BASE}/api/v1/assets/`)).json()) as AssetListItem[];
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((a) => a.status === 'ready_to_list')).toBe(true);
  });

  it('production company sees only its own assets, any status', async () => {
    await login('producer');
    const assets = (await (await fetch(`${BASE}/api/v1/assets/`)).json()) as AssetListItem[];
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((a) => a.production_company?.id === 1)).toBe(true);
    // includes non-listed statuses the broadcaster would never see
    expect(assets.some((a) => a.status !== 'ready_to_list')).toBe(true);
  });

  it('admin sees everything', async () => {
    await login('admin');
    const assets = (await (await fetch(`${BASE}/api/v1/assets/`)).json()) as AssetListItem[];
    expect(assets.length).toBeGreaterThanOrEqual(8);
  });
});

describe('search + suggest', () => {
  it('search returns a paginated match', async () => {
    await login('broadcaster');
    const body = (await (
      await fetch(`${BASE}/api/v1/search/?q=lagos`)
    ).json()) as { count: number; results: SearchAsset[] };
    expect(body.count).toBeGreaterThan(0);
    expect(body.results[0].title).toBe('Lagos After Dark');
  });

  it('suggest works on both the frontend and backend paths', async () => {
    for (const path of ['/api/v1/suggest/', '/api/v1/search/suggest/']) {
      const titles = (await (await fetch(`${BASE}${path}?q=lag`)).json()) as string[];
      expect(titles).toContain('Lagos After Dark');
    }
  });
});

describe('bidding', () => {
  beforeEach(() => {
    session.current = users.find((u) => u.username === 'broadcaster') ?? null;
    // Drop any bids placed by the logged-in broadcaster (id 1) in a prior test.
    for (let i = bids.length - 1; i >= 0; i--) {
      if (bids[i].broadcaster_id === 1) bids.splice(i, 1);
    }
  });

  async function board(): Promise<BidBoard> {
    return (await fetch(`${BASE}/api/v1/assets/101/bids/`)).json() as Promise<BidBoard>;
  }

  it('returns the competitive board scoped to the broadcaster', async () => {
    const b = await board();
    expect(b.license_floor).toBe(8000);
    expect(b.license_ceiling).toBe(25000);
    expect(b.bid_count).toBe(2);
    expect(b.highest_amount).toBe(14500);
    expect(b.your_bid).toBeNull();
  });

  it('places a leading bid within range', async () => {
    const res = await fetch(`${BASE}/api/v1/assets/101/bids/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 15000 }),
    });
    expect(res.status).toBe(200);
    const b = (await res.json()) as BidBoard;
    expect(b.bid_count).toBe(3);
    expect(b.your_bid?.amount).toBe(15000);
    expect(b.your_bid?.is_top).toBe(true);
  });

  it('rejects a bid outside the licensing range', async () => {
    const res = await fetch(`${BASE}/api/v1/assets/101/bids/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100 }),
    });
    expect(res.status).toBe(400);
  });
});
