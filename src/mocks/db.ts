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
    credits: [
      { id: 1, name: 'Kemi Adetiba', role: 'director', role_display: 'Director', character: '', is_primary: true, order: 0 },
      { id: 2, name: 'Funke Akindele', role: 'lead_cast', role_display: 'Lead Cast', character: 'Det. Amara Osei', is_primary: true, order: 1 },
      { id: 3, name: 'Ramsey Nouah', role: 'supporting_cast', role_display: 'Supporting Cast', character: 'Chief Balogun', is_primary: false, order: 2 },
      { id: 4, name: 'Jade Osiberu', role: 'producer', role_display: 'Producer', character: '', is_primary: true, order: 3 },
    ],
    language_tracks: [
      { id: 1, language: tLang('eng', 'English', 2), track_type: 'subtitle' },
      { id: 2, language: tLang('fra', 'French', 5), track_type: 'subtitle' },
      { id: 3, language: tLang('fra', 'French', 5), track_type: 'dub' },
    ],
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
  // Titles 106-115 below round the catalogue out to 15 so browse rails and
  // "More like this" (which needs a genre-mate, see AssetDetailPage) don't
  // look sparse. Genre ids are reused/paired deliberately: every genre used
  // here has at least 2 titles, so no detail page's "More like this" section
  // silently fails to render. `productionCompanies` above only registers the
  // 3 companies used by the original seed set — these new titles' companies
  // are brief refs (id+name) embedded directly, same shape, not registered
  // there, since that array feeds the admin org list, a separate concern.
  {
    id: 106,
    uuid: '00000000-0000-0000-0000-000000000106',
    slug: 'danfo-diaries',
    name: 'Danfo Diaries',
    original_title: 'Ìtàn Dánfó',
    title_type: 'feature_film',
    production_company: { id: 1, name: 'EbonyLife Studios' },
    production_year: 2026,
    country_of_origin: tCountry('NG', 'Nigeria', 1),
    co_production_countries: [],
    original_language: tLang('yor', 'Yoruba', 1),
    dialogue_languages: [tLang('yor', 'Yoruba', 1), tLang('pcm', 'Nigerian Pidgin', 4)],
    genres: [{ id: 1, name: 'Crime Drama', slug: 'crime-drama' }],
    cultural_tags: [{ id: 4, name: 'Lagos', slug: 'lagos' }],
    maturity_rating: null,
    logline: 'A minibus route becomes the spine of five interlocking heists.',
    synopsis:
      'Five strangers share a danfo route across Lagos Island every night for a week, each one running a piece of the same heist without realizing it until the last stop.',
    runtime_minutes: 112,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: '4K',
    aspect_ratio: '2.39:1',
    is_featured: false,
  },
  {
    id: 107,
    uuid: '00000000-0000-0000-0000-000000000107',
    slug: 'the-last-cocoa-house',
    name: 'The Last Cocoa House',
    original_title: 'The Last Cocoa House',
    title_type: 'feature_film',
    production_company: { id: 4, name: 'Gold Coast Films' },
    production_year: 2025,
    country_of_origin: tCountry('GH', 'Ghana', 7),
    co_production_countries: [],
    original_language: tLang('eng', 'English', 10),
    dialogue_languages: [tLang('eng', 'English', 10)],
    genres: [{ id: 3, name: 'Drama', slug: 'drama' }],
    cultural_tags: [],
    maturity_rating: null,
    logline: 'A cocoa warehouse family fights to keep the last independent house standing.',
    synopsis:
      "Three siblings inherit their father's struggling cocoa warehouse in Kumasi and clash over whether to sell to a multinational or hold out as the last independent house on the coast.",
    runtime_minutes: 108,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: '4K',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
  {
    id: 108,
    uuid: '00000000-0000-0000-0000-000000000108',
    slug: 'matatu-blues',
    name: 'Matatu Blues',
    original_title: 'Matatu Blues',
    title_type: 'tv_episode',
    production_company: { id: 2, name: 'Riverwood Ensemble' },
    production_year: 2026,
    country_of_origin: tCountry('KE', 'Kenya', 2),
    co_production_countries: [],
    original_language: tLang('swa', 'Swahili', 5),
    dialogue_languages: [tLang('swa', 'Swahili', 5)],
    genres: [{ id: 4, name: 'Comedy', slug: 'comedy' }],
    cultural_tags: [],
    maturity_rating: null,
    logline: 'A matatu crew turns fare disputes into daily theatre.',
    synopsis:
      'Episode 1 of an anthology comedy following the crew of a wildly decorated Nairobi matatu and the daily theatre of fare disputes, radio wars, and reluctant regulars.',
    runtime_minutes: 42,
    episode_count: 10,
    season_count: 1,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.78:1',
    is_featured: false,
  },
  {
    id: 109,
    uuid: '00000000-0000-0000-0000-000000000109',
    slug: 'the-baobab-keepers',
    name: 'The Baobab Keepers',
    original_title: 'Les Gardiens du Baobab',
    title_type: 'documentary',
    production_company: { id: 3, name: 'Celluloïde Dakar' },
    production_year: 2025,
    country_of_origin: tCountry('SN', 'Senegal', 3),
    co_production_countries: [],
    original_language: tLang('fra', 'French', 9),
    dialogue_languages: [tLang('fra', 'French', 9), tLang('wol', 'Wolof', 6)],
    genres: [{ id: 2, name: 'Documentary', slug: 'documentary' }],
    cultural_tags: [{ id: 5, name: 'Baobab', slug: 'baobab' }],
    maturity_rating: null,
    logline: 'Villagers organize to protect century-old baobabs from a coastal road project.',
    synopsis:
      'A coastal road project threatens a grove of century-old baobabs; the villagers who have tended them for generations organize to protect what they consider living ancestors.',
    runtime_minutes: 84,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
  {
    id: 110,
    uuid: '00000000-0000-0000-0000-000000000110',
    slug: 'cairo-red-line',
    name: 'Cairo Red Line',
    original_title: 'الخط الأحمر',
    title_type: 'feature_film',
    production_company: { id: 5, name: 'Nile Delta Pictures' },
    production_year: 2024,
    country_of_origin: tCountry('EG', 'Egypt', 4),
    co_production_countries: [],
    original_language: tLang('ara', 'Arabic', 8),
    dialogue_languages: [tLang('ara', 'Arabic', 8)],
    genres: [{ id: 5, name: 'Thriller', slug: 'thriller' }],
    cultural_tags: [{ id: 6, name: 'Cairo', slug: 'cairo' }],
    maturity_rating: null,
    logline: 'A metro dispatcher uncovers a smuggling route hidden in the timetable.',
    synopsis:
      'A Cairo metro dispatcher notices a pattern in delayed trains that leads her to a smuggling route hidden inside the official timetable, and to people who want it to stay hidden.',
    runtime_minutes: 121,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: '4K',
    aspect_ratio: '2.39:1',
    is_featured: false,
  },
  {
    id: 111,
    uuid: '00000000-0000-0000-0000-000000000111',
    slug: 'the-nubian-heist',
    name: 'The Nubian Heist',
    original_title: 'سرقة نوبية',
    title_type: 'feature_film',
    production_company: { id: 5, name: 'Nile Delta Pictures' },
    production_year: 2026,
    country_of_origin: tCountry('EG', 'Egypt', 4),
    co_production_countries: [],
    original_language: tLang('ara', 'Arabic', 8),
    dialogue_languages: [tLang('ara', 'Arabic', 8)],
    genres: [{ id: 5, name: 'Thriller', slug: 'thriller' }],
    cultural_tags: [],
    maturity_rating: null,
    logline: 'A retired guide is pulled back to Aswan for one last con.',
    synopsis:
      'A retired antiquities guide is pulled back to Aswan for one last con: recovering a Nubian relic from a private collector before a museum reopening exposes how it was taken.',
    runtime_minutes: 115,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: '4K',
    aspect_ratio: '2.39:1',
    is_featured: false,
  },
  {
    id: 112,
    uuid: '00000000-0000-0000-0000-000000000112',
    slug: 'addis-morning',
    name: 'Addis Morning',
    original_title: 'የአዲስ ጠዋት',
    title_type: 'documentary',
    production_company: { id: 6, name: 'Sheba Films' },
    production_year: 2023,
    country_of_origin: tCountry('ET', 'Ethiopia', 6),
    co_production_countries: [],
    original_language: tLang('amh', 'Amharic', 7),
    dialogue_languages: [tLang('amh', 'Amharic', 7)],
    genres: [{ id: 2, name: 'Documentary', slug: 'documentary' }],
    cultural_tags: [],
    maturity_rating: null,
    logline: 'Addis Ababa\'s buna houses open before dawn, one street at a time.',
    synopsis:
      "Following three coffee-house owners through Addis Ababa's pre-dawn hours, a portrait of the buna ceremony as a small, daily act of community in a fast-changing city.",
    runtime_minutes: 74,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
  {
    id: 113,
    uuid: '00000000-0000-0000-0000-000000000113',
    slug: 'the-tailor-of-kano',
    name: 'The Tailor of Kano',
    original_title: 'Ɗinkin Kano',
    title_type: 'short_film',
    production_company: { id: 7, name: 'Nollywood Craft Guild' },
    production_year: 2026,
    country_of_origin: tCountry('NG', 'Nigeria', 1),
    co_production_countries: [],
    original_language: tLang('hau', 'Hausa', 3),
    dialogue_languages: [tLang('hau', 'Hausa', 3)],
    genres: [{ id: 3, name: 'Drama', slug: 'drama' }],
    cultural_tags: [],
    maturity_rating: null,
    logline: 'An ageing tailor stitches one final wedding gown for a bride he raised.',
    synopsis:
      "An ageing tailor in Kano's textile quarter takes on one final commission: a wedding gown for the daughter of the woman who apprenticed him, forty years ago.",
    runtime_minutes: 18,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
  {
    id: 114,
    uuid: '00000000-0000-0000-0000-000000000114',
    slug: 'joburg-nights',
    name: 'Joburg Nights',
    original_title: 'Joburg Nights',
    title_type: 'feature_film',
    production_company: { id: 8, name: 'Kalahari Sun Studios' },
    production_year: 2025,
    country_of_origin: tCountry('ZA', 'South Africa', 5),
    co_production_countries: [],
    original_language: tLang('eng', 'English', 10),
    dialogue_languages: [tLang('eng', 'English', 10)],
    genres: [{ id: 6, name: 'Romance', slug: 'romance' }],
    cultural_tags: [{ id: 7, name: 'Soweto', slug: 'soweto' }],
    maturity_rating: null,
    logline: 'Two rival food-truck owners keep ending up at the same night markets.',
    synopsis:
      'Two rival food-truck owners keep getting booked into the same Johannesburg night markets, and a season of good-natured sabotage turns into something neither of them planned for.',
    runtime_minutes: 101,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: '4K',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
  {
    id: 115,
    uuid: '00000000-0000-0000-0000-000000000115',
    slug: 'the-matchmaker-of-soweto',
    name: 'The Matchmaker of Soweto',
    original_title: 'The Matchmaker of Soweto',
    title_type: 'tv_episode',
    production_company: { id: 8, name: 'Kalahari Sun Studios' },
    production_year: 2026,
    country_of_origin: tCountry('ZA', 'South Africa', 5),
    co_production_countries: [],
    original_language: tLang('eng', 'English', 10),
    dialogue_languages: [tLang('eng', 'English', 10)],
    genres: [{ id: 6, name: 'Romance', slug: 'romance' }],
    cultural_tags: [{ id: 7, name: 'Soweto', slug: 'soweto' }],
    maturity_rating: null,
    logline: "A retired auntie runs Soweto's most trusted (and nosiest) matchmaking service.",
    synopsis:
      "Episode 1 of a series following a retired schoolteacher whose unofficial matchmaking service is the most trusted, and nosiest, institution on her Soweto street.",
    runtime_minutes: 46,
    episode_count: 6,
    season_count: 1,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.78:1',
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
  // Titles 106-115 (added alongside the catalogue growth above) get the same
  // treatment as the original 5 — otherwise only the newest, most
  // continentally-diverse titles would show "No territory rights listed yet".
  'danfo-diaries': [
    { territory: 'Nigeria', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
    { territory: 'Pan-Africa', rights_type: 'svod', is_exclusive: false, available_from: '2026-08-01', available_until: null, availability: 'available' },
  ],
  'the-last-cocoa-house': [
    { territory: 'West Africa', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
    { territory: 'Worldwide', rights_type: 'svod', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
  ],
  'matatu-blues': [
    { territory: 'Kenya', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
  ],
  'the-baobab-keepers': [
    { territory: 'Francophone Africa', rights_type: 'all', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
    { territory: 'Worldwide', rights_type: 'avod', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
  ],
  'cairo-red-line': [
    { territory: 'North Africa', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
    { territory: 'Worldwide', rights_type: 'svod', is_exclusive: false, available_from: '2026-09-15', available_until: null, availability: 'available' },
  ],
  'the-nubian-heist': [
    { territory: 'Egypt', rights_type: 'theatrical', is_exclusive: true, available_from: null, available_until: null, availability: 'licensed' },
    { territory: 'North Africa', rights_type: 'broadcast', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
  ],
  'addis-morning': [
    { territory: 'East Africa', rights_type: 'broadcast', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
    { territory: 'Worldwide', rights_type: 'avod', is_exclusive: false, available_from: null, available_until: null, availability: 'available' },
  ],
  'the-tailor-of-kano': [
    { territory: 'Nigeria', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
  ],
  'joburg-nights': [
    { territory: 'Southern Africa', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
    { territory: 'Worldwide', rights_type: 'svod', is_exclusive: false, available_from: '2026-08-20', available_until: null, availability: 'available' },
  ],
  'the-matchmaker-of-soweto': [
    { territory: 'South Africa', rights_type: 'broadcast', is_exclusive: true, available_from: null, available_until: null, availability: 'available' },
  ],
};

// Per-title licensing fee range + starting baseline bids for biddingStats()
// in handlers.ts, keyed by slug. Roughly scaled by title type/prestige so
// repeat clicks across the catalogue in a demo don't show identical numbers.
// Any slug not listed here falls back to biddingStats()'s own default.
export const titleFeeRanges: Record<
  string,
  { min: number; max: number; baseline: [number, number] }
> = {
  'lagos-after-dark': { min: 15000, max: 45000, baseline: [22000, 27500] },
  'the-salt-harvesters': { min: 5000, max: 15000, baseline: [7000, 9500] },
  'harmattan-letters': { min: 10000, max: 30000, baseline: [14000, 18000] },
  'riverwood-nights': { min: 4000, max: 12000, baseline: [5500, 7000] },
  'the-griot-of-saint-louis': { min: 5000, max: 14000, baseline: [6500, 8500] },
  'danfo-diaries': { min: 12000, max: 32000, baseline: [16000, 20000] },
  'the-last-cocoa-house': { min: 9000, max: 26000, baseline: [12000, 16000] },
  'matatu-blues': { min: 4000, max: 11000, baseline: [5000, 6800] },
  'the-baobab-keepers': { min: 5500, max: 15000, baseline: [7000, 9000] },
  'cairo-red-line': { min: 14000, max: 38000, baseline: [19000, 24000] },
  'the-nubian-heist': { min: 13000, max: 35000, baseline: [17000, 22000] },
  'addis-morning': { min: 4500, max: 13000, baseline: [6000, 8000] },
  'the-tailor-of-kano': { min: 2000, max: 7000, baseline: [2800, 3800] },
  'joburg-nights': { min: 11000, max: 29000, baseline: [14500, 18500] },
  'the-matchmaker-of-soweto': { min: 4500, max: 12500, baseline: [5800, 7500] },
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
    {
      id: 2,
      title_slug: 'lagos-after-dark',
      title_name: 'Lagos After Dark',
      internal_note: '',
      priority: 'medium',
      added_at: '2026-06-25T09:00:00Z',
    },
    {
      id: 5,
      title_slug: 'danfo-diaries',
      title_name: 'Danfo Diaries',
      internal_note: 'Follow-up to Lagos After Dark — check territory overlap.',
      priority: 'high',
      added_at: '2026-06-28T09:00:00Z',
    },
    {
      id: 6,
      title_slug: 'the-baobab-keepers',
      title_name: 'The Baobab Keepers',
      internal_note: '',
      priority: 'medium',
      added_at: '2026-06-29T09:00:00Z',
    },
    {
      id: 7,
      title_slug: 'joburg-nights',
      title_name: 'Joburg Nights',
      internal_note: '',
      priority: 'low',
      added_at: '2026-06-30T09:00:00Z',
    },
  ],
  // Synthetic broadcaster users whose watchlists feed the seller-studio demand
  // signal (watched_titles + the Territory interest panel). These exist only to
  // give the production dashboard realistic watcher counts in mock mode.
  4: [
    {
      id: 3,
      title_slug: 'lagos-after-dark',
      title_name: 'Lagos After Dark',
      internal_note: '',
      priority: 'high',
      added_at: '2026-06-26T09:00:00Z',
    },
    {
      id: 4,
      title_slug: 'harmattan-letters',
      title_name: 'Harmattan Letters',
      internal_note: '',
      priority: 'medium',
      added_at: '2026-06-27T09:00:00Z',
    },
  ],
  5: [
    {
      id: 5,
      title_slug: 'lagos-after-dark',
      title_name: 'Lagos After Dark',
      internal_note: '',
      priority: 'low',
      added_at: '2026-06-28T09:00:00Z',
    },
  ],
};

let nextWatchlistId = 100;
export function allocateWatchlistId(): number {
  return nextWatchlistId++;
}

// Screener requests, keyed by user id. Covers all four statuses the
// ScreenerRequestsPage groups by (pending / approved+accessed / expired /
// declined) so none of its section headers silently disappear.
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
    {
      uuid: '00000000-0000-0000-0000-0000000000a2',
      title_slug: 'lagos-after-dark',
      title_name: 'Lagos After Dark',
      purpose: 'acquisition_evaluation',
      status: 'approved',
      requested_at: '2026-06-10T09:00:00Z',
      access_expires_at: '2026-08-10T09:00:00Z',
    },
    {
      uuid: '00000000-0000-0000-0000-0000000000a3',
      title_slug: 'danfo-diaries',
      title_name: 'Danfo Diaries',
      purpose: 'programming_review',
      status: 'approved',
      requested_at: '2026-06-18T09:00:00Z',
      access_expires_at: '2026-08-18T09:00:00Z',
    },
    {
      uuid: '00000000-0000-0000-0000-0000000000a4',
      title_slug: 'the-baobab-keepers',
      title_name: 'The Baobab Keepers',
      purpose: 'acquisition_evaluation',
      status: 'expired',
      requested_at: '2026-04-02T09:00:00Z',
      access_expires_at: '2026-05-02T09:00:00Z',
    },
    {
      uuid: '00000000-0000-0000-0000-0000000000a5',
      title_slug: 'cairo-red-line',
      title_name: 'Cairo Red Line',
      purpose: 'co_production_interest',
      status: 'declined',
      requested_at: '2026-06-01T09:00:00Z',
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
  // A title the Didactik team kicked back for changes — drives the changes_requested
  // banner and the Needs Attention surface on the dashboard.
  'eko-rising': { status: 'changes_requested', metadata_score: 54, licensing_intent: 'svod', screener_request_count: 0 },
  // A brand-new draft the producer has only just started — low score, no rights.
  'silent-quarter': { status: 'draft', metadata_score: 22, licensing_intent: '', screener_request_count: 0 },
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

// Two more in-pipeline EbonyLife titles so the seller studio surfaces (Needs
// Attention, the changes_requested banner, the draft pipeline state) all have
// real rows to render.
const ekoRisingTitle: Title = {
  id: 107,
  uuid: '00000000-0000-0000-0000-000000000107',
  slug: 'eko-rising',
  name: 'Èkó Rising',
  original_title: 'Èkó Rising',
  title_type: 'feature_film',
  production_company: { id: 1, name: 'EbonyLife Studios' },
  production_year: 2026,
  country_of_origin: { id: 1, code: 'NG', name: 'Nigeria' },
  co_production_countries: [],
  original_language: { id: 1, code: 'yor', english_name: 'Yoruba' },
  dialogue_languages: [{ id: 1, code: 'yor', english_name: 'Yoruba' }],
  genres: [{ id: 3, name: 'Drama', slug: 'drama' }],
  cultural_tags: [{ id: 1, name: 'Lagos', slug: 'lagos' }],
  maturity_rating: null,
  logline: 'A young architect fights to save a Lagos neighbourhood from demolition.',
  synopsis: '',
  runtime_minutes: 109,
  episode_count: null,
  season_count: null,
  awards: [],
  festival_selections: [],
  resolution: 'HD',
  aspect_ratio: '1.85:1',
  is_featured: false,
};

const silentQuarterTitle: Title = {
  id: 108,
  uuid: '00000000-0000-0000-0000-000000000108',
  slug: 'silent-quarter',
  name: 'The Silent Quarter',
  original_title: 'The Silent Quarter',
  title_type: 'short_film',
  production_company: { id: 1, name: 'EbonyLife Studios' },
  production_year: 2026,
  country_of_origin: { id: 1, code: 'NG', name: 'Nigeria' },
  co_production_countries: [],
  original_language: { id: 10, code: 'eng', english_name: 'English' },
  dialogue_languages: [{ id: 10, code: 'eng', english_name: 'English' }],
  genres: [],
  cultural_tags: [],
  maturity_rating: null,
  logline: 'A wordless short set across one curfew night in Surulere.',
  synopsis: '',
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
export const productionTitlePool: Title[] = [
  ...titles,
  asoRockTitle,
  ekoRisingTitle,
  silentQuarterTitle,
];

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
  'eko-rising': [
    { key: 'synopsis', label: 'Synopsis', points: 20, required: true, completed: false },
    { key: 'logline', label: 'Logline', points: 10, required: true, completed: true },
    { key: 'genres', label: 'Genres', points: 15, required: true, completed: true },
    { key: 'maturity_rating', label: 'Maturity rating', points: 10, required: true, completed: false },
    { key: 'key_art', label: 'Key art', points: 15, required: false, completed: true },
  ],
  'silent-quarter': [
    { key: 'synopsis', label: 'Synopsis', points: 20, required: true, completed: false },
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
