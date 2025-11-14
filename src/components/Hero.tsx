import { useState } from "react";
import { Button } from "./ui/button";
import { Paperclip } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { MorphingText } from "./ui/morphing-text";
import AnimatedGradientBackground from "./ui/animated-gradient-background";

export function Hero() {
  const [prompt, setPrompt] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated gradient background */}
      <AnimatedGradientBackground 
        Breathing={true}
        startingGap={125}
        breathingRange={5}
        animationSpeed={0.02}
      />
      
      {/* Noise grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Main headline */}
        <div className="text-center max-w-5xl mx-auto space-y-6 rise-in mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black">
            What will you{" "}
            <MorphingText
              words={["build", "create", "design", "develop", "launch"]}
              className="text-5xl sm:text-6xl lg:text-7xl"
            />
            ?
          </h1>

          <p className="text-xl sm:text-2xl text-white max-w-3xl mx-auto">
            Create stunning apps & websites by chatting with AI.
          </p>
        </div>

        {/* Large Chat Box */}
        <div className="max-w-3xl mx-auto mb-8 rise-in-delay-1">
          <div className="bg-white border-2 border-border rounded-2xl shadow-lg overflow-hidden">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Let's build a dashboard..."
              className="min-h-[120px] bg-white text-black border-0 text-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-6 placeholder:text-gray-500"
            />
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-white">
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
          <span className="text-sm text-white">or import from</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hover-lift bg-white text-black border-white hover:bg-white/90">
              Figma
            </Button>
            <Button variant="outline" size="sm" className="hover-lift bg-white text-black border-white hover:bg-white/90">
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
