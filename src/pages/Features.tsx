import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Zap, Database, Lock, Rocket } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Build and deploy in minutes, not hours.",
    },
    {
      icon: Database,
      title: "Database Built-in",
      description: "Integrated database with zero configuration.",
    },
    {
      icon: Lock,
      title: "Secure by Default",
      description: "Enterprise-grade security from day one.",
    },
    {
      icon: Rocket,
      title: "Deploy Anywhere",
      description: "One-click deployment to any platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful <span className="text-primary">Features</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build amazing applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-elevated border border-border rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
