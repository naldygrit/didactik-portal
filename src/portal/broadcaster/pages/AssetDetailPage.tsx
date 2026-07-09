import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRecentlyViewed } from '../RecentlyViewedContext';
import { apiGet } from '../../shared/apiHelpers';
import type { Title } from '../../shared/types';
import { titleTypeLabel, titleBackdropBg } from '../posters';
import { ScreenerPanel } from '../components/ScreenerPanel';
import { ExpressInterestForm } from '../components/ExpressInterestForm';
import { MakeOfferForm } from '../components/MakeOfferForm';

type Tab = 'overview' | 'credits' | 'rights';
const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'credits', label: 'Credits' },
  { key: 'rights', label: 'Rights & screener' },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function languageList(title: Title, type: 'subtitle' | 'dub'): string {
  const names = (title.language_tracks ?? [])
    .filter((t) => t.track_type === type)
    .map((t) => t.language.english_name);
  return names.length > 0 ? names.join(', ') : 'None';
}

// Awards are stored as free-form JSON; render only entries that carry a name.
function awardNames(title: Title): string[] {
  return (title.awards as { name?: string; year?: number }[])
    .filter((a) => a && typeof a.name === 'string')
    .map((a) => (a.year ? `${a.name} ${a.year}` : (a.name as string)));
}

export function BroadcasterAssetDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>('overview');

  const { data: title, isLoading, isError } = useQuery<Title>({
    queryKey: ['broadcaster-title', slug],
    queryFn: () => apiGet<Title>(`/api/v1/broadcaster/titles/${slug}/`),
    enabled: !!slug,
  });
  const { data: allTitles } = useQuery<Title[]>({
    queryKey: ['broadcaster-titles'],
    queryFn: () => apiGet<Title[]>('/api/v1/broadcaster/titles/'),
  });

  const { registerView } = useRecentlyViewed();
  useEffect(() => {
    if (title) registerView(title);
    // registerView is stable for our purposes; re-record only when the title changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title?.slug]);

  if (isLoading) return <p className="px-8 py-10 text-sm text-[var(--muted)]">Loading…</p>;
  if (isError || !title) {
    return (
      <div className="px-8 py-10">
        <Link to="/portal/broadcaster/discover" className="text-sm text-[var(--accent-2)]">
          ← Back to browse
        </Link>
        <p className="mt-4 text-sm text-red-400">Title not found or failed to load.</p>
      </div>
    );
  }

  const credits = title.credits ?? [];
  const awards = awardNames(title);
  const genreIds = new Set(title.genres.map((g) => g.id));
  const similar = (allTitles ?? [])
    .filter((t) => t.slug !== title.slug && t.genres.some((g) => genreIds.has(g.id)))
    .slice(0, 6);
  const meta = [
    title.production_company?.name,
    title.country_of_origin?.name,
    title.production_year ? String(title.production_year) : null,
    titleTypeLabel(title.title_type),
    title.runtime_minutes ? `${title.runtime_minutes} min` : null,
    title.maturity_rating?.code,
    title.resolution || null,
  ].filter(Boolean);

  return (
    <div className="min-h-full" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
      {/* Hero */}
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{ background: titleBackdropBg(title) }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, var(--surface) 8%, rgba(11,11,15,0.55) 60%, rgba(11,11,15,0.35))' }}
          aria-hidden
        />
        <div className="relative px-6 pb-7 pt-10 md:px-10 md:pt-16">
          <Link
            to="/portal/broadcaster/discover"
            className="text-sm text-white/80 transition-colors hover:text-white"
          >
            ← Back to browse
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            {title.genres.map((g) => (
              <Tag key={`g-${g.id}`}>{g.name}</Tag>
            ))}
            {awards.map((a) => (
              <Tag key={a} tone="amber">
                🏆 {a}
              </Tag>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title.name}</h1>
          {title.original_title && title.original_title !== title.name && (
            <p className="mt-1 text-sm text-white/50">{title.original_title}</p>
          )}
          <p className="mt-3 text-sm text-white/60">{meta.join(' · ')}</p>
        </div>
      </div>

      {/* Sticky tab bar */}
      <div
        className="sticky top-0 z-10 flex gap-1 border-b px-6 md:px-10"
        style={{ background: 'var(--surface)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="border-b-2 px-4 py-3 text-sm transition-colors"
              style={{
                borderColor: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--muted)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-6 py-7 md:px-10">
        {tab === 'overview' && (
          <div className="max-w-2xl">
            {(title.synopsis || title.logline) && (
              <p className="mb-7 text-[15px] leading-relaxed text-white/75">
                {title.synopsis || title.logline}
              </p>
            )}
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field label="Original language" value={title.original_language?.english_name} />
              <Field label="Cultural tags" value={title.cultural_tags.map((c) => c.name).join(', ')} />
              <Field label="Resolution" value={title.resolution} />
              <Field label="Subtitles" value={languageList(title, 'subtitle')} />
              <Field label="Dubs" value={languageList(title, 'dub')} />
              {awards.length > 0 && <Field label="Awards" value={awards.join(', ')} />}
            </div>
          </div>
        )}

        {tab === 'credits' && (
          <div className="max-w-xl">
            {credits.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Credits not yet available for this title.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {[...credits]
                  .sort((a, b) => a.order - b.order)
                  .map((c) => (
                    <div key={c.id} className="flex items-center gap-3.5 py-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                        style={{ background: 'rgba(255,255,255,0.07)', color: '#fff' }}
                      >
                        {initials(c.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{c.name}</div>
                        <div className="text-xs text-[var(--muted)]">
                          {c.role_display}
                          {c.character ? `, ${c.character}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {tab === 'rights' && (
          <div className="max-w-2xl space-y-5">
            <ScreenerPanel slug={title.slug} />
            <ExpressInterestForm slug={title.slug} />
            <MakeOfferForm slug={title.slug} />
          </div>
        )}
      </div>

      {similar.length > 0 && (
        <div className="px-6 pb-10 md:px-10">
          <h2 className="mb-3 text-base font-bold text-white">More like this</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {similar.map((t) => (
              <Link
                key={t.slug}
                to={`/portal/broadcaster/discover/${t.slug}`}
                className="group min-w-[160px] max-w-[160px]"
              >
                <div
                  className="aspect-video w-full rounded-lg ring-1 ring-white/10 transition-transform group-hover:scale-[1.03]"
                  style={{ background: titleBackdropBg(t) }}
                />
                <div className="mt-1.5 truncate text-sm font-medium text-white/90">{t.name}</div>
                <div className="truncate text-xs text-[var(--muted)]">
                  {titleTypeLabel(t.title_type)}
                  {t.production_year ? ` · ${t.production_year}` : ''}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: 'amber' }) {
  const style =
    tone === 'amber'
      ? { background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }
      : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' };
  return (
    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={style}>
      {children}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1 text-sm text-white/90">{value || '—'}</div>
    </div>
  );
}
