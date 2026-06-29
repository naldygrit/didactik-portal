import '../admin.css';

// Honest "in development" surface for admin sections whose data/flows are
// specified but not yet built (assets QC, analytics, storage, event log). Mirrors
// the reference, which stubs these rather than faking content.
export function AdminPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">{title}</div>
        <div className="page-sub">{description}</div>
      </div>
      <div className="placeholder-box">
        This section is in development. The schema and flows are specified; the view
        lights up once the backend exposes the data.
      </div>
    </div>
  );
}
