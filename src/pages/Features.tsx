import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturesSectionWithBentoGrid } from "@/components/ui/feature-section-with-bento-grid";

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FeaturesSectionWithBentoGrid />
      <Footer />
    </div>
  );
}
