// In-memory mock database for the portal. Seeded with continental African
// audiovisual content (Nollywood, Riverwood, Francophone, etc.) so every portal
// has real-feeling data to render. Mutations (new submissions, withdrawals,
// bids, deals) happen against these arrays at runtime and persist until reload.
import type {
  AssetDetail,
  Country,
  Language,
  MeResponse,
  TaxonomyTag,
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

// ── Bidding (Phase 3) ───────────────────────────────────────────────────────
// The producer's licensing range per title (what they have pre-authorised
// Didactik to accept), plus a seeded bid book so the competitive signal shows
// real rivalry from the first view.
export const LICENSE_CURRENCY = 'USD';

export const licenseRanges: Record<number, { floor: number; ceiling: number }> = {
  101: { floor: 8000, ceiling: 25000 }, // Lagos After Dark
  102: { floor: 3000, ceiling: 9000 }, // The Salt Harvesters
  103: { floor: 10000, ceiling: 30000 }, // Harmattan Letters
  104: { floor: 2000, ceiling: 7000 }, // Riverwood Nights
  105: { floor: 4000, ceiling: 12000 }, // The Griot of Saint-Louis
};

export interface Bid {
  id: number;
  asset_id: number;
  broadcaster_id: number;
  broadcaster_name: string;
  amount: number;
  created_at: string;
}

export const bids: Bid[] = [
  { id: 1, asset_id: 101, broadcaster_id: 2, broadcaster_name: 'Showmax', amount: 12000, created_at: '2026-06-20T10:00:00Z' },
  { id: 2, asset_id: 101, broadcaster_id: 3, broadcaster_name: 'StarTimes Media', amount: 14500, created_at: '2026-06-24T09:00:00Z' },
  { id: 3, asset_id: 102, broadcaster_id: 2, broadcaster_name: 'Showmax', amount: 5000, created_at: '2026-06-22T11:00:00Z' },
];

let nextBidId = 100;
export function allocateBidId(): number {
  return nextBidId++;
}

// ── Deals (Phase 4) ─────────────────────────────────────────────────────────
// A licensed deal: the admin accepts the top bid on the producer's behalf
// (pre-authorised) and records the licence terms.
export type LicenseType = 'exclusive' | 'non_exclusive';

export interface Deal {
  id: number;
  asset_id: number;
  asset_title: string;
  broadcaster_id: number;
  broadcaster_name: string;
  amount: number;
  currency: string;
  license_type: LicenseType;
  created_at: string;
}

// One deal seeded so the producer's earnings and the broadcaster's licences are
// populated on first view; Lagos After Dark is left open for the live
// bid-and-accept demo.
export const deals: Deal[] = [
  {
    id: 490,
    asset_id: 103, // Harmattan Letters (EbonyLife Studios)
    asset_title: 'Harmattan Letters',
    broadcaster_id: 1,
    broadcaster_name: 'Canal+ International',
    amount: 18000,
    currency: LICENSE_CURRENCY,
    license_type: 'non_exclusive',
    created_at: '2026-06-15T10:00:00Z',
  },
];

let nextDealId = 500;
export function allocateDealId(): number {
  return nextDealId++;
}

// ── Payouts (Phase 5) ───────────────────────────────────────────────────────
// A production company's payout split: where licence revenue is sent and in
// what proportion.
export interface PayoutAccount {
  id: number;
  company_id: number;
  label: string;
  account_number: string;
  percentage: number;
}

export const payoutAccounts: PayoutAccount[] = [
  { id: 1, company_id: 1, label: 'EbonyLife Studios — GTBank', account_number: '0123456789', percentage: 80 },
  { id: 2, company_id: 1, label: 'Director escrow — Access Bank', account_number: '0987654321', percentage: 20 },
];

let nextPayoutAccountId = 10;
export function allocatePayoutAccountId(): number {
  return nextPayoutAccountId++;
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
