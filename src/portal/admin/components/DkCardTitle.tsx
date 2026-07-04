import type { CSSProperties, ReactNode } from 'react';

interface DkCardTitleProps {
  children: ReactNode;
  style?: CSSProperties;
}

// One level below the page's <h1>, matching admin.css's existing card-title
// visual style verbatim. Card content underneath a title stays outside this
// component's concern, e.g. the "View all →" card-link stays a sibling. The
// optional style prop exists for the odd call site with a one-off inline
// margin, same reasoning as DkFormMessage's style prop.
export function DkCardTitle({ children, style }: DkCardTitleProps) {
  return (
    <h2 className="card-title" style={style}>
      {children}
    </h2>
  );
}
