import { MorphingText } from "./ui/morphing-text";
import { GradientBackground } from "./ui/gradient-background";
import { motion } from "framer-motion";
import { PromptInputBox } from "./ui/prompt-input-box";
import { Button } from "./ui/button";

export function Hero() {
  const handleSend = (message: string, files?: File[]) => {
    console.log("Message:", message);
    console.log("Files:", files);
  };

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

        {/* AI Prompt Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <PromptInputBox
            onSend={handleSend}
            placeholder="Describe your app idea..."
          />
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
