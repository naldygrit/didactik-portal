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

// A broadcaster interest chip used to personalise recommendations (Phase 6).
export interface InterestOption {
  key: string;
  label: string;
}

// ── Screener model (broadcaster portal) ──────────────────────────────────────
// The broadcaster portal browses Titles (slug-based, public projection),
// inspects per-territory rights availability, requests watermarked screeners
// (admin-moderated), and keeps a watchlist. These types mirror the live
// /api/v1/broadcaster/* contracts and replace the legacy bid/deal flow.

// A minimal {id,name} reference used inside Title for the production company.
export interface TitleBrief {
  id: number;
  name: string;
}

// A reference {id,code,name} used for countries on a Title (distinct from the
// admin Country which omits no fields — this is the same shape, kept explicit
// so the broadcaster projection is self-documenting).
export interface TitleCountry {
  id: number;
  code: string;
  name: string;
}

// A reference {id,code,english_name} used for languages on a Title.
export interface TitleLanguage {
  id: number;
  code: string;
  english_name: string;
}

export interface TitleGenre {
  id: number;
  name: string;
  slug: string;
}

export interface TitleCulturalTag {
  id: number;
  name: string;
  slug: string;
}

export interface TitleMaturityRating {
  id: number;
  code: string;
  rating_system: string;
}

// The public Title projection the broadcaster portal browses. Active titles
// only; no status / metadata_score / licensing_intent (those are admin-only).
export interface Title {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  original_title: string;
  title_type: string;
  production_company: TitleBrief;
  production_year: number | null;
  country_of_origin: TitleCountry | null;
  co_production_countries: TitleCountry[];
  original_language: TitleLanguage | null;
  dialogue_languages: TitleLanguage[];
  genres: TitleGenre[];
  cultural_tags: TitleCulturalTag[];
  maturity_rating: TitleMaturityRating | null;
  logline: string;
  synopsis: string;
  runtime_minutes: number | null;
  episode_count: number | null;
  season_count: number | null;
  awards: unknown[];
  festival_selections: unknown[];
  resolution: string;
  aspect_ratio: string;
  is_featured: boolean;
}

export type RightsType = 'broadcast' | 'svod' | 'avod' | 'tvod' | 'theatrical' | 'all';

// One territory's rights window for a Title, from the broadcaster's perspective.
export interface RightsRow {
  territory: string;
  rights_type: RightsType;
  is_exclusive: boolean;
  available_from: string | null;
  available_until: string | null;
  availability: 'available' | 'licensed';
}

export type WatchlistPriority = '' | 'high' | 'medium' | 'low';

export interface WatchlistEntry {
  id: number;
  title_slug: string;
  title_name: string;
  internal_note: string;
  priority: WatchlistPriority;
  added_at: string;
}

export type ScreenerStatus = 'pending' | 'approved' | 'declined' | 'expired' | 'accessed';

export type ScreenerPurpose =
  | 'acquisition_evaluation'
  | 'programming_review'
  | 'co_production_interest'
  | 'archival_research';

export interface ScreenerSummary {
  uuid: string;
  title_slug: string;
  title_name: string;
  purpose: string;
  status: ScreenerStatus;
  requested_at: string;
  access_expires_at: string | null;
}

// ── Admin screener/Title moderation model ────────────────────────────────────
// The admin portal moderates the catalogue: it triages Title submissions through
// the editorial lifecycle and approves/declines broadcaster screener requests.
// These types mirror the live /api/v1/admin/* contracts and replace the legacy
// deals-desk / GMV / bid model the admin console was built against.

// The eight editorial states a Title moves through. `changes_requested` creates
// an AdminNote whose text is shown to the producer; everything else is internal.
export type TitleStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'archived';

// The admin dashboard aggregate. The admin's primary work surface is the
// triage_queue — submissions awaiting an editorial decision.
export interface AdminDashboard {
  content: {
    total_titles: number;
    by_status: Record<string, number>;
    active: number;
  };
  screeners: {
    by_status: Record<string, number>;
    pending_queue: number;
  };
  triage_queue: {
    slug: string;
    name: string;
    status: string;
    production_company: string;
    metadata_score: number;
    updated_at: string;
  }[];
  organisations: {
    production_companies: number;
    broadcasters: number;
    users_by_role: Record<string, number>;
  };
  assets: {
    total: number;
    unvalidated: number;
  };
  storage: {
    total_bytes: number;
  };
  featured_slots: number;
  // Per-territory rights coverage for the Overview bars. pct is 0-100.
  rights_coverage: { territory: string; titles: number; pct: number }[];
}

// ── Admin organisations (production companies + broadcasters tables) ──────────
// The admin sees every registered organisation, with activity counts the public
// projections withhold. Mirrors the live /api/v1/admin/organisations/ contract.
export interface AdminProductionCompanyRow {
  id: number;
  name: string;
  country: string;
  verification_status: string;
  title_count: number;
  active_title_count: number;
  screener_request_count: number;
  last_activity: string | null;
  created_at: string;
}

export interface AdminBroadcasterRow {
  id: number;
  name: string;
  country: string;
  category: string;
  verification_status: string;
  screener_request_count: number;
  watchlist_count: number;
  last_activity: string | null;
  created_at: string;
}

export interface AdminOrganisations {
  production_companies: AdminProductionCompanyRow[];
  broadcasters: AdminBroadcasterRow[];
}

// A screener request as the admin sees it — unlike the broadcaster/production
// projections, the admin sees the requesting broadcaster's identity.
export interface AdminScreenerRequest {
  uuid: string;
  title_name: string;
  broadcaster: { id: number; name: string };
  purpose: string;
  territory_interest: string[];
  message_to_producer: string;
  status: ScreenerStatus;
  requested_at: string;
  reviewed_at: string | null;
  access_expires_at: string | null;
  access_count: number;
}

// The full admin Title projection — the moderation surface, with the editorial
// fields (status, metadata_score, internal notes, licensing intent) the public
// broadcaster Title omits.
export interface AdminTitle {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  original_title: string;
  title_type: string;
  production_year: number | null;
  logline: string;
  synopsis: string;
  runtime_minutes: number | null;
  episode_count: number | null;
  season_count: number | null;
  awards: unknown[];
  festival_selections: unknown[];
  resolution: string;
  aspect_ratio: string;
  licensing_intent: string;
  is_featured: boolean;
  status: TitleStatus;
  metadata_score: number;
  status_changed_at: string | null;
  admin_notes_internal: string;
  created_at: string;
  updated_at: string;
  production_company: TitleBrief | null;
  country_of_origin: TitleCountry | null;
  original_language: TitleLanguage | null;
  maturity_rating: TitleMaturityRating | null;
  submitted_by: string | null;
  status_changed_by: string | null;
  co_production_countries: TitleCountry[];
  dialogue_languages: TitleLanguage[];
  genres: TitleGenre[];
  cultural_tags: TitleCulturalTag[];
}

// ── Production (seller studio) screener/Title model ──────────────────────────
// The production portal manages the company's own catalogue of licensable
// Titles: catalogue health, metadata completeness, incoming (territory-only)
// screener interest, and the rights windows the company offers. These types
// mirror the live /api/v1/production/* contracts and replace the legacy
// deal/payout/bid model the studio surfaces were built against.

// The production dashboard aggregate — the studio's at-a-glance health.
export interface ProductionDashboard {
  catalogue_health: {
    total_titles: number;
    by_status: Record<string, number>;
    needs_attention: number;
    average_metadata_score: number;
  };
  screener_activity: {
    by_status: Record<string, number>;
    total: number;
  };
  watched_titles: { slug: string; name: string; watchers: number }[];
}

// The production Title projection — the company's own titles, with the editorial
// fields (status, metadata_score, screener counts) the public broadcaster Title
// omits. Extends the shared Title shape; backend scopes to the authed company.
export interface ProductionTitle extends Title {
  status: TitleStatus;
  metadata_score: number;
  licensing_intent: string;
  screener_request_count: number;
  created_at: string;
  updated_at: string;
}

// One rule in a Title's metadata completeness breakdown.
export interface CompletenessRule {
  key: string;
  label: string;
  points: number;
  required: boolean;
  completed: boolean;
}

// A Title's metadata completeness — the score, whether it can be activated, the
// outstanding required fields, and the full checklist.
export interface Completeness {
  score: number;
  can_activate: boolean;
  missing_required: string[];
  breakdown: CompletenessRule[];
}

// A screener request as the producer sees it. Deliberately TERRITORY-ONLY: the
// requesting broadcaster's identity is withheld until a deal is negotiated.
export interface ProductionScreenerRequest {
  uuid: string;
  purpose: string;
  territory_interest: string[];
  status: ScreenerStatus;
  requested_at: string;
}

// A rights window the production company offers on one of its Titles. The
// producer manages these (create/edit/delete); broadcasters see the read-only
// RightsRow projection.
export interface ProductionRightsWindow {
  id: number;
  title: string;
  territory: string;
  rights_type: RightsType;
  is_exclusive: boolean;
  available_from: string | null;
  available_until: string | null;
  availability: 'available' | 'licensed';
}

// A territory option for the rights-window territory dropdown.
export interface TerritoryOption {
  id: number;
  name: string;
  slug: string;
  territory_type: string;
}
