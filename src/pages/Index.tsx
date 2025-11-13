import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
