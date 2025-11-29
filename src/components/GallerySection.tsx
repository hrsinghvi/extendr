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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/database";
import { useAuth } from "@/context/AuthContext";
import { notifyError } from "@/core/errorBus";

export function GallerySection() {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProjects = async () => {
      if (!isAuthenticated || !user?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user!.id);
        if (error) throw error;
        if (mounted) setProjects(data as Project[]);
      } catch (err: any) {
        notifyError({ title: "Load projects", description: err?.message, variant: "destructive" });
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProjects();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.id]);

  if (loading) {
    return (
      <section className="py-24 bg-surface-elevated" id="gallery">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Loading projects…</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-surface-elevated" id="gallery">
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

        {/* Gallery grid (real data from MCP) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <Card
              key={project.id ?? project.title}
              className="group relative overflow-hidden border border-border bg-card hover-lift hover:shadow-lg transition-all duration-base cursor-pointer"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="aspect-square flex flex-col items-center justify-center p-6 space-y-4">
                <div className={`p-4 rounded-xl bg-surface-elevated group-hover:scale-110 transition-transform duration-base`} style={{ color: "#fff" }}>
                  {/* Display a simple icon placeholder if none exists in data */}
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-center">{project.title ?? "Untitled"}</h3>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-base flex items-end justify-center p-4">
                <span className="text-xs text-primary font-medium">View</span>
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
