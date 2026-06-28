import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import { money, licenseTypeLabel } from '../../shared/format';
import type { DealDeskItem, LicenseType } from '../../shared/types';

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

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">Deals desk</h1>
      <p className="mb-6 text-sm text-gray-500">
        Accept the leading bid on the producer's behalf and record the licence terms.
      </p>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      {data && data.length === 0 && (
        <p className="text-sm text-gray-500">No titles have received bids yet.</p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Bids</th>
                <th className="px-4 py-3 font-medium">Top bid</th>
                <th className="px-4 py-3 font-medium">Leading broadcaster</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => (
                <tr key={row.asset_id} className="text-gray-800">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{row.title}</div>
                    {row.production_company && (
                      <div className="text-xs text-gray-500">{row.production_company}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">{row.bid_count}</td>
                  <td className="px-4 py-3 font-medium">
                    {row.top_amount !== null ? money(row.top_amount, row.currency) : '—'}
                  </td>
                  <td className="px-4 py-3">{row.top_broadcaster ?? '—'}</td>
                  <td className="px-4 py-3">
                    {row.deal ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Licensed · {licenseTypeLabel(row.deal.license_type)} · {row.deal.broadcaster_name}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={terms[row.asset_id] ?? 'non_exclusive'}
                          onChange={(e) =>
                            setTerms((t) => ({ ...t, [row.asset_id]: e.target.value as LicenseType }))
                          }
                          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                          style={{ backgroundColor: '#5343fd' }}
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
