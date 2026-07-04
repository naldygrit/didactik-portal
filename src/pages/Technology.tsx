import { motion } from "framer-motion";

export default function Technology() {
  return (
    <div>
      {/* Header */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-bg-alt to-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
              Built for{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
                Data Sovereignty
              </span>{" "}
              and Scale
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Enterprise-grade infrastructure designed for African connectivity,
              cultural accuracy, and long-term preservation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Architecture */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl font-serif font-bold mb-6 text-center">
              The Architecture
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              A hybrid-edge approach optimized for African bandwidth realities.
              Masters in the vault, proxies in the cloud.
            </p>

            {/* Architecture Diagram */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 md:p-12 rounded-2xl border-2 border-primary/20 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                    <div aria-hidden="true" className="text-4xl mb-3">📼</div>
                    <h3 className="font-bold text-lg mb-2">Physical Media</h3>
                    <p className="text-sm text-gray-600">
                      Betacam, VHS, Film Reels
                    </p>
                  </div>
                  <div className="text-secondary font-bold">↓</div>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                    <div aria-hidden="true" className="text-4xl mb-3">🗄️</div>
                    <h3 className="font-bold text-lg mb-2">Master Vault</h3>
                    <p className="text-sm text-gray-600">
                      LTO Cold Storage (On-Premise)
                    </p>
                  </div>
                  <div className="text-secondary font-bold">↓</div>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                    <div aria-hidden="true" className="text-4xl mb-3">☁️</div>
                    <h3 className="font-bold text-lg mb-2">Cloud Proxies</h3>
                    <p className="text-sm text-gray-600">
                      Optimized for Access & Distribution
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-bg-alt p-6 rounded-xl">
                <h4 className="font-bold text-lg mb-3 text-primary">
                  Why Hybrid-Edge?
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>Bandwidth-optimized for African connectivity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>Masters remain secure in local vaults</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>Proxies enable global distribution</span>
                  </li>
                </ul>
              </div>

              <div className="bg-bg-alt p-6 rounded-xl">
                <h4 className="font-bold text-lg mb-3 text-primary">
                  Data Sovereignty
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>NDPR compliant infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>African data stays on African servers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">✓</span>
                    <span>Full client ownership of master files</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Philosophy */}
      <section className="py-16 md:py-24 bg-bg-alt">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl font-serif font-bold mb-6 text-center">
              Human-in-the-Loop AI
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              We combine Whisper's speech-to-text with expert Nigerian
              archivists to ensure 100% cultural accuracy.
            </p>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-primary">
                    The Problem
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Western AI models fail to recognize Nigerian languages,
                    cultural contexts, and regional dialects. Automated
                    transcription of Yoruba, Igbo, or Pidgin English produces
                    unusable results.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-secondary">
                    Our Solution
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    AI provides the first pass. Nigerian archivists with deep
                    cultural knowledge verify, correct, and enrich the metadata.
                    This ensures accuracy while maintaining efficiency.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
                <h4 className="font-bold text-lg mb-3">The Workflow</h4>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg shadow-md mb-2">
                      <span aria-hidden="true" className="text-2xl">🤖</span>
                    </div>
                    <p className="text-sm font-medium">AI Transcription</p>
                  </div>
                  <div className="text-2xl text-secondary">→</div>
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg shadow-md mb-2">
                      <span aria-hidden="true" className="text-2xl">👤</span>
                    </div>
                    <p className="text-sm font-medium">Human Verification</p>
                  </div>
                  <div className="text-2xl text-secondary">→</div>
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg shadow-md mb-2">
                      <span aria-hidden="true" className="text-2xl">✅</span>
                    </div>
                    <p className="text-sm font-medium">Cultural Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Moat: African Cultural Taxonomy */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl font-serif font-bold mb-6 text-center">
              The Moat:{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
                African Cultural Taxonomy
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              A proprietary metadata framework built for African content.
              Western taxonomies fail to capture our cultural nuances.
            </p>

            {/* Example Frame */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-2xl border-2 border-primary/20 mb-8">
              <h3 className="text-xl font-bold mb-6 text-center">
                Example: Nollywood Scene Metadata
              </h3>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-3 text-primary">
                      Cultural Context
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <span className="font-semibold">Language:</span> Yoruba
                        (Lagos dialect)
                      </li>
                      <li>
                        <span className="font-semibold">Event Type:</span>{" "}
                        Owambe (celebration)
                      </li>
                      <li>
                        <span className="font-semibold">Cultural Markers:</span>{" "}
                        Aso-ebi, Gele, Spraying
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3 text-secondary">
                      Technical Metadata
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <span className="font-semibold">Era:</span> 1990s
                        Fashion
                      </li>
                      <li>
                        <span className="font-semibold">Location:</span> Lagos,
                        Nigeria
                      </li>
                      <li>
                        <span className="font-semibold">Genre:</span> Social
                        Drama
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
                This level of cultural specificity is impossible with generic
                metadata standards. Our taxonomy is the result of years of
                archival work with Nigerian content creators and cultural
                experts.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 md:py-24 bg-bg-alt">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl font-serif font-bold mb-12 text-center">
              Security & Compliance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Compliance Standards */}
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-primary">
                  Standards & Frameworks
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="text-2xl">🔒</span>
                    <div>
                      <h4 className="font-bold">NDPR Compliant</h4>
                      <p className="text-sm text-gray-600">
                        Nigeria Data Protection Regulation
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <h4 className="font-bold">OAIS Framework</h4>
                      <p className="text-sm text-gray-600">
                        Open Archival Information System
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h4 className="font-bold">Dublin Core Standards</h4>
                      <p className="text-sm text-gray-600">
                        International metadata standards
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Security Measures */}
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-secondary">
                  Security Measures
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="text-2xl">🔐</span>
                    <div>
                      <h4 className="font-bold">End-to-End Encryption</h4>
                      <p className="text-sm text-gray-600">
                        AES-256 encryption for all data
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <h4 className="font-bold">Access Controls</h4>
                      <p className="text-sm text-gray-600">
                        Role-based permissions & audit logs
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">💾</span>
                    <div>
                      <h4 className="font-bold">Redundant Backups</h4>
                      <p className="text-sm text-gray-600">
                        3-2-1 backup strategy with geographic distribution
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
