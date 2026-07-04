import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DetailModal } from '../components/DetailModal';
import type { Title } from '../../shared/types';

vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn().mockResolvedValue({}),
  apiPost: vi.fn().mockResolvedValue({ status: 200, data: {} }),
}));

const mockTitle: Title = {
  id: 1,
  uuid: 'u-1',
  slug: 'test-title',
  name: 'Test Title',
  original_title: '',
  title_type: 'documentary',
  production_company: { id: 1, name: 'Test Studio' },
  production_year: 2024,
  country_of_origin: { id: 1, code: 'NG', name: 'Nigeria' },
  co_production_countries: [],
  original_language: { id: 1, code: 'eng', english_name: 'English' },
  dialogue_languages: [],
  genres: [],
  cultural_tags: [],
  maturity_rating: null,
  logline: 'A test logline.',
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

// Simulates a real trigger (a poster card) opening the modal, so the
// focus-restore behavior has a real element to return to.
function Harness() {
  const [title, setTitle] = useState<Title | null>(null);
  return (
    <div>
      <button type="button" onClick={() => setTitle(mockTitle)}>
        Open Test Title
      </button>
      <DetailModal title={title} onClose={() => setTitle(null)} />
    </div>
  );
}

function renderHarness() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Harness />
    </QueryClientProvider>,
  );
}

describe('DetailModal focus management', () => {
  it('moves focus into the dialog when it opens', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'Open Test Title' }));
    const dialog = screen.getByRole('dialog', { name: 'Test Title' });
    expect(document.activeElement).toBe(dialog);
  });

  it('traps Tab focus within the dialog, wrapping from last to first', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'Open Test Title' }));
    const dialog = screen.getByRole('dialog', { name: 'Test Title' });

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    expect(focusable.length).toBeGreaterThan(1);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('restores focus to the triggering element when the dialog closes', () => {
    renderHarness();
    const trigger = screen.getByRole('button', { name: 'Open Test Title' });
    // fireEvent.click doesn't simulate the browser's native "clicking a
    // button focuses it" behavior the way a real mouse click (or
    // @testing-library/user-event, not installed here) would — so it's
    // simulated explicitly to give the modal a real "previously focused"
    // element to capture and later restore, matching what a poster-card
    // click does in production.
    trigger.focus();
    fireEvent.click(trigger);
    screen.getByRole('dialog', { name: 'Test Title' });

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });
});
