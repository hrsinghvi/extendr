import {
  LayoutDashboard,
  Smartphone,
  Briefcase,
  ShoppingCart,
  CheckSquare,
  Settings,
  MessageSquare,
  LineChart,
  FileText,
  Heart,
  Palette,
  BookOpen,
} from "lucide-react";
import { Card } from "./ui/card";

const projects = [
  { icon: LayoutDashboard, title: "Landing page", color: "text-blue-500" },
  { icon: LayoutDashboard, title: "Dashboard", color: "text-purple-500" },
  { icon: Smartphone, title: "Mobile", color: "text-green-500" },
  { icon: Briefcase, title: "Portfolio", color: "text-orange-500" },
  { icon: ShoppingCart, title: "E-commerce", color: "text-pink-500" },
  { icon: CheckSquare, title: "Productivity", color: "text-indigo-500" },
  { icon: Settings, title: "Internal tool", color: "text-cyan-500" },
  { icon: MessageSquare, title: "Community & Social", color: "text-violet-500" },
  { icon: LineChart, title: "Business & Finance", color: "text-emerald-500" },
  { icon: FileText, title: "CRM", color: "text-amber-500" },
  { icon: Heart, title: "Lifestyle", color: "text-rose-500" },
  { icon: Palette, title: "Entertainment", color: "text-fuchsia-500" },
  { icon: Heart, title: "Health & Wellness", color: "text-teal-500" },
  { icon: BookOpen, title: "Education", color: "text-sky-500" },
];

export function GallerySection() {
  return (
    <section className="py-24 bg-surface-elevated">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            You can build literally anything
          </h2>
          <p className="text-lg text-muted-foreground">
            From simple landing pages to complex SaaS applications.
            The only limit is your imagination.
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <Card
              key={project.title}
              className="group relative overflow-hidden border border-border bg-card hover-lift hover:shadow-lg transition-all duration-base cursor-pointer"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="aspect-square flex flex-col items-center justify-center p-6 space-y-4">
                <div className={`p-4 rounded-xl bg-surface-elevated group-hover:scale-110 transition-transform duration-base ${project.color}`}>
                  <project.icon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-center">
                  {project.title}
                </h3>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-base flex items-end justify-center p-4">
                <span className="text-xs text-primary font-medium">View examples →</span>
              </div>
            </Card>
          ))}
        </div>

        {/* See all link */}
        <div className="text-center mt-12">
          <a
            href="#gallery"
            className="inline-flex items-center text-primary font-medium hover:underline underline-offset-4 transition-all"
          >
            See all community projects
          </a>
        </div>
      </div>
    </section>
  );
}
