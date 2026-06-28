import { http, HttpResponse } from 'msw';
import type { AssetDetail, AssetListItem, BidBoard, SearchAsset } from '../portal/shared/types';
import { encodeMockJwt } from './jwt';
import {
  allocateAssetId,
  allocateBidId,
  assets,
  bids,
  broadcasters,
  countries,
  languages,
  LICENSE_CURRENCY,
  licenseRanges,
  productionCompanies,
  session,
  users,
} from './db';
import type { MockUser } from './db';

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
