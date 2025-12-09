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
// State
// ============================================================================

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
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

  bootPromise = (async () => {
    try {
      // Check if we're in a secure context (required for WebContainers)
      if (!window.isSecureContext) {
        throw new Error('WebContainers require a secure context (HTTPS or localhost)');
      }

      // Check for required headers
      // Note: We can't directly check headers, but we can try to boot and catch errors
      console.log('[WebContainer] Attempting to boot with credentialless COEP...');
      
      const instance = await WebContainer.boot({
        coep: 'credentialless' // More permissive than 'require-corp'
      });

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
      updateStatus('idle', 'WebContainer ready', 10);
      
      return instance;
    } catch (error: any) {
      bootPromise = null;
      
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

  return bootPromise;
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
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite --host'
      },
      devDependencies: {
        vite: '^5.0.0'
      }
    };
      allFiles['package.json'] = JSON.stringify(defaultPackageJson, null, 2);
      console.log('[WebContainer] Using default package.json');
    } else {
      console.log('[WebContainer] Using AI-provided package.json');
    }

    // Only create default vite.config.js if not provided
    if (!hasViteConfig) {
      const defaultViteConfig = `import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
`;
      allFiles['vite.config.js'] = defaultViteConfig;
      console.log('[WebContainer] Using default vite.config.js');
    } else {
      console.log('[WebContainer] Using AI-provided vite config');
    }

    // Only create index.html if not provided
    if (!hasIndexHtml) {
      // Try to use popup files as fallback
      let indexHtml = files['popup/popup.html'] || files['popup/index.html'] || files['src/index.html'];
    
    if (!indexHtml) {
      // Create a basic index.html if none exists
      indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Extension Preview</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 20px;
      background: #1a1a1a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .loading {
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="loading">
  <h1>Extension Preview</h1>
    <p>Waiting for files... The AI is setting up your project.</p>
  </div>
</body>
</html>`;
    }
      allFiles['index.html'] = indexHtml;
      console.log('[WebContainer] Using default/fallback index.html');
    } else {
      console.log('[WebContainer] Using AI-provided index.html');
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
