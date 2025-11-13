import { Button } from "./ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to build something amazing?
          </h2>
          
          <p className="text-xl text-muted-foreground">
            Try it out and start building for free
          </p>

          {/* Trust chips */}
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

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button variant="outline" size="lg" className="min-w-[140px]">
              Sign in
            </Button>
            <Button size="lg" className="min-w-[140px] bg-primary hover:bg-primary/90 shadow-glow">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
