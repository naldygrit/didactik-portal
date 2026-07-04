import '../admin.css';
import { DkPageHeading } from '../components/DkPageHeading';

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
      <DkPageHeading title={title} subtitle={description} />
      <div className="placeholder-box">
        This section is in development. The schema and flows are specified; the view
        lights up once the backend exposes the data.
      </div>
    </div>
  );
}
