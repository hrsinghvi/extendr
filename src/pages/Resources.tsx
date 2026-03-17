import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles,
  Rocket,
  MessageSquare,
  FileCode,
  Layers,
  Shield,
  Zap,
  Download,
  Cpu,
  Puzzle,
  Eye,
  Code2,
  Wand2,
  BookOpen,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  Search,
  ArrowRight,
  Settings,
  RefreshCw,
  PenTool,
  Terminal,
  Globe,
  Lock,
  FolderOpen,
  ChevronDown,
} from "lucide-react";

/* ─── DATA ─── */

const quickStartSteps = [
  {
    step: "01",
    title: "Sign Up & Choose a Plan",
    desc: "Create your account and pick a plan that fits your needs. Free tier available to get started.",
    icon: Rocket,
  },
  {
    step: "02",
    title: "Describe Your Extension",
    desc: "Tell the AI what Chrome extension you want. Use plain English — no coding knowledge required.",
    icon: MessageSquare,
  },
  {
    step: "03",
    title: "Preview & Iterate",
    desc: "Watch your extension come to life in the WebContainer. Chat with AI to refine and adjust.",
    icon: Eye,
  },
  {
    step: "04",
    title: "Export & Install",
    desc: "Download your extension as a ZIP and load it into Chrome. Ready for the Web Store or personal use.",
    icon: Download,
  },
];

const guides = [
  {
    category: "Getting Started",
    icon: BookOpen,
    items: [
      {
        title: "Introduction to Extendr",
        desc: "Learn what Extendr is, how it works, and what you can build with it.",
      },
      {
        title: "Quick Start Guide",
        desc: "Build your first Chrome extension in under 5 minutes with step-by-step instructions.",
      },
      {
        title: "Understanding the Builder",
        desc: "A tour of the chat interface, file explorer, and live preview panel.",
      },
    ],
  },
  {
    category: "Working with AI",
    icon: Sparkles,
    items: [
      {
        title: "Writing Effective Prompts",
        desc: "Tips for describing your extension so the AI generates exactly what you need.",
      },
      {
        title: "Multi-Model Support",
        desc: "How to switch between GPT-4o, Claude, Gemini, DeepSeek, and OpenRouter models.",
      },
      {
        title: "Model Rotation",
        desc: "Set up automatic model cycling for varied perspectives on complex extensions.",
      },
    ],
  },
  {
    category: "Building Extensions",
    icon: Puzzle,
    items: [
      {
        title: "Manifest V3 Explained",
        desc: "How Extendr generates compliant Manifest V3 extensions and what that means for you.",
      },
      {
        title: "Extension Permissions",
        desc: "Understanding Chrome extension permissions and how the AI configures them.",
      },
      {
        title: "Content Scripts & Background Workers",
        desc: "How Extendr handles content scripts, service workers, and popup pages.",
      },
    ],
  },
  {
    category: "Managing Projects",
    icon: FolderOpen,
    items: [
      {
        title: "Version History",
        desc: "How to view, compare, and roll back to previous versions of your extension.",
      },
      {
        title: "Exporting Your Extension",
        desc: "Download as ZIP, load into Chrome, or prepare for the Chrome Web Store.",
      },
      {
        title: "Saving & Syncing",
        desc: "How your extension files are automatically saved and synced to your account.",
      },
    ],
  },
];

const faqs = [
  {
    q: "Do I need coding experience to use Extendr?",
    a: "No. Extendr is designed for everyone — from complete beginners to experienced developers. Just describe what you want in plain English and the AI handles the rest.",
  },
  {
    q: "What AI models does Extendr support?",
    a: "Extendr supports GPT-4o, Claude, Gemini, DeepSeek, and any model available through OpenRouter. You can switch models per-message or enable automatic rotation.",
  },
  {
    q: "Are the extensions Manifest V3 compliant?",
    a: "Yes. Every extension built with Extendr uses Chrome's latest Manifest V3 standard, ensuring future compatibility and compliance with Chrome Web Store requirements.",
  },
  {
    q: "Can I edit the generated code?",
    a: "Absolutely. You can view and edit all generated files directly in the builder. The AI can also modify specific files when you ask it to.",
  },
  {
    q: "How does the live preview work?",
    a: "Your extension runs in a sandboxed WebContainer directly in the browser — no local setup needed. Changes appear instantly as the AI generates or modifies files.",
  },
  {
    q: "What happens to my extensions if I cancel my subscription?",
    a: "Your extensions are always yours. You can export them as ZIP files at any time. Downloaded extensions continue to work in Chrome regardless of your subscription status.",
  },
  {
    q: "How many extensions can I build?",
    a: "There's no limit on the number of extensions. Your plan determines how many AI messages (credits) you can send per month to build and iterate.",
  },
  {
    q: "Can I publish to the Chrome Web Store?",
    a: "Yes. Exported extensions are ready to be submitted to the Chrome Web Store. You'll need a Chrome Developer account ($5 one-time fee from Google).",
  },
];

const bestPractices = [
  {
    icon: PenTool,
    title: "Be Specific in Prompts",
    desc: "Describe the exact behavior, UI, and features you want. The more detail, the better the result.",
  },
  {
    icon: RefreshCw,
    title: "Iterate Incrementally",
    desc: "Start simple, then add features one at a time. This produces cleaner, more maintainable code.",
  },
  {
    icon: Layers,
    title: "Use Version History",
    desc: "Before making big changes, note your current version. Roll back if something goes wrong.",
  },
  {
    icon: Cpu,
    title: "Try Different Models",
    desc: "Different AI models excel at different tasks. Switch models if you're not getting the results you want.",
  },
  {
    icon: Eye,
    title: "Preview Often",
    desc: "Check the live preview after each major change to catch issues early.",
  },
  {
    icon: Shield,
    title: "Review Permissions",
    desc: "Check what permissions your extension requests. Remove any that aren't needed for better user trust.",
  },
];

/* ─── FAQ ITEM COMPONENT ─── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/30 rounded-xl overflow-hidden bg-card/30 hover:bg-card/50 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-4">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ─── PAGE ─── */

export default function Resources() {
  const heroRef = useRef<HTMLDivElement>(null);
  const quickStartRef = useRef<HTMLDivElement>(null);
  const guidesRef = useRef<HTMLDivElement>(null);
  const bestPracticesRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const quickStartInView = useInView(quickStartRef, { once: true, margin: "-80px" });
  const guidesInView = useInView(guidesRef, { once: true, margin: "-80px" });
  const bestPracticesInView = useInView(bestPracticesRef, { once: true, margin: "-80px" });
  const faqInView = useInView(faqRef, { once: true, margin: "-80px" });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />

        <div className="relative overflow-x-hidden">
          {/* ─── HERO ─── */}
          <div className="px-4 pt-24 sm:pt-32 lg:pt-44 max-w-7xl mx-auto" ref={heroRef}>
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="text-primary font-semibold text-sm tracking-widest uppercase">
                Resources
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
                Learn, build, and ship faster
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Everything you need to get the most out of Extendr. From quick
                start guides to best practices and FAQs — we've got you covered.
              </p>
            </div>

            {/* Jump links */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {[
                { label: "Quick Start", icon: Rocket, href: "#quick-start" },
                { label: "Guides", icon: BookOpen, href: "#guides" },
                { label: "Best Practices", icon: Lightbulb, href: "#best-practices" },
                { label: "FAQ", icon: HelpCircle, href: "#faq" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/30 bg-card/40 hover:bg-card/60 hover:border-border/50 text-sm text-foreground transition-all"
                >
                  <link.icon className="w-4 h-4 text-primary" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* ─── QUICK START ─── */}
          <div
            id="quick-start"
            className="px-4 max-w-7xl mx-auto mb-20 sm:mb-28 scroll-mt-24"
            ref={quickStartRef}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={quickStartInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Quick Start
                </h2>
              </div>
              <p className="text-muted-foreground max-w-lg">
                Get from zero to a working Chrome extension in four simple steps.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {quickStartSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={quickStartInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="rounded-2xl border border-border/30 bg-card/40 p-6 hover:bg-card/60 hover:border-border/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-mono text-primary/60 tracking-wider">
                      {step.step}
                    </span>
                    <div className="flex-1 h-px bg-border/30" />
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <step.icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── GUIDES ─── */}
          <div
            id="guides"
            className="px-4 max-w-7xl mx-auto mb-20 sm:mb-28 scroll-mt-24"
            ref={guidesRef}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={guidesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Guides & Documentation
                </h2>
              </div>
              <p className="text-muted-foreground max-w-lg">
                In-depth guides organized by topic to help you master every aspect of Extendr.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {guides.map((group, gi) => (
                <motion.div
                  key={group.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={guidesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: gi * 0.1, duration: 0.4 }}
                  className="rounded-2xl border border-border/30 bg-card/40 overflow-hidden"
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-border/20 bg-card/60">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <group.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {group.category}
                    </h3>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border/20">
                    {group.items.map((item) => (
                      <div
                        key={item.title}
                        className="px-6 py-4 hover:bg-card/60 transition-colors cursor-pointer group/item"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground mb-1 group-hover/item:text-primary transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 mt-0.5 flex-shrink-0 group-hover/item:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── BEST PRACTICES ─── */}
          <div
            id="best-practices"
            className="px-4 max-w-7xl mx-auto mb-20 sm:mb-28 scroll-mt-24"
            ref={bestPracticesRef}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={bestPracticesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Best Practices
                </h2>
              </div>
              <p className="text-muted-foreground max-w-lg">
                Get the most out of Extendr with these tips from our team.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bestPractices.map((tip, i) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={bestPracticesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="rounded-2xl border border-border/30 bg-card/40 p-6 hover:bg-card/60 hover:border-border/50 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <tip.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tip.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── FAQ ─── */}
          <div
            id="faq"
            className="px-4 max-w-3xl mx-auto mb-12 scroll-mt-24"
            ref={faqRef}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={faqInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-muted-foreground max-w-lg">
                Quick answers to the most common questions about Extendr.
              </p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={faqInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <FaqItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── STILL NEED HELP ─── */}
          <div className="px-4 max-w-7xl mx-auto mb-8">
            <div className="rounded-2xl border border-border/30 bg-gradient-to-r from-card/60 via-primary/5 to-card/60 p-8 sm:p-12 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Can't find what you're looking for? Reach out and we'll help you get started.
              </p>
              <a
                href="mailto:support@extendr.dev"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm tracking-wide uppercase transition-all hover:bg-primary/90 hover:shadow-glow"
              >
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
