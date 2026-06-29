import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { ProductionScreenerRequest, ProductionTitle, ScreenerStatus } from '../../shared/types';

const PURPOSE_LABELS: Record<string, string> = {
  acquisition_evaluation: 'Acquisition evaluation',
  programming_review: 'Programming review',
  co_production_interest: 'Co-production interest',
  archival_research: 'Archival research',
};
function purposeLabel(p: string): string {
  return PURPOSE_LABELS[p] ?? p.replace(/_/g, ' ');
}

type Row = ProductionScreenerRequest & { titleName: string };

// All screener interest across the company's catalogue, grouped by status. The
// data is gathered from each title's territory-only screener-requests endpoint
// (no broadcaster identity), so the confidentiality contract holds.
export function ProductionScreenerRequestsPage() {
  const { data: titles } = useQuery<ProductionTitle[]>({
    queryKey: ['production-titles'],
    queryFn: () => apiGet<ProductionTitle[]>('/api/v1/production/titles/'),
  });
  const withRequests = (titles ?? []).filter((t) => t.screener_request_count > 0);
  const slugs = withRequests.map((t) => t.slug);

  const { data: rows, isLoading } = useQuery<Row[]>({
    queryKey: ['production-all-screeners', slugs],
    enabled: titles !== undefined,
    queryFn: async () => {
      const nameBySlug = new Map(withRequests.map((t) => [t.slug, t.name]));
      const lists = await Promise.all(
        slugs.map(async (slug) => {
          const reqs = await apiGet<ProductionScreenerRequest[]>(
            `/api/v1/production/titles/${slug}/screener-requests/`,
          );
          return reqs.map((r) => ({ ...r, titleName: nameBySlug.get(slug) ?? slug }));
        }),
      );
      return lists.flat();
    },
  });

  const all = rows ?? [];
  const groups: { status: ScreenerStatus; heading: string }[] = [
    { status: 'pending', heading: 'Awaiting review' },
    { status: 'approved', heading: 'Approved' },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">Screener requests</h1>
      <p className="mt-1 text-sm text-gray-500">
        Broadcaster interest across your catalogue. Broadcaster identity is revealed when a
        deal progresses.
      </p>
      <div className="mt-3 mb-6 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs text-gray-500">
        Broadcaster names are confidential during evaluation. You see territory interest and
        purpose only.
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      {!isLoading && all.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center">
          <p className="text-sm font-medium text-gray-900">No screener requests yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Requests from broadcasters will appear here once your titles are active.
          </p>
        </div>
      )}

      {groups.map(({ status, heading }) => {
        const items = all.filter((r) => r.status === status);
        if (items.length === 0) return null;
        return (
          <section key={status} className="mb-6">
            <h2 className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
              {heading}
            </h2>
            <div className="flex flex-col gap-2.5">
              {items.map((r) => (
                <div
                  key={r.uuid}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900">{r.titleName}</div>
                    <div className="text-sm text-gray-500">
                      {r.territory_interest.length > 0
                        ? r.territory_interest.join(', ')
                        : 'No territory specified'}
                      {' · '}
                      {purposeLabel(r.purpose)}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      Requested {new Date(r.requested_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs capitalize text-gray-500">{r.status}</span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
