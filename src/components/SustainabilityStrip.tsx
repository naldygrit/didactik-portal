import { motion } from "framer-motion";

export default function SustainabilityStrip() {
  return (
    <section
      id="sustainability"
      className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold">
              <span aria-hidden="true" className="text-2xl">🌱</span>
              <span>Climate-Positive Digital Archive</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Decarbonizing African History
          </h2>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
            We are transitioning heritage from high-energy physical vaults to
            efficient digital cold storage - reducing the carbon footprint of
            preservation by over{" "}
            <span className="font-bold text-green-700">90%</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">90%</div>
              <p className="text-gray-600">Carbon Reduction</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">LTO</div>
              <p className="text-gray-600">Cold Storage Technology</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <p className="text-gray-600">Years Archive Lifespan</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
