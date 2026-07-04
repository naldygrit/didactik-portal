import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import type { TerritoryOption } from '../../shared/types';
import { useDkDisclosure } from '../../../components/dk/useDkDisclosure';
import { DkFormMessage } from '../../../components/dk/DkFormMessage';
import { DkFieldError } from '../../../components/dk/DkFieldError';

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

type State = 'idle' | 'submitting' | 'done' | 'error';

const fieldClass =
  'w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent)]';

// The negotiation-initiation signal: rights type, territory, window — never a
// price. Gated server-side on holding an approved screener; a 403 surfaces a
// friendly prompt.
export function ExpressInterestForm({ slug }: { slug: string }) {
  const { open, toggle, close, triggerProps, panelProps } = useDkDisclosure();
  const [state, setState] = useState<State>('idle');
  const [form, setForm] = useState({
    territory: '',
    rights_type: 'svod',
    window_duration: '2y',
    exclusivity: 'non_exclusive',
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
    if (!form.territory) return;
    setState('submitting');
    const res = await apiPost('/api/v1/broadcaster/expressions-of-interest/', {
      title_slug: slug,
      territory: Number(form.territory),
      rights_type: form.rights_type,
      window_duration: form.window_duration,
      exclusivity: form.exclusivity,
      message: form.message.trim() || undefined,
    });
    if (res.status === 201) setState('done');
    else setState('error');
  }

  if (state === 'done') {
    return (
      <DkFormMessage
        tone="success"
        className="rounded-xl border p-4"
        style={{ borderColor: 'rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.06)' }}
      >
        <div className="text-sm font-semibold text-emerald-400">Expression of interest sent</div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          The production company can now see your interest and reach out to negotiate the licence
          directly. Didactik does not handle the deal terms.
        </p>
      </DkFormMessage>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Ready to license?</div>
            <div className="text-xs text-[var(--muted)]">
              Send a formal expression of interest. No price, just the rights you want.
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            {...triggerProps}
            className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            Express interest
          </button>
        </div>
      ) : (
        <form onSubmit={submit} {...panelProps} className="space-y-3">
          <div className="text-sm font-semibold text-white">Express interest</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">
                Territory<span aria-hidden="true"> *</span>
              </span>
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
              <span className="mb-1 block text-xs text-[var(--muted)]">Window duration</span>
              <select className={fieldClass} value={form.window_duration} onChange={(e) => set('window_duration', e.target.value)}>
                {DURATIONS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">Exclusivity</span>
              <select className={fieldClass} value={form.exclusivity} onChange={(e) => set('exclusivity', e.target.value)}>
                <option value="non_exclusive">Non-exclusive</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--muted)]">Message (optional)</span>
            <textarea
              className={fieldClass}
              rows={2}
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder="Context for the production company"
            />
          </label>

          {state === 'error' && (
            <DkFieldError className="text-xs text-red-400">
              Something went wrong. Please try again.
            </DkFieldError>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={close} className="text-sm text-[var(--muted)] hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {state === 'submitting' ? 'Sending…' : 'Submit interest'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
