import { render, screen } from '@testing-library/react';
import { PosterCard } from '../components/PosterCard';
import type { Title } from '../../shared/types';

const mockTitle: Title = {
  id: 1,
  uuid: 'u-1',
  slug: 'test-title',
  name: 'Test Title',
  original_title: '',
  title_type: 'documentary',
  production_company: { id: 1, name: 'Studio' },
  production_year: 2024,
  country_of_origin: { id: 1, code: 'NG', name: 'Nigeria' },
  co_production_countries: [],
  original_language: { id: 1, code: 'eng', english_name: 'English' },
  dialogue_languages: [],
  genres: [],
  cultural_tags: [],
  maturity_rating: null,
  logline: '',
  synopsis: '',
  runtime_minutes: 90,
  episode_count: null,
  season_count: null,
  awards: [],
  festival_selections: [],
  resolution: 'HD',
  aspect_ratio: '1.85:1',
  is_featured: false,
};

describe('PosterCard', () => {
  it('reveals hover-only metadata on keyboard focus too, not just mouse hover', () => {
    render(<PosterCard title={mockTitle} onSelect={() => {}} />);
    const meta = screen.getByText(/2024/);
    expect(meta.className).toContain('group-hover:opacity-100');
    expect(meta.className).toContain('group-focus-visible:opacity-100');
  });
});
