/**
 * Chrome Extension Export Utility
 * 
 * Exports extension files as a ready-to-publish ZIP with:
 * - All extension files in correct folder structure
 * - Auto-generated README with publishing checklist
 * - Placeholder icons if missing
 */

import JSZip from 'jszip';
import type { FileMap } from '@/preview/types';
import { MANDATORY_TEMPLATES } from './ai/systemPrompt';

/**
 * Essential files that MUST exist in every Chrome extension export
 */
const ESSENTIAL_FILES = [
  'index.html',
  'manifest.json',
  'public/manifest.json',
];

/**
 * Manifest structure (partial, for parsing)
 */
interface Manifest {
  name?: string;
  short_name?: string;
  description?: string;
  version?: string;
  icons?: {
    '16'?: string;
    '48'?: string;
    '128'?: string;
  };
  action?: {
    default_popup?: string;
    default_icon?: {
      '16'?: string;
      '48'?: string;
      '128'?: string;
    };
  };
  background?: {
    service_worker?: string;
  };
  content_scripts?: Array<{
    js?: string[];
    css?: string[];
    matches?: string[];
  }>;
  web_accessible_resources?: Array<{
    resources?: string[];
  }>;
  permissions?: string[];
}

/**
 * Parse manifest.json from FileMap
 */
function parseManifest(files: FileMap): Manifest | null {
  const manifestContent = files['manifest.json'];
  if (!manifestContent) return null;

  try {
    return JSON.parse(manifestContent) as Manifest;
  } catch (e) {
    console.error('Failed to parse manifest.json:', e);
    return null;
  }
}

/**
 * CSS to inject into popup HTML for Chrome extension compatibility
 * Only sets minimums as a fallback - doesn't override AI-set dimensions
 */
const POPUP_DIMENSION_CSS = `
<style id="extendr-popup-dimensions">
  /* Chrome Extension Popup Fallback - Injected by Extendr */
  /* Only sets minimums - AI/user dimensions take priority */
  html, body {
    min-width: 200px;
    min-height: 100px;
    margin: 0;
    padding: 0;
  }
</style>
`;

/**
 * Inject popup dimension CSS into HTML content
 * Adds the CSS right before </head> to ensure proper popup sizing
 */
function injectPopupDimensions(htmlContent: string): string {
  // Check if already injected
  if (htmlContent.includes('extendr-popup-dimensions')) {
    return htmlContent;
  }
  
  // Try to inject before </head>
  if (htmlContent.includes('</head>')) {
    return htmlContent.replace('</head>', `${POPUP_DIMENSION_CSS}</head>`);
  }
  
  // Fallback: inject after <head> or at the start
  if (htmlContent.includes('<head>')) {
    return htmlContent.replace('<head>', `<head>${POPUP_DIMENSION_CSS}`);
  }
  
  // Last resort: prepend to content
  return POPUP_DIMENSION_CSS + htmlContent;
}

/**
 * Generate placeholder icon SVG
 */
function generatePlaceholderIcon(size: number, initial: string): string {
  const colors = ['#5A9665', '#5f87a3'];
  const bgColor = colors[0];
  const textColor = '#FFFFFF';
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${initial.toUpperCase()}</text>
</svg>`;
}

/**
 * Get icon paths referenced in manifest
 */
function getIconPaths(manifest: Manifest): string[] {
  const iconPaths: string[] = [];
  
  // Check icons object
  if (manifest.icons) {
    if (manifest.icons['16']) iconPaths.push(manifest.icons['16']);
    if (manifest.icons['48']) iconPaths.push(manifest.icons['48']);
    if (manifest.icons['128']) iconPaths.push(manifest.icons['128']);
  }
  
  // Check action.default_icon
  if (manifest.action?.default_icon) {
    if (manifest.action.default_icon['16']) iconPaths.push(manifest.action.default_icon['16']);
    if (manifest.action.default_icon['48']) iconPaths.push(manifest.action.default_icon['48']);
    if (manifest.action.default_icon['128']) iconPaths.push(manifest.action.default_icon['128']);
  }
  
  return iconPaths;
}

/**
 * Generate README.md content
 */
function generateReadme(manifest: Manifest | null, projectName: string): string {
  const name = manifest?.name || manifest?.short_name || projectName;
  const description = manifest?.description || 'A Chrome extension built with ExtenAI';
  const version = manifest?.version || '1.0.0';
  const permissions = manifest?.permissions || [];

  return `# ${name}

${description}

**Version:** ${version}

---

## Installation (Developer Mode)

1. Open Chrome and navigate to \`chrome://extensions/\`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select this folder
5. Your extension is now installed!

---

## Chrome Web Store Publishing Checklist

### 1. Create Developer Account
- Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- Pay the one-time $5 registration fee
- Complete your developer profile

### 2. Prepare Promotional Assets

You'll need:
- **Screenshots**: At least 1, up to 5 (1280x800 or 640x400 recommended)
- **Small promotional tile**: 440x280px
- **Marquee promotional tile** (optional): 920x680px or 1400x560px
- **Icon**: 128x128px (already included in this package)

### 3. Fill Out Store Listing

Required information:
- **Name**: ${name}
- **Description**: ${description}
- **Category**: Choose appropriate category
- **Language**: Select primary language
- **Privacy policy URL**: Required if extension requests permissions
- **Homepage URL** (optional)
- **Support URL** (optional)

### 4. Permissions Explanation

This extension requests the following permissions:
${permissions.length > 0 
  ? permissions.map(p => `- \`${p}\``).join('\n')
  : '- No special permissions required'}

**Important**: You must explain why each permission is needed in your store listing description.

### 5. Upload and Submit

1. Click **New Item** in developer dashboard
2. Upload the ZIP file (or drag and drop)
3. Fill out all required fields
4. Upload promotional assets
5. Review and submit for review

### 6. Review Process

- Review typically takes 1-3 business days
- You'll receive email notifications about status
- If rejected, address feedback and resubmit

---

## Extension Structure

\`\`\`
.
├── manifest.json          # Extension configuration
├── popup/                 # Popup UI files
├── background/            # Background service worker
├── content/               # Content scripts
├── options/               # Options page (if present)
└── icons/                 # Extension icons
\`\`\`

---

## Development

This extension was built with [ExtenAI](https://extenai.com) - an AI-powered Chrome extension builder.

### Making Changes

1. Edit files in this directory
2. Go to \`chrome://extensions/\`
3. Click the refresh icon on your extension card
4. Test your changes

### Debugging

- Open DevTools from the extension card
- Check Console for errors
- Use Chrome's extension debugging tools

---

## Support

For issues or questions:
- Check the [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- Review [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program-policies/)

---

**Good luck with your Chrome Web Store submission!** 🚀
`;
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export extension as ZIP file
 * 
 * @param files - Extension files map
 * @param projectName - Project name for ZIP filename
 * @returns Promise resolving to ZIP blob
 */
export async function exportExtension(
  files: FileMap,
  projectName: string
): Promise<Blob> {
  const zip = new JSZip();
  
  // VALIDATION: Check that we have actual files to export
  const fileCount = Object.keys(files).length;
  console.log(`[Export] Starting export with ${fileCount} files`);
  
  if (fileCount === 0) {
    throw new Error('No files to export. Please create some extension files first.');
  }
  
  // Create a working copy of files that we can augment
  const exportFiles: FileMap = { ...files };
  
  // CRITICAL: Ensure essential files exist - add from templates if missing
  console.log('[Export] Checking for essential files...');
  
  // Check for index.html
  if (!exportFiles['index.html'] && !exportFiles['popup/index.html'] && !exportFiles['public/index.html']) {
    console.log('[Export] Adding missing index.html from template');
    if (MANDATORY_TEMPLATES['index.html']) {
      exportFiles['index.html'] = MANDATORY_TEMPLATES['index.html'];
    }
  }
  
  // Check for package.json
  if (!exportFiles['package.json']) {
    console.log('[Export] Adding missing package.json from template');
    if (MANDATORY_TEMPLATES['package.json']) {
      exportFiles['package.json'] = MANDATORY_TEMPLATES['package.json'];
    }
  }
  
  // Check for vite.config.ts
  if (!exportFiles['vite.config.ts'] && !exportFiles['vite.config.js']) {
    console.log('[Export] Adding missing vite.config.ts from template');
    if (MANDATORY_TEMPLATES['vite.config.ts']) {
      exportFiles['vite.config.ts'] = MANDATORY_TEMPLATES['vite.config.ts'];
    }
  }
  
  // Check for tailwind.config.js
  if (!exportFiles['tailwind.config.js'] && !exportFiles['tailwind.config.ts']) {
    console.log('[Export] Adding missing tailwind.config.js from template');
    if (MANDATORY_TEMPLATES['tailwind.config.js']) {
      exportFiles['tailwind.config.js'] = MANDATORY_TEMPLATES['tailwind.config.js'];
    }
  }
  
  // Check for postcss.config.js
  if (!exportFiles['postcss.config.js'] && !exportFiles['postcss.config.ts']) {
    console.log('[Export] Adding missing postcss.config.js from template');
    if (MANDATORY_TEMPLATES['postcss.config.js']) {
      exportFiles['postcss.config.js'] = MANDATORY_TEMPLATES['postcss.config.js'];
    }
  }
  
  // Check for src/index.css
  if (!exportFiles['src/index.css']) {
    console.log('[Export] Adding missing src/index.css from template');
    if (MANDATORY_TEMPLATES['src/index.css']) {
      exportFiles['src/index.css'] = MANDATORY_TEMPLATES['src/index.css'];
    }
  }
  
  // Check for src/main.tsx
  if (!exportFiles['src/main.tsx'] && !exportFiles['src/main.ts'] && !exportFiles['src/main.jsx']) {
    console.log('[Export] Adding missing src/main.tsx from template');
    if (MANDATORY_TEMPLATES['src/main.tsx']) {
      exportFiles['src/main.tsx'] = MANDATORY_TEMPLATES['src/main.tsx'];
    }
  }
  
  // Check for manifest.json at ROOT level (preferred) or public/
  if (!exportFiles['manifest.json']) {
    // Check if it exists in public/ and copy to root
    if (exportFiles['public/manifest.json']) {
      console.log('[Export] Moving public/manifest.json to root level');
      exportFiles['manifest.json'] = exportFiles['public/manifest.json'];
      delete exportFiles['public/manifest.json'];
    } else {
      console.log('[Export] Adding missing manifest.json from template');
      if (MANDATORY_TEMPLATES['manifest.json']) {
        exportFiles['manifest.json'] = MANDATORY_TEMPLATES['manifest.json'];
      }
    }
  }
  
  // Update files reference to use augmented version
  const filesToExport = exportFiles;
  
  // Find manifest.json - should be at root now
  let manifestPath = 'manifest.json';
  let manifestContent = filesToExport['manifest.json'];
  
  if (!manifestContent) {
    // Fallback: Check alternative locations (shouldn't happen after above logic)
    const possiblePaths = [
      'public/manifest.json',
      'src/manifest.json',
      'extension/manifest.json'
    ];
    
    for (const path of possiblePaths) {
      if (filesToExport[path]) {
        manifestPath = path;
        manifestContent = filesToExport[path];
        // Copy to root for Chrome extension compatibility
        filesToExport['manifest.json'] = manifestContent;
        break;
      }
    }
  }
  
  // Validate manifest exists
  if (!manifestContent) {
    throw new Error('manifest.json not found in extension files. Please ensure your extension has a manifest.json file.');
  }
  
  // Parse manifest from the content we found
  let manifest: Manifest | null = null;
  try {
    manifest = JSON.parse(manifestContent) as Manifest;
  } catch (e) {
    console.error('Failed to parse manifest.json:', e);
    // Continue anyway - we'll still create the ZIP
  }
  
  // Get extension name for icon initial
  const extName = manifest?.name || manifest?.short_name || projectName;
  const initial = extName.charAt(0).toUpperCase();
  
  // DEBUG: Log all files in FileMap
  console.log('[Export] Files in FileMap:', Object.keys(filesToExport));
  
  /**
   * Helper to find a file in the FileMap, checking both exact path and common variations
   * AGGRESSIVELY searches for the file - checks many possible locations
   */
  const findFile = (targetPath: string): { path: string; content: string } | null => {
    // Normalize path (remove leading slash, handle different separators)
    const normalized = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;
    
    console.log(`[Export] Looking for: ${normalized}`);
    
    // Check exact match first
    if (filesToExport[normalized]) {
      console.log(`[Export] Found exact match: ${normalized}`);
      return { path: normalized, content: filesToExport[normalized] };
    }
    
    // Build extensive list of variations to check
    const variations: string[] = [];
    
    // Add common prefix variations
    variations.push(`public/${normalized}`);
    variations.push(`src/${normalized}`);
    variations.push(`extension/${normalized}`);
    variations.push(`dist/${normalized}`);
    
    // Try stripping common prefixes
    variations.push(normalized.replace(/^public\//, ''));
    variations.push(normalized.replace(/^src\//, ''));
    variations.push(normalized.replace(/^dist\//, ''));
    
    // Try folder variations
    variations.push(normalized.replace(/^popup\//, 'public/popup/'));
    variations.push(normalized.replace(/^background\//, 'public/background/'));
    variations.push(normalized.replace(/^content\//, 'public/content/'));
    variations.push(normalized.replace(/^icons\//, 'public/icons/'));
    
    // Check all variations
    for (const variant of variations) {
      if (filesToExport[variant]) {
        console.log(`[Export] Found variant match: ${variant} for ${normalized}`);
        return { path: variant, content: filesToExport[variant] };
      }
    }
    
    // AGGRESSIVE: Search ALL files for matching filename (case-insensitive)
    const targetFileName = normalized.split('/').pop()?.toLowerCase();
    if (targetFileName) {
      for (const [filePath, content] of Object.entries(filesToExport)) {
        const fileName = filePath.split('/').pop()?.toLowerCase();
        if (fileName === targetFileName) {
          console.log(`[Export] Found filename match: ${filePath} for ${normalized}`);
          return { path: filePath, content };
        }
      }
    }
    
    // LAST RESORT: Search for partial path match
    // e.g., if looking for "popup.html", find "anything/popup.html"
    for (const [filePath, content] of Object.entries(filesToExport)) {
      if (filePath.endsWith(normalized) || normalized.endsWith(filePath)) {
        console.log(`[Export] Found partial match: ${filePath} for ${normalized}`);
        return { path: filePath, content };
      }
    }
    
    console.warn(`[Export] FILE NOT FOUND: ${normalized}`);
    return null;
  };
  
  // Add all existing files to ZIP, ensuring manifest.json is at root
  // Also inject popup dimensions into HTML files
  for (const [path, content] of Object.entries(filesToExport)) {
    // Skip node_modules and other build artifacts
    if (path.includes('node_modules') || path.includes('.git')) {
      continue;
    }
    
    // If this is the manifest from a subfolder, place it at root
    if (path === manifestPath && path !== 'manifest.json') {
      zip.file('manifest.json', content);
      continue;
    }
    
    // Inject popup dimensions into HTML files (index.html, popup.html, etc.)
    if (path.endsWith('.html')) {
      const injectedContent = injectPopupDimensions(content);
      zip.file(path, injectedContent);
      console.log(`[Export] Injected popup dimensions into ${path}`);
    } else {
      zip.file(path, content);
    }
  }
  
  // Ensure manifest.json is always at root (double-check it exists)
  if (!zip.file('manifest.json')) {
    zip.file('manifest.json', manifestContent);
  }
  
  // Validate and fix file references in manifest
  if (manifest) {
    const referencedFiles: string[] = [];
    const missingFiles: string[] = [];
    
    // Collect all file paths referenced in manifest
    // Popup HTML
    if (manifest.action?.default_popup) {
      referencedFiles.push(manifest.action.default_popup);
    }
    
    // Background service worker
    if (manifest.background?.service_worker) {
      referencedFiles.push(manifest.background.service_worker);
    }
    
    // Content scripts
    if (manifest.content_scripts) {
      for (const script of manifest.content_scripts) {
        if (script.js) {
          referencedFiles.push(...script.js);
        }
        if (script.css) {
          referencedFiles.push(...script.css);
        }
      }
    }
    
    // Web accessible resources
    if (manifest.web_accessible_resources) {
      for (const resource of manifest.web_accessible_resources) {
        if (resource.resources) {
          referencedFiles.push(...resource.resources);
        }
      }
    }
    
    // Icons
    const iconPaths = getIconPaths(manifest);
    referencedFiles.push(...iconPaths);
    
    // Check which files are missing and create placeholders or copy from alternate locations
    for (const filePath of referencedFiles) {
      // Normalize path (remove leading slash if present)
      const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      
      // CRITICAL: Check FileMap FIRST, before checking ZIP
      // This ensures we use real files, not placeholders
      const foundFile = findFile(normalizedPath);
      
      if (foundFile) {
        // File exists in FileMap - ALWAYS use the real file content
        // Overwrite any placeholder that might have been created  
        console.log(`[Export] Using real file for ${normalizedPath} (found at ${foundFile.path})`);
        zip.file(normalizedPath, foundFile.content);
      } else if (zip.file(normalizedPath)) {
        // File already in ZIP at correct path - skip (might be from first loop)
        continue;
      } else {
        console.warn(`[Export] File ${normalizedPath} not found in FileMap, checking ZIP...`);
        // File doesn't exist in FileMap - only then create placeholder
        // But first, double-check it's not already in ZIP with a slightly different path
        let alreadyAdded = false;
        zip.forEach((relativePath) => {
          if (relativePath === normalizedPath || 
              relativePath.endsWith('/' + normalizedPath) ||
              relativePath.replace(/^public\//, '') === normalizedPath ||
              relativePath.replace(/^src\//, '') === normalizedPath) {
            alreadyAdded = true;
          }
        });
        
        if (!alreadyAdded) {
          // File truly doesn't exist - create placeholder ONLY for icons
          // For HTML/JS/CSS, this is a problem - log error
          const ext = normalizedPath.split('.').pop()?.toLowerCase();
          
          if (ext === 'png' || ext === 'svg' || ext === 'jpg' || ext === 'jpeg') {
            // Only create placeholders for icons - these are OK to generate
            console.log(`[Export] Creating placeholder icon: ${normalizedPath}`);
            missingFiles.push(normalizedPath);
            const sizeMatch = normalizedPath.match(/(\d+)/);
            const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 128;
            const svg = generatePlaceholderIcon(size, initial);
            zip.file(normalizedPath, svg);
          } else {
            // For code files, this is a CRITICAL issue - log prominently
            console.error(`[Export] CRITICAL: Missing code file: ${normalizedPath}`);
            console.error(`[Export] Available files:`, Object.keys(filesToExport));
            missingFiles.push(normalizedPath);
            
            // Still create minimal placeholder so extension doesn't crash, but mark it
            if (ext === 'html') {
              zip.file(normalizedPath, `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ERROR: Missing File</title>
  <style>body { font-family: system-ui; padding: 20px; color: red; }</style>
</head>
<body>
  <h1>⚠️ Missing File</h1>
  <p>File <code>${normalizedPath}</code> was not found during export.</p>
  <p>This is a bug - your actual code should be here.</p>
</body>
</html>`);
            } else if (ext === 'js' || ext === 'ts') {
              zip.file(normalizedPath, `// ERROR: File ${normalizedPath} was not found during export\nconsole.error('Missing file: ${normalizedPath}');`);
            } else if (ext === 'css') {
              zip.file(normalizedPath, `/* ERROR: File ${normalizedPath} was not found during export */`);
            }
          }
        }
      }
    }
    
    // Generate placeholders for any missing icon paths from manifest
    for (const iconPath of iconPaths) {
      const normalizedIconPath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
      if (!zip.file(normalizedIconPath)) {
        const foundIcon = findFile(normalizedIconPath);
        if (foundIcon) {
          zip.file(normalizedIconPath, foundIcon.content);
        } else {
          // Extract size from path (look for numbers like 16, 48, 128)
          const sizeMatch = normalizedIconPath.match(/(\d+)/);
          const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 128;
          
          // Generate SVG placeholder (Chrome supports SVG icons)
          const svg = generatePlaceholderIcon(size, initial);
          zip.file(normalizedIconPath, svg);
        }
      }
    }
    
    // Also check for standard icon sizes if not in manifest
    const iconSizes = [16, 48, 128];
    for (const size of iconSizes) {
      // Check if any icon of this size exists
      const hasIcon = iconPaths.some(p => {
        const normalized = p.startsWith('/') ? p.slice(1) : p;
        return normalized.includes(`${size}`) || normalized.includes(`${size}x${size}`);
      });
      
      if (!hasIcon) {
        // Create default icon path
        const defaultIconPath = `icons/icon${size}.svg`;
        if (!zip.file(defaultIconPath) && !zip.file(`icons/icon${size}.png`)) {
          const svg = generatePlaceholderIcon(size, initial);
          zip.file(defaultIconPath, svg);
        }
      }
    }
    
    // Log missing files for debugging
    if (missingFiles.length > 0) {
      console.warn('Created placeholder files for missing manifest references:', missingFiles);
    }
  }
  
  // Generate and add README
  const readme = generateReadme(manifest, projectName);
  zip.file('README.md', readme);
  
  // Generate ZIP blob
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Export and download extension source files directly
 * 
 * This is the FAST export - no build step required.
 * Works even when WebContainer isn't running.
 * 
 * @param files - Extension files map
 * @param projectName - Project name for ZIP filename
 */
export async function downloadSourceFiles(
  files: FileMap,
  projectName: string
): Promise<void> {
  const blob = await exportExtension(files, projectName);
  const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  downloadBlob(blob, `${sanitizedName}_source.zip`);
}

/**
 * Export and download extension (source files - legacy)
 * 
 * @param files - Extension files map
 * @param projectName - Project name for ZIP filename
 * @deprecated Use downloadSourceFiles or buildAndDownloadExtension instead
 */
export async function downloadExtension(
  files: FileMap,
  projectName: string
): Promise<void> {
  const blob = await exportExtension(files, projectName);
  const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  downloadBlob(blob, `${sanitizedName}.zip`);
}

/**
 * Build extension for production and download as ZIP
 * 
 * This is the proper way to export Chrome extensions:
 * 1. Runs `vite build` in WebContainer to compile TypeScript/React
 * 2. Reads the compiled files from dist/
 * 3. Packages them into a ZIP ready for Chrome
 * 
 * @param sourceFiles - Original source files (used for manifest.json fallback)
 * @param projectName - Project name for ZIP filename
 * @param onProgress - Optional progress callback
 * @returns Promise that resolves when download starts
 * @throws Error if build fails
 */
export async function buildAndDownloadExtension(
  sourceFiles: FileMap,
  projectName: string,
  onProgress?: (message: string) => void
): Promise<void> {
  // Import dynamically to avoid circular dependencies
  const { buildAndReadDist } = await import('@/preview/webcontainerBridge');
  
  onProgress?.('Building extension for production...');
  console.log('[Export] Starting production build...');
  
  // Build and read the dist files
  const builtFiles = await buildAndReadDist(sourceFiles);
  
  if (!builtFiles) {
    throw new Error('Build failed. Check the terminal for errors.');
  }
  
  console.log('[Export] Build complete, got files:', Object.keys(builtFiles));
  onProgress?.('Packaging extension...');
  
  // Use the built files for export
  const blob = await exportExtension(builtFiles, projectName);
  const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  onProgress?.('Downloading...');
  downloadBlob(blob, `${sanitizedName}.zip`);
  
  console.log('[Export] Download started');
}
