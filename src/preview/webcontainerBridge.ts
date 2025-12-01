/**
 * WebContainer Bridge
 * 
 * Manages WebContainer lifecycle for running Chrome extension previews.
 * Uses StackBlitz WebContainers API to provide a Node.js environment in the browser.
 */

import { WebContainer } from '@webcontainer/api';
import type { FileSystemTree, WebContainerProcess } from '@webcontainer/api';
import { 
  bridge, 
  MessageType, 
  BuildStatus, 
  LogLevel 
} from './postMessageBridge';
import type { FileMap } from './types';

/**
 * WebContainer instance (singleton)
 */
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

/**
 * Current running process
 */
let currentProcess: WebContainerProcess | null = null;

/**
 * Terminal write callback
 */
type TerminalWriter = (data: string) => void;
let terminalWriter: TerminalWriter | null = null;

/**
 * Set terminal writer callback
 */
export function setTerminalWriter(writer: TerminalWriter | null): void {
  terminalWriter = writer;
}

/**
 * Write to terminal
 */
function writeToTerminal(data: string): void {
  terminalWriter?.(data);
  bridge.send(MessageType.TERMINAL_OUTPUT, { data });
}

/**
 * Log a message
 */
function log(level: LogLevel, message: string, source?: string): void {
  bridge.send(MessageType.LOG, { level, message, source });
  
  // Also write to terminal for visibility
  const prefix = {
    [LogLevel.DEBUG]: '\x1b[90m[DEBUG]\x1b[0m',
    [LogLevel.INFO]: '\x1b[36m[INFO]\x1b[0m',
    [LogLevel.WARN]: '\x1b[33m[WARN]\x1b[0m',
    [LogLevel.ERROR]: '\x1b[31m[ERROR]\x1b[0m'
  }[level];
  
  writeToTerminal(`${prefix} ${message}\r\n`);
}

/**
 * Boot WebContainer
 */
export async function bootWebContainer(): Promise<WebContainer> {
  // Return existing instance
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  // Return pending boot
  if (bootPromise) {
    return bootPromise;
  }

  log(LogLevel.INFO, 'Booting WebContainer...', 'webcontainer');
  bridge.send(MessageType.BUILD_PROGRESS, {
    status: BuildStatus.INSTALLING,
    message: 'Booting WebContainer...',
    progress: 0
  });

  bootPromise = WebContainer.boot({
    coep: 'credentialless'
  });

  try {
    webcontainerInstance = await bootPromise;
    log(LogLevel.INFO, 'WebContainer booted successfully', 'webcontainer');
    
    // Listen for server-ready events
    webcontainerInstance.on('server-ready', (port, url) => {
      log(LogLevel.INFO, `Server ready on port ${port}: ${url}`, 'webcontainer');
      bridge.send(MessageType.PREVIEW_URL, { url });
      bridge.send(MessageType.EXTENSION_RUNNING, { previewUrl: url });
    });

    // Listen for errors
    webcontainerInstance.on('error', (error) => {
      log(LogLevel.ERROR, `WebContainer error: ${error.message}`, 'webcontainer');
      bridge.send(MessageType.BUILD_ERROR, {
        error: error.message,
        details: error.stack
      });
    });

    return webcontainerInstance;
  } catch (error: any) {
    bootPromise = null;
    log(LogLevel.ERROR, `Failed to boot WebContainer: ${error.message}`, 'webcontainer');
    bridge.send(MessageType.BUILD_ERROR, {
      error: 'Failed to boot WebContainer',
      details: error.message
    });
    throw error;
  }
}

/**
 * Convert flat file map to WebContainer file system tree
 */
export function fileMapToFileSystemTree(files: FileMap): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split('/');
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current[part] = {
          file: { contents }
        };
      } else {
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
  
  log(LogLevel.INFO, `Mounting ${Object.keys(files).length} files...`, 'webcontainer');
  bridge.send(MessageType.BUILD_PROGRESS, {
    status: BuildStatus.INSTALLING,
    message: 'Mounting files...',
    progress: 10
  });

  const tree = fileMapToFileSystemTree(files);
  await wc.mount(tree);

  log(LogLevel.INFO, 'Files mounted successfully', 'webcontainer');
}

/**
 * Write a single file
 */
export async function writeFile(path: string, contents: string): Promise<void> {
  const wc = await bootWebContainer();
  await wc.fs.writeFile(path, contents);
  log(LogLevel.DEBUG, `Updated file: ${path}`, 'webcontainer');
}

/**
 * Read a file
 */
export async function readFile(path: string): Promise<string> {
  const wc = await bootWebContainer();
  return await wc.fs.readFile(path, 'utf-8');
}

/**
 * Run a command in WebContainer
 */
export async function runCommand(
  command: string,
  args: string[] = [],
  options?: { cwd?: string }
): Promise<number> {
  const wc = await bootWebContainer();

  log(LogLevel.INFO, `Running: ${command} ${args.join(' ')}`, 'webcontainer');
  writeToTerminal(`\x1b[1;32m$\x1b[0m ${command} ${args.join(' ')}\r\n`);

  const process = await wc.spawn(command, args, {
    cwd: options?.cwd
  });

  currentProcess = process;

  // Stream output to terminal
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        writeToTerminal(data);
      }
    })
  );

  const exitCode = await process.exit;
  currentProcess = null;

  if (exitCode !== 0) {
    log(LogLevel.WARN, `Command exited with code ${exitCode}`, 'webcontainer');
  }

  return exitCode;
}

/**
 * Kill current process
 */
export function killProcess(): void {
  if (currentProcess) {
    currentProcess.kill();
    currentProcess = null;
    log(LogLevel.INFO, 'Process killed', 'webcontainer');
  }
}

/**
 * Install dependencies
 */
export async function installDependencies(): Promise<boolean> {
  log(LogLevel.INFO, 'Installing dependencies...', 'webcontainer');
  bridge.send(MessageType.BUILD_PROGRESS, {
    status: BuildStatus.INSTALLING,
    message: 'Installing dependencies...',
    progress: 20
  });

  const exitCode = await runCommand('npm', ['install']);

  if (exitCode !== 0) {
    bridge.send(MessageType.BUILD_ERROR, {
      error: 'Failed to install dependencies',
      details: `npm install exited with code ${exitCode}`
    });
    return false;
  }

  bridge.send(MessageType.BUILD_PROGRESS, {
    status: BuildStatus.BUILDING,
    message: 'Dependencies installed',
    progress: 50
  });

  return true;
}

/**
 * Start development server
 */
export async function startDevServer(): Promise<string | null> {
  log(LogLevel.INFO, 'Starting development server...', 'webcontainer');
  bridge.send(MessageType.BUILD_PROGRESS, {
    status: BuildStatus.BUILDING,
    message: 'Starting development server...',
    progress: 70
  });

  const wc = await bootWebContainer();

  // Start the dev server (non-blocking)
  const process = await wc.spawn('npm', ['run', 'dev']);
  currentProcess = process;

  // Stream output
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        writeToTerminal(data);
      }
    })
  );

  // Wait for server-ready event (handled in boot listener)
  // Return null here, URL will be sent via PREVIEW_URL message
  return null;
}

/**
 * Build extension for preview
 * 
 * Creates a simple Vite project that serves the extension popup
 * for live preview purposes.
 */
export async function buildExtension(files: FileMap, installDeps = true): Promise<void> {
  try {
    // Mount extension files
    await mountFiles(files);

    // Create package.json for the preview project
    const packageJson = {
      name: 'extension-preview',
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite --port 3111 --host',
        build: 'vite build',
        preview: 'vite preview'
      },
      devDependencies: {
        vite: '^5.0.0'
      }
    };

    await writeFile('package.json', JSON.stringify(packageJson, null, 2));

    // Create vite.config.js
    const viteConfig = `
import { defineConfig } from 'vite';

export default defineConfig({
  root: './popup',
  server: {
    port: 3111,
    host: true
  },
  build: {
    outDir: '../dist'
  }
});
`;
    await writeFile('vite.config.js', viteConfig);

    // Create index.html in popup folder if it doesn't exist
    if (!files['popup/index.html'] && files['popup/popup.html']) {
      // Rename popup.html to index.html for Vite
      await writeFile('popup/index.html', files['popup/popup.html']);
    }

    if (installDeps) {
      const success = await installDependencies();
      if (!success) return;
    }

    // Start dev server
    await startDevServer();

    bridge.send(MessageType.BUILD_PROGRESS, {
      status: BuildStatus.RUNNING,
      message: 'Extension preview running',
      progress: 100
    });

    bridge.send(MessageType.BUILD_COMPLETE, {});

  } catch (error: any) {
    log(LogLevel.ERROR, `Build failed: ${error.message}`, 'webcontainer');
    bridge.send(MessageType.BUILD_ERROR, {
      error: 'Build failed',
      details: error.message
    });
  }
}

/**
 * Update files and rebuild
 */
export async function updateFiles(files: FileMap, partial = true): Promise<void> {
  try {
    if (partial) {
      // Update individual files
      for (const [path, contents] of Object.entries(files)) {
        await writeFile(path, contents);
      }
    } else {
      // Remount all files
      await mountFiles(files);
    }

    bridge.send(MessageType.FILES_UPDATED, {
      updatedPaths: Object.keys(files)
    });

    log(LogLevel.INFO, `Updated ${Object.keys(files).length} files`, 'webcontainer');
  } catch (error: any) {
    log(LogLevel.ERROR, `Failed to update files: ${error.message}`, 'webcontainer');
    bridge.send(MessageType.ERROR, {
      error: 'Failed to update files',
      code: 'UPDATE_FAILED'
    });
  }
}

/**
 * Stop the extension preview
 */
export async function stopExtension(): Promise<void> {
  killProcess();
  bridge.send(MessageType.EXTENSION_STOPPED, {});
  log(LogLevel.INFO, 'Extension stopped', 'webcontainer');
}

/**
 * Get WebContainer instance
 */
export function getWebContainer(): WebContainer | null {
  return webcontainerInstance;
}

/**
 * Teardown WebContainer
 */
export async function teardown(): Promise<void> {
  killProcess();
  
  if (webcontainerInstance) {
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
    bootPromise = null;
    log(LogLevel.INFO, 'WebContainer torn down', 'webcontainer');
  }
}

/**
 * Setup message handlers for bridge communication
 */
export function setupBridgeHandlers(): () => void {
  const unsubBuild = bridge.on(MessageType.BUILD_EXTENSION, async (msg) => {
    const { files, installDeps } = msg.payload;
    await buildExtension(files, installDeps);
  });

  const unsubUpdate = bridge.on(MessageType.UPDATE_FILES, async (msg) => {
    const { files, partial } = msg.payload;
    await updateFiles(files, partial);
  });

  const unsubRun = bridge.on(MessageType.RUN_EXTENSION, async () => {
    await startDevServer();
  });

  const unsubStop = bridge.on(MessageType.STOP_EXTENSION, async () => {
    await stopExtension();
  });

  // Return cleanup function
  return () => {
    unsubBuild();
    unsubUpdate();
    unsubRun();
    unsubStop();
  };
}

export default {
  bootWebContainer,
  mountFiles,
  writeFile,
  readFile,
  runCommand,
  killProcess,
  installDependencies,
  startDevServer,
  buildExtension,
  updateFiles,
  stopExtension,
  getWebContainer,
  teardown,
  setupBridgeHandlers,
  setTerminalWriter,
  fileMapToFileSystemTree
};

