import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";

const Index = () => {
  useEffect(() => {
    // Always set dark mode
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
