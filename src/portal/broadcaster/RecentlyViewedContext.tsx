import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Title } from '../shared/types';

// A lightweight slice of a Title — just what the "Recently viewed" rail needs.
export interface RecentTitle {
  slug: string;
  name: string;
  title_type: string;
  production_year: number | null;
}

interface RecentlyViewedContextValue {
  recentlyViewed: RecentTitle[];
  registerView: (title: Title) => void;
}

const KEY = 'didactik:recently-viewed';
const MAX = 10;

function load(): RecentTitle[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentTitle[]) : [];
  } catch {
    return [];
  }
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | undefined>(undefined);

// Adapted from Samuel's didactik-media context (legacy Asset → our Title model),
// with localStorage persistence so the rail survives reloads.
export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentTitle[]>(load);

  const registerView = (title: Title) => {
    const entry: RecentTitle = {
      slug: title.slug,
      name: title.name,
      title_type: title.title_type,
      production_year: title.production_year,
    };
    setRecentlyViewed((prev) => {
      const next = [entry, ...prev.filter((t) => t.slug !== entry.slug)].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore quota / unavailable storage
      }
      return next;
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, registerView }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
