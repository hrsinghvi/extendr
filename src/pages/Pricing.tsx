import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import PricingSection3 from "@/components/ui/pricing-section-3";
import { motion } from "framer-motion";

export default function Pricing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <Header />
      <PricingSection3 />
      <Footer />
    </motion.div>
  );
}
