import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface TeamMember {
  name: string;
  role: string;
  credential?: string;
  achievement: string;
  photo?: string;
}

const teamData: TeamMember[] = [
  {
    name: "Ememobong Attah",
    role: "Founder & CEO",
    credential: "LL.B Law, Babcock University",
    achievement:
      "Secured 15+ institutional clients including Africa Magic and Amazon Prime",
    photo: "/images/team/emem.jpg",
  },
  {
    name: "Aderonke Awolaja",
    role: "Archivist & Process Coordinator",
    credential: "B.A., Ekiti State University",
    achievement: "Manages 30% of active projects with 99.5% on-time delivery",
  },
  {
    name: "Daphne Soyinka",
    role: "Archivist & Client Relations Lead",
    credential: "B.A., Federal University of Agriculture, Abeokuta",
    achievement: "100% client retention across portfolio",
  },
  {
    name: "Tamaraebiekiye Bestman",
    role: "Archivist & Institutional Liaison",
    credential: "LL.B Law, Babcock University",
    achievement:
      "Leading government partnerships with NCAC and National Archives",
  },
];

export default function TeamTree() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-bg-alt">
      <div className="container">
        <h2 className="text-4xl font-serif font-bold mb-16 text-center">
          Our Team
        </h2>

        <div className="relative min-h-[700px] md:min-h-[600px]">
          {/* Founder Node */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-xl shadow-lg z-10 max-w-2xl w-full"
          >
            <div className="w-32 h-32 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-white text-4xl font-serif font-bold">
              EA
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-serif font-semibold mb-1">
                {teamData[0].name}
              </h3>
              <p className="text-gray-600 mb-2">{teamData[0].role}</p>
              <p className="text-sm text-gray-500 mb-1">
                {teamData[0].credential}
              </p>
              <p className="text-sm font-medium text-gray-700">
                {teamData[0].achievement}
              </p>
            </div>
          </motion.div>

          {/* Connection Lines (SVG) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid meet"
          >
            <motion.path
              d="M400,150 L200,450"
              stroke="#e5e5e5"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isInView
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{ delay: 0.3, duration: 1, ease: "easeInOut" }}
            />
            <motion.path
              d="M400,150 L400,450"
              stroke="#e5e5e5"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isInView
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
            />
            <motion.path
              d="M400,150 L600,450"
              stroke="#e5e5e5"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isInView
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{ delay: 0.7, duration: 1, ease: "easeInOut" }}
            />
          </svg>

          {/* Team Branches */}
          <div className="absolute bottom-0 left-0 right-0 grid grid-cols-1 md:grid-cols-3 gap-6 mt-96 md:mt-0">
            {teamData.slice(1).map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{
                  delay: 1.2 + index * 0.15,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <h4 className="text-lg font-semibold mb-2">{member.name}</h4>
                <p className="text-sm text-gray-600 mb-1">{member.role}</p>
                <p className="text-xs text-gray-500 mb-2">
                  {member.credential}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {member.achievement}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
