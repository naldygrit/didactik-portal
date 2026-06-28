import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import { money } from '../../shared/format';
import type { BidBoard } from '../../shared/types';

interface Props {
  assetId: number;
}

export function BidPanel({ assetId }: Props) {
  const queryClient = useQueryClient();
  const key = ['bids', assetId];
  const [amount, setAmount] = useState('');

  const { data: board, isLoading } = useQuery<BidBoard>({
    queryKey: key,
    queryFn: () => apiGet<BidBoard>(`/api/v1/assets/${assetId}/bids/`),
  });

  const placeBid = useMutation({
    mutationFn: async (value: number) => {
      const { data, status } = await apiPost<BidBoard | { detail: string }>(
        `/api/v1/assets/${assetId}/bids/`,
        { amount: value },
      );
      if (status >= 400) throw new Error((data as { detail: string }).detail ?? 'Bid failed.');
      return data as BidBoard;
    },
    onSuccess: (next) => {
      queryClient.setQueryData(key, next);
      setAmount('');
    },
  });

  if (isLoading || !board) {
    return <div className="h-24 animate-pulse rounded-lg bg-[var(--surface-hover)]" />;
  }

  const { currency, license_floor, license_ceiling, bid_count, highest_amount, your_bid } = board;
  const parsed = Number(amount);
  const inRange = amount !== '' && !Number.isNaN(parsed) && parsed >= license_floor && parsed <= license_ceiling;
  // Suggest an amount that beats the current top so the placeholder is useful.
  const suggested = highest_amount ? highest_amount + 500 : license_floor;

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Licensing range</span>
        <span className="font-display text-base font-semibold text-white">
          {money(license_floor, currency)} – {money(license_ceiling, currency)}
        </span>
      </div>

      {/* Competitive signal */}
      <div className="rounded-lg bg-[var(--surface-hover)] px-3 py-2 text-sm">
        {bid_count === 0 ? (
          <span className="text-[var(--ink)]/80">No bids yet. Set the pace.</span>
        ) : (
          <span className="text-[var(--ink)]/80">
            <strong className="text-white">{bid_count}</strong>{' '}
            {bid_count === 1 ? 'broadcaster is' : 'broadcasters are'} bidding · top bid{' '}
            <strong className="text-[var(--accent-2)]">
              {highest_amount !== null ? money(highest_amount, currency) : '—'}
            </strong>
          </span>
        )}
      </div>

      {/* Your standing */}
      {your_bid && (
        <p className="text-sm">
          {your_bid.is_top ? (
            <span className="text-emerald-400">
              Your bid of {money(your_bid.amount, currency)} is leading.
            </span>
          ) : (
            <span className="text-amber-400">
              You've been outbid (your bid {money(your_bid.amount, currency)}). Is this your best
              offer? Raise it to stay in.
            </span>
          )}
        </p>
      )}

      {/* Amount entry */}
      <div className="space-y-1">
        <label htmlFor={`bid-${assetId}`} className="block text-xs text-[var(--muted)]">
          {your_bid ? 'Raise your bid' : 'Your bid'} ({currency})
        </label>
        <div className="flex gap-2">
          <input
            id={`bid-${assetId}`}
            type="number"
            inputMode="numeric"
            min={license_floor}
            max={license_ceiling}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={String(suggested)}
            className="w-full rounded-lg border border-white/15 bg-[var(--surface)] px-3 py-2 text-sm text-white placeholder:text-[var(--muted)] focus:border-[var(--accent-2)] focus:outline-none"
          />
          <button
            type="button"
            disabled={!inRange || placeBid.isPending}
            onClick={() => placeBid.mutate(parsed)}
            className="btn-gradient shrink-0 rounded-lg px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placeBid.isPending ? 'Placing…' : your_bid ? 'Raise bid' : 'Place bid'}
          </button>
        </div>
        {amount !== '' && !inRange && (
          <p className="text-xs text-red-400">
            Enter an amount within {money(license_floor, currency)} – {money(license_ceiling, currency)}.
          </p>
        )}
        {placeBid.isError && (
          <p className="text-xs text-red-400">{(placeBid.error as Error).message}</p>
        )}
      </div>
    </div>
  );
}
