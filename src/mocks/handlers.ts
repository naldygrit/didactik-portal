import { http, HttpResponse } from 'msw';
import type {
  AdminDashboard,
  AssetDetail,
  AssetListItem,
  BidBoard,
  ProductionTitleStat,
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
  allocateAssetId,
  allocateBidId,
  allocateDealId,
  allocatePayoutAccountId,
  allocateWatchlistId,
  assets,
  bids,
  broadcasters,
  countries,
  deals,
  findAdminScreener,
  findAdminTitleBySlug,
  findTitleBySlug,
  interestOptions,
  languages,
  LICENSE_CURRENCY,
  licenseRanges,
  payoutAccounts,
  productionCompanies,
  screenerRequests,
  session,
  titleRights,
  titles,
  userInterests,
  users,
  watchlist,
} from './db';
import type { Deal, LicenseType, MockUser, PayoutAccount } from './db';

const API = '/api/v1';

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

// Competitive bid state for one title, scoped to the current broadcaster.
function buildBidBoard(assetId: number, user: MockUser): BidBoard | null {
  const range = licenseRanges[assetId];
  if (!range) return null;
  const assetBids = bids.filter((b) => b.asset_id === assetId);
  const highest = assetBids.length ? Math.max(...assetBids.map((b) => b.amount)) : null;
  const bc = user.me.profile?.broadcaster;
  const mine = bc ? assetBids.find((b) => b.broadcaster_id === bc.id) : undefined;
  return {
    license_floor: range.floor,
    license_ceiling: range.ceiling,
    currency: LICENSE_CURRENCY,
    bid_count: assetBids.length,
    highest_amount: highest,
    your_bid: mine
      ? { id: mine.id, amount: mine.amount, created_at: mine.created_at, is_top: mine.amount === highest }
      : null,
  };
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

  // ── Bidding ───────────────────────────────────────────────────────────────
  http.get(`${API}/assets/:id/bids/`, ({ params }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const board = buildBidBoard(Number(params.id), user);
    if (!board) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    return HttpResponse.json(board);
  }),

  http.post(`${API}/assets/:id/bids/`, async ({ params, request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const bc = user.me.profile?.broadcaster;
    if (!bc) return HttpResponse.json({ detail: 'Only broadcasters can place bids.' }, { status: 403 });

    const assetId = Number(params.id);
    const range = licenseRanges[assetId];
    if (!range) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });

    const { amount } = (await request.json()) as { amount: number };
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      return HttpResponse.json({ detail: 'Enter a bid amount.' }, { status: 400 });
    }
    if (amount < range.floor || amount > range.ceiling) {
      return HttpResponse.json(
        { detail: `Bid must be within the licensing range (${range.floor}–${range.ceiling}).` },
        { status: 400 },
      );
    }

    const existing = bids.find((b) => b.asset_id === assetId && b.broadcaster_id === bc.id);
    if (existing) {
      existing.amount = amount;
      existing.created_at = new Date().toISOString();
    } else {
      bids.push({
        id: allocateBidId(),
        asset_id: assetId,
        broadcaster_id: bc.id,
        broadcaster_name: bc.name,
        amount,
        created_at: new Date().toISOString(),
      });
    }
    return HttpResponse.json(buildBidBoard(assetId, user));
  }),

  // ── Deals ─────────────────────────────────────────────────────────────────
  // Role-scoped: broadcaster sees deals they won, producer sees deals on their
  // titles, admin sees all.
  http.get(`${API}/deals/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    const p = user.me.profile;
    if (isAdmin(user)) return HttpResponse.json(deals);
    if (p?.role === 'broadcaster_user' && p.broadcaster) {
      return HttpResponse.json(deals.filter((d) => d.broadcaster_id === p.broadcaster!.id));
    }
    if (p?.role === 'production_company_user' && p.production_company) {
      const companyId = p.production_company.id;
      return HttpResponse.json(
        deals.filter((d) => assets.find((a) => a.id === d.asset_id)?.production_company?.id === companyId),
      );
    }
    return HttpResponse.json([]);
  }),

  // Admin accepts the top bid on the producer's behalf and records licence terms.
  http.post(`${API}/assets/:id/accept-bid/`, async ({ params, request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    if (!isAdmin(user)) return HttpResponse.json({ detail: 'Admin only.' }, { status: 403 });

    const assetId = Number(params.id);
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    if (deals.some((d) => d.asset_id === assetId)) {
      return HttpResponse.json({ detail: 'This title is already licensed.' }, { status: 409 });
    }
    const assetBids = bids.filter((b) => b.asset_id === assetId);
    if (assetBids.length === 0) {
      return HttpResponse.json({ detail: 'No bids to accept.' }, { status: 400 });
    }
    const top = assetBids.reduce((m, b) => (b.amount > m.amount ? b : m), assetBids[0]);
    const { license_type } = (await request.json()) as { license_type: LicenseType };

    const deal: Deal = {
      id: allocateDealId(),
      asset_id: assetId,
      asset_title: asset.title,
      broadcaster_id: top.broadcaster_id,
      broadcaster_name: top.broadcaster_name,
      amount: top.amount,
      currency: LICENSE_CURRENCY,
      license_type: license_type === 'exclusive' ? 'exclusive' : 'non_exclusive',
      created_at: new Date().toISOString(),
    };
    deals.push(deal);
    return HttpResponse.json(deal);
  }),

  // ── Payouts ───────────────────────────────────────────────────────────────
  http.get(`${API}/payout-accounts/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });
    return HttpResponse.json(payoutAccounts.filter((a) => a.company_id === company.id));
  }),

  http.post(`${API}/payout-accounts/`, async ({ request }) => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });
    const body = (await request.json()) as { label?: string; account_number?: string; percentage?: number };
    const account: PayoutAccount = {
      id: allocatePayoutAccountId(),
      company_id: company.id,
      label: String(body.label ?? 'Account'),
      account_number: String(body.account_number ?? ''),
      percentage: typeof body.percentage === 'number' ? body.percentage : 0,
    };
    payoutAccounts.push(account);
    return HttpResponse.json(account);
  }),

  // Per-title market interest for the production Analytics view.
  http.get(`${API}/production/title-stats/`, () => {
    const user = session.current;
    if (!user) return unauthorized();
    const company = user.me.profile?.production_company;
    if (!company) return HttpResponse.json({ detail: 'Production companies only.' }, { status: 403 });
    const mine = assets.filter((a) => a.production_company?.id === company.id);
    const stats: ProductionTitleStat[] = mine.map((a) => {
      const assetBids = bids.filter((b) => b.asset_id === a.id);
      const top = assetBids.length ? Math.max(...assetBids.map((b) => b.amount)) : null;
      const deal = deals.find((d) => d.asset_id === a.id);
      return {
        asset_id: a.id,
        title: a.title,
        status: a.status,
        bid_count: assetBids.length,
        top_amount: top,
        licensed_amount: deal?.amount ?? null,
        currency: LICENSE_CURRENCY,
      };
    });
    return HttpResponse.json(stats);
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
    };
    return HttpResponse.json(dashboard);
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
