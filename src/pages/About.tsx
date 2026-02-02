import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function About() {
  const values = [
    {
      title: "Truth",
      description: "Commitment to accurate preservation",
    },
    {
      title: "Stewardship",
      description: "Responsible guardianship of cultural assets",
    },
    {
      title: "Innovation",
      description: "Applying modern technology to heritage",
    },
    {
      title: "Impact",
      description: "Measurable cultural and economic outcomes",
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="pt-20 pb-10 bg-gradient-to-b from-bg-alt to-white">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold -mb-2"
          >
            Architects of{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
              Memory.
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="pt-10 pb-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-serif font-bold mb-8">
              Founder's Note
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Founder Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img
                  src="/images/emem.png"
                  alt="Ememobong Attah, Founder & CEO"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </motion.div>

              {/* Founder's Note Text */}
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  I have always been interested in how stories shape power - who
                  gets remembered, who gets believed, and who gets written out.
                  Trained as a lawyer and shaped by years working in television
                  production, I saw firsthand how culture, media, and policy
                  intersect, often invisibly. While working on major African
                  television productions, I became increasingly aware of how
                  much of our history, creative labour, and national memory was
                  undocumented, poorly preserved, or lost entirely. That gap
                  stayed with me.
                </p>
                <p>
                  After leaving production, I founded Didactik Media to respond
                  to that absence. What began as a practical solution to
                  archiving and documentation has grown into a broader
                  commitment to preserving stories with integrity - from film
                  and television to cultural dialogue and institutional memory.
                </p>
                <p className="italic text-gray-600">
                  — Ememobong Attah, Founder & CEO
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-bg-alt">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-serif font-bold mb-8 text-center">
              Our Story
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Didactik Media was founded to address a critical gap in Africa's
                creative economy: the systematic loss of audiovisual heritage.
                We recognized that without proper archival infrastructure,
                decades of cultural production were disappearing—taking with
                them not just content, but the raw material for future
                creativity, research, and economic opportunity.
              </p>
              <p>
                Today, we work with broadcasters, production companies, and
                cultural institutions across Africa to preserve, document, and
                activate their archives. Our approach combines technical
                expertise with deep respect for the cultural significance of the
                material we handle.
              </p>
              <p>
                We believe that preserving Africa's audiovisual heritage is not
                just about looking backward—it's about building the foundation
                for a thriving creative economy that can compete globally while
                remaining rooted in authentic African narratives.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <h3 className="text-2xl font-serif font-semibold mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/contact" className="cta-button">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
