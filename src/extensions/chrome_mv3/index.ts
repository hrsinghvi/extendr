/**
 * Chrome MV3 Extension Scaffold
 * 
 * This module exports the default scaffold files for a Chrome MV3 extension.
 * Used by the WebContainers integration to bootstrap extension projects.
 */

// Default manifest.json content
export const DEFAULT_MANIFEST = {
  manifest_version: 3,
  name: "Extendr Extension",
  version: "1.0.0",
  description: "A Chrome extension built with Extendr",
  permissions: ["storage", "activeTab"],
  action: {
    default_popup: "popup/popup.html",
    default_icon: {
      "16": "assets/icons/icon16.png",
      "32": "assets/icons/icon32.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  },
  background: {
    service_worker: "background/service-worker.js",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["content/content.js"],
      css: ["content/content.css"],
      run_at: "document_idle"
    }
  ],
  icons: {
    "16": "assets/icons/icon16.png",
    "32": "assets/icons/icon32.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  }
};

// Default popup HTML
export const DEFAULT_POPUP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Extension Popup</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div id="app">
    <header class="header">
      <h1>My Extension</h1>
      <span class="status" id="status">Active</span>
    </header>
    <main class="content">
      <p class="description">Your Chrome extension is running!</p>
      <div class="actions">
        <button id="actionBtn" class="btn btn-primary">Take Action</button>
      </div>
    </main>
  </div>
  <script src="popup.js" type="module"></script>
</body>
</html>`;

// Default popup CSS
export const DEFAULT_POPUP_CSS = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 320px;
  min-height: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.btn {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}`;

// Default popup JS
export const DEFAULT_POPUP_JS = `// Popup Script
const actionBtn = document.getElementById('actionBtn');

actionBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.id) {
    await chrome.tabs.sendMessage(tab.id, { type: 'PERFORM_ACTION' });
  }
});

chrome.runtime.sendMessage({ type: 'GET_STATUS' }).then(response => {
  console.log('Status:', response);
});`;

// Default service worker
export const DEFAULT_SERVICE_WORKER = `// Background Service Worker
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  chrome.storage.local.set({ settings: { enabled: true } });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_STATUS':
      sendResponse({ status: 'active', timestamp: Date.now() });
      break;
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  return false;
});`;

// Default content script
export const DEFAULT_CONTENT_SCRIPT = `// Content Script
if (!window.__EXTENSION_INJECTED__) {
  window.__EXTENSION_INJECTED__ = true;
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PERFORM_ACTION') {
      showNotification('Action performed!');
      sendResponse({ success: true });
    }
    return false;
  });
  
  function showNotification(text) {
    const el = document.createElement('div');
    el.textContent = text;
    Object.assign(el.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'system-ui',
      fontSize: '14px',
      zIndex: '2147483647',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}`;

// Default content CSS
export const DEFAULT_CONTENT_CSS = `/* Content Script Styles */
.extension-notification {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  z-index: 2147483647 !important;
}`;

/**
 * Extension file structure for WebContainers
 */
export interface ExtensionFileTree {
  [path: string]: {
    file: {
      contents: string;
    };
  } | {
    directory: ExtensionFileTree;
  };
}

/**
 * Generate a complete extension file tree for WebContainers
 */
export function generateExtensionFileTree(options?: {
  name?: string;
  description?: string;
  permissions?: string[];
}): ExtensionFileTree {
  const manifest = {
    ...DEFAULT_MANIFEST,
    name: options?.name || DEFAULT_MANIFEST.name,
    description: options?.description || DEFAULT_MANIFEST.description,
    permissions: options?.permissions || DEFAULT_MANIFEST.permissions
  };

  return {
    'manifest.json': {
      file: { contents: JSON.stringify(manifest, null, 2) }
    },
    'popup': {
      directory: {
        'popup.html': { file: { contents: DEFAULT_POPUP_HTML } },
        'popup.css': { file: { contents: DEFAULT_POPUP_CSS } },
        'popup.js': { file: { contents: DEFAULT_POPUP_JS } }
      }
    },
    'background': {
      directory: {
        'service-worker.js': { file: { contents: DEFAULT_SERVICE_WORKER } }
      }
    },
    'content': {
      directory: {
        'content.js': { file: { contents: DEFAULT_CONTENT_SCRIPT } },
        'content.css': { file: { contents: DEFAULT_CONTENT_CSS } }
      }
    },
    'assets': {
      directory: {
        'icons': {
          directory: {}
        }
      }
    }
  };
}

/**
 * Convert flat file map to extension file tree
 */
export function filesToFileTree(files: Record<string, string>): ExtensionFileTree {
  const tree: ExtensionFileTree = {};
  
  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split('/');
    let current = tree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      
      if (isLast) {
        current[part] = { file: { contents } };
      } else {
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        const dir = current[part] as { directory: ExtensionFileTree };
        current = dir.directory;
      }
    }
  }
  
  return tree;
}

export default {
  DEFAULT_MANIFEST,
  DEFAULT_POPUP_HTML,
  DEFAULT_POPUP_CSS,
  DEFAULT_POPUP_JS,
  DEFAULT_SERVICE_WORKER,
  DEFAULT_CONTENT_SCRIPT,
  DEFAULT_CONTENT_CSS,
  generateExtensionFileTree,
  filesToFileTree
};

