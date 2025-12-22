import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";
import PricingSection3 from "@/components/ui/pricing-section-3";

export default function Pricing() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />
        <PricingSection3 />
        <Footer />
      </div>
    </div>
  );
}
