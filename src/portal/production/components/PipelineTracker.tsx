import type { TitleStatus } from '../../shared/types';

// The editorial pipeline a title moves through, shown as a horizontal stepper.
// `suspended` and `archived` are off-pipeline terminal states; for those we show
// the pipeline up to Active with nothing lit, which reads honestly (the title is
// no longer progressing). Changes Requested lights amber as a hold state.
const STAGES: { key: TitleStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'changes_requested', label: 'Changes Requested' },
  { key: 'approved', label: 'Approved' },
  { key: 'active', label: 'Active' },
];

const BRAND = '#5343fd';
const GREEN = '#16a34a';
const AMBER = '#b45309';
const TRACK = '#e5e7eb';
const MUTED = '#9ca3af';

export function PipelineTracker({ status }: { status: TitleStatus }) {
  const keys = STAGES.map((s) => s.key);
  const currentIdx = keys.indexOf(status);
  const isChanges = status === 'changes_requested';

  return (
    <div className="flex items-center py-4">
      {STAGES.map((stage, i) => {
        const done = currentIdx >= 0 && i < currentIdx && !isChanges;
        const current = stage.key === status;
        const nodeColour = current && isChanges ? AMBER : current ? BRAND : done ? GREEN : TRACK;
        const textColour = current && isChanges ? AMBER : current ? BRAND : done ? GREEN : MUTED;
        const isLast = i === STAGES.length - 1;
        return (
          <div key={stage.key} className="flex items-center" style={{ flex: isLast ? '0 0 auto' : 1 }}>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{
                  background: done ? GREEN : current ? nodeColour : TRACK,
                  border: `2px solid ${nodeColour}`,
                }}
              >
                {done && <span className="text-[10px] font-bold text-white">✓</span>}
                {current && (
                  <span className="h-2 w-2 rounded-full" style={{ background: '#fff' }} />
                )}
              </div>
              <span
                className="whitespace-nowrap text-center text-[10px] font-semibold leading-tight"
                style={{ color: textColour }}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div
                className="mb-3.5 mx-1 h-0.5 flex-1"
                style={{ background: done ? GREEN : TRACK }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
