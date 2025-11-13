import { Button } from "./ui/button";
import { Zap, Figma, Github } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-surface-elevated">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Announcement banner */}
        <div className="flex justify-center mb-12 fade-in">
          <a
            href="#v2"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-elevated border border-border text-sm font-medium hover:bg-surface-overlay transition-all hover:scale-[1.02] duration-base"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span>Introducing Bolt V2</span>
          </a>
        </div>

        {/* Main headline */}
        <div className="text-center max-w-5xl mx-auto space-y-6 rise-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            What will you{" "}
            <span className="text-primary">build</span>{" "}
            today?
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Create stunning apps & websites by chatting with AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 rise-in-delay-1">
            <Button variant="outline" size="lg" className="min-w-[140px]">
              Sign in
            </Button>
            <Button size="lg" className="min-w-[140px] bg-primary hover:bg-primary/90 shadow-glow">
              Get started
            </Button>
          </div>

          {/* Import options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 rise-in-delay-2">
            <span className="text-sm text-muted-foreground">or import from</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hover-lift hover:border-primary/50"
              >
                <Figma className="w-4 h-4 mr-2" />
                Figma
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover-lift hover:border-primary/50"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 text-center rise-in-delay-2">
          <p className="text-sm text-muted-foreground mb-4">
            The #1 professional AI coding tool trusted by builders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Clear", "Update", "Plan", "Build now"].map((chip) => (
              <span
                key={chip}
                className="px-4 py-2 rounded-full bg-surface-elevated border border-border text-sm font-medium hover:scale-[1.02] hover:shadow-md transition-all duration-base cursor-default"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
