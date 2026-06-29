import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import type { TerritoryOption } from '../../shared/types';

const RIGHTS: [string, string][] = [
  ['broadcast', 'Broadcast'],
  ['svod', 'SVOD'],
  ['avod', 'AVOD'],
  ['tvod', 'TVOD'],
  ['theatrical', 'Theatrical'],
  ['all', 'All rights'],
];
const DURATIONS: [string, string][] = [
  ['1y', '1 year'],
  ['2y', '2 years'],
  ['3y', '3 years'],
  ['5y', '5 years'],
  ['perpetual', 'Perpetual'],
];

type State = 'idle' | 'submitting' | 'done' | 'gated' | 'error';
const fieldClass =
  'w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent)]';

// The priced bid. An accepted offer becomes a deal on which Didactik takes its
// commission. Gated server-side on screener access.
export function MakeOfferForm({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>('idle');
  const [form, setForm] = useState({
    territory: '',
    rights_type: 'svod',
    license_type: 'exclusive',
    amount: '',
    currency: 'USD',
    window_duration: '2y',
    message: '',
  });

  const { data: territories } = useQuery<TerritoryOption[]>({
    queryKey: ['territories'],
    queryFn: () => apiGet<TerritoryOption[]>('/api/v1/territories/'),
    enabled: open,
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.territory || !(Number(form.amount) > 0)) return;
    setState('submitting');
    const res = await apiPost('/api/v1/broadcaster/offers/', {
      title_slug: slug,
      territory: Number(form.territory),
      rights_type: form.rights_type,
      license_type: form.license_type,
      amount: form.amount,
      currency: form.currency,
      window_duration: form.window_duration,
      message: form.message.trim() || undefined,
    });
    if (res.status === 201) setState('done');
    else if (res.status === 403) setState('gated');
    else setState('error');
  }

  if (state === 'done') {
    return (
      <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.06)' }}>
        <div className="text-sm font-semibold text-emerald-400">Offer submitted</div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          The production company can review and accept your offer. If accepted, Didactik confirms
          the licence and its commission.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Make an offer</div>
            <div className="text-xs text-[var(--muted)]">
              Propose a licence fee. The producer can accept, and the deal closes on Didactik.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Make an offer
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="text-sm font-semibold text-white">Make an offer</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">Licence fee</span>
              <div className="flex gap-2">
                <select className={`${fieldClass} w-20`} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="NGN">NGN</option>
                </select>
                <input
                  type="number"
                  min={1}
                  className={fieldClass}
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  placeholder="Amount"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">Territory</span>
              <select className={fieldClass} value={form.territory} onChange={(e) => set('territory', e.target.value)} required>
                <option value="">Select a territory</option>
                {(territories ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">Rights type</span>
              <select className={fieldClass} value={form.rights_type} onChange={(e) => set('rights_type', e.target.value)}>
                {RIGHTS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">Exclusivity</span>
              <select className={fieldClass} value={form.license_type} onChange={(e) => set('license_type', e.target.value)}>
                <option value="exclusive">Exclusive</option>
                <option value="non_exclusive">Non-exclusive</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">Window</span>
              <select className={fieldClass} value={form.window_duration} onChange={(e) => set('window_duration', e.target.value)}>
                {DURATIONS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {state === 'gated' && (
            <p className="text-xs text-amber-400">
              Access a screener for this title before making an offer.
            </p>
          )}
          {state === 'error' && <p className="text-xs text-red-400">Something went wrong. Please try again.</p>}

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-[var(--muted)] hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {state === 'submitting' ? 'Submitting…' : 'Submit offer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
