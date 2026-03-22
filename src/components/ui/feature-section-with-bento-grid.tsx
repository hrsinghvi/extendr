"use client";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Eye,
  Puzzle,
  Download,
  Shield,
  Cpu,
  Layers,
  Wand2,
  Code2,
  Zap,
  MessageSquare,
  FileCode,
} from "lucide-react";

export function FeaturesSectionWithBentoGrid() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bentoInView = useInView(bentoRef, { once: true, margin: "-100px" });
  const spotlightInView = useInView(spotlightRef, { once: true, margin: "-100px" });
  const bottomInView = useInView(bottomRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();

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

  const numberedFeatures = [
    { num: "01", title: "AI Generation", desc: "Describe it, build it" },
    { num: "02", title: "Live Preview", desc: "See changes instantly" },
    { num: "03", title: "Multi-Model", desc: "Choose any AI provider" },
    { num: "04", title: "One-Click Export", desc: "Download & install" },
  ];

  return (
    <div className="relative overflow-x-hidden">
      {/* ─── HERO SECTION ─── */}
      <div
        className="px-4 pt-24 sm:pt-32 lg:pt-44 max-w-7xl mx-auto relative"
        ref={featuresRef}
      >
        <article className="flex xl:flex-row flex-col xl:pb-0 pb-4 xl:items-center items-start justify-between gap-8 xl:gap-12">
          {/* Left: Title & CTA */}
          <div className="text-left mb-6 max-w-xl">
            <div className="mb-4 pt-8">
              <span className="text-primary font-semibold text-sm tracking-widest uppercase">
                Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[120%] text-foreground mb-6">
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
                Build Chrome extensions with the power of AI
              </VerticalCutReveal>
            </h2>

            <TimelineContent
              as="p"
              animationNum={0}
              timelineRef={featuresRef}
              customVariants={revealVariants}
              className="text-muted-foreground text-lg leading-relaxed mb-8"
            >
              From idea to installable extension in minutes. Extendr combines
              15+ specialized AI tools with a live development environment so
              you can create, preview, and ship — all from a single chat.
            </TimelineContent>

            <TimelineContent
              as="div"
              animationNum={1}
              timelineRef={featuresRef}
              customVariants={revealVariants}
            >
              <button
                onClick={() => navigate("/build")}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm tracking-wide uppercase transition-all hover:bg-primary/90 hover:shadow-glow"
              >
                Get Started
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </TimelineContent>
          </div>

          {/* Right: Floating mockup cards */}
          <TimelineContent
            as="div"
            animationNum={1}
            timelineRef={featuresRef}
            customVariants={revealVariants}
            className="flex-1 max-w-lg w-full hidden xl:block"
          >
            <div className="relative mt-8 pr-4">
              {/* Chat message mockup */}
              <motion.div
                className="relative z-10 rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md p-5 shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">You</p>
                    <p className="text-sm text-foreground font-medium">
                      "Build a dark mode toggle extension"
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Extendr AI</p>
                    <div className="mt-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs text-muted-foreground">
                          Creating manifest.json...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                        <span className="text-xs text-muted-foreground">
                          Writing popup.html...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                        <span className="text-xs text-muted-foreground">
                          Generating content script...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* File tree floating card */}
              <motion.div
                className="absolute -bottom-12 right-0 z-20 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm p-4 shadow-lg"
                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Extension Files</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary/60">|--</span> manifest.json
                    <span className="ml-auto text-[10px] text-primary">ready</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary/60">|--</span> popup.html
                    <span className="ml-auto text-[10px] text-primary">ready</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary/60">|--</span> content.js
                    <span className="ml-auto text-[10px] text-yellow-500">building</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary/60">|--</span> styles.css
                    <span className="ml-auto text-[10px] text-muted-foreground/50">queued</span>
                  </div>
                </div>
              </motion.div>

              {/* Status badge */}
              <motion.div
                className="absolute -top-4 left-0 z-20 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.4, type: "spring" }}
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-primary">Manifest V3</span>
              </motion.div>
            </div>
          </TimelineContent>
        </article>

        {/* ─── NUMBERED FEATURES STRIP ─── */}
        <TimelineContent
          as="div"
          animationNum={0}
          timelineRef={featuresRef}
          customVariants={{
            visible: (i: number) => ({
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                delay: i * 0.1,
                duration: 0.3,
              },
            }),
            hidden: {
              filter: "blur(10px)",
              y: -20,
              opacity: 0,
            },
          }}
          className="mt-16 sm:mt-24 lg:mt-32 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl bg-[#0a0e13]/70 backdrop-blur-sm border border-border/30">
            {numberedFeatures.map((feat, i) => {
              // 2-col: items 0,2 get right border; items 0,1 get bottom border
              // 4-col (md+): items 0,1,2 get right border; no bottom borders
              const cls = [
                "py-6 px-4 sm:px-6",
                i % 2 === 0 ? "border-r border-border/30" : "",
                i < 2 ? "border-b border-border/30 md:border-b-0" : "",
                i === 1 || i === 2 ? "md:border-r md:border-border/30" : "",
              ].filter(Boolean).join(" ");
              return (
              <div
                key={feat.num}
                className={cls}
              >
                <div className="border-t border-border/50 pt-4">
                  <span className="text-xs font-mono text-foreground/50 tracking-wider">
                    {feat.num}.
                  </span>
                  <h4 className="text-base font-semibold text-foreground mt-1">
                    {feat.title}
                  </h4>
                  <p className="text-sm text-foreground/60 mt-1">{feat.desc}</p>
                </div>
              </div>
              );
            })}
          </div>
        </TimelineContent>
      </div>

      {/* ─── BENTO GRID SECTION ─── */}
      <div className="px-4 max-w-7xl mx-auto mt-24" ref={bentoRef}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={bentoInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-foreground font-semibold text-sm tracking-widest uppercase">
            Capabilities
          </span>
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Everything you need to build extensions
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: AI-Powered Generation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={bentoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-[#0a0f12] p-8 relative overflow-hidden min-h-[280px] sm:min-h-[340px] flex flex-col"
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <h4 className="text-xl font-semibold text-foreground mb-2 relative z-10">
              AI-Powered Generation
            </h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs relative z-10">
              Describe your extension in plain English. Our AI understands
              context, writes clean code, and handles the entire build pipeline.
            </p>

            {/* Illustration: AI flow diagram */}
            <div className="mt-auto relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  {["manifest.json", "popup.html", "background.js", "content.js", "styles.css"].map((file, i) => (
                    <motion.div
                      key={file}
                      initial={{ x: -20, opacity: 0 }}
                      animate={bentoInView ? { x: 0, opacity: 1 } : {}}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/60 border border-border/30"
                    >
                      <FileCode className="w-3 h-3 text-primary/70" />
                      <span className="text-xs font-mono text-muted-foreground">{file}</span>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-2">
                  {/* Connecting lines */}
                  <svg width="60" height="140" className="text-primary/30">
                    <path d="M0 14 Q30 14 30 35" stroke="currentColor" fill="none" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M0 42 Q30 42 30 55" stroke="currentColor" fill="none" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M0 70 Q30 70 30 70" stroke="currentColor" fill="none" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M0 98 Q30 98 30 85" stroke="currentColor" fill="none" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M0 126 Q30 126 30 105" stroke="currentColor" fill="none" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="30" cy="70" r="18" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/40" />
                    <circle cx="30" cy="70" r="10" fill="currentColor" className="text-primary/20" />
                  </svg>
                  <Cpu className="w-5 h-5 text-primary absolute right-[70px] top-[calc(50%+30px)]" />
                </div>
                <div className="w-20 h-32 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-center">
                  <Puzzle className="w-8 h-8 text-primary/60" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Live Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={bentoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-bl from-card/80 to-[#0a0f12] p-8 relative overflow-hidden min-h-[280px] sm:min-h-[340px] flex flex-col"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

            <h4 className="text-xl font-semibold text-foreground mb-2 relative z-10">
              Real-Time Live Preview
            </h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs relative z-10">
              See your extension come to life as the AI builds it. WebContainer
              technology gives you instant feedback without any setup.
            </p>

            {/* Illustration: Browser mockup */}
            <div className="mt-auto relative z-10">
              <div className="rounded-xl border border-border/40 bg-[#0d1117] overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-surface/40">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-2 px-3 py-1 rounded-md bg-surface/60 text-[10px] font-mono text-muted-foreground/60">
                    chrome-extension://preview
                  </div>
                </div>
                {/* Content area */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                        <Eye className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground">Dark Mode Toggle</span>
                    </div>
                    {/* Toggle */}
                    <div className="w-10 h-5 rounded-full bg-primary/30 relative">
                      <motion.div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-primary"
                        animate={{ left: ["2px", "22px", "2px"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-muted/30 rounded w-full" />
                    <div className="h-2 bg-muted/20 rounded w-3/4" />
                    <div className="h-2 bg-muted/10 rounded w-1/2" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <div className="px-2 py-1 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">
                      Active
                    </div>
                    <div className="px-2 py-1 rounded text-[10px] bg-muted/20 text-muted-foreground border border-border/30">
                      All Sites
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Multi-Model Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={bentoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-tr from-card/80 to-[#0a0f12] p-8 relative overflow-hidden min-h-[280px] sm:min-h-[340px] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <h4 className="text-xl font-semibold text-foreground mb-2 relative z-10">
              Multi-Model AI Support
            </h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs relative z-10">
              Switch between AI providers on-the-fly. Use GPT-4o, Gemini,
              Claude, DeepSeek, or any OpenRouter model — even rotate between
              them automatically.
            </p>

            {/* Illustration: Model cards */}
            <div className="mt-auto relative z-10 space-y-2">
              {[
                { name: "GPT-4o", provider: "OpenAI", active: true },
                { name: "Gemini 2.5 Pro", provider: "Google", active: false },
                { name: "Claude Sonnet", provider: "Anthropic", active: false },
                { name: "DeepSeek V3", provider: "DeepSeek", active: false },
              ].map((model, i) => (
                <motion.div
                  key={model.name}
                  initial={{ x: 20, opacity: 0 }}
                  animate={bentoInView ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                    model.active
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/30 bg-surface/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        model.active
                          ? "bg-primary/20"
                          : "bg-muted/30"
                      }`}
                    >
                      <Cpu className={`w-3.5 h-3.5 ${model.active ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${model.active ? "text-foreground" : "text-muted-foreground"}`}>
                        {model.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">{model.provider}</p>
                    </div>
                  </div>
                  {model.active && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] text-primary font-medium">Active</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card 4: One-Click Export */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={bentoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-tl from-card/80 to-[#0a0f12] p-8 relative overflow-hidden min-h-[280px] sm:min-h-[340px] flex flex-col items-center justify-center text-center"
          >
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <h4 className="text-xl font-semibold text-foreground mb-2 relative z-10">
              One-Click Export & Install
            </h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs relative z-10">
              Download your extension as a ready-to-install ZIP. Load it
              directly into Chrome — no build tools, no terminal, no hassle.
            </p>

            {/* Illustration: Export flow */}
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4">
                {/* Source */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl border border-border/40 bg-surface/40 flex items-center justify-center">
                    <Code2 className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Source</span>
                </div>

                {/* Arrow with animation */}
                <div className="flex flex-col items-center gap-1">
                  <svg width="80" height="24" className="text-primary/50">
                    <motion.line
                      x1="0" y1="12" x2="60" y2="12"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      animate={bentoInView ? { pathLength: 1 } : {}}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    />
                    <polygon points="60,6 72,12 60,18" fill="currentColor" />
                  </svg>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={bentoInView ? { opacity: 1 } : {}}
                    transition={{ delay: 1.2 }}
                    className="text-[9px] text-primary/60 font-mono"
                  >
                    .zip
                  </motion.div>
                </div>

                {/* Chrome icon */}
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    className="w-16 h-16 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={bentoInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 1.0, type: "spring" }}
                  >
                    <Download className="w-7 h-7 text-primary" />
                  </motion.div>
                  <span className="text-[10px] text-primary font-medium">Install</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 mx-auto max-w-xs">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Extension ready</span>
                  <span className="text-primary">100%</span>
                </div>
                <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={bentoInView ? { width: "100%" } : {}}
                    transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── SPOTLIGHT SECTION ─── */}
      <div className="px-4 max-w-7xl mx-auto mt-6" ref={spotlightRef}>
        <div className="rounded-2xl sm:rounded-3xl border border-border/30 bg-gradient-to-r from-card/60 via-[#080c10] to-card/60 p-5 sm:p-8 lg:p-12 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left content */}
            <div className="flex-1 max-w-lg">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={spotlightInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6"
              >
                15+ AI tools working
                <br className="hidden sm:block" />
                {" "}together to build your
                <br className="hidden sm:block" />
                {" "}extension
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={spotlightInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-muted-foreground leading-relaxed mb-8"
              >
                From creating files and writing code to managing dependencies and
                configuring permissions — every aspect of Chrome extension
                development is handled by specialized AI tools that work in
                concert.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={spotlightInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">File Management</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create, edit, and organize all extension files automatically
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wand2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">Smart Scaffolding</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manifest V3 structure generated from your description
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right: Tool grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={spotlightInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex-1 w-full"
            >
              <div className="rounded-2xl border border-border/30 bg-[#0a0e13] p-6 relative overflow-hidden">
                {/* Subtle grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative z-10 grid grid-cols-3 gap-3">
                  {[
                    { icon: FileCode, label: "Create File", color: "text-primary" },
                    { icon: Code2, label: "Write Code", color: "text-primary" },
                    { icon: Eye, label: "Preview", color: "text-brand-blue-light" },
                    { icon: Shield, label: "Permissions", color: "text-primary" },
                    { icon: Puzzle, label: "Manifest", color: "text-brand-blue-light" },
                    { icon: Download, label: "Export", color: "text-primary" },
                    { icon: Zap, label: "Hot Reload", color: "text-brand-blue-light" },
                    { icon: Layers, label: "Dependencies", color: "text-primary" },
                    { icon: Wand2, label: "Refactor", color: "text-brand-blue-light" },
                  ].map((tool, i) => (
                    <motion.div
                      key={tool.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={spotlightInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.3 + i * 0.06, type: "spring" }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/20 bg-surface/20 hover:bg-surface/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface-elevated/60 border border-border/30 flex items-center justify-center">
                        <tool.icon className={`w-5 h-5 ${tool.color}`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium text-center">
                        {tool.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Connection lines overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
                  <line x1="33%" y1="33%" x2="66%" y2="33%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-primary" />
                  <line x1="33%" y1="66%" x2="66%" y2="66%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-primary" />
                  <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-primary" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM FEATURES GRID ─── */}
      <div className="px-4 max-w-7xl mx-auto mt-16 sm:mt-24 lg:mt-32 mb-4" ref={bottomRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={bottomInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-foreground font-semibold text-sm tracking-widest uppercase">
            Why Extendr
          </span>
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Built for speed. Designed for everyone.
          </h3>
        </motion.div>

        {/* Top row: 3 equal columns */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Natural Language Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={bottomInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0, duration: 0.4 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-[#0a0f12] hover:border-border/60 transition-all duration-300 overflow-hidden"
          >
            <div className="h-48 relative bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-6 overflow-hidden">
              {/* Chat bubble illustration */}
              <div className="relative w-full max-w-[220px]">
                <div className="bg-background/60 backdrop-blur border border-border/40 rounded-xl p-3 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">You</span>
                  </div>
                  <p className="text-[10px] text-foreground/80 leading-relaxed">"Build me a dark mode toggle extension"</p>
                </div>
                <div className="bg-primary/10 backdrop-blur border border-primary/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[10px] text-primary font-medium">Extendr AI</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-base font-semibold text-foreground mb-2">Natural Language Input</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Just describe what you want. No coding knowledge required — the AI handles everything from architecture to implementation.</p>
            </div>
          </motion.div>

          {/* Manifest V3 Ready */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={bottomInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-[#0a0f12] hover:border-border/60 transition-all duration-300 overflow-hidden"
          >
            <div className="h-48 relative bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-6 overflow-hidden">
              {/* Shield + manifest illustration */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                {/* Floating badges */}
                <div className="absolute -top-2 -right-12 bg-background/60 backdrop-blur border border-border/40 rounded-lg px-2 py-1 flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary/40 flex items-center justify-center">
                    <svg className="w-2 h-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-[9px] text-foreground/70 font-medium">V3</span>
                </div>
                <div className="absolute -bottom-1 -left-14 bg-background/60 backdrop-blur border border-border/40 rounded-lg px-2 py-1">
                  <span className="text-[9px] text-foreground/70 font-medium">manifest.json</span>
                </div>
                <div className="absolute top-1 -left-16 bg-background/60 backdrop-blur border border-border/40 rounded-lg px-2 py-1 flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary/40 flex items-center justify-center">
                    <svg className="w-2 h-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-[9px] text-foreground/70 font-medium">Compliant</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-base font-semibold text-foreground mb-2">Manifest V3 Ready</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Every extension is built with Chrome's latest Manifest V3 standard. Future-proof and compliant out of the box.</p>
            </div>
          </motion.div>

          {/* Instant WebContainer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={bottomInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.16, duration: 0.4 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-[#0a0f12] hover:border-border/60 transition-all duration-300 overflow-hidden"
          >
            <div className="h-48 relative bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-6 overflow-hidden">
              {/* Terminal/container illustration */}
              <div className="w-full max-w-[220px] bg-background/60 backdrop-blur border border-border/40 rounded-xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30">
                  <div className="w-2 h-2 rounded-full bg-red-400/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <div className="w-2 h-2 rounded-full bg-green-400/60" />
                  <span className="text-[9px] text-muted-foreground ml-2 font-mono">WebContainer</span>
                </div>
                <div className="p-3 font-mono text-[10px] space-y-1.5">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-primary">Ready</span>
                    <span className="text-muted-foreground">in 0.8s</span>
                  </div>
                  <div className="text-foreground/60">├── manifest.json</div>
                  <div className="text-foreground/60">├── popup.html</div>
                  <div className="text-foreground/60">└── content.js</div>
                  <div className="flex items-center gap-1 text-primary/80 mt-1">
                    <span>▶</span>
                    <span>Live preview active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-base font-semibold text-foreground mb-2">Instant WebContainer</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">No local setup needed. Your extension runs in a sandboxed WebContainer for immediate, zero-config previewing.</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom row: 2 wider columns */}
        <div className="grid sm:grid-cols-2 gap-5 mt-5">
          {/* Version History + Export to ZIP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={bottomInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.24, duration: 0.4 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-[#0a0f12] hover:border-border/60 transition-all duration-300 overflow-hidden"
          >
            <div className="h-48 relative bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-6 overflow-hidden">
              {/* Version tree illustration */}
              <div className="relative flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                  <div className="w-px h-8 bg-primary/30" />
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="text-[8px] text-primary font-bold">v3</span>
                  </div>
                  <div className="w-px h-8 bg-primary/20" />
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-[8px] text-primary/60 font-bold">v2</span>
                  </div>
                  <div className="w-px h-6 bg-primary/10" />
                  <div className="w-5 h-5 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
                    <span className="text-[7px] text-primary/40 font-bold">v1</span>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="bg-background/60 backdrop-blur border border-primary/20 rounded-lg px-3 py-1.5">
                    <span className="text-[10px] text-foreground/80 font-medium">Current version</span>
                  </div>
                  <div className="bg-background/40 backdrop-blur border border-border/30 rounded-lg px-3 py-1.5 mt-6">
                    <span className="text-[10px] text-foreground/50">Added popup UI</span>
                  </div>
                  <div className="bg-background/30 backdrop-blur border border-border/20 rounded-lg px-3 py-1.5">
                    <span className="text-[10px] text-foreground/30">Initial scaffold</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-base font-semibold text-foreground mb-2">Version History</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Every iteration is saved. Roll back to any previous version of your extension with a single click.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={bottomInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.32, duration: 0.4 }}
            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-[#0a0f12] hover:border-border/60 transition-all duration-300 overflow-hidden"
          >
            <div className="h-48 relative bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-6 overflow-hidden">
              {/* Model icons illustration */}
              <div className="relative flex items-center gap-3">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-background/60 backdrop-blur border border-border/40 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <Sparkles className="w-6 h-6 text-primary/80" />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium">GPT-4o</span>
                </div>
                <div className="flex flex-col items-center gap-3 -mt-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/15 backdrop-blur border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/5">
                    <Cpu className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-[9px] text-primary font-semibold">Claude</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-background/60 backdrop-blur border border-border/40 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <Wand2 className="w-6 h-6 text-primary/80" />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium">Gemini</span>
                </div>
                {/* Rotation arrows */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <svg width="100" height="24" viewBox="0 0 100 24" fill="none" className="text-primary/30">
                    <defs>
                      <marker id="arrowRight" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0 0 L6 3 L0 6" fill="currentColor" />
                      </marker>
                    </defs>
                    <path d="M15 18 Q50 0 85 18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#arrowRight)" />
                  </svg>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                  <svg width="100" height="24" viewBox="0 0 100 24" fill="none" className="text-primary/30">
                    <defs>
                      <marker id="arrowLeft" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
                        <path d="M6 0 L0 3 L6 6" fill="currentColor" />
                      </marker>
                    </defs>
                    <path d="M85 6 Q50 24 15 6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" fill="none" markerEnd="url(#arrowLeft)" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-base font-semibold text-foreground mb-2">Model Rotation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Automatically cycle between AI models for varied perspectives and optimal results on complex extensions.</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={bottomInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-foreground mb-6">
            Ready to build your first Chrome extension?
          </p>
          <button
            onClick={() => navigate("/pricing")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm tracking-wide uppercase transition-all hover:bg-primary/90 hover:shadow-glow"
          >
            Start Building
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
