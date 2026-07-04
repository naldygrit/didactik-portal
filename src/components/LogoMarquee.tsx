import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const logos = [
  {
    name: "Africa Magic",
    src: "/images/africa-magic-logo.svg",
    className: "h-12 w-auto object-contain",
  },
  {
    name: "Showmax",
    src: "/images/showmax-logo-vector.svg",
    className: "h-20 w-auto object-contain",
  },
  {
    name: "Prime Video",
    src: "/images/Prime_Video-Logo.wine.svg",
    className: "h-24 w-auto object-contain",
  },
];

// Duplicate the logos array multiple times to ensure seamless looping
const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

export default function LogoMarquee() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  // Runs only when the OS doesn't already prefer reduced motion and the user
  // hasn't paused it — WCAG 2.2.2 (Pause, Stop, Hide) requires an actual
  // control for content that auto-updates indefinitely, not just a
  // reduced-motion fallback.
  const animating = !reduce && !paused;

  return (
    <div className="w-full overflow-hidden mb-10 py-4 relative">
      {!reduce && (
        <div className="flex justify-end px-4 pb-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            {paused ? "Play logo scroll" : "Pause logo scroll"}
          </button>
        </div>
      )}
      <motion.div
        className="flex gap-16 items-center flex-nowrap w-max"
        animate={animating ? { x: [0, "-50%"] } : undefined}
        transition={
          animating
            ? {
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }
            : undefined
        }
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            // Only the first, non-duplicated set is announced — the other
            // three copies exist purely for the seamless loop illusion.
            aria-hidden={index >= logos.length}
            className="flex items-center justify-center min-w-[150px] opacity-70 hover:opacity-100 transition-opacity duration-300 "
          >
            <img src={logo.src} alt={logo.name} className={logo.className} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
