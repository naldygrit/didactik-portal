export interface JwtPayload {
  user_id: number;
  email: string;
  role: string | null;
  exp: number;
}

export type AssetStatus =
  | 'pending_admin_approval'
  | 'pending_upload'
  | 'uploaded'
  | 'under_review'
  | 'ready_to_list'
  | 'withdrawn'
  | 'rejected';

export type AssetType =
  | 'feature_film'
  | 'short_film'
  | 'documentary'
  | 'tv_episode'
  | 'music_video'
  | 'broadcast_recording'
  | 'interview'
  | 'other';

export interface Language {
  id: number;
  code: string;
  english_name: string;
}

export interface Country {
  id: number;
  code: string;
  name: string;
}

export interface ProductionCompanyBrief {
  id: number;
  name: string;
}

export interface ProductionCompanyDetail {
  id: number;
  name: string;
  country: Country | null;
  verification_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyTag {
  id: number;
  term: string;
  english_gloss: string;
  term_type: string;
  language_code: string;
  start_timecode_seconds: number | null;
  end_timecode_seconds: number | null;
  notes: string;
}

export interface AssetListItem {
  id: number;
  title: string;
  original_title: string;
  asset_type: AssetType;
  status: AssetStatus;
  production_year: number | null;
  primary_language: Language | null;
  production_country: Country | null;
  production_company: ProductionCompanyBrief | null;
  storage_backend: string;
  created_at: string;
  taxonomy_count: number;
}

export interface AssetDetail extends AssetListItem {
  description: string;
  approved_at: string | null;
  updated_at: string;
  rejection_reason: string;
  taxonomy_tags: TaxonomyTag[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SearchAsset extends AssetListItem {
  matched_fields: string[];
  highlight: string;
}

export interface UploadInitiatedResponse {
  asset_id: number;
  upload_url: string | null;
  expires_in_seconds: number | null;
  storage_key: string | null;
  status: AssetStatus;
  message: string;
}

export interface ConfirmUploadResponse {
  asset_id: number;
  status: AssetStatus;
  message: string;
}

export interface MeProfile {
  role: string;
  production_company: ProductionCompanyBrief | null;
  broadcaster: { id: number; name: string } | null;
}

export interface MeResponse {
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  profile: MeProfile | null;
}

// The competitive state of one title's bidding, scoped to the current
// broadcaster (Phase 3).
export interface BidBoard {
  license_floor: number;
  license_ceiling: number;
  currency: string;
  bid_count: number;
  highest_amount: number | null;
  your_bid: { id: number; amount: number; created_at: string; is_top: boolean } | null;
}

// A licensed deal struck from a winning bid (Phase 4).
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

// One row of the admin deals desk: a title with bidding activity awaiting
// acceptance, plus its deal once struck.
export interface DealDeskItem {
  asset_id: number;
  title: string;
  production_company: string | null;
  bid_count: number;
  top_amount: number | null;
  top_broadcaster: string | null;
  currency: string;
  deal: Deal | null;
}

// A production company's payout split account (Phase 5).
export interface PayoutAccount {
  id: number;
  company_id: number;
  label: string;
  account_number: string;
  percentage: number;
}

// A broadcaster interest chip used to personalise recommendations (Phase 6).
export interface InterestOption {
  key: string;
  label: string;
}

// Per-title market interest for the production Analytics view.
export interface ProductionTitleStat {
  asset_id: number;
  title: string;
  status: AssetStatus;
  bid_count: number;
  top_amount: number | null;
  licensed_amount: number | null;
  currency: string;
}
