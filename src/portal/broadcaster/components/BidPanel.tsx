import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../shared/apiHelpers';
import type { BiddingStats } from '../../shared/types';

function money(value: string | null, currency = 'USD'): string {
  if (value == null) return '';
  const n = Number(value);
  const formatted = n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return currency === 'USD' ? `$${formatted}` : `${currency} ${formatted}`;
}

// The competitive bid panel: an indicative licence range, how many broadcasters
// are bidding, the top bid, and the broadcaster's own standing. A bid is an
// Offer under the hood, so an accepted bid flows into the producer's Deal and
// Didactik's commission.
export function BidPanel({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const { data } = useQuery<BiddingStats>({
    queryKey: ['bidding', slug],
    queryFn: () => apiGet<BiddingStats>(`/api/v1/broadcaster/titles/${slug}/bidding/`),
  });

  const place = useMutation({
    mutationFn: () =>
      apiPost(`/api/v1/broadcaster/titles/${slug}/bid/`, { amount: Number(amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bidding', slug] });
      setAmount('');
    },
  });

  if (!data) return null;

  const hasBid = data.your_bid != null;
  const currency = data.currency || 'USD';
  const range =
    data.fee_min && data.fee_max
      ? `${money(data.fee_min, currency)} – ${money(data.fee_max, currency)}`
      : null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (Number(amount) > 0) place.mutate();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-4">
      {/* Range header */}
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Licensing range
        </span>
        {range && <span className="text-sm font-semibold text-white">{range}</span>}
      </div>

      {/* Competitive signal */}
      <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-[var(--ink)]/85">
        {data.bidder_count > 0 ? (
          <>
            <span className="font-semibold text-white">{data.bidder_count}</span>{' '}
            {data.bidder_count === 1 ? 'broadcaster is' : 'broadcasters are'} bidding
            {data.top_bid && (
              <>
                {' '}
                &middot; top bid{' '}
                <span className="font-semibold text-[var(--accent-2)]">
                  {money(data.top_bid, currency)}
                </span>
              </>
            )}
          </>
        ) : (
          'No bids yet. Be the first to bid.'
        )}
      </div>

      {/* Your standing */}
      {hasBid && (
        <p className={`mt-2 text-sm ${data.you_leading ? 'text-emerald-400' : 'text-amber-400'}`}>
          {data.you_leading
            ? `Your bid of ${money(data.your_bid, currency)} is leading.`
            : `Your bid is ${money(data.your_bid, currency)}. The top bid is ${money(data.top_bid, currency)}.`}
        </p>
      )}
      {place.isSuccess && (
        <p className="mt-1 text-sm text-emerald-400">
          {data.you_leading ? 'Bid placed. You are leading.' : 'Bid placed.'}
        </p>
      )}

      {/* Place / raise */}
      {!open && !hasBid ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-gradient mt-3 inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold"
        >
          Place a bid
        </button>
      ) : (
        <form onSubmit={submit} className="mt-3">
          <label className="mb-1 block text-xs text-[var(--muted)]">
            {hasBid ? 'Raise your bid' : 'Your bid'} ({currency})
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={data.top_bid ? String(Number(data.top_bid) + 1000) : '8000'}
              className="flex-1 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={place.isPending || !(Number(amount) > 0)}
              className="btn-gradient shrink-0 rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {hasBid ? 'Raise bid' : 'Place bid'}
            </button>
          </div>
          {place.isError && (
            <p className="mt-1 text-xs text-red-400">Could not place the bid. Try again.</p>
          )}
        </form>
      )}
    </div>
  );
}
