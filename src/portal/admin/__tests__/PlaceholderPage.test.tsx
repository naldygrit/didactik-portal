import { render, screen } from '@testing-library/react';
import { AdminPlaceholderPage } from '../pages/PlaceholderPage';

describe('AdminPlaceholderPage', () => {
  it('renders the given title as a real heading', () => {
    render(<AdminPlaceholderPage title="Analytics" description="Coming soon" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });
});
