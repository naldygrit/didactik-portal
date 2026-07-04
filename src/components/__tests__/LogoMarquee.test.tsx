import { render, screen, fireEvent } from '@testing-library/react';
import * as framerMotion from 'framer-motion';
import LogoMarquee from '../LogoMarquee';

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

describe('LogoMarquee', () => {
  afterEach(() => {
    vi.mocked(framerMotion.useReducedMotion).mockReturnValue(false);
  });

  it('renders a pause control when motion is not reduced, and clicking it toggles state', () => {
    render(<LogoMarquee />);
    const button = screen.getByRole('button', { name: 'Pause logo scroll' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Play logo scroll' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('omits the pause control entirely when the OS already prefers reduced motion', () => {
    vi.mocked(framerMotion.useReducedMotion).mockReturnValue(true);
    render(<LogoMarquee />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps all duplicated logo copies in the DOM for the scroll illusion, but hides all but the first set from assistive tech', () => {
    const { container } = render(<LogoMarquee />);
    // 3 logos x 4 duplicated copies, all present visually.
    expect(container.querySelectorAll('img')).toHaveLength(12);
    // Only the first, non-duplicated set is exposed via role="img".
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });
});
