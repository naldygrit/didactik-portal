import { render, screen } from '@testing-library/react';
import TeamTree from '../TeamTree';

describe('TeamTree', () => {
  it('groups the founder and team members as one accessible list', () => {
    render(<TeamTree />);
    const list = screen.getByRole('list', { name: 'Team' });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
    items.forEach((item) => expect(list).toContainElement(item));
  });

  it('gives every person the same heading level, not a founder/team split', () => {
    render(<TeamTree />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Ememobong Attah' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Aderonke Awolaja' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
  });
});
