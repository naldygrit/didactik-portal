import { http, HttpResponse } from 'msw';
import type {
  AdminDashboard,
  AssetDetail,
  AssetListItem,
  Completeness,
  ProductionDashboard,
  ProductionRightsWindow,
  ProductionScreenerRequest,
  ProductionTitle,
  ScreenerPurpose,
  ScreenerSummary,
  SearchAsset,
  TitleStatus,
  WatchlistEntry,
} from '../portal/shared/types';
import { encodeMockJwt } from './jwt';
import {
  adminScreenerRequests,
  adminTitles,
  buildAdminOrganisations,
  allocateAssetId,
  allocateRightsWindowId,
  allocateWatchlistId,
  assets,
  broadcasters,
  completenessBreakdowns,
  countries,
  findAdminScreener,
  findAdminTitleBySlug,
  findTerritory,
  findTitleBySlug,
  interestOptions,
  languages,
  productionCompanies,
  productionEditorial,
  productionRightsWindows,
  productionScreenerRequests,
  productionTitlePool,
  screenerRequests,
  session,
  territories,
  titleRights,
  titles,
  userInterests,
  users,
  watchlist,
} from './db';
import type { MockUser } from './db';

const API = '/api/v1';

// Rights coverage by territory: for each territory, how many titles offer rights
// there, as a percentage of the catalogue. Derived from the per-title rights
// projections so the Overview bars reflect real seeded data (sorted widest first).
function buildRightsCoverage(): { territory: string; titles: number; pct: number }[] {
  const total = Object.keys(titleRights).length || 1;
  const counts = new Map<string, number>();
  for (const rows of Object.values(titleRights)) {
    const seen = new Set<string>();
    for (const r of rows) {
      if (seen.has(r.territory)) continue;
      seen.add(r.territory);
      counts.set(r.territory, (counts.get(r.territory) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([territory, t]) => ({ territory, titles: t, pct: Math.round((t / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

// Strip an AssetDetail down to the list-serializer shape the real API returns.
function toListItem(a: AssetDetail): AssetListItem {
  const {
    description: _d,
    approved_at: _a,
    updated_at: _u,
    rejection_reason: _r,
    taxonomy_tags: _t,
    ...listItem
  } = a;
  void _d; void _a; void _u; void _r; void _t;
  return listItem;
}

// Role-scoped asset visibility, mirroring the backend's get_queryset filtering.
function visibleAssets(): AssetDetail[] {
  const user = session.current;
  if (!user) return [];
  const profile = user.me.profile;
  if (user.me.is_staff || profile?.role === 'admin_staff') return assets;
  if (profile?.role === 'broadcaster_user') {
    return assets.filter((a) => a.status === 'ready_to_list');
  }
  if (profile?.role === 'production_company_user' && profile.production_company) {
    return assets.filter((a) => a.production_company?.id === profile.production_company!.id);
  }
  return [];
}

function unauthorized() {
  return HttpResponse.json({ detail: 'Authentication credentials were not provided.' }, { status: 401 });
}

function isAdmin(user: MockUser): boolean {
  return user.me.is_staff || user.me.profile?.role === 'admin_staff';
}

// Rule-based recommender stub: score a title by how many of the broadcaster's
// interest chips it matches. Swapped for a real recommender behind this seam.
function interestScore(asset: AssetDetail, interests: string[]): number {
  let score = 0;
  for (const key of interests) {
    const [dim, val] = key.split(':');
    if (dim === 'type' && asset.asset_type === val) score++;
    else if (dim === 'country' && asset.production_country?.code === val) score++;
    else if (dim === 'lang' && asset.primary_language?.code === val) score++;
  }
  return score;
}

export const handlers = [
  // ── Auth ────────────────────────────────────────────────────────────────
  http.post(`${API}/auth/login/`, async ({ request }) => {
    const { username, password } = (await request.json()) as { username: string; password: string };
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      return HttpResponse.json({ detail: 'No active account found with the given credentials' }, { status: 401 });
    }
    session.current = user;
    const role = user.me.profile?.role ?? null;
    const access = encodeMockJwt({ user_id: user.user_id, email: user.email, role });
    return HttpResponse.json({ access });
  }),

  // Pre-auth onboarding application. Mirrors the planned backend contract: the
  // application is accepted and queued for admin verification.
  http.post(`${API}/onboarding/applications/`, async ({ request }) => {
    const body = (await request.json()) as { org_name?: string };
    if (!body?.org_name) {
      return HttpResponse.json({ detail: 'org_name is required' }, { status: 400 });
    }
    return HttpResponse.json({ status: 'received', reference: 'APP-DEMO' }, { status: 201 });
  }),

  http.post(`${API}/auth/refresh/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    const role = user.me.profile?.role ?? null;
    return HttpResponse.json({ access: encodeMockJwt({ user_id: user.user_id, email: user.email, role }) });
  }),

  http.post(`${API}/auth/logout/`, () => {
    session.current = null;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/auth/me/`, () => {
    if (!session.current) return unauthorized();
    return HttpResponse.json(session.current.me);
  }),

  // ── Assets ──────────────────────────────────────────────────────────────
  // The real AssetViewSet.list returns a plain array (no pagination class).
  http.get(`${API}/assets/`, () => {
    if (!session.current) return unauthorized();
    return HttpResponse.json(visibleAssets().map(toListItem));
  }),

  http.get(`${API}/assets/:id/`, ({ params }) => {
    if (!session.current) return unauthorized();
    const asset = visibleAssets().find((a) => a.id === Number(params.id));
    if (!asset) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    return HttpResponse.json(asset);
  }),

  http.post(`${API}/assets/initiate-upload/`, async ({ request }) => {
    if (!session.current) return unauthorized();
    const body = (await request.json()) as Record<string, unknown>;
    const profile = session.current.me.profile;
    const id = allocateAssetId();
    const storage_key = `mock/${id}/${String(body.filename ?? 'master.mp4')}`;
    const asset: AssetDetail = {
      id,
      title: String(body.title ?? 'Untitled'),
      original_title: String(body.original_title ?? ''),
      asset_type: (body.asset_type as AssetDetail['asset_type']) ?? 'other',
      status: 'pending_upload',
      production_year: typeof body.production_year === 'number' ? body.production_year : null,
      primary_language: languages.find((l) => l.id === body.primary_language) ?? null,
      production_country: countries.find((c) => c.id === body.production_country) ?? null,
      production_company: profile?.production_company ?? null,
      storage_backend: 'b2',
      created_at: new Date().toISOString(),
      taxonomy_count: 0,
      description: String(body.description ?? ''),
      approved_at: null,
      updated_at: new Date().toISOString(),
      rejection_reason: '',
      taxonomy_tags: [],
    };
    assets.push(asset);
    return HttpResponse.json({
      asset_id: id,
      upload_url: `${location.origin}/_mock-upload/${encodeURIComponent(storage_key)}`,
      expires_in_seconds: 3600,
      storage_key,
      status: 'pending_upload',
      message: 'Upload initiated. PUT the file to the returned URL.',
    });
  }),

  // Catch the wizard's direct PUT to "storage" so the upload flow completes offline.
  http.put('/_mock-upload/:key', () => new HttpResponse(null, { status: 200 })),

  http.post(`${API}/assets/:id/confirm-upload/`, ({ params }) => {
    if (!session.current) return unauthorized();
    const asset = assets.find((a) => a.id === Number(params.id));
    if (!asset) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    asset.status = 'under_review';
    asset.updated_at = new Date().toISOString();
    return HttpResponse.json({ asset_id: asset.id, status: asset.status, message: 'Upload confirmed. Asset is now under review.' });
  }),

  http.post(`${API}/assets/:id/withdraw/`, ({ params }) => {
    if (!session.current) return unauthorized();
    const asset = assets.find((a) => a.id === Number(params.id));
    if (!asset) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    asset.status = 'withdrawn';
    asset.updated_at = new Date().toISOString();
    return HttpResponse.json(toListItem(asset));
  }),

  // ── Production (seller studio) screener/Title model ─────────────────────────
  // The production portal manages the company's own catalogue. Every endpoint is
  // scoped to the authed production company (here: the demo producer's EbonyLife).
  // Returns 403 for non-production users, mirroring the backend's role gate.
  http.get(`${API}/production/dashboard/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });

    const mine = productionTitlePool.filter((t) => t.production_company.id === company.id);
    const byStatus: Record<string, number> = {};
    let scoreSum = 0;
    let needsAttention = 0;
    for (const t of mine) {
      const ed = productionEditorial[t.slug];
      const status = ed?.status ?? 'active';
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      scoreSum += ed?.metadata_score ?? 0;
      if ((ed?.metadata_score ?? 0) < 60) needsAttention++;
    }
    const avg = mine.length ? Math.round(scoreSum / mine.length) : 0;

    const screenerByStatus: Record<string, number> = {};
    let screenerTotal = 0;
    for (const t of mine) {
      for (const r of productionScreenerRequests[t.slug] ?? []) {
        screenerByStatus[r.status] = (screenerByStatus[r.status] ?? 0) + 1;
        screenerTotal++;
      }
    }

    // Watched titles: how many broadcasters keep each of the company's titles on
    // their watchlist. Derived from the broadcaster watchlists for realism.
    const watchCounts = new Map<string, number>();
    for (const list of Object.values(watchlist)) {
      for (const entry of list) watchCounts.set(entry.title_slug, (watchCounts.get(entry.title_slug) ?? 0) + 1);
    }
    const watched = mine
      .map((t) => ({ slug: t.slug, name: t.name, watchers: watchCounts.get(t.slug) ?? 0 }))
      .filter((w) => w.watchers > 0)
      .sort((a, b) => b.watchers - a.watchers);

    const dashboard: ProductionDashboard = {
      catalogue_health: {
        total_titles: mine.length,
        by_status: byStatus,
        needs_attention: needsAttention,
        average_metadata_score: avg,
      },
      screener_activity: { by_status: screenerByStatus, total: screenerTotal },
      watched_titles: watched,
    };
    return HttpResponse.json(dashboard);
  }),

  http.get(`${API}/production/titles/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });

    const mine = productionTitlePool.filter((t) => t.production_company.id === company.id);
    const projection: ProductionTitle[] = mine.map((t) => {
      const ed = productionEditorial[t.slug];
      return {
        ...t,
        status: ed?.status ?? 'active',
        metadata_score: ed?.metadata_score ?? 0,
        licensing_intent: ed?.licensing_intent ?? '',
        screener_request_count: ed?.screener_request_count ?? 0,
        created_at: '2026-04-01T09:00:00Z',
        updated_at: '2026-06-20T09:00:00Z',
      };
    });
    return HttpResponse.json(projection);
  }),

  http.get(`${API}/production/titles/:slug/completeness/`, ({ params }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });

    const slug = String(params.slug);
    const title = productionTitlePool.find((t) => t.slug === slug && t.production_company.id === company.id);
    if (!title) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });

    const breakdown = completenessBreakdowns[slug] ?? [];
    const score = breakdown.filter((r) => r.completed).reduce((s, r) => s + r.points, 0);
    const missingRequired = breakdown.filter((r) => r.required && !r.completed).map((r) => r.label);
    const completeness: Completeness = {
      score,
      can_activate: missingRequired.length === 0,
      missing_required: missingRequired,
      breakdown,
    };
    return HttpResponse.json(completeness);
  }),

  http.get(`${API}/production/titles/:slug/assets/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!user.me.profile?.production_company) {
      return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });
    }
    // Three validation states for the demo (poster missing → shown by the panel).
    return HttpResponse.json([
      {
        id: 1, asset_type: 'screener', asset_type_display: 'Screener', file_name: 'screener.mp4',
        file_size_bytes: 2_400_000_000, validation_status: 'validated', validation_notes: '',
        is_primary: false, version_number: 1, uploaded_at: '2026-01-10T09:00:00Z',
      },
      {
        id: 2, asset_type: 'master', asset_type_display: 'Master', file_name: 'master.mov',
        file_size_bytes: 48_000_000_000, validation_status: 'pending', validation_notes: '',
        is_primary: false, version_number: 1, uploaded_at: '2026-01-10T09:00:00Z',
      },
      {
        id: 3, asset_type: 'poster', asset_type_display: 'Poster', file_name: 'poster.jpg',
        file_size_bytes: 2_100_000, validation_status: 'failed',
        validation_notes: 'Resolution below the 2000px minimum. Please re-upload.',
        is_primary: true, version_number: 1, uploaded_at: '2026-01-10T09:00:00Z',
      },
    ]);
  }),

  http.get(`${API}/production/titles/:slug/interest/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!user.me.profile?.production_company) {
      return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });
    }
    return HttpResponse.json({
      interests: [
        {
          uuid: 'eoi-1',
          broadcaster: { id: 1, name: 'Showmax', category: 'svod', contact_name: 'Lindiwe M.', contact_email: 'acq@showmax.example' },
          territory: 'West Africa', rights_type: 'svod', rights_type_display: 'SVOD',
          window_duration: '2y', window_duration_display: '2 years', exclusivity: 'exclusive',
          message: 'Keen to anchor our autumn slate.', status: 'submitted', created_at: '2026-02-01T09:00:00Z',
        },
        {
          uuid: 'eoi-2',
          broadcaster: { id: 2, name: 'Africa Magic', category: 'pay-tv', contact_name: 'Tunde A.', contact_email: 'rights@africamagic.example' },
          territory: 'West Africa', rights_type: 'broadcast', rights_type_display: 'Broadcast',
          window_duration: '1y', window_duration_display: '1 year', exclusivity: 'non_exclusive',
          message: '', status: 'submitted', created_at: '2026-02-03T09:00:00Z',
        },
      ],
      competitive_territories: ['West Africa'],
    });
  }),

  http.get(`${API}/production/titles/:slug/screener-requests/`, ({ params }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });

    const slug = String(params.slug);
    const title = productionTitlePool.find((t) => t.slug === slug && t.production_company.id === company.id);
    if (!title) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });

    // TERRITORY-ONLY: deliberately no broadcaster identity in this projection.
    const reqs: ProductionScreenerRequest[] = (productionScreenerRequests[slug] ?? []).map((r) => ({
      uuid: r.uuid,
      purpose: r.purpose,
      territory_interest: r.territory_interest,
      status: r.status,
      requested_at: r.requested_at,
    }));
    return HttpResponse.json(reqs);
  }),

  // ── Production rights windows (CRUD) ────────────────────────────────────────
  http.get(`${API}/production/rights-windows/`, ({ request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });

    const ownedSlugs = new Set(
      productionTitlePool.filter((t) => t.production_company.id === company.id).map((t) => t.slug),
    );
    const titleFilter = new URL(request.url).searchParams.get('title');
    const rows: ProductionRightsWindow[] = productionRightsWindows
      .filter((w) => ownedSlugs.has(w.title_slug))
      .filter((w) => !titleFilter || w.title_slug === titleFilter)
      .map((w) => ({
        id: w.id,
        title: w.title,
        territory: w.territory,
        rights_type: w.rights_type,
        is_exclusive: w.is_exclusive,
        available_from: w.available_from,
        available_until: w.available_until,
        availability: w.availability,
      }));
    return HttpResponse.json(rows);
  }),

  http.post(`${API}/production/rights-windows/`, async ({ request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });

    const body = (await request.json()) as {
      title_slug?: string;
      territory?: number;
      rights_type?: ProductionRightsWindow['rights_type'];
      is_exclusive?: boolean;
      available_from?: string | null;
      available_until?: string | null;
    };
    const title = body.title_slug
      ? productionTitlePool.find((t) => t.slug === body.title_slug && t.production_company.id === company.id)
      : undefined;
    if (!title) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    const territory = typeof body.territory === 'number' ? findTerritory(body.territory) : undefined;
    if (!territory) return HttpResponse.json({ detail: 'territory is required.' }, { status: 400 });

    const window = {
      id: allocateRightsWindowId(),
      title_slug: title.slug,
      title: title.slug,
      territory: territory.name,
      rights_type: body.rights_type ?? 'broadcast',
      is_exclusive: body.is_exclusive ?? false,
      available_from: body.available_from ?? null,
      available_until: body.available_until ?? null,
      availability: 'available' as const,
    };
    productionRightsWindows.push(window);
    return HttpResponse.json(window, { status: 201 });
  }),

  http.patch(`${API}/production/rights-windows/:id/`, async ({ params, request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });

    const window = productionRightsWindows.find((w) => w.id === Number(params.id));
    if (!window) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    const body = (await request.json()) as Partial<{
      rights_type: ProductionRightsWindow['rights_type'];
      is_exclusive: boolean;
      available_from: string | null;
      available_until: string | null;
    }>;
    if (body.rights_type !== undefined) window.rights_type = body.rights_type;
    if (body.is_exclusive !== undefined) window.is_exclusive = body.is_exclusive;
    if (body.available_from !== undefined) window.available_from = body.available_from;
    if (body.available_until !== undefined) window.available_until = body.available_until;
    return HttpResponse.json(window);
  }),

  http.delete(`${API}/production/rights-windows/:id/`, ({ params }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });

    const idx = productionRightsWindows.findIndex((w) => w.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    productionRightsWindows.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Discovery (interests + recommendations) ────────────────────────────────
  http.get(`${API}/interests/`, () => HttpResponse.json(interestOptions)),

  http.get(`${API}/me/interests/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    return HttpResponse.json(userInterests[user.user_id] ?? []);
  }),

  http.put(`${API}/me/interests/`, async ({ request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const body = (await request.json()) as { interests?: string[] };
    userInterests[user.user_id] = Array.isArray(body.interests) ? body.interests : [];
    return HttpResponse.json(userInterests[user.user_id]);
  }),

  http.get(`${API}/recommendations/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    const interests = userInterests[user.user_id] ?? [];
    const listed = assets.filter((a) => a.status === 'ready_to_list');
    const ranked = [...listed].sort((a, b) => interestScore(b, interests) - interestScore(a, interests));
    return HttpResponse.json(ranked.map(toListItem));
  }),

  // ── Search + suggest ──────────────────────────────────────────────────────
  http.get(`${API}/search/`, ({ request }) => {
    if (!session.current) return unauthorized();
    const q = (new URL(request.url).searchParams.get('q') ?? '').toLowerCase().trim();
    const matches = visibleAssets().filter(
      (a) => !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
    );
    const results: SearchAsset[] = matches.map((a) => ({
      ...toListItem(a),
      matched_fields: q ? ['title'] : [],
      highlight: a.title,
    }));
    return HttpResponse.json({ count: results.length, next: null, previous: null, results });
  }),

  // Mock BOTH paths: the frontend calls /suggest/, the backend currently serves
  // /search/suggest/. Handling both neutralizes that mismatch for the demo and
  // documents the contract the real backend should expose.
  ...[`${API}/suggest/`, `${API}/search/suggest/`].map((path) =>
    http.get(path, ({ request }) => {
      const q = (new URL(request.url).searchParams.get('q') ?? '').toLowerCase().trim();
      if (!q) return HttpResponse.json([]);
      const titles = assets
        .filter((a) => a.status === 'ready_to_list' && a.title.toLowerCase().includes(q))
        .map((a) => a.title)
        .slice(0, 10);
      return HttpResponse.json(titles);
    }),
  ),

  // ── Broadcaster: Titles (screener model) ───────────────────────────────────
  // Public Title projection — active titles only, slug-based. Returns a bare
  // array (no pagination wrapper), matching the live contract.
  http.get(`${API}/broadcaster/titles/`, () => {
    if (!session.current) return unauthorized();
    return HttpResponse.json(titles);
  }),

  http.get(`${API}/broadcaster/titles/:slug/`, ({ params }) => {
    if (!session.current) return unauthorized();
    const title = findTitleBySlug(String(params.slug));
    if (!title) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    return HttpResponse.json(title);
  }),

  http.get(`${API}/broadcaster/titles/:slug/rights/`, ({ params }) => {
    if (!session.current) return unauthorized();
    const title = findTitleBySlug(String(params.slug));
    if (!title) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    return HttpResponse.json(titleRights[title.slug] ?? []);
  }),

  // ── Broadcaster: home dashboard ─────────────────────────────────────────────
  // First-party only: the broadcaster's own watchlist + screener state, and
  // rights opening in their territories. No audience/viewership data.
  http.get(`${API}/broadcaster/dashboard/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    const reqs = screenerRequests[user.user_id] ?? [];
    const byStatus: Record<string, number> = {};
    for (const r of reqs) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    return HttpResponse.json({
      activity: {
        watchlist_count: (watchlist[user.user_id] ?? []).length,
        screener_requests_by_status: byStatus,
      },
      browsable_titles: titles.length,
      rights_opening_soon: [
        {
          title_slug: 'harmattan-letters',
          title_name: 'Harmattan Letters',
          territory: 'Francophone Africa',
          rights_type: 'svod',
          available_from: '2026-08-01',
        },
        {
          title_slug: 'riverwood-nights',
          title_name: 'Riverwood Nights',
          territory: 'East Africa',
          rights_type: 'broadcast',
          available_from: '2026-09-15',
        },
      ],
    });
  }),

  // ── Broadcaster: Expression of Interest ─────────────────────────────────────
  http.post(`${API}/broadcaster/expressions-of-interest/`, async ({ request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ uuid: 'eoi-new', ...body, status: 'submitted' }, { status: 201 });
  }),

  // ── Broadcaster: Watchlist ──────────────────────────────────────────────────
  http.get(`${API}/broadcaster/watchlist/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    return HttpResponse.json(watchlist[user.user_id] ?? []);
  }),

  // Idempotent: 200 if the title is already on the list, 201 if newly added.
  http.post(`${API}/broadcaster/watchlist/`, async ({ request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const body = (await request.json()) as {
      title_slug?: string;
      internal_note?: string;
      priority?: string;
    };
    const title = body.title_slug ? findTitleBySlug(body.title_slug) : undefined;
    if (!title) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });

    const list = (watchlist[user.user_id] ??= []);
    const existing = list.find((e) => e.title_slug === title.slug);
    if (existing) return HttpResponse.json(existing, { status: 200 });

    const entry: WatchlistEntry = {
      id: allocateWatchlistId(),
      title_slug: title.slug,
      title_name: title.name,
      internal_note: String(body.internal_note ?? ''),
      priority: (body.priority as WatchlistEntry['priority']) ?? '',
      added_at: new Date().toISOString(),
    };
    list.push(entry);
    return HttpResponse.json(entry, { status: 201 });
  }),

  // ── Broadcaster: Screener requests ──────────────────────────────────────────
  http.get(`${API}/broadcaster/screener-requests/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    return HttpResponse.json(screenerRequests[user.user_id] ?? []);
  }),

  http.post(`${API}/broadcaster/screener-requests/`, async ({ request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const body = (await request.json()) as {
      title_slug?: string;
      purpose?: ScreenerPurpose;
      territory_interest?: number[];
      message_to_producer?: string;
    };
    const title = body.title_slug ? findTitleBySlug(body.title_slug) : undefined;
    if (!title) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });

    const summary: ScreenerSummary = {
      uuid: crypto.randomUUID(),
      title_slug: title.slug,
      title_name: title.name,
      purpose: body.purpose ?? 'acquisition_evaluation',
      status: 'pending',
      requested_at: new Date().toISOString(),
      access_expires_at: null,
    };
    (screenerRequests[user.user_id] ??= []).push(summary);
    return HttpResponse.json(summary, { status: 201 });
  }),

  // ── Admin: moderation model (dashboard / screeners / titles) ────────────────
  // The admin moderates the full catalogue. Dashboard is an aggregate over the
  // admin title roster + screener queue + org/asset/storage counts.
  http.get(`${API}/admin/dashboard/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!isAdmin(user)) return HttpResponse.json({ detail: 'Admin only.' }, { status: 403 });

    const byStatus: Record<string, number> = {};
    for (const t of adminTitles) byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;

    const screenersByStatus: Record<string, number> = {};
    for (const r of adminScreenerRequests) {
      screenersByStatus[r.status] = (screenersByStatus[r.status] ?? 0) + 1;
    }

    // Triage queue: submissions awaiting an editorial decision, lowest metadata
    // score first (the ones that most need an archivist's attention).
    const triage = adminTitles
      .filter((t) => t.status === 'submitted' || t.status === 'under_review')
      .sort((a, b) => a.metadata_score - b.metadata_score)
      .map((t) => ({
        slug: t.slug,
        name: t.name,
        status: t.status,
        production_company: t.production_company?.name ?? '—',
        metadata_score: t.metadata_score,
        updated_at: t.updated_at,
      }));

    const usersByRole: Record<string, number> = {};
    for (const u of users) {
      const role = u.me.profile?.role ?? 'unknown';
      usersByRole[role] = (usersByRole[role] ?? 0) + 1;
    }

    const dashboard: AdminDashboard = {
      content: {
        total_titles: adminTitles.length,
        by_status: byStatus,
        active: adminTitles.filter((t) => t.status === 'active').length,
      },
      screeners: {
        by_status: screenersByStatus,
        pending_queue: adminScreenerRequests.filter((r) => r.status === 'pending').length,
      },
      triage_queue: triage,
      organisations: {
        production_companies: productionCompanies.length,
        broadcasters: broadcasters.length,
        users_by_role: usersByRole,
      },
      assets: {
        total: assets.length,
        unvalidated: assets.filter((a) => a.taxonomy_count === 0).length,
      },
      storage: {
        total_bytes: 4_812_375_982_106,
      },
      featured_slots: adminTitles.filter((t) => t.is_featured).length,
      // Rights coverage by territory: how many active titles offer rights in each
      // territory, as a percentage of the active catalogue. Derived from the
      // production rights windows so the bars track real data.
      rights_coverage: buildRightsCoverage(),
    };
    return HttpResponse.json(dashboard);
  }),

  // The admin organisations roster (production companies + broadcasters), with
  // activity counts derived from the title roster, screener queue, and watchlists.
  http.get(`${API}/admin/organisations/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!isAdmin(user)) return HttpResponse.json({ detail: 'Admin only.' }, { status: 403 });
    return HttpResponse.json(buildAdminOrganisations());
  }),

  // Screener moderation queue — every broadcaster's request, with identity visible.
  http.get(`${API}/admin/screener-requests/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!isAdmin(user)) return HttpResponse.json({ detail: 'Admin only.' }, { status: 403 });
    return HttpResponse.json(adminScreenerRequests);
  }),

  http.post(`${API}/admin/screener-requests/:uuid/approve/`, async ({ params, request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!isAdmin(user)) return HttpResponse.json({ detail: 'Admin only.' }, { status: 403 });
    const req = findAdminScreener(String(params.uuid));
    if (!req) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });

    const body = (await request.json().catch(() => ({}))) as { access_duration_hours?: number };
    const hours = typeof body.access_duration_hours === 'number' ? body.access_duration_hours : 48;
    const now = new Date();
    req.status = 'approved';
    req.reviewed_at = now.toISOString();
    req.access_expires_at = new Date(now.getTime() + hours * 3600 * 1000).toISOString();
    return HttpResponse.json(req);
  }),

  http.post(`${API}/admin/screener-requests/:uuid/decline/`, async ({ params, request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!isAdmin(user)) return HttpResponse.json({ detail: 'Admin only.' }, { status: 403 });
    const req = findAdminScreener(String(params.uuid));
    if (!req) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });

    // reason is captured by the backend (surfaced to the broadcaster); the
    // request transitions to declined regardless of whether a reason was given.
    await request.json().catch(() => ({}));
    req.status = 'declined';
    req.reviewed_at = new Date().toISOString();
    return HttpResponse.json(req);
  }),

  // Full admin Title roster (bare array), and the editorial status transition.
  http.get(`${API}/admin/titles/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!isAdmin(user)) return HttpResponse.json({ detail: 'Admin only.' }, { status: 403 });
    return HttpResponse.json(adminTitles);
  }),

  http.patch(`${API}/admin/titles/:slug/status/`, async ({ params, request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!isAdmin(user)) return HttpResponse.json({ detail: 'Admin only.' }, { status: 403 });
    const title = findAdminTitleBySlug(String(params.slug));
    if (!title) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });

    const body = (await request.json()) as { status?: TitleStatus; note?: string };
    if (!body.status) return HttpResponse.json({ detail: 'status is required.' }, { status: 400 });
    title.status = body.status;
    title.status_changed_at = new Date().toISOString();
    title.status_changed_by = user.me.email;
    title.updated_at = title.status_changed_at;
    // changes_requested surfaces the note to the producer; we mirror it onto the
    // internal notes so the demo shows the captured text.
    if (body.status === 'changes_requested' && body.note) {
      title.admin_notes_internal = body.note;
    }
    return HttpResponse.json(title);
  }),

  // ── Reference data ────────────────────────────────────────────────────────
  http.get(`${API}/languages/`, () => HttpResponse.json(languages)),
  http.get(`${API}/countries/`, () => HttpResponse.json(countries)),
  http.get(`${API}/territories/`, () => HttpResponse.json(territories)),
  http.get(`${API}/production-companies/`, () => HttpResponse.json(productionCompanies)),
  http.get(`${API}/production-companies/:id/`, ({ params }) => {
    const company = productionCompanies.find((c) => c.id === Number(params.id));
    if (!company) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    return HttpResponse.json(company);
  }),
  http.get(`${API}/broadcasters/`, () => HttpResponse.json(broadcasters)),
  http.get(`${API}/taxonomy-terms/`, () =>
    HttpResponse.json(assets.flatMap((a) => a.taxonomy_tags)),
  ),
];
