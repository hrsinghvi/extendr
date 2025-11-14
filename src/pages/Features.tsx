import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturesSectionWithBentoGrid } from "@/components/ui/feature-section-with-bento-grid";
import { motion } from "framer-motion";

export default function Features() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <Header />
      <main className="pt-32 pb-20">
        <FeaturesSectionWithBentoGrid />
      </main>
      <Footer />
    </motion.div>
  );
}
