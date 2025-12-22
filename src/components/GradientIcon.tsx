import React, { useLayoutEffect } from "react";
import { LucideIcon } from "lucide-react";

interface GradientIconProps {
  icon: LucideIcon;
  className?: string;
}

// Global gradient ID
const GRADIENT_ID = "extendr-icon-gradient";

// Flag to track if gradient has been injected
let gradientInjected = false;

/**
 * Inject the gradient SVG defs into the document body (runs once).
 */
function injectGradient() {
  if (gradientInjected || typeof document === "undefined") return;
  
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svg.style.visibility = "hidden";
  svg.style.pointerEvents = "none";
  svg.innerHTML = `
    <defs>
      <linearGradient id="${GRADIENT_ID}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3B82F6" />
        <stop offset="50%" stop-color="#5A9665" />
        <stop offset="100%" stop-color="#22C55E" />
      </linearGradient>
    </defs>
  `;
  document.body.insertBefore(svg, document.body.firstChild);
  gradientInjected = true;
}

/**
 * Wrapper component that applies a blue-green gradient to Lucide icons.
 * Renders the icon with gradient stroke applied to all paths.
 */
export function GradientIcon({ 
  icon: Icon, 
  className = "w-8 h-8",
}: GradientIconProps) {
  // Inject gradient before paint
  useLayoutEffect(() => {
    injectGradient();
  }, []);

  // Also inject immediately for SSR/initial render
  if (typeof document !== "undefined" && !gradientInjected) {
    injectGradient();
  }
  
  return (
    <Icon 
      className={className}
      stroke={`url(#${GRADIENT_ID})`}
    />
  );
}
