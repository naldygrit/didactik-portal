// A small circular progress ring for a metadata-completeness score (0-100).
// Green at >=75, amber at >=50, red below. Brand violet is reserved for primary
// actions, so the ring keeps the green/amber/red traffic-light reading the
// reference uses. The percent label shares the ring colour.
const GREEN = '#16a34a';
const AMBER = '#b45309';
const RED = '#b91c1c';
const TRACK = '#e5e7eb';

function ringColour(score: number): string {
  if (score >= 75) return GREEN;
  if (score >= 50) return AMBER;
  return RED;
}

export function ScoreRing({ score, size = 32 }: { score: number; size?: number }) {
  const colour = ringColour(score);
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circ;
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={3} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth={3}
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="text-[13px] font-bold tabular-nums" style={{ color: colour }}>
        {score}%
      </span>
    </span>
  );
}
