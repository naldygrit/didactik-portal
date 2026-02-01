import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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
      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen flex items-center bg-gradient-to-b from-white to-bg-alt"
      >
        <div className="container py-20">
          <div className="max-w-4xl">
            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight"
            >
              Securing Africa's Story.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl leading-relaxed"
            >
              Didactik Media preserves, documents, and activates Africa's
              audiovisual heritage. We are building the essential archival
              infrastructure for the continent's creative economy.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-sm text-gray-500 mb-8"
            >
              Trusted by Africa Magic, Showmax & Amazon Prime Video
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link to="/our-work" className="cta-button">
                Learn About Our Work
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-8 text-sm text-gray-600"
            >
              <div>
                <div className="text-3xl font-bold text-secondary mb-1">
                  100+
                </div>
                <div>Hours Preserved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-1">
                  15+
                </div>
                <div>Institutional Clients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-1">
                  100%
                </div>
                <div>Broadcast-Ready</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Value Propositions */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="card"
              >
                <h3 className="text-2xl font-serif font-semibold mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
