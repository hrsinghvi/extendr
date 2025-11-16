import React from "react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { useRef } from "react";

export function FeaturesSectionWithBentoGrid() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <div
      className="px-4 pt-20 min-h-screen max-w-7xl mx-auto relative"
      ref={featuresRef}
    >
      <article className="flex sm:flex-row flex-col sm:pb-0 pb-4 sm:items-center items-start justify-between">
        <div className="text-left mb-6">
          <h2 className="text-4xl font-medium leading-[130%] text-foreground mb-4 pt-8">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-start"
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
                delay: 0,
              }}
            >
              Features
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={0}
            timelineRef={featuresRef}
            customVariants={revealVariants}
            className="text-muted-foreground w-[80%]"
          >
            Discover the powerful capabilities that make our platform the perfect choice for your projects.
          </TimelineContent>
        </div>
      </article>

      {/* Bento-style feature grid */}
      {/* Top row – three equal cards */}
      <section className="grid gap-6 md:grid-cols-3 auto-rows-[240px]">
        <div className="rounded-3xl border border-border/80 bg-card/60 shadow-sm backdrop-blur-sm p-6 flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Lightning-fast setup
          </h3>
          <p className="text-sm text-muted-foreground">
            Go from idea to live experience in minutes with opinionated defaults
            and zero-config integrations.
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/60 shadow-sm backdrop-blur-sm p-6 flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            AI-native workflows
          </h3>
          <p className="text-sm text-muted-foreground">
            Orchestrate complex AI flows, prompts, and tools in a way your team
            can actually understand and iterate on.
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/60 shadow-sm backdrop-blur-sm p-6 flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Production-ready by default
          </h3>
          <p className="text-sm text-muted-foreground">
            Built-in analytics, auth-ready patterns, and sensible error
            handling so you can ship with confidence.
          </p>
        </div>
      </section>

      {/* Bottom row – two equal cards */}
      <section className="mt-6 grid gap-6 md:grid-cols-2 auto-rows-[260px]">
        <div className="rounded-3xl border border-border/80 bg-card/60 shadow-sm backdrop-blur-sm p-6 flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Collaborative by design
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Give product, design, and engineering a shared canvas. Edit copy,
            prompts, and flows without touching the core infrastructure.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground/80">
            <span className="px-3 py-1 rounded-full border border-border/70">
              Comment threads
            </span>
            <span className="px-3 py-1 rounded-full border border-border/70">
              Version history
            </span>
            <span className="px-3 py-1 rounded-full border border-border/70">
              Review workflows
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/60 shadow-sm backdrop-blur-sm p-6 flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Scale without friction
          </h3>
          <p className="text-sm text-muted-foreground">
            Horizontally scale requests, cache smartly, and plug into your
            existing observability stack without lock-in.
          </p>
        </div>
      </section>
    </div>
  );
}

