/**
 * WebContainer Bridge
 * 
 * Manages WebContainer lifecycle for running Chrome extension previews.
 * Uses StackBlitz WebContainers API to provide a Node.js environment in the browser.
 * 
 * @see https://webcontainers.io/guides/quickstart
 */

import { WebContainer } from '@webcontainer/api';
import type { FileSystemTree, WebContainerProcess } from '@webcontainer/api';
import type { FileMap } from './types';

// ============================================================================
// Types
// ============================================================================

export type TerminalWriter = (data: string) => void;
export type StatusCallback = (status: WebContainerStatus) => void;
export type ErrorCallback = (error: string, details?: string) => void;
export type UrlCallback = (url: string) => void;

export interface WebContainerStatus {
  phase: 'idle' | 'booting' | 'mounting' | 'installing' | 'starting' | 'running' | 'error';
  message: string;
  progress?: number;
}

// ============================================================================
// State (stored on window to persist across HMR)
// ============================================================================

// Extend Window interface for our global state
declare global {
  interface Window {
    __webcontainer_instance__?: WebContainer;
    __webcontainer_boot_promise__?: Promise<WebContainer>;
    __webcontainer_session_id__?: string;
  }
}

// Generate a unique session ID for this page load
const SESSION_ID = `wc-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Check if this is a fresh page load (not HMR)
// If the session ID doesn't match, clear the cached state
const storedSessionId = window.__webcontainer_session_id__;
if (storedSessionId && storedSessionId !== SESSION_ID) {
  // This is a new page load, not HMR - clear stale references
  // Note: The actual WebContainer may still be alive in the service worker
  console.log('[WebContainer] Detected new session, clearing stale references');
  window.__webcontainer_instance__ = undefined;
  window.__webcontainer_boot_promise__ = undefined;
}
window.__webcontainer_session_id__ = SESSION_ID;

// Use window storage to survive HMR reloads
// This prevents "Only a single WebContainer instance can be booted" errors
let webcontainerInstance: WebContainer | null = window.__webcontainer_instance__ || null;
let bootPromise: Promise<WebContainer> | null = window.__webcontainer_boot_promise__ || null;
let currentProcess: WebContainerProcess | null = null;
let serverUrl: string | null = null;

// Callbacks
let terminalWriter: TerminalWriter | null = null;
let statusCallback: StatusCallback | null = null;
let errorCallback: ErrorCallback | null = null;
let urlCallback: UrlCallback | null = null;

// ============================================================================
// Callback Setters
// ============================================================================

export function setTerminalWriter(writer: TerminalWriter | null): void {
  terminalWriter = writer;
}

export function setStatusCallback(callback: StatusCallback | null): void {
  statusCallback = callback;
}

export function setErrorCallback(callback: ErrorCallback | null): void {
  errorCallback = callback;
}

export function setUrlCallback(callback: UrlCallback | null): void {
  urlCallback = callback;
}

// ============================================================================
// Internal Helpers
// ============================================================================

function writeToTerminal(data: string): void {
  if (terminalWriter) {
    terminalWriter(data);
  }
  // Also log to console for debugging
  console.log('[WebContainer Terminal]', data.replace(/\r\n/g, '\n').trim());
}

function updateStatus(phase: WebContainerStatus['phase'], message: string, progress?: number): void {
  const status: WebContainerStatus = { phase, message, progress };
  console.log(`[WebContainer Status] ${phase}: ${message}`);
  statusCallback?.(status);
}

function reportError(error: string, details?: string): void {
  console.error(`[WebContainer Error] ${error}`, details || '');
  writeToTerminal(`\x1b[31m[ERROR]\x1b[0m ${error}\r\n`);
  if (details) {
    writeToTerminal(`\x1b[90m${details}\x1b[0m\r\n`);
  }
  errorCallback?.(error, details);
  updateStatus('error', error);
}

// ============================================================================
// WebContainer Boot
// ============================================================================

/**
 * Boot WebContainer instance
 * This is the first step - must be called before any other operations
 */
export async function bootWebContainer(): Promise<WebContainer> {
  // Return existing instance if already booted
  if (webcontainerInstance) {
    console.log('[WebContainer] Already booted, returning existing instance');
    return webcontainerInstance;
  }

  // Return pending boot promise if boot is in progress
  if (bootPromise) {
    console.log('[WebContainer] Boot in progress, waiting...');
    return bootPromise;
  }

  updateStatus('booting', 'Initializing WebContainer...', 0);
  writeToTerminal('\x1b[1;36m[WebContainer]\x1b[0m Booting...\r\n');

  const promise = (async () => {
    try {
      // Check if we're in a secure context (required for WebContainers)
      if (!window.isSecureContext) {
        throw new Error('WebContainers require a secure context (HTTPS or localhost)');
      }

      // Check for required headers
      // Note: We can't directly check headers, but we can try to boot and catch errors
      console.log('[WebContainer] Attempting to boot with credentialless COEP...');
      
      let instance: WebContainer;
      try {
        instance = await WebContainer.boot({
          coep: 'credentialless' // More permissive than 'require-corp'
        });
      } catch (bootError: any) {
        // Handle "Only a single WebContainer instance can be booted" error
        if (bootError.message?.includes('single WebContainer')) {
          console.warn('[WebContainer] Instance already exists. Page reload may be needed.');
          // If we have a cached instance, return it
          if (window.__webcontainer_instance__) {
            console.log('[WebContainer] Returning cached instance from window');
            return window.__webcontainer_instance__;
          }
          // Otherwise, we need to tell the user to refresh
          throw new Error('WebContainer already running. Please refresh the page to restart.');
        }
        throw bootError;
      }

      console.log('[WebContainer] Boot successful!');
      writeToTerminal('\x1b[1;32m[WebContainer]\x1b[0m Boot successful!\r\n');

      // Set up server-ready listener
      instance.on('server-ready', (port: number, url: string) => {
        console.log(`[WebContainer] Server ready on port ${port}: ${url}`);
        writeToTerminal(`\x1b[1;32m[WebContainer]\x1b[0m Server ready at ${url}\r\n`);
        serverUrl = url;
        urlCallback?.(url);
        updateStatus('running', 'Running', 100);
      });

      // Set up error listener
      instance.on('error', (error: { message: string }) => {
        reportError('WebContainer error', error.message);
      });

      webcontainerInstance = instance;
      // Store on window so it persists across HMR
      window.__webcontainer_instance__ = instance;
      updateStatus('idle', 'WebContainer ready', 10);
      
      return instance;
    } catch (error: any) {
      bootPromise = null;
      window.__webcontainer_boot_promise__ = undefined;
      
      // Provide helpful error messages
      let errorMessage = error.message || 'Unknown error';
      let details = '';
      
      if (errorMessage.includes('SharedArrayBuffer')) {
        errorMessage = 'WebContainers require Cross-Origin Isolation headers';
        details = 'Your server needs to send these headers:\n' +
          'Cross-Origin-Embedder-Policy: require-corp (or credentialless)\n' +
          'Cross-Origin-Opener-Policy: same-origin';
      } else if (errorMessage.includes('secure context')) {
        details = 'WebContainers only work on HTTPS or localhost';
      }
      
      reportError(errorMessage, details);
      throw error;
    }
  })();

  // Store on both module variable and window
  bootPromise = promise;
  window.__webcontainer_boot_promise__ = promise;

  return promise;
}

// ============================================================================
// File System Operations
// ============================================================================

/**
 * Convert flat file map to WebContainer FileSystemTree
 */
export function fileMapToFileSystemTree(files: FileMap): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const [filePath, contents] of Object.entries(files)) {
    const parts = filePath.split('/').filter(p => p.length > 0);
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;

      if (isLastPart) {
        // It's a file
        current[part] = {
          file: { contents }
        };
      } else {
        // It's a directory
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        const dir = current[part] as { directory: FileSystemTree };
        current = dir.directory;
      }
    }
  }

  return tree;
}

/**
 * Mount files to WebContainer
 */
export async function mountFiles(files: FileMap): Promise<void> {
  const wc = await bootWebContainer();
  
  const fileCount = Object.keys(files).length;
  updateStatus('mounting', `Mounting ${fileCount} files...`, 15);
  writeToTerminal(`\x1b[1;36m[WebContainer]\x1b[0m Mounting ${fileCount} files...\r\n`);

  try {
    const tree = fileMapToFileSystemTree(files);
    await wc.mount(tree);
    
    writeToTerminal(`\x1b[1;32m[WebContainer]\x1b[0m Files mounted successfully\r\n`);
    console.log('[WebContainer] Files mounted:', Object.keys(files));
  } catch (error: any) {
    reportError('Failed to mount files', error.message);
    throw error;
  }
}

/**
 * Write a single file to WebContainer
 */
export async function writeFile(path: string, contents: string): Promise<void> {
  const wc = await bootWebContainer();
  
  try {
    // Ensure parent directories exist
    const parts = path.split('/');
    if (parts.length > 1) {
      const dirPath = parts.slice(0, -1).join('/');
      await wc.fs.mkdir(dirPath, { recursive: true });
    }
    
    await wc.fs.writeFile(path, contents);
    console.log(`[WebContainer] Wrote file: ${path}`);
  } catch (error: any) {
    reportError(`Failed to write file: ${path}`, error.message);
    throw error;
  }
}

/**
 * Read a file from WebContainer
 */
export async function readFile(path: string): Promise<string> {
  const wc = await bootWebContainer();
  return await wc.fs.readFile(path, 'utf-8');
}

// ============================================================================
// Process Management
// ============================================================================

/**
 * Run a command in WebContainer
 */
export async function runCommand(
  command: string,
  args: string[] = []
): Promise<number> {
  const wc = await bootWebContainer();
  
  const fullCommand = `${command} ${args.join(' ')}`.trim();
  writeToTerminal(`\x1b[1;33m$\x1b[0m ${fullCommand}\r\n`);
  console.log(`[WebContainer] Running: ${fullCommand}`);

  try {
    const process = await wc.spawn(command, args);
    currentProcess = process;

    // Pipe output to terminal
    const outputReader = process.output.getReader();
    
    (async () => {
      try {
        while (true) {
          const { done, value } = await outputReader.read();
          if (done) break;
          writeToTerminal(value);
        }
      } catch (e) {
        // Stream closed, ignore
      }
    })();

    const exitCode = await process.exit;
    currentProcess = null;
    
    console.log(`[WebContainer] Command exited with code: ${exitCode}`);
    
    if (exitCode !== 0) {
      writeToTerminal(`\x1b[33m[WebContainer]\x1b[0m Command exited with code ${exitCode}\r\n`);
    }
    
    return exitCode;
  } catch (error: any) {
    currentProcess = null;
    reportError(`Command failed: ${fullCommand}`, error.message);
    throw error;
  }
}

/**
 * Start a long-running process (like dev server)
 */
export async function startProcess(
  command: string,
  args: string[] = []
): Promise<WebContainerProcess> {
  const wc = await bootWebContainer();
  
  const fullCommand = `${command} ${args.join(' ')}`.trim();
  writeToTerminal(`\x1b[1;33m$\x1b[0m ${fullCommand}\r\n`);
  console.log(`[WebContainer] Starting: ${fullCommand}`);

  const process = await wc.spawn(command, args);
  currentProcess = process;

  // Pipe output to terminal (non-blocking)
  const outputReader = process.output.getReader();
  
  (async () => {
    try {
      while (true) {
        const { done, value } = await outputReader.read();
        if (done) break;
        writeToTerminal(value);
      }
    } catch (e) {
      // Stream closed, ignore
    }
  })();

  // Handle process exit
  process.exit.then((exitCode) => {
    console.log(`[WebContainer] Process exited with code: ${exitCode}`);
    if (currentProcess === process) {
      currentProcess = null;
    }
  });

  return process;
}

/**
 * Kill current running process
 */
export function killProcess(): void {
  if (currentProcess) {
    console.log('[WebContainer] Killing current process');
    currentProcess.kill();
    currentProcess = null;
    writeToTerminal('\x1b[1;31m[WebContainer]\x1b[0m Process terminated\r\n');
  }
}

// ============================================================================
// Build & Run Extension
// ============================================================================

/**
 * Install npm dependencies
 */
export async function installDependencies(): Promise<boolean> {
  updateStatus('installing', 'Installing dependencies...', 30);
  writeToTerminal('\x1b[1;36m[WebContainer]\x1b[0m Installing dependencies...\r\n');

  try {
    const exitCode = await runCommand('npm', ['install']);
    
    if (exitCode !== 0) {
      reportError('npm install failed', `Exit code: ${exitCode}`);
      return false;
    }
    
    updateStatus('installing', 'Dependencies installed', 60);
    return true;
  } catch (error: any) {
    reportError('Failed to install dependencies', error.message);
    return false;
  }
}

/**
 * Start the Vite development server
 */
export async function startDevServer(): Promise<void> {
  updateStatus('starting', 'Starting development server...', 80);
  writeToTerminal('\x1b[1;36m[WebContainer]\x1b[0m Starting dev server...\r\n');

  try {
    // Start Vite dev server
    await startProcess('npm', ['run', 'dev']);
    
    // The server-ready event will update the status and URL
  } catch (error: any) {
    reportError('Failed to start dev server', error.message);
    throw error;
  }
}

/**
 * Build and run extension preview
 * 
 * This sets up a Vite project to serve the extension's popup HTML.
 * If the AI provides its own config files (package.json, vite.config.ts, index.html),
 * they will be used instead of the defaults.
 */
export async function buildExtension(files: FileMap, installDeps = true): Promise<void> {
  console.log('[WebContainer] buildExtension called with files:', Object.keys(files));
  
  try {
    // Step 1: Boot WebContainer
    await bootWebContainer();
    
    // Step 2: Create project structure
    updateStatus('mounting', 'Setting up project...', 20);
    
    // Check if project config files already exist in the provided files
    const hasPackageJson = !!files['package.json'];
    const hasViteConfig = !!files['vite.config.js'] || !!files['vite.config.ts'];
    const hasIndexHtml = !!files['index.html'];
    
    console.log('[WebContainer] Config detection:', { hasPackageJson, hasViteConfig, hasIndexHtml });
    
    // Start with all provided files
    const allFiles: FileMap = { ...files };
    
    // Only create default package.json if not provided
    if (!hasPackageJson) {
      const defaultPackageJson = {
        name: 'extension-preview',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite --host',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          'react': '^18.3.1',
          'react-dom': '^18.3.1',
          'lucide-react': '^0.468.0'
        },
        devDependencies: {
          '@types/react': '^18.3.16',
          '@types/react-dom': '^18.3.5',
          '@vitejs/plugin-react': '^4.3.4',
          'autoprefixer': '^10.4.20',
          'postcss': '^8.4.49',
          'tailwindcss': '^3.4.17',
          'typescript': '^5.7.2',
          'vite': '^6.0.3'
        }
      };
      allFiles['package.json'] = JSON.stringify(defaultPackageJson, null, 2);
      console.log('[WebContainer] Using default package.json with React/Tailwind');
    } else {
      console.log('[WebContainer] Using AI-provided package.json');
    }

    // Only create default vite.config.ts if not provided
    if (!hasViteConfig) {
      const defaultViteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
`;
      allFiles['vite.config.ts'] = defaultViteConfig;
      console.log('[WebContainer] Using default vite.config.ts with React plugin and @ alias');
    } else {
      console.log('[WebContainer] Using AI-provided vite config');
    }

    // Create default tailwind.config.js if not provided
    if (!files['tailwind.config.js'] && !files['tailwind.config.ts']) {
      const defaultTailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
      allFiles['tailwind.config.js'] = defaultTailwindConfig;
      console.log('[WebContainer] Using default tailwind.config.js');
    }

    // Create default postcss.config.js if not provided
    if (!files['postcss.config.js'] && !files['postcss.config.cjs']) {
      const defaultPostcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
      allFiles['postcss.config.js'] = defaultPostcssConfig;
      console.log('[WebContainer] Using default postcss.config.js');
    }

    // Create default tsconfig.json if not provided
    if (!files['tsconfig.json']) {
      const defaultTsConfig = {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          baseUrl: '.',
          paths: {
            '@/*': ['./src/*']
          }
        },
        include: ['src']
      };
      allFiles['tsconfig.json'] = JSON.stringify(defaultTsConfig, null, 2);
      console.log('[WebContainer] Using default tsconfig.json');
    }

    // Create default src/index.css with Tailwind
    if (!files['src/index.css'] && !files['src/styles/index.css']) {
      const defaultCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
}
`;
      allFiles['src/index.css'] = defaultCss;
      console.log('[WebContainer] Created src/index.css with Tailwind');
    }

    // Only create index.html if not provided
    if (!hasIndexHtml) {
      // Create a proper React entry index.html
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Extension Preview</title>
  </head>
  <body class="dark">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
      allFiles['index.html'] = indexHtml;
      console.log('[WebContainer] Using default React index.html');
    } else {
      console.log('[WebContainer] Using AI-provided index.html');
    }

    // Create default src/main.tsx if not provided
    if (!files['src/main.tsx']) {
      const defaultMain = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
      allFiles['src/main.tsx'] = defaultMain;
      console.log('[WebContainer] Created default src/main.tsx');
    }

    // Create default src/App.tsx if not provided
    if (!files['src/App.tsx'] && !files['src/pages/popup/App.tsx']) {
      const defaultApp = `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-80 bg-gray-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-xl font-bold text-center mb-4">
          Extension Preview
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Your extension will appear here. The AI is setting up your project.
        </p>
        <p className="text-4xl font-mono text-center mb-4">{count}</p>
        <button
          onClick={() => setCount(c => c + 1)}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
        >
          Click me!
        </button>
      </div>
    </div>
  );
}
`;
      allFiles['src/App.tsx'] = defaultApp;
      console.log('[WebContainer] Created default src/App.tsx');
    }

    await mountFiles(allFiles);

    // Step 3: Install dependencies
    if (installDeps) {
      const success = await installDependencies();
      if (!success) {
        return;
      }
    }

    // Step 4: Start dev server
    await startDevServer();

  } catch (error: any) {
    reportError('Build failed', error.message);
  }
}

/**
 * Update files in WebContainer (for hot reload)
 */
export async function updateFilesInContainer(files: FileMap): Promise<void> {
  console.log('[WebContainer] Updating files:', Object.keys(files));
  
  try {
    for (const [path, contents] of Object.entries(files)) {
      await writeFile(path, contents);
    }
    
    // Also update index.html if popup.html changed
    if (files['popup/popup.html']) {
      await writeFile('index.html', files['popup/popup.html']);
    }
    
    writeToTerminal(`\x1b[1;32m[WebContainer]\x1b[0m Updated ${Object.keys(files).length} files\r\n`);
  } catch (error: any) {
    reportError('Failed to update files', error.message);
  }
}

/**
 * Stop the extension preview
 */
export function stopExtension(): void {
  killProcess();
  serverUrl = null;
  updateStatus('idle', 'Extension stopped');
}

// ============================================================================
// Getters
// ============================================================================

export function getWebContainer(): WebContainer | null {
  return webcontainerInstance;
}

export function getServerUrl(): string | null {
  return serverUrl;
}

export function isBooted(): boolean {
  return webcontainerInstance !== null;
}

// ============================================================================
// Teardown
// ============================================================================

export async function teardown(): Promise<void> {
  killProcess();
  
  if (webcontainerInstance) {
    console.log('[WebContainer] Tearing down...');
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
    bootPromise = null;
    serverUrl = null;
    // Clear window storage
    window.__webcontainer_instance__ = undefined;
    window.__webcontainer_boot_promise__ = undefined;
    writeToTerminal('\x1b[1;36m[WebContainer]\x1b[0m Torn down\r\n');
  }
}

// ============================================================================
// Export default
// ============================================================================

export default {
  bootWebContainer,
  mountFiles,
  writeFile,
  readFile,
  runCommand,
  startProcess,
  killProcess,
  installDependencies,
  startDevServer,
  buildExtension,
  updateFilesInContainer,
  stopExtension,
  getWebContainer,
  getServerUrl,
  isBooted,
  teardown,
  setTerminalWriter,
  setStatusCallback,
  setErrorCallback,
  setUrlCallback,
  fileMapToFileSystemTree
};
