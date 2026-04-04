import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LogoMarquee from "../components/LogoMarquee";
import SustainabilityStrip from "../components/SustainabilityStrip";
import ImageWithSkeleton from "../components/ImageWithSkeleton";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const values = [
    {
      title: "Preservation",
      description: "Rescue and digitize at-risk film & broadcast archives",
    },
    {
      title: "Knowledge",
      description: "Apply intelligent, culturally-informed cataloging",
    },
    {
      title: "Access",
      description: "Enable discovery, distribution, and new revenue",
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Didactik Media — Securing Africa's Story</title>
        <meta name="description" content="The operating system for Africa's audiovisual heritage. AI-powered archival infrastructure for broadcasters and cultural institutions." />
        <link rel="canonical" href="https://www.didactikmedia.com/" />
      </Helmet>
      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-12 md:py-20 lg:py-32 bg-gradient-to-b from-white to-bg-alt flex items-center"
      >
        <div className="container relative flex items-start">
          <div className="flex-1 max-w-full md:max-w-2xl lg:max-w-3xl relative z-10">
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif font-bold mb-4 md:mb-6 leading-tight"
            >
              Securing <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
                Africa's Story.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-3 md:mb-4 max-w-full md:max-w-3xl leading-relaxed"
            >
              The operating system for Africa's audiovisual heritage. We
              preserve, catalog, and activate the continent's film and broadcast
              archives with AI-powered infrastructure - building essential
              systems for the creative economy.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-gray-500 mb-6 md:mb-8 font-semibold italic"
            >
              Powering archival infrastructure for:
            </motion.p>

            <motion.div variants={itemVariants} className="mb-6 md:mb-8 w-full">
              <LogoMarquee />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 mb-8 md:mb-10"
            >
              <Link to="/our-work" className="cta-button">
                Learn About Our Work
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-6 sm:gap-8 md:gap-12 pt-6 md:pt-8 border-t border-gray-200"
            >
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-1 md:mb-2">
                  100+
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Hours Preserved
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-1 md:mb-2">
                  15+
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Institutional Clients
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-1 md:mb-2">
                  100%
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Broadcast-Ready
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 5 }}
            animate={{ opacity: 0.12, x: 0, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 lg:inset-auto lg:right-0 lg:top-1/2 lg:-translate-y-1/2 z-0 lg:w-[60%] flex items-center justify-center lg:justify-end pointer-events-none"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-[80%] max-w-xs sm:max-w-sm md:max-w-md lg:w-full lg:max-w-none"
            >
              <ImageWithSkeleton
                src="/images/film-reel-hero.webp"
                alt="Vintage film reel artistic illustration"
                className="w-full h-auto object-contain opacity-100 lg:opacity-100 drop-shadow-2xl lg:ml-auto"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Value Propositions */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="card hover:border-primary/20"
              >
                <h3 className="text-2xl font-serif font-semibold mb-4 text-primary">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Strip */}
      <SustainabilityStrip />

      {/* Featured In The News */}
      <section className="py-16 bg-bg-alt">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-1/2"
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                <ImageWithSkeleton
                  src="/images/guardian-feature.png"
                  alt="Didactik Media featured in The Guardian"
                  className="w-full h-auto object-cover"
                  skeletonClassName="rounded-xl"
                />
              </div>
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full md:w-1/2"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase">
                  Featured Story
                </span>
                <span className="text-gray-400 text-sm">|</span>
                <span className="text-gray-500 font-serif italic">
                  The Guardian
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-primary leading-tight">
                Preserving Nigeria's Cultural Legacy
              </h2>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Read about our vision and impact in this feature by The
                Guardian, highlighting Didactik Media's commitment to securing
                the nation's audiovisual heritage for future generations.
              </p>

              <a
                href="https://guardian.ng/art/preserving-nigerias-cultural-legacy-vision-impact-of-didactik-media/"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button inline-flex items-center gap-2"
              >
                Read Full Article
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
