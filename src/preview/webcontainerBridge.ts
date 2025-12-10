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
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite --host',
          build: 'tsc && vite build',
          preview: 'vite preview'
        },
        dependencies: {
          'react': '^18.3.1',
          'react-dom': '^18.3.1',
          'lucide-react': '^0.468.0',
          'class-variance-authority': '^0.7.0',
          'clsx': '^2.1.1',
          'tailwind-merge': '^2.5.5'
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
      console.log('[WebContainer] Using default package.json with React/Tailwind/shadcn deps');
    } else {
      console.log('[WebContainer] Using AI-provided package.json');
    }

    // Only create default vite.config.ts if not provided
    if (!hasViteConfig) {
      const defaultViteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
      console.log('[WebContainer] Using default vite.config.ts with React plugin');
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
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
`;
      allFiles['tailwind.config.js'] = defaultTailwindConfig;
      console.log('[WebContainer] Using default tailwind.config.js with shadcn theme');
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

    // Create default src/lib/utils.ts (cn utility for shadcn) if not provided
    if (!files['src/lib/utils.ts']) {
      const cnUtility = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
      allFiles['src/lib/utils.ts'] = cnUtility;
      console.log('[WebContainer] Created src/lib/utils.ts (cn utility)');
    }

    // Create default src/styles/index.css with Tailwind and shadcn CSS variables
    if (!files['src/styles/index.css'] && !files['src/index.css']) {
      const defaultCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --primary: 142 76% 36%;
    --primary-foreground: 355 100% 97%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 142 76% 36%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 142 76% 46%;
    --primary-foreground: 144 80% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 142 76% 46%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
      allFiles['src/styles/index.css'] = defaultCss;
      console.log('[WebContainer] Created src/styles/index.css with shadcn CSS variables');
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
import './styles/index.css';

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
import { cn } from './lib/utils';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-80 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-center mb-4">
          Extension Preview
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Your extension will appear here. The AI is setting up your project.
        </p>
        <button
          onClick={() => setCount(c => c + 1)}
          className={cn(
            "w-full inline-flex items-center justify-center rounded-md text-sm font-medium",
            "h-10 px-4 py-2",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "transition-colors"
          )}
        >
          Count: {count}
        </button>
      </div>
    </div>
  );
}
`;
      allFiles['src/App.tsx'] = defaultApp;
      console.log('[WebContainer] Created default src/App.tsx');
    }

    // ============ PRE-INSTALLED SHADCN/UI COMPONENTS ============

    // shadcn/ui Button component
    if (!files['src/components/ui/button.tsx']) {
      const buttonComponent = `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
`;
      allFiles['src/components/ui/button.tsx'] = buttonComponent;
      console.log('[WebContainer] Created shadcn Button component');
    }

    // shadcn/ui Card component
    if (!files['src/components/ui/card.tsx']) {
      const cardComponent = `import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
`;
      allFiles['src/components/ui/card.tsx'] = cardComponent;
      console.log('[WebContainer] Created shadcn Card component');
    }

    // shadcn/ui Input component
    if (!files['src/components/ui/input.tsx']) {
      const inputComponent = `import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
`;
      allFiles['src/components/ui/input.tsx'] = inputComponent;
      console.log('[WebContainer] Created shadcn Input component');
    }

    // shadcn/ui Badge component
    if (!files['src/components/ui/badge.tsx']) {
      const badgeComponent = `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
`;
      allFiles['src/components/ui/badge.tsx'] = badgeComponent;
      console.log('[WebContainer] Created shadcn Badge component');
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
