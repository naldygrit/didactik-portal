import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import type { AdminScreenerRequest, ScreenerStatus } from '../../shared/types';

const hairline = { borderColor: 'var(--hairline)' };

const PURPOSE_LABELS: Record<string, string> = {
  acquisition_evaluation: 'Acquisition evaluation',
  programming_review: 'Programming review',
  co_production_interest: 'Co-production interest',
  archival_research: 'Archival research',
};

const STATUS_DOT: Record<ScreenerStatus, string> = {
  pending: 'bg-amber-400',
  approved: 'bg-emerald-400',
  declined: 'bg-red-400',
  expired: 'bg-zinc-500',
  accessed: 'bg-sky-400',
};

export function AdminScreenerQueuePage() {
  const queryClient = useQueryClient();
  // Per-request approve duration (hours) and decline reason, kept local until acted on.
  const [hours, setHours] = useState<Record<string, number>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<AdminScreenerRequest[]>({
    queryKey: ['admin-screener-requests'],
    queryFn: () => apiGet<AdminScreenerRequest[]>('/api/v1/admin/screener-requests/'),
  });

  const approve = useMutation({
    mutationFn: ({ uuid, access_duration_hours }: { uuid: string; access_duration_hours: number }) =>
      apiPost(`/api/v1/admin/screener-requests/${uuid}/approve/`, { access_duration_hours }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-screener-requests'] }),
  });

  const decline = useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) =>
      apiPost(`/api/v1/admin/screener-requests/${uuid}/decline/`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-screener-requests'] }),
  });

  const pending = (data ?? []).filter((r) => r.status === 'pending').length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--ink)]">Screeners</h1>
          <p className="text-sm text-[var(--muted)]">
            Approve or decline broadcaster screener requests.
          </p>
        </div>
        {data && (
          <span className="font-mono text-xs tabular-nums text-[var(--muted)]">
            {pending} pending
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}

      {data && data.length === 0 && (
        <p className="text-sm text-[var(--muted)]">No screener requests yet.</p>
      )}

      {data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((req) => {
            const isPending = req.status === 'pending';
            return (
              <li key={req.uuid} className="rounded-lg border p-4" style={hairline}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-[var(--ink)]">{req.title_name}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {req.broadcaster.name} · {PURPOSE_LABELS[req.purpose] ?? req.purpose}
                    </div>
                    {req.territory_interest.length > 0 && (
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        Territories: {req.territory_interest.join(', ')}
                      </div>
                    )}
                    {req.message_to_producer && (
                      <p className="mt-1.5 text-xs italic text-[var(--muted)]">
                        “{req.message_to_producer}”
                      </p>
                    )}
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 text-xs capitalize text-[var(--muted)]">
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[req.status] ?? 'bg-zinc-500'}`} />
                    {req.status}
                  </span>
                </div>

                {isPending ? (
                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3" style={hairline}>
                    <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
                      Access (hours)
                      <input
                        type="number"
                        min={1}
                        value={hours[req.uuid] ?? 48}
                        onChange={(e) =>
                          setHours((h) => ({ ...h, [req.uuid]: Number(e.target.value) }))
                        }
                        className="w-24 rounded-md border bg-[var(--surface-raised)] px-2 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        style={hairline}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={approve.isPending}
                      onClick={() =>
                        approve.mutate({
                          uuid: req.uuid,
                          access_duration_hours: hours[req.uuid] ?? 48,
                        })
                      }
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      Approve
                    </button>
                    <input
                      value={reasons[req.uuid] ?? ''}
                      onChange={(e) => setReasons((r) => ({ ...r, [req.uuid]: e.target.value }))}
                      placeholder="Decline reason (optional)"
                      className="min-w-0 flex-grow rounded-md border bg-[var(--surface-raised)] px-2 py-1.5 text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      style={hairline}
                    />
                    <button
                      type="button"
                      disabled={decline.isPending}
                      onClick={() =>
                        decline.mutate({ uuid: req.uuid, reason: reasons[req.uuid] ?? '' })
                      }
                      className="rounded-md border px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-50"
                      style={hairline}
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  req.access_expires_at && (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Access expires {new Date(req.access_expires_at).toLocaleDateString('en-GB')}
                      {req.access_count > 0 && ` · ${req.access_count} views`}
                    </p>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
