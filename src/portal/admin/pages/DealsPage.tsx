import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import { money, licenseTypeLabel } from '../../shared/format';
import type { DealDeskItem, LicenseType } from '../../shared/types';

const hairline = { borderColor: 'var(--hairline)' };

export function AdminDealsPage() {
  const queryClient = useQueryClient();
  const [terms, setTerms] = useState<Record<number, LicenseType>>({});

  const { data, isLoading } = useQuery<DealDeskItem[]>({
    queryKey: ['deals-desk'],
    queryFn: () => apiGet<DealDeskItem[]>('/api/v1/admin/deals-desk/'),
  });

  const accept = useMutation({
    mutationFn: ({ assetId, licenseType }: { assetId: number; licenseType: LicenseType }) =>
      apiPost(`/api/v1/assets/${assetId}/accept-bid/`, { license_type: licenseType }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals-desk'] }),
  });

  const pending = (data ?? []).filter((d) => !d.deal).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--ink)]">Deals desk</h1>
          <p className="text-sm text-[var(--muted)]">Accept the leading bid on the producer's behalf.</p>
        </div>
        {data && (
          <span className="font-mono text-xs tabular-nums text-[var(--muted)]">
            {pending} awaiting
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}

      {data && data.length === 0 && (
        <p className="text-sm text-[var(--muted)]">No titles have received bids yet.</p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg border" style={hairline}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-[var(--muted)]" style={hairline}>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 text-right font-medium">Bids</th>
                <th className="px-4 py-2.5 text-right font-medium">Top bid</th>
                <th className="px-4 py-2.5 font-medium">Leading</th>
                <th className="px-4 py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.asset_id}
                  className="transition-colors hover:bg-[var(--surface-hover)]"
                  style={i === 0 ? undefined : { borderTop: '1px solid var(--hairline)' }}
                >
                  <td className="px-4 py-3">
                    <div className="text-[var(--ink)]">{row.title}</div>
                    {row.production_company && (
                      <div className="text-xs text-[var(--muted)]">{row.production_company}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--muted)]">
                    {row.bid_count}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--ink)]">
                    {row.top_amount !== null ? money(row.top_amount, row.currency) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{row.top_broadcaster ?? '—'}</td>
                  <td className="px-4 py-3">
                    {row.deal ? (
                      <div className="flex items-center justify-end gap-2 text-xs text-[var(--muted)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Licensed · {licenseTypeLabel(row.deal.license_type)}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={terms[row.asset_id] ?? 'non_exclusive'}
                          onChange={(e) =>
                            setTerms((t) => ({ ...t, [row.asset_id]: e.target.value as LicenseType }))
                          }
                          className="rounded-md border bg-[var(--surface-raised)] px-2 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                          style={hairline}
                        >
                          <option value="non_exclusive">Non-exclusive</option>
                          <option value="exclusive">Exclusive</option>
                        </select>
                        <button
                          type="button"
                          disabled={accept.isPending}
                          onClick={() =>
                            accept.mutate({
                              assetId: row.asset_id,
                              licenseType: terms[row.asset_id] ?? 'non_exclusive',
                            })
                          }
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-50"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          Accept top bid
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
