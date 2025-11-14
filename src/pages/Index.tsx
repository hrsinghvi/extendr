import { Navbar1 } from "@/components/ui/navbar-1";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <Navbar1 />
      <main>
        <Hero />
      </main>
      <Footer />
    </motion.div>
  );
};

export default Index;
