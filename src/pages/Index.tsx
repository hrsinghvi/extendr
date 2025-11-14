import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const Index = () => {
  useEffect(() => {
    // Initialize theme on mount - default to dark
    const stored = localStorage.getItem("theme");
    const theme = stored || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (!stored) {
      localStorage.setItem("theme", "dark");
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </motion.div>
  );
};

export default Index;
