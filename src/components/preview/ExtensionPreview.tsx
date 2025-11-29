import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Eye, FileCode, FileJson, Palette, Braces } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { PreviewFrame } from "./PreviewFrame";

interface ExtensionFile {
  name: string;
  language: "html" | "css" | "javascript" | "json";
  content: string;
  icon: React.ReactNode;
}

interface ExtensionPreviewProps {
  className?: string;
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  initialManifest?: string;
  onCodeChange?: (files: { html: string; css: string; js: string; manifest: string }) => void;
}

const DEFAULT_HTML = `<div class="popup-container">
  <header class="popup-header">
    <h1>My Extension</h1>
    <p class="subtitle">Built with Extendr</p>
  </header>
  
  <main class="popup-content">
    <div class="feature-card">
      <span class="icon">🚀</span>
      <h3>Quick Actions</h3>
      <p>Access your tools instantly</p>
    </div>
    
    <button class="primary-btn" id="actionBtn">
      Click Me
    </button>
    
    <div class="status" id="status">
      Ready to go!
    </div>
  </main>
  
  <footer class="popup-footer">
    <span>v1.0.0</span>
  </footer>
</div>`;

const DEFAULT_CSS = `/* Popup Container */
.popup-container {
  width: 320px;
  min-height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: white;
  display: flex;
  flex-direction: column;
}

/* Header */
.popup-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.popup-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.popup-header .subtitle {
  font-size: 12px;
  opacity: 0.8;
}

/* Content */
.popup-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Feature Card */
.feature-card {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.feature-card .icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.feature-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.feature-card p {
  font-size: 12px;
  opacity: 0.8;
}

/* Button */
.primary-btn {
  background: white;
  color: #764ba2;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.primary-btn:active {
  transform: translateY(0);
}

/* Status */
.status {
  text-align: center;
  padding: 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  font-size: 13px;
}

/* Footer */
.popup-footer {
  padding: 12px 20px;
  text-align: center;
  font-size: 11px;
  opacity: 0.6;
  border-top: 1px solid rgba(255,255,255,0.1);
}`;

const DEFAULT_JS = `// Extension popup JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const actionBtn = document.getElementById('actionBtn');
  const status = document.getElementById('status');
  let clickCount = 0;
  
  actionBtn.addEventListener('click', function() {
    clickCount++;
    status.textContent = 'Clicked ' + clickCount + ' time(s)!';
    
    // Animate the button
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = '';
    }, 100);
    
    // Example: Using Chrome storage API
    chrome.storage.local.set({ clickCount: clickCount });
  });
  
  // Load saved click count
  chrome.storage.local.get(['clickCount'], function(result) {
    if (result.clickCount) {
      clickCount = result.clickCount;
      status.textContent = 'Welcome back! ' + clickCount + ' clicks saved.';
    }
  });
});`;

const DEFAULT_MANIFEST = `{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "Built with Extendr",
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "permissions": [
    "storage"
  ],
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`;

type TabType = "preview" | "html" | "css" | "js" | "manifest";

/**
 * Complete extension preview component with code editor and live preview
 */
export function ExtensionPreview({
  className,
  initialHtml = DEFAULT_HTML,
  initialCss = DEFAULT_CSS,
  initialJs = DEFAULT_JS,
  initialManifest = DEFAULT_MANIFEST,
  onCodeChange,
}: ExtensionPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("preview");
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [manifest, setManifest] = useState(initialManifest);

  const handleCodeChange = useCallback(
    (type: "html" | "css" | "js" | "manifest", value: string) => {
      switch (type) {
        case "html":
          setHtml(value);
          break;
        case "css":
          setCss(value);
          break;
        case "js":
          setJs(value);
          break;
        case "manifest":
          setManifest(value);
          break;
      }

      onCodeChange?.({
        html: type === "html" ? value : html,
        css: type === "css" ? value : css,
        js: type === "js" ? value : js,
        manifest: type === "manifest" ? value : manifest,
      });
    },
    [html, css, js, manifest, onCodeChange]
  );

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
    { id: "html", label: "HTML", icon: <FileCode className="w-4 h-4" /> },
    { id: "css", label: "CSS", icon: <Palette className="w-4 h-4" /> },
    { id: "js", label: "JS", icon: <Braces className="w-4 h-4" /> },
    { id: "manifest", label: "Manifest", icon: <FileJson className="w-4 h-4" /> },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-[#1a1a1a] rounded-lg overflow-hidden", className)}>
      {/* Tab bar */}
      <div className="flex items-center bg-[#252525] border-b border-[#333] px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <PreviewFrame
                html={html}
                css={css}
                javascript={js}
                title="Extension Preview"
              />
            </motion.div>
          )}

          {activeTab === "html" && (
            <motion.div
              key="html"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-auto"
            >
              <CodeEditor
                value={html}
                onChange={(v) => handleCodeChange("html", v)}
                language="html"
                placeholder="<!-- Enter your popup HTML here -->"
              />
            </motion.div>
          )}

          {activeTab === "css" && (
            <motion.div
              key="css"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-auto"
            >
              <CodeEditor
                value={css}
                onChange={(v) => handleCodeChange("css", v)}
                language="css"
                placeholder="/* Enter your styles here */"
              />
            </motion.div>
          )}

          {activeTab === "js" && (
            <motion.div
              key="js"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-auto"
            >
              <CodeEditor
                value={js}
                onChange={(v) => handleCodeChange("js", v)}
                language="javascript"
                placeholder="// Enter your JavaScript here"
              />
            </motion.div>
          )}

          {activeTab === "manifest" && (
            <motion.div
              key="manifest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-auto"
            >
              <CodeEditor
                value={manifest}
                onChange={(v) => handleCodeChange("manifest", v)}
                language="json"
                placeholder='{ "manifest_version": 3, ... }'
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ExtensionPreview;

