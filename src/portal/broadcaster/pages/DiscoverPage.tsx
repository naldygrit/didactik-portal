import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import type { Title } from '../../shared/types';
import { titleTypeLabel } from '../posters';

export function BroadcasterDiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce so we send one request after typing settles, not one per keystroke.
  const [query, setQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setQuery(searchTerm.trim()), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Discover Content</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search titles…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {q && data && (
          <span className="ml-3 text-sm text-gray-400">
            {titles.length} result{titles.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      {!isLoading && titles.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>{q ? 'No results for that query.' : 'No content available yet.'}</p>
        </div>
      )}

      {titles.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
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
            <tbody className="divide-y divide-gray-100">
              {titles.map((title) => (
                <tr key={title.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {title.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {titleTypeLabel(title.title_type)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {title.original_language?.english_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {title.country_of_origin?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{title.production_year ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {title.production_company?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/portal/broadcaster/discover/${title.slug}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
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
    </div>
  );
}
