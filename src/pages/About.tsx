import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Link } from "react-router-dom";
import TeamTree from "../components/TeamTree";

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
      <section className="py-24 bg-gradient-to-b from-bg-alt to-white">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold mb-6"
          >
            Architects of Memory.
          </motion.h1>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="py-24 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-serif font-bold mb-8">
              Founder's Note
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                I have always been interested in how stories shape power — who
                gets remembered, who gets believed, and who gets written out.
                Trained as a lawyer and shaped by years working in television
                production, I saw firsthand how culture, media, and policy
                intersect, often invisibly. While working on major African
                television productions, I became increasingly aware of how much
                of our history, creative labour, and national memory was
                undocumented, poorly preserved, or lost entirely. That gap
                stayed with me.
              </p>
              <p>
                After leaving production, I founded Didactik Media to respond to
                that absence. What began as a practical solution to archiving
                and documentation has grown into a broader commitment to
                preserving stories with integrity — from film and television to
                cultural dialogue and institutional memory.
              </p>
              <p className="italic text-gray-600">
                — Ememobong Attah, Founder & CEO
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Tree */}
      <TeamTree />

      {/* Core Values */}
      <section className="py-24 bg-white">
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
