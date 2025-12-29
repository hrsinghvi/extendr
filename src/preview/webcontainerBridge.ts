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

// Track boot attempts to prevent infinite loops
let bootAttempts = 0;
const MAX_BOOT_ATTEMPTS = 2;

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
 * Try to clear any existing WebContainer service workers
 * This helps recover from "Unable to create more instances" errors
 */
async function clearWebContainerServiceWorkers(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        // Only unregister WebContainer-related service workers
        if (registration.scope.includes('webcontainer') || 
            registration.active?.scriptURL.includes('webcontainer')) {
          console.log('[WebContainer] Unregistering service worker:', registration.scope);
          await registration.unregister();
        }
      }
    }
  } catch (e) {
    console.warn('[WebContainer] Failed to clear service workers:', e);
  }
}

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

  // Check window cache first (survives HMR)
  if (window.__webcontainer_instance__) {
    console.log('[WebContainer] Found cached instance on window');
    webcontainerInstance = window.__webcontainer_instance__;
    return webcontainerInstance;
  }

  // Return pending boot promise if boot is in progress
  if (bootPromise) {
    console.log('[WebContainer] Boot in progress, waiting...');
    return bootPromise;
  }

  // Check window cache for pending promise
  if (window.__webcontainer_boot_promise__) {
    console.log('[WebContainer] Found cached boot promise on window');
    bootPromise = window.__webcontainer_boot_promise__;
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
        const errorMsg = bootError.message || String(bootError);
        
        // Handle various forms of "instance already exists" error
        if (errorMsg.includes('single WebContainer') || 
            errorMsg.includes('Unable to create') || 
            errorMsg.includes('already') ||
            errorMsg.includes('more instances')) {
          console.warn('[WebContainer] Instance already exists:', errorMsg);
          
          // If we have a cached instance, use it
          if (window.__webcontainer_instance__) {
            console.log('[WebContainer] Returning cached instance from window');
            webcontainerInstance = window.__webcontainer_instance__;
            return webcontainerInstance;
          }
          
          // First attempt: try to clear service workers and retry
          if (bootAttempts < MAX_BOOT_ATTEMPTS) {
            bootAttempts++;
            console.log(`[WebContainer] Attempting recovery (attempt ${bootAttempts}/${MAX_BOOT_ATTEMPTS})...`);
            writeToTerminal('\x1b[1;33m[WebContainer]\x1b[0m Attempting to recover...\r\n');
            
            // Clear state
            bootPromise = null;
            window.__webcontainer_boot_promise__ = undefined;
            
            // Try clearing service workers
            await clearWebContainerServiceWorkers();
            
            // Wait a moment for cleanup
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry boot
            try {
              instance = await WebContainer.boot({
                coep: 'credentialless'
              });
              console.log('[WebContainer] Recovery successful!');
              writeToTerminal('\x1b[1;32m[WebContainer]\x1b[0m Recovery successful!\r\n');
            } catch (retryError: any) {
              // Recovery failed - give up and ask for refresh
              console.error('[WebContainer] Recovery failed:', retryError);
              updateStatus('error', 'Please close all other tabs and hard refresh (Ctrl+Shift+R)');
              writeToTerminal('\x1b[1;31m[WebContainer]\x1b[0m Recovery failed.\r\n');
              writeToTerminal('\x1b[1;33m[WebContainer]\x1b[0m Please:\r\n');
              writeToTerminal('  1. Close ALL other tabs with this site\r\n');
              writeToTerminal('  2. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)\r\n');
              writeToTerminal('  3. If still failing, clear browser data for this site\r\n');
              throw new Error('Please hard refresh (Ctrl+Shift+R) to restart');
            }
          } else {
            // Max attempts reached
            updateStatus('error', 'Please hard refresh (Ctrl+Shift+R)');
            writeToTerminal('\x1b[1;31m[WebContainer]\x1b[0m Could not start WebContainer.\r\n');
            writeToTerminal('\x1b[1;33m[WebContainer]\x1b[0m Please hard refresh: Ctrl+Shift+R\r\n');
            throw new Error('Please hard refresh (Ctrl+Shift+R) to restart');
          }
        } else {
          throw bootError;
        }
      }

      console.log('[WebContainer] Boot successful!');
      writeToTerminal('\x1b[1;32m[WebContainer]\x1b[0m Boot successful!\r\n');
      bootAttempts = 0; // Reset on success

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
      } else if (errorMessage.includes('refresh')) {
        // Already handled above, just re-throw
        throw error;
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
      // Vite config with plugin to copy manifest.json to dist for Chrome extension export
      const defaultViteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

// Plugin to copy manifest.json to dist after build
const copyManifestPlugin = () => ({
  name: 'copy-manifest',
  closeBundle() {
    // Ensure dist exists
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    // Copy manifest.json to dist
    if (existsSync('manifest.json')) {
      copyFileSync('manifest.json', 'dist/manifest.json');
      console.log('✓ Copied manifest.json to dist/');
    } else if (existsSync('public/manifest.json')) {
      copyFileSync('public/manifest.json', 'dist/manifest.json');
      console.log('✓ Copied public/manifest.json to dist/');
    }
  }
});

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  // Use relative paths for Chrome extension compatibility
  base: './',
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
    outDir: 'dist',
    // Generate clean output for Chrome extension
    rollupOptions: {
      output: {
        // Use simple filenames without hashes for extension compatibility
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
`;
      allFiles['vite.config.ts'] = defaultViteConfig;
      console.log('[WebContainer] Using default vite.config.ts with manifest copy plugin');
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

/* Dark background to fill the preview area */
html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #1a1a1a;
}

/* Center the extension in the preview */
#root {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
}

/* Make extension fill viewport if no explicit width set */
#root > * {
  max-width: 100%;
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
// Production Build (for Export)
// ============================================================================

/**
 * Build extension for production
 * Runs `npm run build` and waits for completion
 * 
 * @returns true if build succeeded, false otherwise
 */
export async function buildForProduction(): Promise<boolean> {
  const wc = await bootWebContainer();
  
  writeToTerminal('\x1b[1;36m[WebContainer]\x1b[0m Building for production...\r\n');
  console.log('[WebContainer] Starting production build');
  
  try {
    const exitCode = await runCommand('npm', ['run', 'build']);
    
    if (exitCode !== 0) {
      writeToTerminal(`\x1b[1;31m[WebContainer]\x1b[0m Build failed with exit code ${exitCode}\r\n`);
      return false;
    }
    
    writeToTerminal('\x1b[1;32m[WebContainer]\x1b[0m Production build complete!\r\n');
    console.log('[WebContainer] Production build succeeded');
    return true;
  } catch (error: any) {
    reportError('Production build failed', error.message);
    return false;
  }
}

/**
 * Read all files from a directory recursively
 * Used to read the built files from dist/
 * 
 * @param dirPath - Directory path to read (e.g., 'dist')
 * @returns FileMap of all files in the directory
 */
export async function readDirectory(dirPath: string): Promise<FileMap> {
  const wc = await bootWebContainer();
  const files: FileMap = {};
  
  async function readDirRecursive(currentPath: string, basePath: string): Promise<void> {
    try {
      const entries = await wc.fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = currentPath === '.' ? entry.name : `${currentPath}/${entry.name}`;
        // Remove the base path prefix to get relative path
        const relativePath = entryPath.startsWith(basePath + '/') 
          ? entryPath.slice(basePath.length + 1) 
          : entryPath;
        
        if (entry.isDirectory()) {
          await readDirRecursive(entryPath, basePath);
        } else if (entry.isFile()) {
          try {
            const content = await wc.fs.readFile(entryPath, 'utf-8');
            files[relativePath] = content;
            console.log(`[WebContainer] Read file: ${relativePath}`);
          } catch (e) {
            // Skip binary files or files that can't be read as utf-8
            console.warn(`[WebContainer] Skipped file (may be binary): ${relativePath}`);
          }
        }
      }
    } catch (error: any) {
      console.error(`[WebContainer] Error reading directory ${currentPath}:`, error.message);
    }
  }
  
  await readDirRecursive(dirPath, dirPath);
  return files;
}

/**
 * Build for production and read the output files
 * Combined helper for export functionality
 * 
 * @param sourceFiles - Original source files (used to get manifest.json if not in dist)
 * @returns FileMap of built files ready for export, or null if build failed
 */
export async function buildAndReadDist(sourceFiles: FileMap): Promise<FileMap | null> {
  // Run the production build
  const buildSuccess = await buildForProduction();
  if (!buildSuccess) {
    return null;
  }
  
  // Read files from dist/
  writeToTerminal('\x1b[1;36m[WebContainer]\x1b[0m Reading build output...\r\n');
  const distFiles = await readDirectory('dist');
  
  console.log('[WebContainer] Built files:', Object.keys(distFiles));
  
  if (Object.keys(distFiles).length === 0) {
    writeToTerminal('\x1b[1;31m[WebContainer]\x1b[0m No files found in dist/\r\n');
    return null;
  }
  
  // Ensure manifest.json is included (copy from source if not in dist)
  if (!distFiles['manifest.json']) {
    if (sourceFiles['manifest.json']) {
      distFiles['manifest.json'] = sourceFiles['manifest.json'];
      console.log('[WebContainer] Copied manifest.json from source');
    } else if (sourceFiles['public/manifest.json']) {
      distFiles['manifest.json'] = sourceFiles['public/manifest.json'];
      console.log('[WebContainer] Copied manifest.json from public/');
    }
  }
  
  writeToTerminal(`\x1b[1;32m[WebContainer]\x1b[0m Read ${Object.keys(distFiles).length} files from dist/\r\n`);
  return distFiles;
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
  fileMapToFileSystemTree,
  // Export build functions
  buildForProduction,
  readDirectory,
  buildAndReadDist
};
