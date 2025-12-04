import {
  Gamepad2,
  CheckSquare,
  Code2,
  Share2,
  Wrench,
  Shield,
  Palette,
  GraduationCap,
  ShoppingCart,
  DollarSign,
  Newspaper,
  Accessibility,
  Zap,
  Layout,
  Bookmark,
  EyeOff,
  MessageCircle,
  Film,
  Search,
  Box,
  LucideIcon
} from "lucide-react";

export type ProjectCategory = 
  | "Game"
  | "Productivity"
  | "Developer Tool"
  | "Social Media"
  | "Utility"
  | "Security"
  | "Design"
  | "Education"
  | "Shopping"
  | "Finance"
  | "News"
  | "Accessibility"
  | "Automation"
  | "Tab Manager"
  | "Bookmark Manager"
  | "Privacy"
  | "Communication"
  | "Entertainment"
  | "Search"
  | "Other";

export const CATEGORIES: Record<ProjectCategory, LucideIcon> = {
  "Game": Gamepad2,
  "Productivity": CheckSquare,
  "Developer Tool": Code2,
  "Social Media": Share2,
  "Utility": Wrench,
  "Security": Shield,
  "Design": Palette,
  "Education": GraduationCap,
  "Shopping": ShoppingCart,
  "Finance": DollarSign,
  "News": Newspaper,
  "Accessibility": Accessibility,
  "Automation": Zap,
  "Tab Manager": Layout,
  "Bookmark Manager": Bookmark,
  "Privacy": EyeOff,
  "Communication": MessageCircle,
  "Entertainment": Film,
  "Search": Search,
  "Other": Box
};

export const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  "Game": "text-purple-400",
  "Productivity": "text-green-400",
  "Developer Tool": "text-blue-400",
  "Social Media": "text-pink-400",
  "Utility": "text-gray-400",
  "Security": "text-red-400",
  "Design": "text-orange-400",
  "Education": "text-yellow-400",
  "Shopping": "text-emerald-400",
  "Finance": "text-green-500",
  "News": "text-blue-300",
  "Accessibility": "text-indigo-400",
  "Automation": "text-amber-400",
  "Tab Manager": "text-cyan-400",
  "Bookmark Manager": "text-teal-400",
  "Privacy": "text-slate-400",
  "Communication": "text-sky-400",
  "Entertainment": "text-fuchsia-400",
  "Search": "text-violet-400",
  "Other": "text-gray-400"
};

/**
 * Heuristic to determine category from text
 */
export function determineCategoryFromText(text: string): ProjectCategory {
  const lower = text.toLowerCase();
  
  if (lower.includes("game") || lower.includes("tic tac") || lower.includes("play") || lower.includes("score")) return "Game";
  if (lower.includes("todo") || lower.includes("task") || lower.includes("list") || lower.includes("note") || lower.includes("organize")) return "Productivity";
  if (lower.includes("dev") || lower.includes("code") || lower.includes("debug") || lower.includes("json") || lower.includes("api")) return "Developer Tool";
  if (lower.includes("social") || lower.includes("twitter") || lower.includes("instagram") || lower.includes("facebook") || lower.includes("linkedin")) return "Social Media";
  if (lower.includes("shop") || lower.includes("buy") || lower.includes("price") || lower.includes("amazon") || lower.includes("cart")) return "Shopping";
  if (lower.includes("finance") || lower.includes("money") || lower.includes("crypto") || lower.includes("stock") || lower.includes("budget")) return "Finance";
  if (lower.includes("design") || lower.includes("color") || lower.includes("css") || lower.includes("theme") || lower.includes("style")) return "Design";
  if (lower.includes("security") || lower.includes("password") || lower.includes("lock") || lower.includes("auth")) return "Security";
  if (lower.includes("news") || lower.includes("feed") || lower.includes("read") || lower.includes("article")) return "News";
  if (lower.includes("tab") && lower.includes("manager")) return "Tab Manager";
  if (lower.includes("tab")) return "Tab Manager";
  if (lower.includes("bookmark")) return "Bookmark Manager";
  if (lower.includes("privacy") || lower.includes("block") || lower.includes("adblock") || lower.includes("tracker")) return "Privacy";
  if (lower.includes("search") || lower.includes("find") || lower.includes("query")) return "Search";
  if (lower.includes("video") || lower.includes("movie") || lower.includes("music") || lower.includes("youtube")) return "Entertainment";
  if (lower.includes("chat") || lower.includes("message") || lower.includes("email")) return "Communication";
  if (lower.includes("automate") || lower.includes("script") || lower.includes("bot")) return "Automation";
  if (lower.includes("accessibility") || lower.includes("read") || lower.includes("speak")) return "Accessibility";
  if (lower.includes("learn") || lower.includes("study") || lower.includes("quiz")) return "Education";
  if (lower.includes("calc") || lower.includes("convert") || lower.includes("weather") || lower.includes("time") || lower.includes("clock")) return "Utility";
  
  return "Other";
}

