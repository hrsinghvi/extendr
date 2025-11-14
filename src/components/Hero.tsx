import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Paperclip } from "lucide-react";
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium backdrop-blur-sm">
            <span className="text-white/70">Introducing Bolt V2</span>
          </div>
        </div>

        {/* Main headline */}
        <div className="text-center max-w-5xl mx-auto space-y-6 rise-in mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            What will you{" "}
            <span className="relative inline-block min-w-[180px] sm:min-w-[240px] lg:min-w-[320px] h-[1.2em]">
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute left-0 right-0 text-center text-primary font-bold"
                  initial={{ opacity: 0, y: 100 }}
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
          
          <p className="text-xl sm:text-2xl text-white/75 max-w-3xl mx-auto">
            Create stunning apps & websites by chatting with AI.
          </p>
        </div>

        {/* Large Chat Box */}
        <div className="max-w-3xl mx-auto mb-8 rise-in-delay-1">
          <div className="bg-surface-elevated border-2 border-border rounded-2xl shadow-lg overflow-hidden">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Let's build a dashboard..."
              className="min-h-[120px] bg-surface-elevated border-0 text-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-6"
            />
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="p-2">
                  <Paperclip className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Build now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Import options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 rise-in-delay-2">
          <span className="text-sm text-white/60">or import from</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hover-lift hover:border-primary/50 border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            >
              Figma
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover-lift hover:border-primary/50 border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            >
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
