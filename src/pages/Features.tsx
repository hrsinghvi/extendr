import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";
import { FeaturesSectionWithBentoGrid } from "@/components/ui/feature-section-with-bento-grid";
import { SEO } from "@/components/SEO";

export default function Features() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <SEO
        title="Features"
        description="Explore Extendr's AI-powered features: natural language to Chrome extension, live preview, Manifest V3 support, multi-model AI, and one-click download."
        path="/features"
      />
      <GradientBackground />
      <div className="relative z-10">
        <Header />
        <FeaturesSectionWithBentoGrid />
        <Footer />
      </div>
    </div>
  );
}
