import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  MessageSquare,
  Eye,
  Download,
  BookOpen,
  Sparkles,
  Puzzle,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  Menu,
  X,
  Cpu,
  Code2,
  Shield,
  Settings,
  Globe,
  Layers,
  Terminal,
  FileCode,
  PenTool,
  RefreshCw,
  Zap,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─── TYPES ─── */

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
  headings: { id: string; title: string; level: number }[];
}

interface SidebarCategory {
  name: string;
  icon: React.ElementType;
  sections: { id: string; title: string }[];
}

/* ─── CALLOUT COMPONENT ─── */

function Callout({
  icon: Icon,
  title,
  children,
  variant = "info",
}: {
  icon?: React.ElementType;
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "tip" | "warning";
}) {
  const styles = {
    info: "border-blue-500/30 bg-blue-500/5",
    tip: "border-primary/30 bg-primary/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
  };
  const iconColor = {
    info: "text-blue-400",
    tip: "text-primary",
    warning: "text-yellow-400",
  };

  return (
    <div className={`rounded-lg border p-4 my-6 ${styles[variant]}`}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor[variant]}`} />}
        <div className="min-w-0">
          {title && (
            <p className={`font-semibold text-sm mb-1 ${iconColor[variant]}`}>{title}</p>
          )}
          <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ ITEM ─── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/20 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left group"
      >
        <span className="text-sm font-medium text-foreground pr-4 group-hover:text-primary transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed px-5 pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── SECTION CONTENT DEFINITIONS ─── */

function IntroductionContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Extendr is an AI-powered Chrome extension builder that lets you create fully functional
        Manifest V3 extensions using natural language. Describe what you want, and AI generates
        the code — complete with popup pages, content scripts, background workers, and more.
      </p>

      <Callout icon={Lightbulb} title="Want to learn by doing?" variant="tip">
        Jump straight into our{" "}
        <button
          onClick={() => document.querySelector('[data-section="quick-start"]')?.scrollIntoView()}
          className="text-primary hover:underline font-medium"
        >
          Quick Start Guide
        </button>{" "}
        and build your first extension in under 5 minutes!
      </Callout>

      <h2 id="what-is-extendr" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        What is Extendr?
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Extendr is an AI-powered builder for Chrome extensions. Simply type your idea into the chat,
        click send, and Extendr will transform your idea into a working Chrome extension in minutes.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-6">
        With a single prompt, you can build:
      </p>
      <ul className="space-y-3 mb-8">
        {[
          ["Productivity tools", "like tab managers, bookmarkers, note-takers, and clipboard managers"],
          ["Content enhancers", "such as ad blockers, dark mode togglers, readability improvers, and translators"],
          ["Developer utilities", "including API testers, color pickers, JSON formatters, and CSS inspectors"],
          ["Social & fun extensions", "like custom new tab pages, notification managers, and theme changers"],
        ].map(([bold, rest]) => (
          <li key={bold} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>
              <strong className="text-foreground">{bold}</strong> {rest}
            </span>
          </li>
        ))}
      </ul>

      <h2 id="who-is-extendr-for" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Who is Extendr for?
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Extendr is for everyone. Whether you've never written a line of code or you're a seasoned developer,
        Extendr helps you build more and build faster.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        <strong className="text-foreground">New to coding?</strong> Extendr removes the technical roadblocks.
        Just describe what you want, and the AI creates it for you. You can then refine through simple chat messages.
        No coding knowledge required — just bring your ideas.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        <strong className="text-foreground">Experienced developer?</strong> Extendr gives you speed and flexibility.
        Choose your preferred AI model, view and edit the generated code directly, and iterate rapidly. Think of it as
        a coding copilot that understands Chrome extension architecture.
      </p>

      <h2 id="how-it-works" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        How it works
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Extendr supports the full lifecycle of Chrome extension development:
      </p>
      <ol className="space-y-4 mb-6">
        {[
          ["Describe", "Tell the AI what extension you want using natural language."],
          ["Generate", "The AI creates all the files — manifest.json, HTML, CSS, JavaScript, and icons."],
          ["Preview", "See your extension running live in a sandboxed WebContainer, right in the browser."],
          ["Iterate", "Chat with the AI to add features, fix bugs, or change the design."],
          ["Export", "Download the finished extension as a ZIP and load it into Chrome."],
        ].map(([title, desc], i) => (
          <li key={title} className="flex items-start gap-4 text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">{title}.</strong> {desc}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function QuickStartContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Get from zero to a working Chrome extension in under 5 minutes. This guide walks you through
        creating your account, building your first extension, and installing it in Chrome.
      </p>

      <h2 id="step-1-sign-up" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        1. Create your account
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Head to the{" "}
        <Link to="/auth" className="text-primary hover:underline font-medium">
          sign up page
        </Link>{" "}
        and create your account. You can sign up with email or Google. Choose the plan
        that fits your needs and start building right away.
      </p>

      <h2 id="step-2-describe" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        2. Describe your extension
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Navigate to the{" "}
        <Link to="/build" className="text-primary hover:underline font-medium">
          builder
        </Link>{" "}
        and describe what Chrome extension you want. Use plain English — be as specific as you can.
      </p>

      <Callout icon={Lightbulb} title="Example prompt" variant="tip">
        <code className="bg-card/80 px-2 py-1 rounded text-xs text-foreground">
          Build a Chrome extension that adds a dark mode toggle to any website. It should have a popup
          with an on/off switch and remember the user's preference.
        </code>
      </Callout>

      <p className="text-muted-foreground leading-relaxed mb-4">
        The more detail you include, the better the result. Mention specific features, UI preferences,
        colors, and behaviors you want.
      </p>

      <h2 id="step-3-preview" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        3. Preview and iterate
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Watch your extension come to life in the live preview panel. The AI generates all files in real-time
        inside a sandboxed WebContainer — no local setup needed.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Not quite right? Just tell the AI what to change. You can:
      </p>
      <ul className="space-y-2 mb-6">
        {[
          "Add new features or pages",
          "Change colors, fonts, or layout",
          "Fix bugs or unexpected behavior",
          "Modify permissions or manifest settings",
          "Refactor the code structure",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 id="step-4-export" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        4. Export and install
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        When you're happy with your extension, click the export button to download it as a ZIP file.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        To install in Chrome:
      </p>
      <ol className="space-y-3 mb-6">
        {[
          "Unzip the downloaded file",
          <>Navigate to <code className="bg-card/80 px-2 py-0.5 rounded text-xs text-foreground">chrome://extensions</code></>,
          "Enable \"Developer mode\" in the top right",
          "Click \"Load unpacked\" and select the unzipped folder",
          "Your extension is now installed and ready to use!",
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

function UsingTheChatContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        The chat interface is where you communicate with the AI to build and iterate on your extension.
        Understanding how to use it effectively is key to getting great results.
      </p>

      <h2 id="chat-interface" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        The chat interface
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The builder is split into two main panels: the chat on the left and the live preview on the right.
        Type your messages in the input area at the bottom of the chat panel.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Each message you send uses one credit. The AI will respond with generated code and explanations.
        Changes appear in the preview panel automatically.
      </p>

      <h2 id="conversation-context" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Conversation context
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The AI maintains the full conversation history, so it understands what you've built so far.
        You can reference previous messages and the AI will know what you mean.
      </p>

      <Callout icon={Lightbulb} title="Tip" variant="tip">
        If the conversation gets long and the AI starts losing context, you can start a new
        conversation while keeping your extension files intact.
      </Callout>

      <h2 id="file-viewer" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Viewing and editing files
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        You can view all generated files in the file explorer. Click any file to see its contents.
        The AI can also modify specific files when you reference them in your messages.
      </p>
    </>
  );
}

function AIModelsContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Extendr supports multiple AI providers and models, so you can choose the one
        that works best for your specific task.
      </p>

      <h2 id="available-models" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Available models
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Extendr currently supports the following AI providers:
      </p>
      <ul className="space-y-3 mb-6">
        {[
          ["OpenAI (GPT-4o)", "Excellent all-around performance for most extension types"],
          ["Claude (Anthropic)", "Strong at complex logic, careful about edge cases"],
          ["Gemini (Google)", "Great at visual/UI-focused extensions and fast iteration"],
          ["DeepSeek", "Good performance at competitive pricing"],
          ["OpenRouter", "Access to hundreds of models through a single API"],
        ].map(([model, desc]) => (
          <li key={model} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>
              <strong className="text-foreground">{model}</strong> — {desc}
            </span>
          </li>
        ))}
      </ul>

      <h2 id="switching-models" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Switching models
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Click the model selector in the chat input area to switch between models. You can change
        models between messages — the AI will pick up the full conversation context regardless
        of which model you switch to.
      </p>

      <h2 id="model-rotation" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Model rotation
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Enable model rotation to automatically cycle through different AI models for each message.
        This can be useful for getting varied perspectives on complex extensions or comparing outputs.
      </p>

      <Callout icon={Lightbulb} title="When to use rotation" variant="tip">
        Model rotation is most useful when you're exploring different approaches to a complex
        extension. For straightforward builds, sticking with one model usually gives more
        consistent results.
      </Callout>
    </>
  );
}

function LivePreviewContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        The live preview lets you see your extension running in real-time as the AI generates code.
        It uses a sandboxed WebContainer that runs entirely in your browser.
      </p>

      <h2 id="how-preview-works" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        How the preview works
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Your extension files are loaded into a WebContainer — a browser-based runtime environment.
        This means you can preview your extension's popup, options page, and other UI elements
        without installing anything locally.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Changes appear instantly as the AI generates or modifies files. The preview automatically
        refreshes when files are updated.
      </p>

      <h2 id="preview-limitations" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Preview limitations
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The live preview shows your extension's UI components, but some Chrome-specific APIs
        (like tabs, storage, or alarms) require the extension to be actually installed in Chrome
        to function. The preview focuses on visual output and basic JavaScript logic.
      </p>
    </>
  );
}

function ManagingProjectsContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Extendr automatically saves your extension files to your account. Here's how to manage
        your projects effectively.
      </p>

      <h2 id="auto-saving" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Auto-saving
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        After every AI response, your extension files are automatically saved to your account via Supabase.
        You don't need to manually save — everything is persisted in real-time.
      </p>

      <h2 id="version-history" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Version history
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        View previous versions of your extension to compare changes or roll back if needed.
        Before making major changes, note your current version so you can revert if something goes wrong.
      </p>

      <h2 id="exporting" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Exporting your extension
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Click the export/download button to get your extension as a ZIP file. The ZIP contains
        everything you need to load the extension into Chrome or submit to the Chrome Web Store.
      </p>

      <Callout icon={Lightbulb} title="Chrome Web Store" variant="info">
        To publish on the Chrome Web Store, you'll need a Chrome Developer account (a one-time $5 fee from Google).
        Exported extensions are fully compatible with the Web Store submission process.
      </Callout>
    </>
  );
}

function ExtensionFilesContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Every Chrome extension is made up of several files that work together. Understanding
        this structure helps you communicate more effectively with the AI.
      </p>

      <h2 id="manifest-json" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        manifest.json
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The manifest is the heart of every Chrome extension. It declares the extension's name,
        version, permissions, and which files to use. Extendr always generates Manifest V3
        compliant configurations.
      </p>

      <h2 id="popup-html" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Popup pages
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The popup is the small window that appears when users click your extension's icon.
        It's built with standard HTML, CSS, and JavaScript. Most extensions use a popup as
        their primary interface.
      </p>

      <h2 id="content-scripts" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Content scripts
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Content scripts run in the context of web pages. They can read and modify the DOM of
        pages the user visits. Use content scripts when your extension needs to interact with
        or modify websites.
      </p>

      <h2 id="background-workers" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Background service workers
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Service workers run in the background and handle events like alarms, notifications,
        and cross-tab communication. In Manifest V3, these replace the old persistent background pages.
      </p>
    </>
  );
}

function SupportedTechContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Extendr generates modern Chrome extensions using industry-standard technologies.
      </p>

      <h2 id="core-technologies" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Core technologies
      </h2>
      <ul className="space-y-3 mb-6">
        {[
          ["Manifest V3", "The latest Chrome extension platform, required for all new extensions"],
          ["HTML5 / CSS3", "Modern markup and styling for extension UI"],
          ["JavaScript (ES2020+)", "Full modern JavaScript support for extension logic"],
          ["Chrome Extension APIs", "Access to tabs, storage, alarms, notifications, and more"],
        ].map(([tech, desc]) => (
          <li key={tech} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>
              <strong className="text-foreground">{tech}</strong> — {desc}
            </span>
          </li>
        ))}
      </ul>

      <h2 id="chrome-apis" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Chrome APIs supported
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The AI can generate extensions that use a wide range of Chrome APIs including:
      </p>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          "chrome.tabs",
          "chrome.storage",
          "chrome.runtime",
          "chrome.alarms",
          "chrome.notifications",
          "chrome.contextMenus",
          "chrome.bookmarks",
          "chrome.cookies",
          "chrome.downloads",
          "chrome.history",
        ].map((api) => (
          <code
            key={api}
            className="bg-card/60 border border-border/20 px-3 py-1.5 rounded text-xs text-foreground"
          >
            {api}
          </code>
        ))}
      </div>
    </>
  );
}

function PromptingTipsContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Clear, verbose prompts produce better output. Think of the AI like your engineering
        partner — it only knows what you tell it.
      </p>

      <h2 id="be-specific" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        1. Be specific
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Mention the exact pages, features, and behaviors you want. Instead of "make a tab manager,"
        say "make a tab manager that groups tabs by domain, shows a search bar, and lets me close
        tabs from the popup."
      </p>

      <h2 id="describe-ui" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        2. Describe the UI
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Tell the AI what you want the extension to look like. Mention colors, layout preferences,
        icon styles, and any design references. The more visual detail, the closer the result
        matches your vision.
      </p>

      <h2 id="iterate-incrementally" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        3. Start simple, then iterate
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Begin with the core functionality and add features one at a time. This produces cleaner
        code and makes it easier to identify issues. A complex prompt can sometimes overwhelm
        the AI — breaking it into steps gives better results.
      </p>

      <Callout icon={Lightbulb} title="Example workflow" variant="tip">
        <p className="mb-2">Message 1: "Build a bookmark manager popup with a list of saved bookmarks"</p>
        <p className="mb-2">Message 2: "Add a search bar at the top to filter bookmarks"</p>
        <p className="mb-2">Message 3: "Add folder support and drag-to-reorder"</p>
        <p>Message 4: "Style it with a dark theme and rounded corners"</p>
      </Callout>

      <h2 id="give-feedback" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        4. Give clear feedback
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        When something isn't right, be specific about what needs to change. Instead of "this doesn't
        look good," say "make the font size larger, add more padding, and change the button color
        to blue."
      </p>

      <h2 id="reference-files" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        5. Reference specific files
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        If you want changes to a specific file, mention it by name. For example: "In popup.html,
        move the search bar above the bookmark list" or "In background.js, add an alarm that runs every hour."
      </p>
    </>
  );
}

function ManifestV3Content() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Manifest V3 is Chrome's latest extension platform. Every extension built with Extendr
        uses Manifest V3 by default, ensuring compatibility with the Chrome Web Store and
        future versions of Chrome.
      </p>

      <h2 id="what-is-mv3" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        What is Manifest V3?
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Manifest V3 (MV3) is the latest version of Chrome's extension platform, introduced to
        improve security, performance, and privacy. Key changes from V2 include:
      </p>
      <ul className="space-y-2 mb-6">
        {[
          "Service workers replace persistent background pages",
          "Declarative net request replaces blocking webRequest",
          "Stricter content security policies",
          "Promise-based APIs alongside callbacks",
          "Host permissions are separated from other permissions",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 id="permissions-guide" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Understanding permissions
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Chrome extension permissions control what APIs and data your extension can access.
        Extendr automatically configures the right permissions based on your extension's features.
      </p>

      <Callout icon={Shield} title="Security tip" variant="warning">
        Only request permissions your extension actually needs. Unnecessary permissions reduce
        user trust and can cause your extension to be rejected from the Chrome Web Store.
        Review the generated manifest.json and remove any permissions you don't need.
      </Callout>
    </>
  );
}

function PlansCreditsContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Extendr uses a credit-based system. Each AI message costs one credit. Choose a plan
        that fits how much you build.
      </p>

      <h2 id="how-credits-work" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        How credits work
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Every message you send to the AI uses one credit. This includes initial prompts,
        follow-up requests, and refinements. Viewing files, using the preview, and exporting
        your extension are all free — only AI messages use credits.
      </p>

      <h2 id="choosing-a-plan" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Choosing a plan
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Visit the{" "}
        <Link to="/pricing" className="text-primary hover:underline font-medium">
          pricing page
        </Link>{" "}
        to compare plans and choose the one that works for you. All plans include
        daily credits that reset every day plus monthly credits based on your tier.
      </p>

      <h2 id="extension-ownership" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Extension ownership
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Your extensions are always yours. You can export them at any time as ZIP files.
        Downloaded extensions continue to work in Chrome regardless of your subscription
        status. We never claim ownership of the code generated for you.
      </p>
    </>
  );
}

function FAQContent() {
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
    {
      q: "Is my data secure?",
      a: "Yes. Your extension files are stored securely and are only accessible to you. We use Supabase for backend storage with row-level security policies.",
    },
    {
      q: "Can I use my own API keys?",
      a: "Currently, Extendr uses its own API keys to provide a seamless experience. Custom API key support may be added in the future.",
    },
  ];

  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-8">
        Quick answers to the most common questions about Extendr.
      </p>
      <div className="border border-border/20 rounded-xl overflow-hidden py-2">
        {faqs.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>
    </>
  );
}

function CommonIssuesContent() {
  return (
    <>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Solutions to common problems you might encounter when using Extendr.
      </p>

      <h2 id="extension-not-loading" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Extension not loading in Chrome
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        If your exported extension doesn't load in Chrome, check:
      </p>
      <ul className="space-y-2 mb-6">
        {[
          "Developer mode is enabled in chrome://extensions",
          "You selected the correct unzipped folder (not the ZIP file itself)",
          "The manifest.json is valid — look for error messages in the extensions page",
          "There are no syntax errors in the JavaScript files",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 id="preview-blank" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Preview shows blank screen
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        If the live preview is blank, try refreshing the preview panel. If the issue persists,
        check the browser console for errors and ask the AI to fix any JavaScript issues.
      </p>

      <h2 id="ai-not-responding" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        AI not responding
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        If the AI doesn't respond after sending a message:
      </p>
      <ul className="space-y-2 mb-6">
        {[
          "Check your internet connection",
          "Verify you have credits remaining",
          "Try switching to a different AI model",
          "Refresh the page and try again",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 id="contact-support" className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">
        Still stuck?
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        If you can't resolve your issue, reach out to us at{" "}
        <a href="mailto:hi@extendr.dev" className="text-primary hover:underline font-medium">
          hi@extendr.dev
        </a>{" "}
        and we'll help you out.
      </p>
    </>
  );
}

/* ─── DOC SECTIONS ─── */

const DOC_SECTIONS: DocSection[] = [
  {
    id: "introduction",
    title: "Introduction to Extendr",
    icon: BookOpen,
    headings: [
      { id: "what-is-extendr", title: "What is Extendr?", level: 2 },
      { id: "who-is-extendr-for", title: "Who is Extendr for?", level: 2 },
      { id: "how-it-works", title: "How it works", level: 2 },
    ],
    content: <IntroductionContent />,
  },
  {
    id: "quick-start",
    title: "Quick Start Guide",
    icon: Rocket,
    headings: [
      { id: "step-1-sign-up", title: "1. Create your account", level: 2 },
      { id: "step-2-describe", title: "2. Describe your extension", level: 2 },
      { id: "step-3-preview", title: "3. Preview and iterate", level: 2 },
      { id: "step-4-export", title: "4. Export and install", level: 2 },
    ],
    content: <QuickStartContent />,
  },
  {
    id: "using-the-chat",
    title: "Using the Chat",
    icon: MessageSquare,
    headings: [
      { id: "chat-interface", title: "The chat interface", level: 2 },
      { id: "conversation-context", title: "Conversation context", level: 2 },
      { id: "file-viewer", title: "Viewing and editing files", level: 2 },
    ],
    content: <UsingTheChatContent />,
  },
  {
    id: "ai-models",
    title: "AI Models & Providers",
    icon: Cpu,
    headings: [
      { id: "available-models", title: "Available models", level: 2 },
      { id: "switching-models", title: "Switching models", level: 2 },
      { id: "model-rotation", title: "Model rotation", level: 2 },
    ],
    content: <AIModelsContent />,
  },
  {
    id: "live-preview",
    title: "Live Preview",
    icon: Eye,
    headings: [
      { id: "how-preview-works", title: "How the preview works", level: 2 },
      { id: "preview-limitations", title: "Preview limitations", level: 2 },
    ],
    content: <LivePreviewContent />,
  },
  {
    id: "managing-projects",
    title: "Managing Projects",
    icon: FolderOpen,
    headings: [
      { id: "auto-saving", title: "Auto-saving", level: 2 },
      { id: "version-history", title: "Version history", level: 2 },
      { id: "exporting", title: "Exporting your extension", level: 2 },
    ],
    content: <ManagingProjectsContent />,
  },
  {
    id: "extension-files",
    title: "Extension Files",
    icon: FileCode,
    headings: [
      { id: "manifest-json", title: "manifest.json", level: 2 },
      { id: "popup-html", title: "Popup pages", level: 2 },
      { id: "content-scripts", title: "Content scripts", level: 2 },
      { id: "background-workers", title: "Background service workers", level: 2 },
    ],
    content: <ExtensionFilesContent />,
  },
  {
    id: "supported-technologies",
    title: "Supported Technologies",
    icon: Globe,
    headings: [
      { id: "core-technologies", title: "Core technologies", level: 2 },
      { id: "chrome-apis", title: "Chrome APIs supported", level: 2 },
    ],
    content: <SupportedTechContent />,
  },
  {
    id: "prompting-tips",
    title: "Prompting Best Practices",
    icon: PenTool,
    headings: [
      { id: "be-specific", title: "1. Be specific", level: 2 },
      { id: "describe-ui", title: "2. Describe the UI", level: 2 },
      { id: "iterate-incrementally", title: "3. Start simple, then iterate", level: 2 },
      { id: "give-feedback", title: "4. Give clear feedback", level: 2 },
      { id: "reference-files", title: "5. Reference specific files", level: 2 },
    ],
    content: <PromptingTipsContent />,
  },
  {
    id: "manifest-v3",
    title: "Manifest V3 Guide",
    icon: Shield,
    headings: [
      { id: "what-is-mv3", title: "What is Manifest V3?", level: 2 },
      { id: "permissions-guide", title: "Understanding permissions", level: 2 },
    ],
    content: <ManifestV3Content />,
  },
  {
    id: "plans-credits",
    title: "Plans & Credits",
    icon: Zap,
    headings: [
      { id: "how-credits-work", title: "How credits work", level: 2 },
      { id: "choosing-a-plan", title: "Choosing a plan", level: 2 },
      { id: "extension-ownership", title: "Extension ownership", level: 2 },
    ],
    content: <PlansCreditsContent />,
  },
  {
    id: "faq",
    title: "FAQ",
    icon: HelpCircle,
    headings: [],
    content: <FAQContent />,
  },
  {
    id: "common-issues",
    title: "Troubleshooting",
    icon: Settings,
    headings: [
      { id: "extension-not-loading", title: "Extension not loading", level: 2 },
      { id: "preview-blank", title: "Preview shows blank screen", level: 2 },
      { id: "ai-not-responding", title: "AI not responding", level: 2 },
      { id: "contact-support", title: "Still stuck?", level: 2 },
    ],
    content: <CommonIssuesContent />,
  },
];

/* ─── SIDEBAR CATEGORIES ─── */

const SIDEBAR_CATEGORIES: SidebarCategory[] = [
  {
    name: "Getting Started",
    icon: Rocket,
    sections: [
      { id: "introduction", title: "Introduction to Extendr" },
      { id: "quick-start", title: "Quick Start Guide" },
    ],
  },
  {
    name: "Working in Extendr",
    icon: Terminal,
    sections: [
      { id: "using-the-chat", title: "Using the Chat" },
      { id: "ai-models", title: "AI Models & Providers" },
      { id: "live-preview", title: "Live Preview" },
      { id: "managing-projects", title: "Managing Projects" },
      { id: "extension-files", title: "Extension Files" },
      { id: "supported-technologies", title: "Supported Technologies" },
    ],
  },
  {
    name: "Best Practices",
    icon: Lightbulb,
    sections: [
      { id: "prompting-tips", title: "Prompting Best Practices" },
    ],
  },
  {
    name: "Building Extensions",
    icon: Puzzle,
    sections: [
      { id: "manifest-v3", title: "Manifest V3 Guide" },
    ],
  },
  {
    name: "Account",
    icon: Settings,
    sections: [
      { id: "plans-credits", title: "Plans & Credits" },
    ],
  },
  {
    name: "Troubleshooting",
    icon: HelpCircle,
    sections: [
      { id: "faq", title: "FAQ" },
      { id: "common-issues", title: "Common Issues" },
    ],
  },
];

/* ─── PAGE COMPONENT ─── */

export default function Resources() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHeading, setActiveHeading] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const currentSection = useMemo(
    () => DOC_SECTIONS.find((s) => s.id === activeSection) || DOC_SECTIONS[0],
    [activeSection]
  );

  const currentCategory = useMemo(
    () => SIDEBAR_CATEGORIES.find((cat) => cat.sections.some((s) => s.id === activeSection)),
    [activeSection]
  );

  // Search filter
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SIDEBAR_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return SIDEBAR_CATEGORIES.map((cat) => ({
      ...cat,
      sections: cat.sections.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.sections.length > 0);
  }, [searchQuery]);

  const navigateTo = useCallback(
    (sectionId: string) => {
      setActiveSection(sectionId);
      setSidebarOpen(false);
      setActiveHeading("");
      // Scroll the content panel to top
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    []
  );

  const scrollToHeading = useCallback((headingId: string) => {
    setActiveHeading(headingId);
    const el = document.getElementById(headingId);
    if (el && contentRef.current) {
      const containerRect = contentRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const scrollTop = contentRef.current.scrollTop + (elRect.top - containerRect.top) - 24;
      contentRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, []);

  // Track active heading on scroll within the content panel
  useEffect(() => {
    const headings = currentSection.headings.map((h) => document.getElementById(h.id));
    if (headings.length === 0 || !contentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { root: contentRef.current, rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => h && observer.observe(h));
    return () => observer.disconnect();
  }, [currentSection]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // SEO: Update document title
  useEffect(() => {
    document.title = `${currentSection.title} | Extendr Documentation`;
    return () => {
      document.title = "Extendr";
    };
  }, [currentSection]);

  // Handle URL hash for direct linking
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const section = DOC_SECTIONS.find((s) => s.id === hash);
      if (section) {
        setActiveSection(hash);
      }
    }
  }, []);

  // Update URL hash when section changes
  useEffect(() => {
    window.history.replaceState(null, "", `#${activeSection}`);
  }, [activeSection]);

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col overflow-hidden">
      <Header />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        aria-label="Toggle documentation menu"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 pt-24 sm:pt-32 lg:pt-44 overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex h-full">
          {/* ─── LEFT SIDEBAR ─── */}
          <aside
            className={`
              fixed lg:relative top-0 lg:top-0 left-0 z-40 lg:z-10
              w-[280px] lg:w-[260px] xl:w-[280px] h-screen lg:h-full
              bg-background lg:bg-transparent border-r border-border/10
              overflow-y-auto overscroll-contain
              transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              flex-shrink-0 custom-scrollbar
            `}
          >
            <nav className="py-6 lg:py-2 px-4" aria-label="Documentation navigation">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-card/40 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              {/* Category sections */}
              {filteredCategories.map((cat) => (
                <div key={cat.name} className="mb-5">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <cat.icon className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {cat.name}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {cat.sections.map((section) => (
                      <li key={section.id}>
                        <button
                          onClick={() => navigateTo(section.id)}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150
                            ${
                              activeSection === section.id
                                ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                            }
                          `}
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* ─── MAIN CONTENT (only scrollable area) ─── */}
          <main
            ref={contentRef}
            className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 xl:px-16 py-6 lg:py-2 overflow-y-auto h-full custom-scrollbar"
          >
            <article className="max-w-[720px]" itemScope itemType="https://schema.org/TechArticle">
              {/* Breadcrumb */}
              {currentCategory && (
                <nav aria-label="Breadcrumb" className="mb-2">
                  <span className="text-xs font-semibold text-primary tracking-wide">
                    {currentCategory.name}
                  </span>
                </nav>
              )}

              {/* Title */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
                  itemProp="name"
                >
                  {currentSection.title}
                </h1>
              </div>

              {/* Description meta */}
              <meta
                itemProp="description"
                content={`Documentation for ${currentSection.title} in Extendr - AI-powered Chrome extension builder`}
              />

              {/* Separator */}
              <div className="h-px bg-border/20 my-6" />

              {/* Content */}
              <div
                className="docs-content"
                data-section={currentSection.id}
                itemProp="articleBody"
              >
                {currentSection.content}
              </div>

              {/* Navigation between sections */}
              <div className="border-t border-border/20 mt-16 pt-8 pb-12">
                <div className="flex items-center justify-between gap-4">
                  {(() => {
                    const allSections = SIDEBAR_CATEGORIES.flatMap((c) => c.sections);
                    const currentIdx = allSections.findIndex((s) => s.id === activeSection);
                    const prev = currentIdx > 0 ? allSections[currentIdx - 1] : null;
                    const next = currentIdx < allSections.length - 1 ? allSections[currentIdx + 1] : null;

                    return (
                      <>
                        {prev ? (
                          <button
                            onClick={() => navigateTo(prev.id)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                          >
                            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                            <span>{prev.title}</span>
                          </button>
                        ) : (
                          <div />
                        )}
                        {next ? (
                          <button
                            onClick={() => navigateTo(next.id)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group ml-auto"
                          >
                            <span>{next.title}</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ) : (
                          <div />
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Still need help */}
              <div className="rounded-xl border border-border/20 bg-card/30 p-6 sm:p-8 mb-12 text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Still have questions?
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                  Can't find what you're looking for? Reach out and we'll help you get started.
                </p>
                <a
                  href="mailto:hi@extendr.dev"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 hover:shadow-glow"
                >
                  Contact Support
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </article>
          </main>

          {/* ─── RIGHT TOC SIDEBAR ─── */}
          {currentSection.headings.length > 0 && (
            <aside className="hidden xl:block w-[220px] flex-shrink-0 h-full py-2">
              <nav aria-label="On this page">
                <div className="flex items-center gap-2 px-3 mb-3">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
                  <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    On this page
                  </span>
                </div>
                <ul className="space-y-1">
                  {currentSection.headings.map((heading) => (
                    <li key={heading.id}>
                      <button
                        onClick={() => scrollToHeading(heading.id)}
                        className={`
                          w-full text-left px-3 py-1.5 text-xs transition-colors duration-150 rounded
                          ${heading.level > 2 ? "pl-6" : ""}
                          ${
                            activeHeading === heading.id
                              ? "text-primary font-medium"
                              : "text-muted-foreground/60 hover:text-foreground"
                          }
                        `}
                      >
                        {heading.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
