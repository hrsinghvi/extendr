import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw, ExternalLink, Smartphone, Monitor, Tablet } from "lucide-react";
import { transform } from 'sucrase';

interface PreviewFrameProps {
  react: string;
  html: string;
  css: string;
  javascript: string;
  className?: string;
  title?: string;
}

type ViewportSize = "mobile" | "tablet" | "desktop";

const VIEWPORT_SIZES: Record<ViewportSize, { width: number; height: number; label: string }> = {
  mobile: { width: 375, height: 667, label: "Mobile" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  desktop: { width: 1200, height: 800, label: "Desktop" },
};

/**
 * Sandboxed iframe preview for Chrome extension UI
 * Renders HTML/CSS/JS safely in an isolated environment
 */
export function PreviewFrame({
  react,
  html,
  css,
  javascript,
  className,
  title = "Extension Preview",
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  /**
   * Builds the complete HTML document for the preview
   * Includes error handling and console capture
   */
  const buildPreviewDocument = useCallback(() => {
    let transpiledJs = javascript;
    if (react.trim()) {
      try {
        const fullReactCode = `
          import React from 'react';
          import { createRoot } from 'react-dom/client';

          ${react}

          const container = document.getElementById('root');
          if (container) {
            const root = createRoot(container);
            root.render(<App />);
          } else {
            console.error('Could not find root element to mount React app.');
          }
        `;

        const transformed = transform(fullReactCode, {
          transforms: ['jsx', 'typescript', 'imports'],
          jsxPragma: 'React.createElement',
          jsxFragmentPragma: 'React.Fragment',
          production: true, // Minify and optimize
        });

        transpiledJs = transformed.code;
      } catch (e: any) {
        console.error("Sucrase transformation failed:", e);
        setError(`React/JSX Transpilation Error: ${e.message}`);
        // Inject a script to display the error in the preview itself
        transpiledJs = `
          document.body.innerHTML = '<div style="color: red; font-family: monospace; padding: 1rem;">'
            + '<h2>React Transpilation Error</h2>'
            + '<pre>${e.message.replace(/\'/g, "\\'")}</pre>'
          + '</div>';
        `;
      }
    }

    // Escape script content to prevent XSS while still allowing execution in sandbox
    const safeJS = transpiledJs
      .replace(/<\/script>/gi, "<\\/script>")
      .replace(/<!--/g, "<\\!--");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Reset and base styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      background: #fff;
      min-height: 100%;
    }
    
    /* Popup-like container for extension UI */
    .extension-popup {
      width: 100%;
      min-height: 100vh;
      padding: 12px;
    }
    
    /* Make external links obvious */
    a[href^="http"] {
      color: #1a73e8;
      text-decoration: underline;
    }
    
    /* Error display */
    .preview-error {
      background: #fee2e2;
      border: 1px solid #ef4444;
      color: #b91c1c;
      padding: 12px;
      margin: 8px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
    
    /* User styles */
    ${css}
  </style>
</head>
<body>
  <div class="extension-popup" id="root">
    ${html}
  </div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <script>
    // Capture and display errors
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'preview-error';
      errorDiv.textContent = 'Error: ' + msg + ' (line ' + lineNo + ')';
      document.body.insertBefore(errorDiv, document.body.firstChild);
      return false;
    };
    
    // Make external links open in new tab
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a[href^="http"]');
      if (link) {
        e.preventDefault();
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    });
    
    // Mock Chrome extension APIs for preview
    if (typeof chrome === 'undefined') {
      window.chrome = {
        runtime: {
          sendMessage: function(msg, callback) {
            console.log('[Mock] chrome.runtime.sendMessage:', msg);
            if (callback) callback({ success: true, mock: true });
          },
          onMessage: {
            addListener: function(fn) {
              console.log('[Mock] chrome.runtime.onMessage.addListener registered');
            }
          },
          getURL: function(path) {
            return 'chrome-extension://mock-id/' + path;
          }
        },
        storage: {
          local: {
            get: function(keys, callback) {
              console.log('[Mock] chrome.storage.local.get:', keys);
              const result = {};
              if (Array.isArray(keys)) {
                keys.forEach(k => result[k] = localStorage.getItem('mock_' + k));
              } else if (typeof keys === 'string') {
                result[keys] = localStorage.getItem('mock_' + keys);
              }
              if (callback) callback(result);
              return Promise.resolve(result);
            },
            set: function(items, callback) {
              console.log('[Mock] chrome.storage.local.set:', items);
              Object.entries(items).forEach(([k, v]) => {
                localStorage.setItem('mock_' + k, JSON.stringify(v));
              });
              if (callback) callback();
              return Promise.resolve();
            }
          },
          sync: {
            get: function(keys, callback) {
              return chrome.storage.local.get(keys, callback);
            },
            set: function(items, callback) {
              return chrome.storage.local.set(items, callback);
            }
          }
        },
        tabs: {
          query: function(queryInfo, callback) {
            console.log('[Mock] chrome.tabs.query:', queryInfo);
            const mockTabs = [{ id: 1, url: 'https://example.com', title: 'Mock Tab' }];
            if (callback) callback(mockTabs);
            return Promise.resolve(mockTabs);
          },
          create: function(createProperties, callback) {
            console.log('[Mock] chrome.tabs.create:', createProperties);
            window.open(createProperties.url, '_blank');
            if (callback) callback({ id: 2, ...createProperties });
          }
        },
        action: {
          setBadgeText: function(details) {
            console.log('[Mock] chrome.action.setBadgeText:', details);
          },
          setBadgeBackgroundColor: function(details) {
            console.log('[Mock] chrome.action.setBadgeBackgroundColor:', details);
          }
        }
      };
    }
    
    // User JavaScript
    try {
      ${safeJS}
    } catch (e) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'preview-error';
      errorDiv.textContent = 'JavaScript Error: ' + e.message;
      document.body.insertBefore(errorDiv, document.body.firstChild);
    }
  </script>
</body>
</html>`;
  }, [react, html, css, javascript, title]);

  /**
   * Updates the iframe content
   */
  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const doc = buildPreviewDocument();
      
      // Use srcdoc for sandboxed content
      iframeRef.current.srcdoc = doc;
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to render preview");
    } finally {
      setIsLoading(false);
    }
  }, [buildPreviewDocument]);

  // Update preview when code changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      updatePreview();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [react, html, css, javascript, updatePreview]);

  const handleRefresh = () => {
    updatePreview();
  };

  const handleOpenExternal = () => {
    const doc = buildPreviewDocument();
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Clean up blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const currentViewport = VIEWPORT_SIZES[viewport];

  return (
    <div className={cn("flex flex-col h-full bg-[#1a1a1a]", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252525] border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Preview</span>
          {isLoading && (
            <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Viewport toggles */}
          <button
            onClick={() => setViewport("mobile")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewport === "mobile"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#333]"
            )}
            title="Mobile view"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewport === "tablet"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#333]"
            )}
            title="Tablet view"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport("desktop")}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewport === "desktop"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#333]"
            )}
            title="Desktop view"
          >
            <Monitor className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-[#444] mx-1" />

          {/* Actions */}
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenExternal}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-[#0d0d0d] flex items-start justify-center p-4">
        {error ? (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-md">
            <p className="text-red-400 text-sm font-mono">{error}</p>
          </div>
        ) : (
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: viewport === "desktop" ? "100%" : currentViewport.width,
              maxWidth: currentViewport.width,
              height: viewport === "desktop" ? "100%" : currentViewport.height,
              maxHeight: "100%",
            }}
          >
            <iframe
              ref={iframeRef}
              title="Extension Preview"
              sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              className="w-full h-full border-0"
              style={{ backgroundColor: "#fff" }}
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-3 py-1.5 bg-[#252525] border-t border-[#333] flex items-center justify-between">
        <span className="text-[10px] text-gray-500">
          {currentViewport.label} ({currentViewport.width}×{currentViewport.height})
        </span>
        <span className="text-[10px] text-gray-500">
          Updated {lastUpdate.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export default PreviewFrame;

