import type { ReactNode } from 'react';

interface DkCardTitleProps {
  children: ReactNode;
}

// One level below the page's <h1>, matching admin.css's existing card-title
// visual style verbatim. Card content underneath a title stays outside this
// component's concern, e.g. the "View all →" card-link stays a sibling.
export function DkCardTitle({ children }: DkCardTitleProps) {
  return <h2 className="card-title">{children}</h2>;
}
