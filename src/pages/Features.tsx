import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";
import { FeaturesSectionWithBentoGrid } from "@/components/ui/feature-section-with-bento-grid";

export default function Features() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />
        <FeaturesSectionWithBentoGrid />
        <Footer />
      </div>
    </div>
  );
}
