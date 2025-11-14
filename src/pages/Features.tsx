import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import FeaturesDemo from "@/components/FeaturesDemo";
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
        <FeaturesDemo />
      </main>
      <Footer />
    </motion.div>
  );
}
