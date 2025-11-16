import { MorphingText } from "./ui/morphing-text";
import { motion } from "framer-motion";
import { PromptInputBox } from "./ui/prompt-input-box";

export function Hero() {
  const handleSend = (message: string, files?: File[]) => {
    console.log("Message:", message);
    console.log("Files:", files);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050609]">
      {/* Radial gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050609]" />
        <motion.div
          className="absolute bottom-[-300px] left-1/2 -translate-x-1/2 w-[1900px] h-[900px]"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(111,151,179,1.0) 0%, rgba(125,167,194,1.0) 25%, rgba(90,150,101,0.9) 55%, rgba(12,17,17,0) 75%)",
            filter: "blur(45px)",
            opacity: 0.95,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-[-240px] left-1/2 -translate-x-1/2 w-[1200px] h-[620px]"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(152,193,218,1.0) 0%, rgba(111,151,179,0.7) 35%, rgba(90,150,101,0.25) 55%, rgba(90,150,101,0) 70%)",
            filter: "blur(30px)",
            opacity: 0.9,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-35 mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 250 250'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.75'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "260px 260px",
          }}
        />
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
            className="text-xl sm:text-2xl text-white max-w-3xl mx-auto"
          >
            Create custom Chrome extensions in minutes with AI.
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

      </div>
    </section>
  );
}
