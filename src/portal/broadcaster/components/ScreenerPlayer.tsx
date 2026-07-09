import { useState } from 'react';
import { titleBackdropBg } from '../posters';

/**
 * Screener surface for the broadcaster demo. Plays a cleared sample clip at
 * public/screeners/<slug>.mp4 when present; until one is dropped in, it shows a
 * clearly-labelled "Demo screener" slate over the title's gradient — never a
 * broken video. The clip MUST be content you are licensed to use (CC0 / public
 * domain, or partner-cleared with permission) — see public/screeners/README.md.
 */
export function ScreenerPlayer({ slug }: { slug: string }) {
  const [hasClip, setHasClip] = useState(true);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-lg ring-1 ring-white/10"
      style={{ background: titleBackdropBg({ slug }) }}
    >
      {hasClip ? (
        <video
          key={slug}
          src={`/screeners/${slug}.mp4`}
          className="absolute inset-0 h-full w-full bg-black"
          controls
          playsInline
          preload="metadata"
          onError={() => setHasClip(false)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
            <span className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
          </div>
          <p className="text-sm font-medium text-white">Demo screener</p>
          <p className="text-xs text-[var(--muted)]">A cleared sample clip plays here.</p>
        </div>
      )}
      <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
        Demo Screener
      </span>
    </div>
  );
}
