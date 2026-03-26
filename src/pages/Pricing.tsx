import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";
import PricingSection3 from "@/components/ui/pricing-section-3";
import { SEO } from "@/components/SEO";

export default function Pricing() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <SEO
        title="Pricing"
        description="Extendr pricing plans. Start free and upgrade for more credits to build Chrome extensions with AI. Simple, transparent pricing."
        path="/pricing"
      />
      <GradientBackground />
      <div className="relative z-10">
        <Header />
        <PricingSection3 />
        <Footer />
      </div>
    </div>
  );
}
