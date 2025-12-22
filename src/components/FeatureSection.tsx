import { Code2, Database, Users, Sparkles, Globe, Lock } from "lucide-react";
import { Card } from "./ui/card";

const features = [
  {
    icon: Database,
    title: "Unlimited databases",
    description: "Scale from prototype to production with PostgreSQL databases that grow with you.",
  },
  {
    icon: Lock,
    title: "Enterprise-grade",
    description: "Bank-level security and compliance built in from day one.",
  },
  {
    icon: Users,
    title: "User Management & Authentication",
    description: "Complete auth system with email, social login, and role management.",
  },
  {
    icon: Sparkles,
    title: "SEO optimization",
    description: "Your project ranks from day one with built-in SEO best practices.",
  },
  {
    icon: Globe,
    title: "Hosting with analytics",
    description: "Deploy globally with custom domains and real-time analytics.",
  },
  {
    icon: Code2,
    title: "Edge Functions",
    description: "Serverless backend logic that scales automatically with your traffic.",
  },
];

export function FeatureSection() {
  return (
    <section className="py-24 bg-surface-elevated">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Everything you need to scale. Built in.
          </h2>
          <p className="text-lg text-muted-foreground">
            Stop stitching together platforms. extendr gives you enterprise-grade
            backend infrastructure without the complexity.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="p-6 hover-lift hover:shadow-lg transition-all duration-base border border-border bg-card"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Divider with text */}
        <div className="relative my-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 bg-surface-elevated text-sm text-muted-foreground">
              extendr gives you everything you need inside one familiar interface—no extra accounts, no steep learning curve.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
