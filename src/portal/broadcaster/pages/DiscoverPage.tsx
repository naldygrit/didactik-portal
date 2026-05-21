import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../shared/apiHelpers';
import { paginationPath } from '../../shared/apiHelpers';
import { StatusBadge } from '../../production/components/StatusBadge';
import type { AssetListItem, PaginatedResponse, SearchAsset } from '../../shared/types';

export function BroadcasterDiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPage, setSearchPage] = useState<string | null>(null);

  const isSearching = searchTerm.trim().length > 0;

  // Default: all READY_TO_LIST assets (role-filtered by backend)
  const { data: allAssets, isLoading: allLoading } = useQuery<AssetListItem[]>({
    queryKey: ['broadcaster-assets'],
    queryFn: () => apiGet<AssetListItem[]>('/api/v1/assets/'),
    enabled: !isSearching,
  });

  // Search: paginated results via the search endpoint
  const searchUrl = searchPage ?? `/api/v1/search/?q=${encodeURIComponent(searchTerm.trim())}`;
  const { data: searchResults, isLoading: searchLoading } = useQuery<PaginatedResponse<SearchAsset>>({
    queryKey: ['broadcaster-search', searchTerm, searchPage],
    queryFn: () => apiGet<PaginatedResponse<SearchAsset>>(searchUrl),
    enabled: isSearching,
  });

  const isLoading = isSearching ? searchLoading : allLoading;

  const assets: (AssetListItem | SearchAsset)[] = isSearching
    ? (searchResults?.results ?? [])
    : (allAssets ?? []);

  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setSearchPage(null); // reset to first page on new query
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Discover Content</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search titles, descriptions, taxonomy tags…"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {isSearching && searchResults && (
          <span className="ml-3 text-sm text-gray-400">
            {searchResults.count} result{searchResults.count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      {!isLoading && assets.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>{isSearching ? 'No results for that query.' : 'No content available yet.'}</p>
        </div>
      )}

      {assets.length > 0 && (
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
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {asset.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">
                    {asset.asset_type.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {asset.primary_language?.english_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {asset.production_country?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {asset.production_year ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {asset.production_company?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/portal/broadcaster/discover/${asset.id}`}
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

      {/* Pagination — only shown for search results */}
      {isSearching && searchResults && (searchResults.next || searchResults.previous) && (
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => searchResults.previous && setSearchPage(paginationPath(searchResults.previous))}
            disabled={!searchResults.previous}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => searchResults.next && setSearchPage(paginationPath(searchResults.next))}
            disabled={!searchResults.next}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
