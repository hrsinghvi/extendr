/**
 * Default Scaffold Files
 *
 * Standard boilerplate files for a React/Vite/Tailwind Chrome extension project.
 * These are pre-injected before the AI starts, so the AI only needs to write
 * extension-specific files (manifest.json, src/App.tsx, etc.)
 *
 * Shared between:
 * - Build.tsx (pre-scaffold injection)
 * - webcontainerBridge.ts (fallback defaults during build)
 */

import type { FileMap } from '@/preview';

export const DEFAULT_PACKAGE_JSON = {
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

export const DEFAULT_VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';

// Plugin to copy manifest.json and extension assets (icons) to dist after build
const copyExtensionAssetsPlugin = () => ({
  name: 'copy-extension-assets',
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
    // Copy icons/ directory to dist/icons/
    if (existsSync('icons')) {
      mkdirSync('dist/icons', { recursive: true });
      const copyDirRecursive = (src, dest) => {
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        const entries = readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = src + '/' + entry.name;
          const destPath = dest + '/' + entry.name;
          if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
          } else {
            copyFileSync(srcPath, destPath);
          }
        }
      };
      copyDirRecursive('icons', 'dist/icons');
      console.log('✓ Copied icons/ to dist/icons/');
    }
    // Also copy any public/icons/ to dist/icons/
    if (existsSync('public/icons')) {
      mkdirSync('dist/icons', { recursive: true });
      const copyDirRecursive = (src, dest) => {
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        const entries = readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = src + '/' + entry.name;
          const destPath = dest + '/' + entry.name;
          if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
          } else {
            copyFileSync(srcPath, destPath);
          }
        }
      };
      copyDirRecursive('public/icons', 'dist/icons');
      console.log('✓ Copied public/icons/ to dist/icons/');
    }
  }
});

export default defineConfig({
  plugins: [react(), copyExtensionAssetsPlugin()],
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

export const DEFAULT_TAILWIND_CONFIG = `/** @type {import('tailwindcss').Config} */
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

export const DEFAULT_POSTCSS_CONFIG = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

export const DEFAULT_TSCONFIG = {
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

export const DEFAULT_INDEX_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

/*
 * Base Styles (auto-injected)
 * Uses flexbox to fill available space — works in both preview and Chrome popup.
 * No viewport units (vh/vw) or fixed backgrounds — those break in popups.
 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background-color: #ffffff;
}

#root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* App content fills available space and shrinks if needed */
#root > * {
  width: 100%;
  flex: 1;
  min-height: 0;
}
`;

export const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en" class="h-full">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Extension Preview</title>
  </head>
  <body class="dark h-full">
    <div id="root" class="h-full"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

/**
 * Get all scaffold files as a FileMap.
 * These are the boilerplate files that every project needs.
 * The AI does NOT need to create these.
 */
export function getScaffoldFiles(): FileMap {
  return {
    'package.json': JSON.stringify(DEFAULT_PACKAGE_JSON, null, 2),
    'vite.config.ts': DEFAULT_VITE_CONFIG,
    'tailwind.config.js': DEFAULT_TAILWIND_CONFIG,
    'postcss.config.js': DEFAULT_POSTCSS_CONFIG,
    'tsconfig.json': JSON.stringify(DEFAULT_TSCONFIG, null, 2),
    'src/index.css': DEFAULT_INDEX_CSS,
    'index.html': DEFAULT_INDEX_HTML,
  };
}

/**
 * List of scaffold file paths, for quick membership checks.
 */
export const SCAFFOLD_FILE_PATHS = new Set([
  'package.json',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'src/index.css',
  'index.html',
]);
