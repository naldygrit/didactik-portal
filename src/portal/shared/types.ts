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
