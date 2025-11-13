import { Briefcase, Rocket, TrendingUp, Users2, GraduationCap } from "lucide-react";
import { Card } from "./ui/card";

const roles = [
  {
    icon: Briefcase,
    role: "Product managers",
    value: "Go from insight to prototype in hours, not weeks. Validate ideas before committing resources.",
  },
  {
    icon: Rocket,
    role: "Entrepreneurs",
    value: "Launch a full business in days. Build your MVP and start getting feedback from real users.",
  },
  {
    icon: TrendingUp,
    role: "Marketers",
    value: "Spin up high-performing campaign pages without waiting for dev resources.",
  },
  {
    icon: Users2,
    role: "Agencies",
    value: "Multiply your impact. Deliver more client projects in less time with better margins.",
  },
  {
    icon: GraduationCap,
    role: "Students & builders",
    value: "Learn by doing. Build real projects that look great on your portfolio.",
  },
];

export function RolesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Bolt gives you superpowers
          </h2>
          <p className="text-lg text-muted-foreground">
            From idea to live product in record time. Bolt adapts to the way you work,
            amplifying your unique strengths.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {roles.map((role, index) => (
            <Card
              key={role.role}
              className="p-6 hover-lift hover:shadow-lg transition-all duration-base border border-border bg-card group cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <role.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{role.role}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {role.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
