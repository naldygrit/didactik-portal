import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface TeamMember {
  name: string;
  role: string;
  credential?: string;
  photo?: string;
}

const teamData: TeamMember[] = [
  {
    name: "Ememobong Attah",
    role: "Founder & CEO",
    credential:
      "LL.B Law, Babcock University | IP & Media Strategist | CP Innovate Grant 2024",
    photo: "/images/team/founder-img-1.jpeg",
  },
  {
    name: "Aderonke Awolaja",
    role: "Archivist & Process Coordinator",
    credential: "B.A., Ekiti State University",
  },
  {
    name: "Daphne Soyinka",
    role: "Archivist & Client Relations Lead",
    credential: "B.A., Federal University of Agriculture, Abeokuta",
  },
  {
    name: "Tamaraebiekiye Bestman",
    role: "Archivist & Institutional Liaison",
    credential: "LL.B Law, Babcock University",
  },
];

export default function TeamTree() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-12 bg-bg-alt">
      <div className="container">
        <h2 className="text-4xl font-serif font-bold mb-8 text-center">
          Our Team
        </h2>

        <div>
          {/* Founder Node */}
          <div className="flex justify-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-2xl shadow-xl z-10 max-w-4xl w-full border border-gray-100"
            >
              <img
                src="/images/founder-img-1.jpeg"
                alt={teamData[0].name}
                className="w-40 h-40 rounded-full object-cover flex-shrink-0 border-4 border-secondary shadow-md"
              />
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-serif font-bold mb-2 text-gray-900">
                  {teamData[0].name}
                </h3>
                <p className="text-xl text-primary font-medium mb-3">
                  {teamData[0].role}
                </p>
                <p className="text-base text-gray-600 font-medium">
                  {teamData[0].credential}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamData.slice(1).map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{
                  delay: 0.2 + index * 0.15,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h4 className="text-xl font-bold mb-2 text-gray-900">
                  {member.name}
                </h4>
                <p className="text-primary font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600 font-medium">
                  {member.credential}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
