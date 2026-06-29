// In-memory mock database for the portal. Seeded with continental African
// audiovisual content (Nollywood, Riverwood, Francophone, etc.) so every portal
// has real-feeling data to render. Mutations (new submissions, withdrawals,
// screener requests, rights windows) happen against these arrays at runtime and
// persist until reload.
import type {
  AdminOrganisations,
  AdminScreenerRequest,
  AdminTitle,
  AssetDetail,
  Country,
  Language,
  MeResponse,
  RightsRow,
  ScreenerSummary,
  TaxonomyTag,
  Title,
  TitleStatus,
  WatchlistEntry,
} from '../portal/shared/types';

export interface MockUser {
  username: string;
  password: string;
  user_id: number;
  email: string;
  me: MeResponse;
}

export const languages: Language[] = [
  { id: 1, code: 'yor', english_name: 'Yoruba' },
  { id: 2, code: 'ibo', english_name: 'Igbo' },
  { id: 3, code: 'hau', english_name: 'Hausa' },
  { id: 4, code: 'pcm', english_name: 'Nigerian Pidgin' },
  { id: 5, code: 'swa', english_name: 'Swahili' },
  { id: 6, code: 'wol', english_name: 'Wolof' },
  { id: 7, code: 'amh', english_name: 'Amharic' },
  { id: 8, code: 'ara', english_name: 'Arabic' },
  { id: 9, code: 'fra', english_name: 'French' },
  { id: 10, code: 'eng', english_name: 'English' },
];

export const countries: Country[] = [
  { id: 1, code: 'NG', name: 'Nigeria' },
  { id: 2, code: 'KE', name: 'Kenya' },
  { id: 3, code: 'SN', name: 'Senegal' },
  { id: 4, code: 'EG', name: 'Egypt' },
  { id: 5, code: 'ZA', name: 'South Africa' },
  { id: 6, code: 'ET', name: 'Ethiopia' },
  { id: 7, code: 'GH', name: 'Ghana' },
];

export interface MockCompany {
  id: number;
  name: string;
  country: Country;
  verification_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const productionCompanies: MockCompany[] = [
  { id: 1, name: 'EbonyLife Studios', country: countries[0], verification_status: 'verified', notes: '', created_at: '2025-11-02T09:00:00Z', updated_at: '2026-01-10T09:00:00Z' },
  { id: 2, name: 'Riverwood Ensemble', country: countries[1], verification_status: 'verified', notes: '', created_at: '2025-12-14T09:00:00Z', updated_at: '2026-02-01T09:00:00Z' },
  { id: 3, name: 'Celluloïde Dakar', country: countries[2], verification_status: 'pending', notes: '', created_at: '2026-03-20T09:00:00Z', updated_at: '2026-03-20T09:00:00Z' },
];

export interface MockBroadcaster {
  id: number;
  name: string;
  country: Country;
}

export const broadcasters: MockBroadcaster[] = [
  // Broadcasters can be based anywhere globally; country is informational only.
  { id: 1, name: 'Canal+ International', country: countries[2] },
  { id: 2, name: 'Showmax', country: countries[4] },
  { id: 3, name: 'StarTimes Media', country: countries[0] },
];

const tag = (
  id: number,
  term: string,
  english_gloss: string,
  term_type: string,
  language_code: string,
): TaxonomyTag => ({
  id,
  term,
  english_gloss,
  term_type,
  language_code,
  start_timecode_seconds: null,
  end_timecode_seconds: null,
  notes: '',
});

// Master asset records (AssetDetail shape). List/search responses derive from these.
export const assets: AssetDetail[] = [
  {
    id: 101,
    title: 'Lagos After Dark',
    original_title: 'Èkó Lálẹ́',
    asset_type: 'feature_film',
    status: 'ready_to_list',
    production_year: 2024,
    primary_language: languages[0],
    production_country: countries[0],
    production_company: { id: 1, name: 'EbonyLife Studios' },
    storage_backend: 'b2',
    created_at: '2026-04-02T10:15:00Z',
    taxonomy_count: 3,
    description:
      'A neon-lit crime drama tracing one night across Lagos through the eyes of a danfo driver, a market trader, and an off-duty officer whose paths collide.',
    approved_at: '2026-04-10T12:00:00Z',
    updated_at: '2026-04-10T12:00:00Z',
    rejection_reason: '',
    taxonomy_tags: [
      tag(1, 'Èkó', 'Lagos', 'place', 'yor'),
      tag(2, 'danfo', 'minibus taxi', 'object', 'pcm'),
      tag(3, 'crime drama', 'crime drama', 'genre', 'eng'),
    ],
  },
  {
    id: 102,
    title: 'The Salt Harvesters',
    original_title: 'Wavunaji wa Chumvi',
    asset_type: 'documentary',
    status: 'ready_to_list',
    production_year: 2023,
    primary_language: languages[4],
    production_country: countries[1],
    production_company: { id: 2, name: 'Riverwood Ensemble' },
    storage_backend: 'b2',
    created_at: '2026-03-18T08:30:00Z',
    taxonomy_count: 2,
    description:
      'Along the shores of Lake Magadi, three generations of salt harvesters reckon with drought, tourism, and a vanishing trade.',
    approved_at: '2026-03-25T09:00:00Z',
    updated_at: '2026-03-25T09:00:00Z',
    rejection_reason: '',
    taxonomy_tags: [
      tag(4, 'Magadi', 'Lake Magadi', 'place', 'swa'),
      tag(5, 'chumvi', 'salt', 'object', 'swa'),
    ],
  },
  {
    id: 103,
    title: 'Harmattan Letters',
    original_title: 'Harmattan Letters',
    asset_type: 'feature_film',
    status: 'ready_to_list',
    production_year: 2025,
    primary_language: languages[9],
    production_country: countries[6],
    production_company: { id: 1, name: 'EbonyLife Studios' },
    storage_backend: 'b2',
    created_at: '2026-05-01T14:00:00Z',
    taxonomy_count: 1,
    description:
      'Two estranged sisters in Accra rebuild their relationship through a year of handwritten letters as the dry Harmattan winds sweep down from the Sahel.',
    approved_at: '2026-05-08T10:00:00Z',
    updated_at: '2026-05-08T10:00:00Z',
    rejection_reason: '',
    taxonomy_tags: [tag(6, 'Harmattan', 'dry season wind', 'event', 'eng')],
  },
  {
    id: 104,
    title: 'Riverwood Nights',
    original_title: 'Riverwood Nights',
    asset_type: 'tv_episode',
    status: 'ready_to_list',
    production_year: 2025,
    primary_language: languages[4],
    production_country: countries[1],
    production_company: { id: 2, name: 'Riverwood Ensemble' },
    storage_backend: 'b2',
    created_at: '2026-05-20T11:00:00Z',
    taxonomy_count: 0,
    description:
      'Episode 1 of the anthology series following a Nairobi film crew shooting on a shoestring budget.',
    approved_at: '2026-05-27T10:00:00Z',
    updated_at: '2026-05-27T10:00:00Z',
    rejection_reason: '',
    taxonomy_tags: [],
  },
  {
    id: 105,
    title: 'The Griot of Saint-Louis',
    original_title: 'Le Griot de Saint-Louis',
    asset_type: 'documentary',
    status: 'ready_to_list',
    production_year: 2024,
    primary_language: languages[8],
    production_country: countries[2],
    production_company: { id: 3, name: 'Celluloïde Dakar' },
    storage_backend: 'b2',
    created_at: '2026-04-22T09:00:00Z',
    taxonomy_count: 2,
    description:
      'A portrait of an ageing griot preserving four centuries of oral history on the island city of Saint-Louis.',
    approved_at: '2026-04-29T09:00:00Z',
    updated_at: '2026-04-29T09:00:00Z',
    rejection_reason: '',
    taxonomy_tags: [
      tag(7, 'griot', 'oral historian', 'role', 'wol'),
      tag(8, 'Saint-Louis', 'Saint-Louis', 'place', 'fra'),
    ],
  },
  // Production-company-owned, mid-pipeline (visible to PC user, not broadcasters)
  {
    id: 106,
    title: 'Aso Rock',
    original_title: 'Aso Rock',
    asset_type: 'feature_film',
    status: 'under_review',
    production_year: 2026,
    primary_language: languages[3],
    production_country: countries[0],
    production_company: { id: 1, name: 'EbonyLife Studios' },
    storage_backend: 'b2',
    created_at: '2026-06-10T13:00:00Z',
    taxonomy_count: 0,
    description: 'A political thriller set in the corridors of power in Abuja.',
    approved_at: null,
    updated_at: '2026-06-12T13:00:00Z',
    rejection_reason: '',
    taxonomy_tags: [],
  },
  {
    id: 107,
    title: 'Market Day',
    original_title: 'Ọjọ́ Ọjà',
    asset_type: 'short_film',
    status: 'uploaded',
    production_year: 2026,
    primary_language: languages[0],
    production_country: countries[0],
    production_company: { id: 1, name: 'EbonyLife Studios' },
    storage_backend: 'b2',
    created_at: '2026-06-20T08:00:00Z',
    taxonomy_count: 0,
    description: 'A wordless short following a child lost in Balogun market.',
    approved_at: null,
    updated_at: '2026-06-20T08:00:00Z',
    rejection_reason: '',
    taxonomy_tags: [],
  },
  {
    id: 108,
    title: 'Pending Submission',
    original_title: 'Pending Submission',
    asset_type: 'feature_film',
    status: 'pending_upload',
    production_year: 2026,
    primary_language: languages[9],
    production_country: countries[0],
    production_company: { id: 1, name: 'EbonyLife Studios' },
    storage_backend: 'b2',
    created_at: '2026-06-27T08:00:00Z',
    taxonomy_count: 0,
    description: 'Awaiting file upload.',
    approved_at: null,
    updated_at: '2026-06-27T08:00:00Z',
    rejection_reason: '',
    taxonomy_tags: [],
  },
];

export const users: MockUser[] = [
  {
    username: 'broadcaster',
    password: 'demo',
    user_id: 1,
    email: 'buyer@canalplus.example',
    me: {
      username: 'broadcaster',
      email: 'buyer@canalplus.example',
      is_staff: false,
      is_superuser: false,
      profile: { role: 'broadcaster_user', production_company: null, broadcaster: { id: 1, name: 'Canal+ International' } },
    },
  },
  {
    username: 'producer',
    password: 'demo',
    user_id: 2,
    email: 'studio@ebonylife.example',
    me: {
      username: 'producer',
      email: 'studio@ebonylife.example',
      is_staff: false,
      is_superuser: false,
      profile: { role: 'production_company_user', production_company: { id: 1, name: 'EbonyLife Studios' }, broadcaster: null },
    },
  },
  {
    username: 'admin',
    password: 'demo',
    user_id: 3,
    email: 'curator@didactikmedia.com',
    me: {
      username: 'admin',
      email: 'curator@didactikmedia.com',
      is_staff: true,
      is_superuser: true,
      profile: { role: 'admin_staff', production_company: null, broadcaster: null },
    },
  },
];

// Mutable runtime session (set on login, read by refresh/me, cleared on logout).
export const session: { current: MockUser | null } = { current: null };

let nextAssetId = 200;
export function allocateAssetId(): number {
  return nextAssetId++;
}

// ── Discovery (Phase 6) ─────────────────────────────────────────────────────
// Interest chips a broadcaster picks at onboarding; keys encode the dimension
// they match against (type / country / language).
export interface InterestOption {
  key: string;
  label: string;
}

export const interestOptions: InterestOption[] = [
  { key: 'type:feature_film', label: 'Feature films' },
  { key: 'type:documentary', label: 'Documentaries' },
  { key: 'type:short_film', label: 'Short films' },
  { key: 'type:tv_episode', label: 'Series' },
  { key: 'country:NG', label: 'Nigeria' },
  { key: 'country:KE', label: 'Kenya' },
  { key: 'country:SN', label: 'Senegal' },
  { key: 'country:GH', label: 'Ghana' },
  { key: 'lang:yor', label: 'Yoruba' },
  { key: 'lang:swa', label: 'Swahili' },
  { key: 'lang:fra', label: 'Francophone' },
];

// Picked interests per user id (set at onboarding).
export const userInterests: Record<number, string[]> = {};

// ── Screener model (broadcaster portal) ──────────────────────────────────────
// The broadcaster portal browses Titles (slug-based public projection), inspects
// per-territory rights availability, requests watermarked screeners, and keeps a
// watchlist. These seeds mirror the live /api/v1/broadcaster/* contracts. Names
// intentionally match the listable assets above so demos read consistently.

const tLang = (code: string, english_name: string, id: number) => ({ id, code, english_name });
const tCountry = (code: string, name: string, id: number) => ({ id, code, name });

export const titles: Title[] = [
  {
    id: 101,
    uuid: '00000000-0000-0000-0000-000000000101',
    slug: 'lagos-after-dark',
    name: 'Lagos After Dark',
    original_title: 'Èkó Lálẹ́',
    title_type: 'feature_film',
    production_company: { id: 1, name: 'EbonyLife Studios' },
    production_year: 2024,
    country_of_origin: tCountry('NG', 'Nigeria', 1),
    co_production_countries: [],
    original_language: tLang('yor', 'Yoruba', 1),
    dialogue_languages: [tLang('yor', 'Yoruba', 1), tLang('pcm', 'Nigerian Pidgin', 4)],
    genres: [{ id: 1, name: 'Crime Drama', slug: 'crime-drama' }],
    cultural_tags: [{ id: 1, name: 'Lagos', slug: 'lagos' }],
    maturity_rating: { id: 1, code: '18', rating_system: 'NFVCB' },
    logline: 'One night across Lagos, three strangers collide.',
    synopsis:
      'A neon-lit crime drama tracing one night across Lagos through the eyes of a danfo driver, a market trader, and an off-duty officer whose paths collide.',
    runtime_minutes: 118,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: '4K',
    aspect_ratio: '2.39:1',
    is_featured: true,
  },
  {
    id: 102,
    uuid: '00000000-0000-0000-0000-000000000102',
    slug: 'the-salt-harvesters',
    name: 'The Salt Harvesters',
    original_title: 'Wavunaji wa Chumvi',
    title_type: 'documentary',
    production_company: { id: 2, name: 'Riverwood Ensemble' },
    production_year: 2023,
    country_of_origin: tCountry('KE', 'Kenya', 2),
    co_production_countries: [],
    original_language: tLang('swa', 'Swahili', 5),
    dialogue_languages: [tLang('swa', 'Swahili', 5)],
    genres: [{ id: 2, name: 'Documentary', slug: 'documentary' }],
    cultural_tags: [{ id: 2, name: 'Lake Magadi', slug: 'lake-magadi' }],
    maturity_rating: null,
    logline: 'Three generations reckon with a vanishing trade.',
    synopsis:
      'Along the shores of Lake Magadi, three generations of salt harvesters reckon with drought, tourism, and a vanishing trade.',
    runtime_minutes: 92,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
  {
    id: 103,
    uuid: '00000000-0000-0000-0000-000000000103',
    slug: 'harmattan-letters',
    name: 'Harmattan Letters',
    original_title: 'Harmattan Letters',
    title_type: 'feature_film',
    production_company: { id: 1, name: 'EbonyLife Studios' },
    production_year: 2025,
    country_of_origin: tCountry('GH', 'Ghana', 7),
    co_production_countries: [],
    original_language: tLang('eng', 'English', 10),
    dialogue_languages: [tLang('eng', 'English', 10)],
    genres: [{ id: 3, name: 'Drama', slug: 'drama' }],
    cultural_tags: [],
    maturity_rating: { id: 2, code: 'PG', rating_system: 'NFVCB' },
    logline: 'Two estranged sisters rebuild through a year of letters.',
    synopsis:
      'Two estranged sisters in Accra rebuild their relationship through a year of handwritten letters as the dry Harmattan winds sweep down from the Sahel.',
    runtime_minutes: 105,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: '4K',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
  {
    id: 104,
    uuid: '00000000-0000-0000-0000-000000000104',
    slug: 'riverwood-nights',
    name: 'Riverwood Nights',
    original_title: 'Riverwood Nights',
    title_type: 'tv_episode',
    production_company: { id: 2, name: 'Riverwood Ensemble' },
    production_year: 2025,
    country_of_origin: tCountry('KE', 'Kenya', 2),
    co_production_countries: [],
    original_language: tLang('swa', 'Swahili', 5),
    dialogue_languages: [tLang('swa', 'Swahili', 5)],
    genres: [{ id: 4, name: 'Comedy', slug: 'comedy' }],
    cultural_tags: [],
    maturity_rating: null,
    logline: 'A Nairobi film crew shoots on a shoestring.',
    synopsis:
      'Episode 1 of the anthology series following a Nairobi film crew shooting on a shoestring budget.',
    runtime_minutes: 44,
    episode_count: 8,
    season_count: 1,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.78:1',
    is_featured: false,
  },
  {
    id: 105,
    uuid: '00000000-0000-0000-0000-000000000105',
    slug: 'the-griot-of-saint-louis',
    name: 'The Griot of Saint-Louis',
    original_title: 'Le Griot de Saint-Louis',
    title_type: 'documentary',
    production_company: { id: 3, name: 'Celluloïde Dakar' },
    production_year: 2024,
    country_of_origin: tCountry('SN', 'Senegal', 3),
    co_production_countries: [],
    original_language: tLang('fra', 'French', 9),
    dialogue_languages: [tLang('fra', 'French', 9), tLang('wol', 'Wolof', 6)],
    genres: [{ id: 2, name: 'Documentary', slug: 'documentary' }],
    cultural_tags: [{ id: 3, name: 'Oral history', slug: 'oral-history' }],
    maturity_rating: null,
    logline: 'An ageing griot preserves four centuries of memory.',
    synopsis:
      'A portrait of an ageing griot preserving four centuries of oral history on the island city of Saint-Louis.',
    runtime_minutes: 78,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
];

// Per-title territory rights windows, keyed by slug. Mirrors RightsRow[].
export const titleRights: Record<string, RightsRow[]> = {
  'lagos-after-dark': [
    { territory: 'Nigeria', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
    { territory: 'Pan-Africa', rights_type: 'svod', is_exclusive: false, available_from: '2026-07-29', available_until: null, availability: 'available' },
    { territory: 'France', rights_type: 'all', is_exclusive: true, available_from: null, available_until: null, availability: 'licensed' },
  ],
  'the-salt-harvesters': [
    { territory: 'East Africa', rights_type: 'broadcast', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
    { territory: 'Worldwide', rights_type: 'avod', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
  ],
  'harmattan-letters': [
    { territory: 'Worldwide', rights_type: 'svod', is_exclusive: false, available_from: '2026-09-01', available_until: null, availability: 'available' },
  ],
  'riverwood-nights': [
    { territory: 'Kenya', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
  ],
  'the-griot-of-saint-louis': [
    { territory: 'Francophone Africa', rights_type: 'all', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
  ],
};

// Watchlist entries, keyed by user id (the broadcaster keeps a private list).
export const watchlist: Record<number, WatchlistEntry[]> = {
  1: [
    {
      id: 1,
      title_slug: 'the-griot-of-saint-louis',
      title_name: 'The Griot of Saint-Louis',
      internal_note: 'Strong fit for the documentary strand.',
      priority: 'high',
      added_at: '2026-06-22T09:00:00Z',
    },
  ],
};

let nextWatchlistId = 100;
export function allocateWatchlistId(): number {
  return nextWatchlistId++;
}

// Screener requests, keyed by user id.
export const screenerRequests: Record<number, ScreenerSummary[]> = {
  1: [
    {
      uuid: '00000000-0000-0000-0000-0000000000a1',
      title_slug: 'harmattan-letters',
      title_name: 'Harmattan Letters',
      purpose: 'acquisition_evaluation',
      status: 'pending',
      requested_at: '2026-06-24T11:00:00Z',
      access_expires_at: null,
    },
  ],
};

export function findTitleBySlug(slug: string): Title | undefined {
  return titles.find((t) => t.slug === slug);
}

// ── Admin moderation model (admin portal) ────────────────────────────────────
// The admin portal moderates the full catalogue: the editorial Title lifecycle
// (status + metadata_score + internal notes) and broadcaster screener requests
// (with the requesting broadcaster's identity visible — unlike the broadcaster
// and production projections). These seeds mirror the live /api/v1/admin/*
// contracts. Admin titles derive from the public `titles` above plus a couple of
// in-pipeline submissions so the triage queue has real work to show.

// Lift the shared fields off a public Title and layer on the admin-only editorial
// fields, so the admin and broadcaster projections stay consistent by construction.
function adminTitleFrom(
  t: Title,
  editorial: {
    status: TitleStatus;
    metadata_score: number;
    licensing_intent: string;
    admin_notes_internal?: string;
    status_changed_at?: string | null;
    submitted_by?: string | null;
    status_changed_by?: string | null;
  },
): AdminTitle {
  return {
    id: t.id,
    uuid: t.uuid,
    slug: t.slug,
    name: t.name,
    original_title: t.original_title,
    title_type: t.title_type,
    production_year: t.production_year,
    logline: t.logline,
    synopsis: t.synopsis,
    runtime_minutes: t.runtime_minutes,
    episode_count: t.episode_count,
    season_count: t.season_count,
    awards: t.awards,
    festival_selections: t.festival_selections,
    resolution: t.resolution,
    aspect_ratio: t.aspect_ratio,
    licensing_intent: editorial.licensing_intent,
    is_featured: t.is_featured,
    status: editorial.status,
    metadata_score: editorial.metadata_score,
    status_changed_at: editorial.status_changed_at ?? null,
    admin_notes_internal: editorial.admin_notes_internal ?? '',
    created_at: '2026-04-01T09:00:00Z',
    updated_at: '2026-06-20T09:00:00Z',
    production_company: t.production_company,
    country_of_origin: t.country_of_origin,
    original_language: t.original_language,
    maturity_rating: t.maturity_rating,
    submitted_by: editorial.submitted_by ?? null,
    status_changed_by: editorial.status_changed_by ?? null,
    co_production_countries: t.co_production_countries,
    dialogue_languages: t.dialogue_languages,
    genres: t.genres,
    cultural_tags: t.cultural_tags,
  };
}

export const adminTitles: AdminTitle[] = [
  adminTitleFrom(titles[0], {
    status: 'active',
    metadata_score: 92,
    licensing_intent: 'broadcast_and_svod',
    status_changed_at: '2026-04-10T12:00:00Z',
    submitted_by: 'studio@ebonylife.example',
    status_changed_by: 'curator@didactikmedia.com',
  }),
  adminTitleFrom(titles[1], {
    status: 'active',
    metadata_score: 88,
    licensing_intent: 'avod',
    status_changed_at: '2026-03-25T09:00:00Z',
    submitted_by: 'studio@riverwood.example',
    status_changed_by: 'curator@didactikmedia.com',
  }),
  adminTitleFrom(titles[2], {
    status: 'approved',
    metadata_score: 81,
    licensing_intent: 'svod',
    status_changed_at: '2026-05-08T10:00:00Z',
    submitted_by: 'studio@ebonylife.example',
    status_changed_by: 'curator@didactikmedia.com',
  }),
  adminTitleFrom(titles[3], {
    status: 'submitted',
    metadata_score: 47,
    licensing_intent: 'broadcast',
    submitted_by: 'studio@riverwood.example',
  }),
  adminTitleFrom(titles[4], {
    status: 'under_review',
    metadata_score: 63,
    licensing_intent: 'all_rights',
    submitted_by: 'studio@celluloide.example',
    status_changed_by: 'curator@didactikmedia.com',
    status_changed_at: '2026-05-02T09:00:00Z',
  }),
];

export function findAdminTitleBySlug(slug: string): AdminTitle | undefined {
  return adminTitles.find((t) => t.slug === slug);
}

// Screener requests across all broadcasters, as the admin moderation queue sees
// them. Two pending (the live approve/decline demo), one already approved.
export const adminScreenerRequests: AdminScreenerRequest[] = [
  {
    uuid: '00000000-0000-0000-0000-0000000000a1',
    title_name: 'Harmattan Letters',
    broadcaster: { id: 1, name: 'Canal+ International' },
    purpose: 'acquisition_evaluation',
    territory_interest: ['Francophone Africa', 'France'],
    message_to_producer: 'Keen to evaluate for the autumn acquisition slate.',
    status: 'pending',
    requested_at: '2026-06-24T11:00:00Z',
    reviewed_at: null,
    access_expires_at: null,
    access_count: 0,
  },
  {
    uuid: '00000000-0000-0000-0000-0000000000a2',
    title_name: 'Lagos After Dark',
    broadcaster: { id: 2, name: 'Showmax' },
    purpose: 'programming_review',
    territory_interest: ['Pan-Africa'],
    message_to_producer: '',
    status: 'pending',
    requested_at: '2026-06-26T08:30:00Z',
    reviewed_at: null,
    access_expires_at: null,
    access_count: 0,
  },
  {
    uuid: '00000000-0000-0000-0000-0000000000a3',
    title_name: 'The Salt Harvesters',
    broadcaster: { id: 3, name: 'StarTimes Media' },
    purpose: 'co_production_interest',
    territory_interest: ['East Africa'],
    message_to_producer: 'Exploring a co-production follow-up.',
    status: 'approved',
    requested_at: '2026-06-18T14:00:00Z',
    reviewed_at: '2026-06-19T10:00:00Z',
    access_expires_at: '2026-06-21T10:00:00Z',
    access_count: 2,
  },
];

export function findAdminScreener(uuid: string): AdminScreenerRequest | undefined {
  return adminScreenerRequests.find((r) => r.uuid === uuid);
}

// ── Admin organisations roster ───────────────────────────────────────────────
// The admin organisations table sees every registered company/broadcaster with
// activity counts the public projections withhold. We DERIVE these rows from the
// existing seeds (admin titles, screener queue, watchlists) so the counts stay
// internally consistent with the rest of the mock — mirrors the live
// /api/v1/admin/organisations/ contract.

// Broadcaster category + last-activity seeds (informational; the broadcaster
// model proper only carries id/name/country).
const broadcasterMeta: Record<number, { category: string; last_activity: string | null; created_at: string }> = {
  1: { category: 'pay_tv', last_activity: '2026-06-29T07:00:00Z', created_at: '2025-10-01T09:00:00Z' },
  2: { category: 'svod', last_activity: '2026-06-28T12:00:00Z', created_at: '2025-11-15T09:00:00Z' },
  3: { category: 'pay_tv', last_activity: '2026-06-24T09:00:00Z', created_at: '2026-01-20T09:00:00Z' },
};

// Production-company last-submission seeds (the company's most recent activity).
const productionMeta: Record<number, { last_activity: string | null }> = {
  1: { last_activity: '2026-06-29T08:00:00Z' },
  2: { last_activity: '2026-06-27T08:00:00Z' },
  3: { last_activity: '2026-06-17T08:00:00Z' },
};

export function buildAdminOrganisations(): AdminOrganisations {
  const production_companies = productionCompanies.map((c) => {
    const titlesForCo = adminTitles.filter((t) => t.production_company?.id === c.id);
    return {
      id: c.id,
      name: c.name,
      country: c.country.name,
      verification_status: c.verification_status,
      title_count: titlesForCo.length,
      active_title_count: titlesForCo.filter((t) => t.status === 'active').length,
      screener_request_count: titlesForCo.reduce(
        (n, t) =>
          n + adminScreenerRequests.filter((r) => r.title_name === t.name).length,
        0,
      ),
      last_activity: productionMeta[c.id]?.last_activity ?? null,
      created_at: c.created_at,
    };
  });

  const broadcasters_rows = broadcasters.map((b) => {
    const meta = broadcasterMeta[b.id];
    return {
      id: b.id,
      name: b.name,
      country: b.country.name,
      category: meta?.category ?? 'other',
      // Every broadcaster seed is an established, verified partner.
      verification_status: 'verified',
      screener_request_count: adminScreenerRequests.filter((r) => r.broadcaster.id === b.id).length,
      watchlist_count: watchlistCountFor(b.id),
      last_activity: meta?.last_activity ?? null,
      created_at: meta?.created_at ?? '2026-01-01T09:00:00Z',
    };
  });

  return { production_companies, broadcasters: broadcasters_rows };
}

// Watchlist is keyed by USER id, not broadcaster id. Broadcaster 1 (Canal+) is
// the seeded broadcaster user (user id 1); other broadcasters have no watchlist
// seed, so their count is 0 — honest, not fabricated.
function watchlistCountFor(broadcasterId: number): number {
  if (broadcasterId === 1) return watchlist[1]?.length ?? 0;
  return 0;
}

// ── Production (seller studio) screener/Title model ──────────────────────────
// The production portal manages the company's own catalogue: catalogue health,
// per-title metadata completeness, incoming (territory-only) screener interest,
// and the rights windows the company offers. These seeds mirror the live
// /api/v1/production/* contracts and replace the legacy deal/payout/bid model.

// Territories used to populate the rights-window dropdown and stored on windows.
export interface MockTerritory {
  id: number;
  name: string;
  slug: string;
  territory_type: string;
}

export const territories: MockTerritory[] = [
  { id: 1, name: 'Nigeria', slug: 'nigeria', territory_type: 'country' },
  { id: 2, name: 'Kenya', slug: 'kenya', territory_type: 'country' },
  { id: 3, name: 'Ghana', slug: 'ghana', territory_type: 'country' },
  { id: 4, name: 'Senegal', slug: 'senegal', territory_type: 'country' },
  { id: 5, name: 'France', slug: 'france', territory_type: 'country' },
  { id: 6, name: 'Pan-Africa', slug: 'pan-africa', territory_type: 'region' },
  { id: 7, name: 'East Africa', slug: 'east-africa', territory_type: 'region' },
  { id: 8, name: 'Francophone Africa', slug: 'francophone-africa', territory_type: 'region' },
  { id: 9, name: 'Worldwide', slug: 'worldwide', territory_type: 'global' },
];

export function findTerritory(id: number): MockTerritory | undefined {
  return territories.find((t) => t.id === id);
}

// Editorial metadata layered onto a public Title for the production projection,
// keyed by slug. Mirrors the ProductionTitle extra fields.
export const productionEditorial: Record<
  string,
  { status: TitleStatus; metadata_score: number; licensing_intent: string; screener_request_count: number }
> = {
  'lagos-after-dark': { status: 'active', metadata_score: 92, licensing_intent: 'broadcast_and_svod', screener_request_count: 1 },
  'harmattan-letters': { status: 'approved', metadata_score: 81, licensing_intent: 'svod', screener_request_count: 1 },
  // EbonyLife's in-pipeline submission (not yet a public Title), so the producer
  // sees a low-completeness title that needs attention.
  'aso-rock': { status: 'submitted', metadata_score: 38, licensing_intent: 'broadcast', screener_request_count: 0 },
};

// Production Titles belong to the authed company (EbonyLife / company id 1 for
// the demo producer). The shared `titles` cover the public catalogue; we add the
// in-pipeline "Aso Rock" so the producer's catalogue has a needs-attention row.
const asoRockTitle: Title = {
  id: 106,
  uuid: '00000000-0000-0000-0000-000000000106',
  slug: 'aso-rock',
  name: 'Aso Rock',
  original_title: 'Aso Rock',
  title_type: 'feature_film',
  production_company: { id: 1, name: 'EbonyLife Studios' },
  production_year: 2026,
  country_of_origin: { id: 1, code: 'NG', name: 'Nigeria' },
  co_production_countries: [],
  original_language: { id: 4, code: 'pcm', english_name: 'Nigerian Pidgin' },
  dialogue_languages: [{ id: 4, code: 'pcm', english_name: 'Nigerian Pidgin' }],
  genres: [],
  cultural_tags: [],
  maturity_rating: null,
  logline: 'A political thriller in the corridors of power in Abuja.',
  synopsis: 'A political thriller set in the corridors of power in Abuja.',
  runtime_minutes: null,
  episode_count: null,
  season_count: null,
  awards: [],
  festival_selections: [],
  resolution: '',
  aspect_ratio: '',
  is_featured: false,
};

// The pool of source Titles a production company can own (public catalogue plus
// in-pipeline submissions). Scoped to a company at request time.
export const productionTitlePool: Title[] = [...titles, asoRockTitle];

// Per-title metadata completeness breakdowns, keyed by slug.
export interface CompletenessRuleSeed {
  key: string;
  label: string;
  points: number;
  required: boolean;
  completed: boolean;
}

export const completenessBreakdowns: Record<string, CompletenessRuleSeed[]> = {
  'lagos-after-dark': [
    { key: 'synopsis', label: 'Synopsis', points: 20, required: true, completed: true },
    { key: 'logline', label: 'Logline', points: 10, required: true, completed: true },
    { key: 'genres', label: 'Genres', points: 15, required: true, completed: true },
    { key: 'maturity_rating', label: 'Maturity rating', points: 10, required: false, completed: true },
    { key: 'key_art', label: 'Key art', points: 15, required: false, completed: true },
  ],
  'harmattan-letters': [
    { key: 'synopsis', label: 'Synopsis', points: 20, required: true, completed: true },
    { key: 'logline', label: 'Logline', points: 10, required: true, completed: true },
    { key: 'genres', label: 'Genres', points: 15, required: true, completed: true },
    { key: 'maturity_rating', label: 'Maturity rating', points: 10, required: false, completed: true },
    { key: 'key_art', label: 'Key art', points: 15, required: false, completed: false },
  ],
  'aso-rock': [
    { key: 'synopsis', label: 'Synopsis', points: 20, required: true, completed: true },
    { key: 'logline', label: 'Logline', points: 10, required: true, completed: true },
    { key: 'genres', label: 'Genres', points: 15, required: true, completed: false },
    { key: 'maturity_rating', label: 'Maturity rating', points: 10, required: true, completed: false },
    { key: 'key_art', label: 'Key art', points: 15, required: false, completed: false },
  ],
};

// Incoming screener requests per title, TERRITORY-ONLY (no broadcaster identity),
// as the producer sees them. Keyed by slug.
export interface ProductionScreenerSeed {
  uuid: string;
  purpose: string;
  territory_interest: string[];
  status: ScreenerSummary['status'];
  requested_at: string;
}

export const productionScreenerRequests: Record<string, ProductionScreenerSeed[]> = {
  'lagos-after-dark': [
    {
      uuid: '00000000-0000-0000-0000-0000000000b1',
      purpose: 'programming_review',
      territory_interest: ['Pan-Africa'],
      status: 'pending',
      requested_at: '2026-06-26T08:30:00Z',
    },
  ],
  'harmattan-letters': [
    {
      uuid: '00000000-0000-0000-0000-0000000000b2',
      purpose: 'acquisition_evaluation',
      territory_interest: ['Francophone Africa', 'France'],
      status: 'pending',
      requested_at: '2026-06-24T11:00:00Z',
    },
  ],
};

// Mutable rights windows owned by the production company, scoped to a title slug.
export interface MockRightsWindow {
  id: number;
  title_slug: string;
  title: string;
  territory: string;
  rights_type: RightsRow['rights_type'];
  is_exclusive: boolean;
  available_from: string | null;
  available_until: string | null;
  availability: 'available' | 'licensed';
}

export const productionRightsWindows: MockRightsWindow[] = [
  { id: 1, title_slug: 'lagos-after-dark', title: 'lagos-after-dark', territory: 'Nigeria', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
  { id: 2, title_slug: 'lagos-after-dark', title: 'lagos-after-dark', territory: 'Pan-Africa', rights_type: 'svod', is_exclusive: false, available_from: '2026-07-29', available_until: null, availability: 'available' },
  { id: 3, title_slug: 'lagos-after-dark', title: 'lagos-after-dark', territory: 'France', rights_type: 'all', is_exclusive: true, available_from: null, available_until: null, availability: 'licensed' },
  { id: 4, title_slug: 'harmattan-letters', title: 'harmattan-letters', territory: 'Worldwide', rights_type: 'svod', is_exclusive: false, available_from: '2026-09-01', available_until: null, availability: 'available' },
];

let nextRightsWindowId = 100;
export function allocateRightsWindowId(): number {
  return nextRightsWindowId++;
}
