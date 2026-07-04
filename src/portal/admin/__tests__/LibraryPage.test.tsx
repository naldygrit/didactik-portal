import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { AdminLibraryPage } from '../pages/LibraryPage';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'admin') ?? null;
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminLibraryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminLibraryPage', () => {
  it('renders a real heading and labeled search/filter controls', async () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Library' })).toBeInTheDocument();
    expect(await screen.findByLabelText('Filter titles, producers')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
  });

  it('labels the table and announces the bulk-selection count as a live status', async () => {
    renderPage();
    const checkbox = await screen.findByLabelText('Select Lagos After Dark');
    expect(screen.getByRole('table', { name: 'Library' })).toBeInTheDocument();

    fireEvent.click(checkbox);
    const bulkBar = screen.getByText('1 selected').closest('[role="status"]');
    expect(bulkBar).toHaveAttribute('aria-live', 'polite');
  });

  it('marks "select all" indeterminate for a partial selection, not just checked/unchecked', async () => {
    renderPage();
    const rowCheckbox = await screen.findByLabelText('Select Lagos After Dark');
    const selectAll = screen.getByLabelText('Select all') as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(false);
    expect(selectAll.checked).toBe(false);

    fireEvent.click(rowCheckbox);
    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll.checked).toBe(false);

    fireEvent.click(selectAll);
    expect(selectAll.indeterminate).toBe(false);
    expect(selectAll.checked).toBe(true);
  });
});
