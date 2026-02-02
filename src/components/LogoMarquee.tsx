import { motion } from "framer-motion";

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
  return (
    <div className="w-full overflow-hidden mb-10 py-4 relative">
      <motion.div
        className="flex gap-16 items-center flex-nowrap w-max"
        animate={{
          x: [0, "-50%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="flex items-center justify-center min-w-[150px] opacity-70 hover:opacity-100 transition-opacity duration-300 "
          >
            <img src={logo.src} alt={logo.name} className={logo.className} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
