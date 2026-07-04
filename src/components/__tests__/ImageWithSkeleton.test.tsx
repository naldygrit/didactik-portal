import { render, screen, fireEvent } from '@testing-library/react';
import ImageWithSkeleton from '../ImageWithSkeleton';

describe('ImageWithSkeleton', () => {
  it('announces the loading skeleton to assistive tech and respects reduced motion', () => {
    render(<ImageWithSkeleton src="/photo.jpg" alt="A photo" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading image');
    expect(status.className).toContain('motion-reduce:animate-none');
  });

  it('announces a load failure as an alert', () => {
    render(<ImageWithSkeleton src="/broken.jpg" alt="A photo" />);
    fireEvent.error(screen.getByAltText('A photo'));
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load image');
  });
});
