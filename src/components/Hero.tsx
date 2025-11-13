import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Zap, Plus, Sparkles, Github, Figma } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { motion } from "framer-motion";
import { ShaderBackground } from "./ui/neural-network-hero";

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["build", "create", "design", "launch", "ship"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Neural Network Background */}
      <ShaderBackground />
      
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
        <div className="text-center max-w-5xl mx-auto space-y-6 rise-in mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            What will you{" "}
            <span className="relative inline-flex justify-center overflow-hidden">
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute text-primary font-bold"
                  initial={{ opacity: 0, y: -100 }}
                  transition={{ type: "spring", stiffness: 50 }}
                  animate={
                    titleNumber === index
                      ? {
                          y: 0,
                          opacity: 1,
                        }
                      : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0,
                        }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>{" "}
            today?
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Create stunning apps & websites by chatting with AI.
          </p>
        </div>

        {/* Large Chat Box */}
        <div className="max-w-3xl mx-auto mb-8 rise-in-delay-1">
          <div className="bg-surface-elevated border border-border rounded-2xl shadow-lg overflow-hidden">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Let's build a dashboard..."
              className="min-h-[120px] bg-surface-elevated border-0 text-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex items-center justify-between p-4 border-t border-border bg-surface">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Claude Agent</span>
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  <span className="mr-2">💡</span>
                  Plan
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Build now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Import options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 rise-in-delay-2">
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
    </section>
  );
}
