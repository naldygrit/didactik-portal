import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Impact() {
  return (
    <div>
      {/* Header */}
      <section className="py-24 bg-gradient-to-b from-bg-alt to-white">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold mb-6"
          >
            Why This Matters.
          </motion.h1>
        </div>
      </section>

      {/* Two-Column Impact */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Cultural Imperative */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-serif font-bold mb-6 text-secondary">
                The Cultural Imperative
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Preventing the permanent loss of history—70%+ of pre-2000
                  Nigerian TV content is already gone.
                </p>
                <p>Building a credible record for research and education.</p>
                <p>
                  Safeguarding the narratives that define us for future
                  generations.
                </p>
              </div>
            </motion.div>

            {/* Economic Engine */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-serif font-bold mb-6 text-secondary">
                The Economic Engine
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Transforming cost centers into revenue streams—unlocking
                  billions in creative IP.
                </p>
                <p>
                  Enabling licensing, syndication, and new productions on global
                  platforms.
                </p>
                <p>
                  Professionalizing the creative industry's assets—producers
                  lose 15-30% of potential revenue from inaccessible archives.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Quote */}
      <section className="py-24 bg-bg-alt">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="text-6xl text-secondary mb-6">"</div>
            <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-800 mb-6 leading-relaxed">
              We are not just saving tapes; we are securing the raw material of
              our future.
            </blockquote>
            <p className="text-lg text-gray-600">— Emem Attah, Founder</p>
          </motion.div>

          <div className="mt-16 text-center">
            <Link to="/about" className="cta-button">
              Meet Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
