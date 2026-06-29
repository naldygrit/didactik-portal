import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { AdminDashboard } from '../../shared/types';

const hairline = { borderColor: 'var(--hairline)' };

// Compact bytes -> GB/TB. Storage on the platform is reported in raw bytes.
function formatBytes(bytes: number): string {
  const tb = bytes / 1_000_000_000_000;
  if (tb >= 1) return `${tb.toFixed(1)} TB`;
  const gb = bytes / 1_000_000_000;
  return `${gb.toFixed(0)} GB`;
}

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdminOverviewPage() {
  const { data } = useQuery<AdminDashboard>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiGet<AdminDashboard>('/api/v1/admin/dashboard/'),
  });

  const triage = data?.triage_queue ?? [];
  const orgs = data?.organisations;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-lg font-semibold text-[var(--ink)]">Overview</h1>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Titles" value={data?.content.total_titles ?? '—'} />
        <Metric label="Active" value={data?.content.active ?? '—'} />
        <Metric
          label="Screeners pending"
          value={data?.screeners.pending_queue ?? '—'}
          highlight={(data?.screeners.pending_queue ?? 0) > 0}
        />
        <Metric label="Unvalidated assets" value={data?.assets.unvalidated ?? '—'} />
      </div>

      {/* Title status breakdown */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-[var(--ink)]">Catalogue by status</h2>
        {data ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.content.by_status).map(([status, count]) => (
              <span
                key={status}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-[var(--muted)]"
                style={hairline}
              >
                {titleCase(status)}
                <span className="font-mono tabular-nums text-[var(--ink)]">{count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        )}
      </section>

      {/* Triage queue — the admin's primary work surface */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-[var(--ink)]">Triage queue</h2>
          <Link to="/portal/admin/library" className="text-xs text-[var(--accent)] hover:underline">
            Library
          </Link>
        </div>
        {triage.length > 0 ? (
          <ul className="overflow-hidden rounded-lg border" style={hairline}>
            {triage.map((row, i) => (
              <li
                key={row.slug}
                style={i === 0 ? undefined : { borderTop: '1px solid var(--hairline)' }}
              >
                <Link
                  to={`/portal/admin/library?title=${encodeURIComponent(row.slug)}`}
                  className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <span className="min-w-0 truncate">
                    <span className="text-[var(--ink)]">{row.name}</span>
                    <span className="text-[var(--muted)]"> · {row.production_company}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-xs capitalize text-[var(--muted)]">
                      {titleCase(row.status)}
                    </span>
                    <span className="font-mono tabular-nums text-[var(--muted)]">
                      {row.metadata_score}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">Nothing to triage. The queue is clear.</p>
        )}
      </section>

      {/* Organisations + storage */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Metric label="Production companies" value={orgs?.production_companies ?? '—'} />
        <Metric label="Broadcasters" value={orgs?.broadcasters ?? '—'} />
        <Metric
          label="Storage"
          value={data ? formatBytes(data.storage.total_bytes) : '—'}
          mono
        />
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border p-4" style={hairline}>
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${mono ? 'font-mono' : ''}`}
        style={{ color: highlight ? 'var(--accent)' : 'var(--ink)' }}
      >
        {value}
      </p>
    </div>
  );
}
