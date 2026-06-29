import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../../shared/apiHelpers';
import type { Deal, PayoutAccount } from '../../shared/types';

const BRAND = '#5343fd';

function money(amount: string | number, currency = 'USD'): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  return `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function ProductionEarningsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ label: '', account_details: '', percentage: '' });

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ['production-deals'],
    queryFn: () => apiGet<Deal[]>('/api/v1/production/deals/'),
  });
  const { data: accounts } = useQuery<PayoutAccount[]>({
    queryKey: ['payout-accounts'],
    queryFn: () => apiGet<PayoutAccount[]>('/api/v1/production/payout-accounts/'),
  });

  const addAccount = useMutation({
    mutationFn: () =>
      apiPost('/api/v1/production/payout-accounts/', {
        label: form.label,
        account_details: form.account_details,
        percentage: Number(form.percentage),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payout-accounts'] });
      setForm({ label: '', account_details: '', percentage: '' });
    },
  });
  const removeAccount = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/v1/production/payout-accounts/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payout-accounts'] }),
  });

  const all = deals ?? [];
  const gross = all.reduce((s, d) => s + Number(d.amount), 0);
  const net = all.reduce((s, d) => s + Number(d.net_to_producer), 0);
  const commission = gross - net;
  const allocated = (accounts ?? []).reduce((s, a) => s + a.percentage, 0);
  const canAdd =
    form.label.trim() !== '' && form.account_details.trim() !== '' && Number(form.percentage) > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Licence revenue from your catalogue, net of Didactik's commission, and where it is paid.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Deals" value={String(all.length)} />
        <Stat label="Gross licence value" value={money(gross)} />
        <Stat label="Net to you" value={money(net)} accent />
        <Stat label="Didactik commission" value={money(commission)} />
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Licence deals</h2>
        {all.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center">
            <p className="text-sm font-medium text-gray-900">No deals yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              When you accept a broadcaster's offer, the licence and your earnings show here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Broadcaster</th>
                  <th className="px-4 py-3">Territory</th>
                  <th className="px-4 py-3 text-right">Fee</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3 text-right">Net to you</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {all.map((d) => (
                  <tr key={d.uuid}>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.title_name}</td>
                    <td className="px-4 py-3 text-gray-600">{d.broadcaster_name}</td>
                    <td className="px-4 py-3 text-gray-600">{d.territory}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {money(d.amount, d.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-400">
                      {money(d.commission_amount, d.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                      {money(d.net_to_producer, d.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-gray-900">Payout accounts</h2>
          <span className="text-xs text-gray-500">
            {allocated}% allocated{allocated !== 100 ? ' (should total 100%)' : ''}
          </span>
        </div>
        <div className="space-y-2">
          {(accounts ?? []).map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">{a.label}</div>
                <div className="text-xs text-gray-400">{a.account_details}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">{a.percentage}%</span>
                <button
                  type="button"
                  onClick={() => removeAccount.mutate(a.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canAdd) addAccount.mutate();
          }}
          className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3"
        >
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Label (e.g. Main account)"
            className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
          />
          <input
            value={form.account_details}
            onChange={(e) => setForm((f) => ({ ...f, account_details: e.target.value }))}
            placeholder="Bank / wallet reference"
            className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
          />
          <input
            type="number"
            min={1}
            max={100}
            value={form.percentage}
            onChange={(e) => setForm((f) => ({ ...f, percentage: e.target.value }))}
            placeholder="%"
            className="w-20 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={!canAdd || addAccount.isPending}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            Add
          </button>
        </form>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p
        className="mt-1 font-display text-xl font-bold tabular-nums text-gray-900"
        style={accent ? { color: BRAND } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
