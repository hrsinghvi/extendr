import { useState } from "react";
import { Button } from "./ui/button";
import { Paperclip } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { MorphingText } from "./ui/morphing-text";
import { GradientBackground } from "./ui/gradient-background";
import { motion } from "framer-motion";

export function Hero() {
  const [prompt, setPrompt] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        <GradientBackground />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Main headline */}
        <div className="text-center max-w-5xl mx-auto space-y-6 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
          >
            What will you{" "}
            <MorphingText
              words={["build", "create", "design", "develop", "launch"]}
              className="text-5xl sm:text-6xl lg:text-7xl"
            />
            ?
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto"
          >
            Create stunning apps & websites by chatting with AI.
          </motion.p>
        </div>

        {/* Large Chat Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-3xl mx-auto mb-8"
        >
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
        </motion.div>

        {/* Import options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <span className="text-sm text-muted-foreground">or import from</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hover-lift hover:border-primary/50 text-foreground">
              Figma
            </Button>
            <Button variant="outline" size="sm" className="hover-lift hover:border-primary/50 text-foreground">
              GitHub
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
