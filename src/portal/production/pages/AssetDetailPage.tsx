import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../../shared/apiHelpers';
import { TitleStatusBadge } from '../components/TitleStatusBadge';
import type {
  Completeness,
  ProductionRightsWindow,
  ProductionScreenerRequest,
  ProductionTitle,
  RightsType,
  TerritoryOption,
} from '../../shared/types';

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

export function ProductionAssetDetailPage() {
  // The route param is named `id` for historical reasons but carries the slug.
  const { id: slug } = useParams<{ id: string }>();
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
        <Link to="/portal/production/assets" className="text-sm text-indigo-600">← Back to catalogue</Link>
        <p className="mt-4 text-sm text-red-600">Title not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/portal/production/assets"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to catalogue
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title.name}</h1>
          {title.original_title && title.original_title !== title.name && (
            <p className="text-sm text-gray-400 mt-0.5">{title.original_title}</p>
          )}
        </div>
        <TitleStatusBadge status={title.status} />
      </div>

      <CompletenessSection completeness={completeness} />
      <ScreenerInterestSection requests={screenerRequests} />
      <RightsWindowsSection titleSlug={title.slug} qc={qc} />
    </div>
  );
}

function CompletenessSection({ completeness }: { completeness: Completeness | undefined }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Metadata completeness</h2>
        {completeness && (
          <span className="text-sm tabular-nums text-gray-500">
            <span className="font-semibold text-gray-900">{completeness.score}</span> / 100
          </span>
        )}
      </div>

      {!completeness && <p className="text-sm text-gray-500">Loading…</p>}

      {completeness && (
        <>
          {completeness.can_activate ? (
            <p className="mb-4 text-sm text-green-700">Ready to activate.</p>
          ) : (
            <p className="mb-4 text-sm text-amber-700">
              {completeness.missing_required.length > 0
                ? `Missing required: ${completeness.missing_required.join(', ')}`
                : 'Not yet ready to activate.'}
            </p>
          )}

          <ul className="space-y-1.5">
            {completeness.breakdown.map((rule) => (
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
        </>
      )}
    </div>
  );
}

function ScreenerInterestSection({
  requests,
}: {
  requests: ProductionScreenerRequest[] | undefined;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-1">Incoming screener interest</h2>
      <p className="text-xs text-gray-400 mb-4">
        Broadcaster identity stays confidential until a deal is negotiated. You see the territory
        and purpose of each request, not who made it.
      </p>

      {!requests && <p className="text-sm text-gray-500">Loading…</p>}

      {requests && requests.length === 0 && (
        <p className="text-sm text-gray-500">No screener requests on this title yet.</p>
      )}

      {requests && requests.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {requests.map((req) => (
            <li key={req.uuid} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{purposeLabel(req.purpose)}</p>
                <p className="text-xs text-gray-500">
                  {req.territory_interest.length > 0
                    ? req.territory_interest.join(', ')
                    : 'No territory specified'}
                </p>
              </div>
              <span className="shrink-0 text-xs capitalize text-gray-500">{req.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RightsWindowsSection({
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

  // The endpoint accepts an optional ?title= filter so the producer sees only
  // this title's windows; the mock honours it and the real backend ignores
  // unknown params harmlessly.
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Rights windows</h2>

      {titleWindows.length > 0 ? (
        <ul className="divide-y divide-gray-100 mb-5">
          {titleWindows.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {w.territory}
                  <span className="ml-2 text-xs uppercase text-gray-500">{w.rights_type}</span>
                  {w.is_exclusive && (
                    <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-indigo-600">
                      Exclusive
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {w.available_from ? `From ${w.available_from}` : 'Available now'}
                  {w.available_until ? ` · until ${w.available_until}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`text-xs font-medium ${
                    w.availability === 'available' ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {w.availability === 'available' ? 'Available' : 'Licensed'}
                </span>
                <button
                  type="button"
                  onClick={() => remove.mutate(w.id)}
                  disabled={remove.isPending}
                  className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 text-sm text-gray-500">No rights windows yet. Add one below.</p>
      )}

      {/* Create a rights window */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
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
            style={{ backgroundColor: '#5343fd' }}
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
