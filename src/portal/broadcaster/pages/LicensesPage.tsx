import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { money, licenseTypeLabel } from '../../shared/format';
import type { Deal } from '../../shared/types';

export function BroadcasterLicensesPage() {
  const { data, isLoading } = useQuery<Deal[]>({
    queryKey: ['deals'],
    queryFn: () => apiGet<Deal[]>('/api/v1/deals/'),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <h1 className="font-display mb-1 text-2xl font-bold text-white md:text-3xl">Your licences</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Titles you have successfully licensed.</p>

      {isLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}

      {data && data.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-8 text-center">
          <p className="font-display text-lg text-white">No licences yet</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Win a bid and Didactik finalises the licence here.
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((deal) => (
            <li
              key={deal.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4"
            >
              <div>
                <p className="font-display text-lg font-semibold text-white">{deal.asset_title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {licenseTypeLabel(deal.license_type)} licence
                </p>
              </div>
              <span className="font-display text-lg font-semibold text-[var(--accent-2)]">
                {money(deal.amount, deal.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
