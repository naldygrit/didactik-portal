import { render, screen } from '@testing-library/react';
import { ContentRail } from '../components/ContentRail';
import type { Title } from '../../shared/types';

const mockTitles: Title[] = [
  {
    id: 1,
    uuid: 'u-1',
    slug: 'title-one',
    name: 'Title One',
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
  },
  {
    id: 2,
    uuid: 'u-2',
    slug: 'title-two',
    name: 'Title Two',
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
  },
];

describe('ContentRail', () => {
  it('groups its poster cards as an accessible list named after the rail', () => {
    render(<ContentRail title="Featured" titles={mockTitles} onSelect={() => {}} />);
    const list = screen.getByRole('list', { name: 'Featured' });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(list).toContainElement(item));
  });
});
