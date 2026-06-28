import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import { money, licenseTypeLabel } from '../../shared/format';
import type { Deal, PayoutAccount } from '../../shared/types';

const CURRENCY = 'USD';

export function ProductionEarningsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ label: '', account_number: '', percentage: '' });

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ['deals'],
    queryFn: () => apiGet<Deal[]>('/api/v1/deals/'),
  });
  const { data: accounts } = useQuery<PayoutAccount[]>({
    queryKey: ['payout-accounts'],
    queryFn: () => apiGet<PayoutAccount[]>('/api/v1/payout-accounts/'),
  });

  const addAccount = useMutation({
    mutationFn: () =>
      apiPost('/api/v1/payout-accounts/', {
        label: form.label,
        account_number: form.account_number,
        percentage: Number(form.percentage),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-accounts'] });
      setForm({ label: '', account_number: '', percentage: '' });
    },
  });

  const total = (deals ?? []).reduce((sum, d) => sum + d.amount, 0);
  const allocated = (accounts ?? []).reduce((sum, a) => sum + a.percentage, 0);
  const canAdd = form.label.trim() !== '' && form.account_number.trim() !== '' && Number(form.percentage) > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Earnings</h1>
        <p className="mt-1 text-sm text-gray-500">Licence revenue from your catalogue and where it is paid.</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-xs uppercase tracking-wide text-gray-500">Total licensed</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{money(total, CURRENCY)}</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Licensed titles</h2>
        {deals && deals.length > 0 ? (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
            {deals.map((deal) => (
              <li key={deal.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{deal.asset_title}</p>
                  <p className="text-xs text-gray-500">
                    {licenseTypeLabel(deal.license_type)} · {deal.broadcaster_name}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">{money(deal.amount, deal.currency)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No titles licensed yet.</p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Payout split</h2>
          <span className={allocated === 100 ? 'text-xs text-gray-500' : 'text-xs font-medium text-amber-600'}>
            {allocated}% allocated{allocated !== 100 ? ' (should total 100%)' : ''}
          </span>
        </div>

        <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
          {(accounts ?? []).map((acct) => (
            <li key={acct.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{acct.label}</p>
                <p className="text-xs text-gray-500">Acct ····{acct.account_number.slice(-4)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{acct.percentage}%</p>
                <p className="text-xs text-gray-500">{money((total * acct.percentage) / 100, CURRENCY)}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Add a payout account */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Account label"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            value={form.account_number}
            onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))}
            placeholder="Account number"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            value={form.percentage}
            onChange={(e) => setForm((f) => ({ ...f, percentage: e.target.value }))}
            placeholder="%"
            className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            disabled={!canAdd || addAccount.isPending}
            onClick={() => addAccount.mutate()}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: '#5343fd' }}
          >
            Add account
          </button>
        </div>
      </section>
    </div>
  );
}
