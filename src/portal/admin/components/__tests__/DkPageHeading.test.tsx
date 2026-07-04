import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DkPageHeading } from '../DkPageHeading';
import { DkCardTitle } from '../DkCardTitle';

describe('DkPageHeading', () => {
  it('renders the title as a real h1 with the existing page-title class', () => {
    render(<DkPageHeading title="Overview" />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Overview' });
    expect(heading).toHaveClass('page-title');
  });

  it('renders the subtitle as page-sub text when provided', () => {
    render(<DkPageHeading title="Overview" subtitle="Platform health and the work waiting on you" />);
    expect(
      screen.getByText('Platform health and the work waiting on you'),
    ).toHaveClass('page-sub');
  });

  it('omits the subtitle element entirely when none is given', () => {
    const { container } = render(<DkPageHeading title="Overview" />);
    expect(container.querySelector('.page-sub')).toBeNull();
  });
});

describe('DkCardTitle', () => {
  it('renders as an h2 with the existing card-title class, one level under the page h1', () => {
    render(<DkCardTitle>Triage queue</DkCardTitle>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Triage queue' });
    expect(heading).toHaveClass('card-title');
  });
});
