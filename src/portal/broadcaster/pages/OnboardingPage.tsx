import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { apiGet } from '../../shared/apiHelpers';
import { apiFetch } from '../../shared/api';
import { bcLink } from '../../shared/portalHost';
import type { InterestOption } from '../../shared/types';

export function BroadcasterOnboardingPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: options } = useQuery<InterestOption[]>({
    queryKey: ['interests'],
    queryFn: () => apiGet<InterestOption[]>('/api/v1/interests/'),
  });
  const { data: current } = useQuery<string[]>({
    queryKey: ['me-interests'],
    queryFn: () => apiGet<string[]>('/api/v1/me/interests/'),
  });

  useEffect(() => {
    if (current) setSelected(new Set(current));
  }, [current]);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    await apiFetch('/api/v1/me/interests/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interests: [...selected] }),
    });
    navigate(bcLink('dashboard'), { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-8">
      <h1 className="font-display text-3xl font-bold text-white md:text-4xl">What are you in the market for?</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Pick a few and we'll lead with titles that fit. Change these any time.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {(options ?? []).map((opt) => {
          const on = selected.has(opt.key);
          return (
            <motion.button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              aria-pressed={on}
              animate={reduce ? undefined : { scale: on ? 1.06 : 1 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className={
                on
                  ? 'btn-gradient rounded-full px-5 py-2.5 text-sm font-semibold'
                  : 'rounded-full border border-white/20 px-5 py-2.5 text-sm text-[var(--ink)]/80 transition-colors hover:border-white/40'
              }
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-gradient rounded-full px-7 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving…' : selected.size > 0 ? `Show my picks (${selected.size})` : 'Continue'}
        </button>
        <button
          type="button"
          onClick={() => navigate(bcLink('dashboard'), { replace: true })}
          className="text-sm text-[var(--muted)] transition-colors hover:text-white"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
