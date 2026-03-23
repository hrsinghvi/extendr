/**
 * Careers Page
 *
 * Lists job openings at extendr. Currently shows two roles
 * with a notice that there are no active openings.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";
import { ChevronRight, Briefcase, Megaphone, Mail } from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  department: string;
  type: string;
  icon: React.ElementType;
  description: string;
}

const jobs: JobListing[] = [
  {
    id: "junior-engineer",
    title: "Junior Software Engineer",
    department: "Engineering",
    type: "Full-time",
    icon: Briefcase,
    description:
      "Help build and scale the extendr platform. You'll work on our AI-powered Chrome extension builder, contributing to both frontend and backend systems.",
  },
  {
    id: "marketing-ugc",
    title: "Marketing & UGC Creator",
    department: "Marketing",
    type: "Contract",
    icon: Megaphone,
    description:
      "Create engaging user-generated content and marketing materials that showcase what extendr can do. Help grow our community and brand presence.",
  },
];

export default function Careers() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />

        <main className="px-4 pt-24 sm:pt-32 lg:pt-44 min-h-screen max-w-4xl mx-auto relative">
          <div className="text-left mb-8 pt-8">
            <h1 className="text-4xl font-bold leading-[130%] text-white mb-4">
              Careers
            </h1>
            <p className="text-gray-400 text-lg">
              Join us in building the future of browser extension development.
            </p>
          </div>

          <div className="space-y-4 pb-24">
            {jobs.map((job) => (
              <div key={job.id}>
                <button
                  onClick={() =>
                    setSelectedJob(selectedJob === job.id ? null : job.id)
                  }
                  className="w-full text-left border border-border rounded-xl p-6 bg-[#141414] hover:bg-[#1a1a1a] transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <job.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {job.department} · {job.type}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: selectedJob === job.id ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {selectedJob === job.id && (
                    <motion.div
                      key={`${job.id}-details`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 border border-border rounded-xl p-6 bg-[#0e0e0e]">
                        <p className="text-gray-400 mb-6">{job.description}</p>

                        <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4">
                          <p className="text-yellow-400 font-medium mb-2">
                            No openings at this time
                          </p>
                          <p className="text-gray-400 text-sm">
                            We don't have any active openings for this role right
                            now, but we're always looking for talented people. If
                            you're interested in future opportunities, feel free to
                            reach out to us at{" "}
                            <a
                              href="mailto:hi@extendr.dev"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              hi@extendr.dev
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
