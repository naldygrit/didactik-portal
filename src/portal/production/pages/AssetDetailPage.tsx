import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../../shared/apiHelpers';
import { TitleStatusBadge } from '../components/TitleStatusBadge';
import { ScoreRing } from '../components/ScoreRing';
import { PipelineTracker } from '../components/PipelineTracker';
import type {
  Completeness,
  CompletenessRule,
  Credit,
  ProductionRightsWindow,
  ProductionScreenerRequest,
  ProductionTitle,
  RightsType,
  TerritoryOption,
} from '../../shared/types';

const BRAND = '#5343fd';
const RIGHTS_TYPES: RightsType[] = ['broadcast', 'svod', 'avod', 'tvod', 'theatrical', 'all'];

const PURPOSE_LABELS: Record<string, string> = {
  acquisition_evaluation: 'Acquisition evaluation',
  programming_review: 'Programming review',
  co_production_interest: 'Co-production interest',
  archival_research: 'Archival research',
};
function purposeLabel(p: string): string {
  return PURPOSE_LABELS[p] ?? p.replace(/_/g, ' ');
}
function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

type PanelKey = 'metadata' | 'credits' | 'assets' | 'rights' | 'activity';
const PANELS: { key: PanelKey; label: string }[] = [
  { key: 'metadata', label: 'Metadata' },
  { key: 'credits', label: 'Credits' },
  { key: 'assets', label: 'Assets' },
  { key: 'rights', label: 'Rights' },
  { key: 'activity', label: 'Activity' },
];

export function ProductionAssetDetailPage() {
  // The route param is named `id` for historical reasons but carries the slug.
  const { id: slug } = useParams<{ id: string }>();
  const [panel, setPanel] = useState<PanelKey>('metadata');
  const qc = useQueryClient();

  const { data: title, isLoading, isError } = useQuery<ProductionTitle>({
    queryKey: ['production-title', slug],
    queryFn: () =>
      apiGet<ProductionTitle[]>('/api/v1/production/titles/').then((titles) => {
        const found = titles.find((t) => t.slug === slug);
        if (!found) throw new Error('Title not found');
        return found;
      }),
    enabled: !!slug,
  });

  const { data: completeness } = useQuery<Completeness>({
    queryKey: ['production-title-completeness', slug],
    queryFn: () => apiGet<Completeness>(`/api/v1/production/titles/${slug}/completeness/`),
    enabled: !!slug,
  });

  const { data: screenerRequests } = useQuery<ProductionScreenerRequest[]>({
    queryKey: ['production-title-screeners', slug],
    queryFn: () =>
      apiGet<ProductionScreenerRequest[]>(`/api/v1/production/titles/${slug}/screener-requests/`),
    enabled: !!slug,
  });

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (isError || !title) {
    return (
      <div>
        <Link to="/portal/production/assets" className="text-sm" style={{ color: BRAND }}>
          ← Back to catalogue
        </Link>
        <p className="mt-4 text-sm text-red-600">Title not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/portal/production/assets"
        className="mb-3 inline-flex items-center text-sm font-medium"
        style={{ color: BRAND }}
      >
        ← Back to catalogue
      </Link>

      {/* Admin change-request banner. The production projection does not yet carry
          the structured change-note text, so when a title is in changes_requested
          we show an honest prompt that names the unmet required fields from the
          completeness breakdown rather than inventing a reviewer message. */}
      {title.status === 'changes_requested' && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <span aria-hidden className="text-base text-amber-700">
            ⚠
          </span>
          <div>
            <div className="text-sm font-semibold text-amber-900">
              Changes requested by the Didactik team
            </div>
            <div className="mt-0.5 text-xs text-amber-800">
              {completeness && completeness.missing_required.length > 0
                ? `Outstanding required fields: ${completeness.missing_required.join(', ')}.`
                : 'Review the metadata and assets below, then resubmit.'}
            </div>
          </div>
        </div>
      )}

      {/* Title header */}
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title.name}</h1>
          {title.original_title && title.original_title !== title.name && (
            <p className="mt-0.5 text-sm text-gray-400">{title.original_title}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <TitleStatusBadge status={title.status} />
            <span className="text-xs text-gray-400">
              {titleCase(title.title_type)}
              {title.production_year ? ` · ${title.production_year}` : ''}
            </span>
            <span className="text-gray-300">·</span>
            <ScoreRing score={title.metadata_score} size={22} />
            <span className="text-xs text-gray-400">metadata score</span>
          </div>
        </div>
      </div>

      <PipelineTracker status={title.status} />

      {/* Panel tabs */}
      <div className="mb-5 flex gap-0 border-b border-gray-200">
        {PANELS.map((p) => {
          const isActive = panel === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setPanel(p.key)}
              className="-mb-px border-b-2 px-4 py-2 text-sm transition-colors"
              style={{
                borderColor: isActive ? BRAND : 'transparent',
                color: isActive ? BRAND : '#6b7280',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {panel === 'metadata' && <MetadataPanel title={title} completeness={completeness} />}
      {panel === 'credits' && <CreditsPanel credits={title.credits ?? []} />}
      {panel === 'assets' && <AssetsPanel />}
      {panel === 'rights' && <RightsWindowsPanel titleSlug={title.slug} qc={qc} />}
      {panel === 'activity' && <ActivityPanel requests={screenerRequests} status={title.status} />}
    </div>
  );
}

// Comma-joined subtitle or dub languages from the Title's language tracks.
function languageList(title: ProductionTitle, type: 'subtitle' | 'dub'): string | null {
  const names = (title.language_tracks ?? [])
    .filter((t) => t.track_type === type)
    .map((t) => t.language.english_name);
  return names.length > 0 ? names.join(', ') : null;
}

// ── Metadata panel ───────────────────────────────────────────────────────────
// Wired to the real title fields, with the completeness breakdown driving the
// required-field cues (which fields earn points and whether they are complete).
function MetadataPanel({
  title,
  completeness,
}: {
  title: ProductionTitle;
  completeness: Completeness | undefined;
}) {
  const fields: { label: string; value: string | null }[] = [
    { label: 'Title', value: title.name },
    { label: 'Type', value: titleCase(title.title_type) },
    { label: 'Production year', value: title.production_year ? String(title.production_year) : null },
    { label: 'Country of origin', value: title.country_of_origin?.name ?? null },
    { label: 'Original language', value: title.original_language?.english_name ?? null },
    { label: 'Subtitles', value: languageList(title, 'subtitle') },
    { label: 'Dubs', value: languageList(title, 'dub') },
    { label: 'Runtime', value: title.runtime_minutes ? `${title.runtime_minutes} mins` : null },
    { label: 'Genres', value: title.genres.map((g) => g.name).join(', ') || null },
    { label: 'Cultural tags', value: title.cultural_tags.map((c) => c.name).join(', ') || null },
    { label: 'Maturity rating', value: title.maturity_rating?.code ?? null },
    { label: 'Resolution', value: title.resolution || null },
    { label: 'Aspect ratio', value: title.aspect_ratio || null },
    { label: 'Logline', value: title.logline || null },
    { label: 'Synopsis', value: title.synopsis || null },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Title metadata</h2>
        {completeness && (
          <span className="text-xs tabular-nums text-gray-500">
            <span className="font-semibold text-gray-900">{completeness.score}</span> / 100
          </span>
        )}
      </div>

      {completeness && completeness.missing_required.length > 0 && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Required to activate: {completeness.missing_required.join(', ')}.
        </p>
      )}

      <div className="divide-y divide-gray-100">
        {fields.map((f) => (
          <div key={f.label} className="flex gap-5 py-2.5">
            <div className="w-40 shrink-0 text-sm text-gray-500">{f.label}</div>
            <div
              className="flex-1 text-sm"
              style={{ color: f.value ? '#111827' : '#9ca3af', fontStyle: f.value ? 'normal' : 'italic' }}
            >
              {f.value || 'Not set'}
            </div>
          </div>
        ))}
      </div>

      {completeness && <CompletenessChecklist rules={completeness.breakdown} />}
    </div>
  );
}

function CompletenessChecklist({ rules }: { rules: CompletenessRule[] }) {
  if (rules.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        Completeness checklist
      </h3>
      <ul className="space-y-1.5">
        {rules.map((rule) => (
          <li key={rule.key} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                rule.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {rule.completed ? '✓' : ''}
            </span>
            <span className={rule.completed ? 'text-gray-700' : 'text-gray-500'}>
              {rule.label}
              {rule.required && <span className="ml-1 text-xs text-amber-600">required</span>}
            </span>
            <span className="ml-auto text-xs tabular-nums text-gray-400">{rule.points} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Credits panel ────────────────────────────────────────────────────────────
// Wired to the real Credit records (PBCore contributorRole), grouped by craft.
// "Add credit" stays disabled until a production write endpoint exists.
const CREDIT_GROUP_ORDER = ['Direction', 'Cast', 'Producing', 'Crew'];

function creditGroup(role: string): string {
  if (role === 'director') return 'Direction';
  if (role.includes('cast')) return 'Cast';
  if (role === 'producer') return 'Producing';
  return 'Crew';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function CreditsPanel({ credits }: { credits: Credit[] }) {
  const grouped = new Map<string, Credit[]>();
  for (const c of [...credits].sort((a, b) => a.order - b.order)) {
    const g = creditGroup(c.role);
    grouped.set(g, [...(grouped.get(g) ?? []), c]);
  }
  const groups = CREDIT_GROUP_ORDER.filter((g) => grouped.has(g)).map(
    (g) => [g, grouped.get(g)!] as const,
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Production credits</h2>
        <button
          type="button"
          disabled
          title="Editing credits is coming soon"
          className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-400"
        >
          Add credit
        </button>
      </div>

      {credits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
          <p className="text-sm font-medium text-gray-700">No credits yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Cast, direction, and producing credits will appear here as they are added.
          </p>
        </div>
      ) : (
        groups.map(([group, list]) => (
          <div key={group} className="mb-5">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              {group}
            </div>
            <div className="divide-y divide-gray-100">
              {list.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900">{c.name}</span>
                      {c.is_primary && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: '#ede9fe', color: BRAND }}
                        >
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {c.role_display}
                      {c.character ? `, ${c.character}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Assets panel (honest stub) ───────────────────────────────────────────────
// Per-asset validation status (master, screener, poster, subtitles) is not on
// the production projection yet, so we show an honest placeholder rather than
// invented file rows with fabricated validation states.
function AssetsPanel() {
  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 text-sm font-bold text-gray-900">Assets</h2>
      <p className="mb-4 text-sm text-gray-400">
        Master file and poster are required. Additional assets improve broadcaster appeal.
      </p>
      <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
        <p className="text-sm font-medium text-gray-700">Asset details aren't available here yet.</p>
        <p className="mt-1 text-sm text-gray-500">
          Per-asset upload and validation status will appear here once the catalogue
          exposes them. Uploads are handled through the submission flow for now.
        </p>
      </div>
    </div>
  );
}

// ── Activity panel ───────────────────────────────────────────────────────────
// The production projection does not return a structured event log. We surface
// the real signal we DO hold, incoming screener requests, as the activity feed,
// and otherwise show an honest empty state. No fabricated event history.
function ActivityPanel({
  requests,
  status,
}: {
  requests: ProductionScreenerRequest[] | undefined;
  status: ProductionTitle['status'];
}) {
  if (!requests) return <p className="text-sm text-gray-500">Loading…</p>;
  if (requests.length === 0) {
    return (
      <div className="max-w-xl">
        <h2 className="mb-2 text-sm font-bold text-gray-900">Activity</h2>
        <p className="py-2 text-sm text-gray-500">
          No activity yet. Screener requests and status changes will appear here as
          your title moves through the archive.
          {status === 'active' ? '' : ' This title is not active yet.'}
        </p>
      </div>
    );
  }
  const sorted = [...requests].sort((a, b) => b.requested_at.localeCompare(a.requested_at));
  return (
    <div className="max-w-xl">
      <h2 className="mb-4 text-sm font-bold text-gray-900">Activity</h2>
      <ul>
        {sorted.map((r, i) => (
          <li key={r.uuid} className="relative flex gap-3 pb-4">
            {i < sorted.length - 1 && (
              <span aria-hidden className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 bg-gray-100" />
            )}
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs"
              style={{ color: BRAND }}
            >
              ●
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-gray-900">
                Screener {r.status} for{' '}
                {r.territory_interest.length > 0 ? r.territory_interest.join(', ') : 'an unspecified territory'}
              </div>
              <div className="mt-0.5 text-xs text-gray-400">
                {new Date(r.requested_at).toLocaleDateString()} · {purposeLabel(r.purpose)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Rights windows panel (wired CRUD, preserved behaviour) ───────────────────
function RightsWindowsPanel({
  titleSlug,
  qc,
}: {
  titleSlug: string;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const blankForm = {
    territory: '',
    rights_type: 'broadcast' as RightsType,
    is_exclusive: false,
    available_from: '',
    available_until: '',
  };
  const [form, setForm] = useState(blankForm);

  const { data: windows } = useQuery<ProductionRightsWindow[]>({
    queryKey: ['production-rights-windows', titleSlug],
    queryFn: () =>
      apiGet<ProductionRightsWindow[]>(
        `/api/v1/production/rights-windows/?title=${encodeURIComponent(titleSlug)}`,
      ),
  });

  const { data: territories } = useQuery<TerritoryOption[]>({
    queryKey: ['territories'],
    queryFn: () => apiGet<TerritoryOption[]>('/api/v1/territories/'),
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['production-rights-windows', titleSlug] });

  const create = useMutation({
    mutationFn: () =>
      apiPost('/api/v1/production/rights-windows/', {
        title_slug: titleSlug,
        territory: Number(form.territory),
        rights_type: form.rights_type,
        is_exclusive: form.is_exclusive,
        available_from: form.available_from || null,
        available_until: form.available_until || null,
      }),
    onSuccess: () => {
      invalidate();
      setForm(blankForm);
    },
  });

  const remove = useMutation({
    mutationFn: (windowId: number) => apiDelete(`/api/v1/production/rights-windows/${windowId}/`),
    onSuccess: invalidate,
  });

  const titleWindows = windows ?? [];
  const canCreate = form.territory !== '';

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Rights and territory windows</h2>
          <p className="text-xs text-gray-400">
            Define where and how broadcasters can license this title.
          </p>
        </div>
      </div>

      {titleWindows.length > 0 ? (
        <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-3.5 py-2.5 font-semibold">Territory</th>
                <th className="px-3.5 py-2.5 font-semibold">Type</th>
                <th className="px-3.5 py-2.5 font-semibold">Exclusive</th>
                <th className="px-3.5 py-2.5 font-semibold">From</th>
                <th className="px-3.5 py-2.5 font-semibold">Status</th>
                <th className="px-3.5 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {titleWindows.map((w) => (
                <tr key={w.id}>
                  <td className="px-3.5 py-3 font-semibold text-gray-900">{w.territory}</td>
                  <td className="px-3.5 py-3 uppercase text-gray-600">{w.rights_type}</td>
                  <td className="px-3.5 py-3">
                    <span style={{ color: w.is_exclusive ? BRAND : '#9ca3af', fontWeight: w.is_exclusive ? 600 : 400 }}>
                      {w.is_exclusive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-gray-600">{w.available_from || 'Now'}</td>
                  <td className="px-3.5 py-3">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: w.availability === 'available' ? '#16a34a' : '#9ca3af' }}
                    >
                      {w.availability === 'available' ? 'Available' : 'Licensed'}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove.mutate(w.id)}
                      disabled={remove.isPending}
                      className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-5 text-sm text-gray-500">
          No rights windows yet. Add one below. At least one is required for submission.
        </p>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Add a rights window
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs text-gray-500">
            Territory
            <select
              value={form.territory}
              onChange={(e) => setForm((f) => ({ ...f, territory: e.target.value }))}
              aria-label="Territory"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select territory…</option>
              {(territories ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-gray-500">
            Rights type
            <select
              value={form.rights_type}
              onChange={(e) => setForm((f) => ({ ...f, rights_type: e.target.value as RightsType }))}
              aria-label="Rights type"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm capitalize text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {RIGHTS_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-gray-500">
            Available from
            <input
              type="date"
              value={form.available_from}
              onChange={(e) => setForm((f) => ({ ...f, available_from: e.target.value }))}
              aria-label="Available from"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <label className="text-xs text-gray-500">
            Available until
            <input
              type="date"
              value={form.available_until}
              onChange={(e) => setForm((f) => ({ ...f, available_until: e.target.value }))}
              aria-label="Available until"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.is_exclusive}
              onChange={(e) => setForm((f) => ({ ...f, is_exclusive: e.target.checked }))}
            />
            Exclusive
          </label>
          <button
            type="button"
            disabled={!canCreate || create.isPending}
            onClick={() => create.mutate()}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            {create.isPending ? 'Adding…' : 'Add window'}
          </button>
        </div>
        {create.isError && (
          <p className="mt-2 text-xs text-red-600">
            {create.error instanceof Error ? create.error.message : 'Failed to add window.'}
          </p>
        )}
      </div>
    </div>
  );
}
