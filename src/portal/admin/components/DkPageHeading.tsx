interface DkPageHeadingProps {
  title: string;
  subtitle?: string;
}

// HeroUI's Typography lets a heading keep one visual style while choosing
// its own semantic level ("H1 visual style while maintaining an H2 semantic
// element"). Same idea here in reverse: keep admin.css's page-title/page-sub
// classes (and their exact visual output) unchanged, but render a real <h1>
// so screen-reader heading navigation works across the admin console.
export function DkPageHeading({ title, subtitle }: DkPageHeadingProps) {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-sub">{subtitle}</p>}
    </div>
  );
}
