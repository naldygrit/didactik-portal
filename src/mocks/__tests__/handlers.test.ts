import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../handlers';
import {
  adminScreenerRequests,
  productionRightsWindows,
  session,
  userInterests,
  users,
} from '../db';
import type {
  AdminDashboard,
  AdminScreenerRequest,
  AdminTitle,
  AssetListItem,
  Completeness,
  MeResponse,
  ProductionDashboard,
  ProductionRightsWindow,
  ProductionScreenerRequest,
  ProductionTitle,
  SearchAsset,
} from '../../portal/shared/types';

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

describe('production (seller studio)', () => {
  function setUser(username: string) {
    session.current = users.find((u) => u.username === username) ?? null;
  }

  // Restore the rights-window seed list between tests (CRUD mutates it).
  const seededWindowIds = productionRightsWindows.map((w) => w.id);
  beforeEach(() => {
    for (let i = productionRightsWindows.length - 1; i >= 0; i--) {
      if (!seededWindowIds.includes(productionRightsWindows[i].id)) {
        productionRightsWindows.splice(i, 1);
      }
    }
  });

  it('returns the dashboard aggregate to the producer', async () => {
    setUser('producer');
    const dash = (await (await fetch(`${BASE}/api/v1/production/dashboard/`)).json()) as ProductionDashboard;
    expect(dash.catalogue_health.total_titles).toBeGreaterThan(0);
    expect(typeof dash.catalogue_health.average_metadata_score).toBe('number');
    expect(typeof dash.screener_activity.total).toBe('number');
    expect(Array.isArray(dash.watched_titles)).toBe(true);
  });

  it('forbids a broadcaster from the production dashboard', async () => {
    setUser('broadcaster');
    const res = await fetch(`${BASE}/api/v1/production/dashboard/`);
    expect(res.status).toBe(403);
  });

  it('lists only the company\'s own titles with editorial fields', async () => {
    setUser('producer');
    const list = (await (await fetch(`${BASE}/api/v1/production/titles/`)).json()) as ProductionTitle[];
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((t) => t.production_company.id === 1)).toBe(true);
    expect(list.every((t) => typeof t.metadata_score === 'number')).toBe(true);
    expect(list.every((t) => typeof t.screener_request_count === 'number')).toBe(true);
  });

  it('returns a metadata completeness breakdown', async () => {
    setUser('producer');
    const c = (await (
      await fetch(`${BASE}/api/v1/production/titles/lagos-after-dark/completeness/`)
    ).json()) as Completeness;
    expect(c.score).toBeGreaterThan(0);
    expect(typeof c.can_activate).toBe('boolean');
    expect(Array.isArray(c.breakdown)).toBe(true);
  });

  it('returns territory-only screener requests (no broadcaster identity)', async () => {
    setUser('producer');
    const reqs = (await (
      await fetch(`${BASE}/api/v1/production/titles/harmattan-letters/screener-requests/`)
    ).json()) as ProductionScreenerRequest[];
    expect(reqs.length).toBeGreaterThan(0);
    expect(Array.isArray(reqs[0].territory_interest)).toBe(true);
    // Confidentiality: the producer projection must NOT leak broadcaster identity.
    expect('broadcaster' in reqs[0]).toBe(false);
  });

  it('creates a rights window via the territory dropdown', async () => {
    setUser('producer');
    const before = (await (
      await fetch(`${BASE}/api/v1/production/rights-windows/?title=lagos-after-dark`)
    ).json()) as ProductionRightsWindow[];

    const res = await fetch(`${BASE}/api/v1/production/rights-windows/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title_slug: 'lagos-after-dark',
        territory: 2, // Kenya
        rights_type: 'svod',
        is_exclusive: true,
      }),
    });
    expect(res.status).toBe(201);
    const created = (await res.json()) as ProductionRightsWindow;
    expect(created.territory).toBe('Kenya');
    expect(created.rights_type).toBe('svod');
    expect(created.is_exclusive).toBe(true);

    const after = (await (
      await fetch(`${BASE}/api/v1/production/rights-windows/?title=lagos-after-dark`)
    ).json()) as ProductionRightsWindow[];
    expect(after.length).toBe(before.length + 1);
  });

  it('deletes a rights window', async () => {
    setUser('producer');
    const created = (await (
      await fetch(`${BASE}/api/v1/production/rights-windows/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title_slug: 'lagos-after-dark', territory: 3, rights_type: 'broadcast' }),
      })
    ).json()) as ProductionRightsWindow;

    const del = await fetch(`${BASE}/api/v1/production/rights-windows/${created.id}/`, {
      method: 'DELETE',
    });
    expect(del.status).toBe(204);
  });

  it('forbids a broadcaster from the production titles', async () => {
    setUser('broadcaster');
    const res = await fetch(`${BASE}/api/v1/production/titles/`);
    expect(res.status).toBe(403);
  });
});

describe('admin moderation', () => {
  function setUser(username: string) {
    session.current = users.find((u) => u.username === username) ?? null;
  }

  beforeEach(() => {
    // Reset moderation state mutated by approve/decline/status tests.
    for (const r of adminScreenerRequests) {
      if (r.uuid === '00000000-0000-0000-0000-0000000000a1') {
        r.status = 'pending';
        r.reviewed_at = null;
        r.access_expires_at = null;
      }
    }
  });

  it('returns the dashboard aggregate to the admin', async () => {
    setUser('admin');
    const dash = (await (await fetch(`${BASE}/api/v1/admin/dashboard/`)).json()) as AdminDashboard;
    expect(dash.content.total_titles).toBeGreaterThan(0);
    expect(dash.screeners.pending_queue).toBeGreaterThanOrEqual(1);
    expect(dash.triage_queue.length).toBeGreaterThan(0);
    expect(dash.organisations.broadcasters).toBe(3);
  });

  it('forbids a broadcaster from the admin dashboard', async () => {
    setUser('broadcaster');
    const res = await fetch(`${BASE}/api/v1/admin/dashboard/`);
    expect(res.status).toBe(403);
  });

  it('lists screener requests with broadcaster identity', async () => {
    setUser('admin');
    const reqs = (await (
      await fetch(`${BASE}/api/v1/admin/screener-requests/`)
    ).json()) as AdminScreenerRequest[];
    expect(reqs.length).toBeGreaterThan(0);
    expect(reqs[0].broadcaster.name).toBeTruthy();
  });

  it('approves a screener request with an access window', async () => {
    setUser('admin');
    const res = await fetch(
      `${BASE}/api/v1/admin/screener-requests/00000000-0000-0000-0000-0000000000a1/approve/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_duration_hours: 72 }),
      },
    );
    expect(res.status).toBe(200);
    const req = (await res.json()) as AdminScreenerRequest;
    expect(req.status).toBe('approved');
    expect(req.access_expires_at).not.toBeNull();
  });

  it('declines a screener request', async () => {
    setUser('admin');
    const res = await fetch(
      `${BASE}/api/v1/admin/screener-requests/00000000-0000-0000-0000-0000000000a1/decline/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Out of scope' }),
      },
    );
    expect(res.status).toBe(200);
    const req = (await res.json()) as AdminScreenerRequest;
    expect(req.status).toBe('declined');
  });

  it('lists admin titles and changes a title status', async () => {
    setUser('admin');
    const titlesList = (await (await fetch(`${BASE}/api/v1/admin/titles/`)).json()) as AdminTitle[];
    expect(Array.isArray(titlesList)).toBe(true);
    const target = titlesList[0];
    const res = await fetch(`${BASE}/api/v1/admin/titles/${target.slug}/status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as AdminTitle;
    expect(updated.status).toBe('suspended');
    // Restore so other tests/ordering aren't affected.
    await fetch(`${BASE}/api/v1/admin/titles/${target.slug}/status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: target.status }),
    });
  });

  it('forbids a broadcaster from listing admin titles', async () => {
    setUser('broadcaster');
    const res = await fetch(`${BASE}/api/v1/admin/titles/`);
    expect(res.status).toBe(403);
  });
});

describe('discovery', () => {
  beforeEach(() => {
    session.current = users.find((u) => u.username === 'broadcaster') ?? null;
    delete userInterests[1];
  });

  async function setInterests(interests: string[]) {
    return fetch(`${BASE}/api/v1/me/interests/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interests }),
    });
  }

  it('lists interest options', async () => {
    const opts = (await (await fetch(`${BASE}/api/v1/interests/`)).json()) as unknown[];
    expect(opts.length).toBeGreaterThan(0);
  });

  it('saves and returns the broadcaster interests', async () => {
    await setInterests(['type:documentary']);
    const mine = (await (await fetch(`${BASE}/api/v1/me/interests/`)).json()) as string[];
    expect(mine).toEqual(['type:documentary']);
  });

  it('ranks recommendations by interest match', async () => {
    await setInterests(['type:documentary']);
    const recs = (await (await fetch(`${BASE}/api/v1/recommendations/`)).json()) as AssetListItem[];
    expect(recs[0].asset_type).toBe('documentary');
  });
});
