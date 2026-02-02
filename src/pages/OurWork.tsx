import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function OurWork() {
  const processSteps = [
    {
      number: "01",
      title: "Ingest & Digitize",
      description:
        "We rescue content from tapes, film, and disorganized drives-from Betacam to VHS, we handle all legacy formats.",
    },
    {
      number: "02",
      title: "Catalog & Structure",
      description:
        "We apply our proprietary, culturally-informed metadata taxonomy, making content searchable by people, themes, locations, Nigerian idioms, and more.",
    },
    {
      number: "03",
      title: "Preserve & Secure",
      description:
        "We store master files in secure, managed environments for the long term-preservation-grade digital asset management.",
    },
    {
      number: "04",
      title: "Activate & Distribute",
      description:
        "We provide subtitling, localization, and delivery to help clients monetize their archives on platforms like Netflix, Amazon Prime, and Showmax.",
    },
  ];

  const services = [
    {
      title: "Archival Audits",
      description: "Assess your content library and preservation needs",
    },
    {
      title: "Full Digitization",
      description: "Legacy format rescue (Betacam, U-matic, VHS, film)",
    },
    {
      title: "Metadata & Cataloging",
      description: "Culturally-informed, searchable taxonomy",
    },
    {
      title: "Subtitling & Localization",
      description: "Multi-language, platform-compliant subtitles",
    },
    {
      title: "Digital Asset Management",
      description: "Secure storage, access control, rights management",
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-bg-alt to-white">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold mb-4 max-w-3xl"
          >
            From Chaos to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
              Cultural Capital.
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="space-y-10">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row items-start gap-6"
              >
                <div className="text-6xl md:text-8xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20 bg-clip-text font-serif leading-none">
                  {step.number}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-3xl font-serif font-semibold mb-2 text-primary">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-bg-alt">
        <div className="container">
          <h2 className="text-4xl font-serif font-bold mb-8 text-primary">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card hover:border-secondary/20"
              >
                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/impact" className="cta-button">
              See Our Impact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
