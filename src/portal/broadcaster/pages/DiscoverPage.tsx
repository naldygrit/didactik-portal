import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { Title } from '../../shared/types';
import { titleTypeLabel } from '../posters';
import { bcLink } from '../../shared/portalHost';

// Client-side page size. The full result set is small enough at current scale
// that paging in the browser is adequate; a large catalogue would move this to
// a dedicated server-paginated search endpoint (not the shared titles list,
// which Browse and AssetDetail also consume as a bare array).
const PAGE_SIZE = 12;

export function BroadcasterDiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  // Debounce so we send one request after typing settles, not one per keystroke.
  const [query, setQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setQuery(searchTerm.trim()), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);
  // A new query resets to the first page.
  useEffect(() => setPage(0), [query]);

  // Server-side search via the backend ?q= param: trigram, diacritic-insensitive,
  // role-filtered, and matches synopsis/logline too — beyond a name-only client
  // filter. keepPreviousData avoids a flash of empty while a new query refetches.
  const { data, isLoading } = useQuery<Title[]>({
    queryKey: ['broadcaster-titles', query],
    queryFn: () =>
      apiGet<Title[]>(
        `/api/v1/broadcaster/titles/${query ? `?q=${encodeURIComponent(query)}` : ''}`,
      ),
    placeholderData: keepPreviousData,
  });

  const titles = data ?? [];
  const q = query.toLowerCase();
  const pageCount = Math.ceil(titles.length / PAGE_SIZE);
  const pageTitles = titles.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <h1 className="font-display mb-1 text-2xl font-bold text-white md:text-3xl">
        Discover Content
      </h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Search the full catalogue by title, language, or country.
      </p>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search titles…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
        {q && data && (
          <span className="ml-3 text-sm text-[var(--muted)]">
            {titles.length} result{titles.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}

      {!isLoading && titles.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-10 text-center">
          <p className="font-display text-lg text-white">
            {q ? 'No results for that query.' : 'No content available yet.'}
          </p>
        </div>
      )}

      {titles.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-[var(--surface-raised)]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-left text-xs text-[var(--muted)] uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Production company</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {pageTitles.map((title) => (
                <tr key={title.slug} className="transition-colors hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white max-w-xs truncate">
                    {title.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {titleTypeLabel(title.title_type)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {title.original_language?.english_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {title.country_of_origin?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{title.production_year ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {title.production_company?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={bcLink(`discover/${title.slug}`)}
                      className="font-medium text-[var(--accent-2)] hover:text-white"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg px-3 py-1.5 text-[var(--accent-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-[var(--muted)]">
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="rounded-lg px-3 py-1.5 text-[var(--accent-2)] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
