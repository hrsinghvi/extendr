/**
 * Preview System Types
 * 
 * Shared type definitions for the preview system.
 */

// BuildStatus is defined in useWebContainer.ts to avoid circular deps

/**
 * Extension file structure
 */
export interface ExtensionFiles {
  // Core files
  'manifest.json'?: string;
  
  // Popup files
  'popup/popup.html'?: string;
  'popup/popup.css'?: string;
  'popup/popup.js'?: string;
  'popup/popup.tsx'?: string;
  
  // Background
  'background/service-worker.js'?: string;
  'background/service-worker.ts'?: string;
  
  // Content scripts
  'content/content.js'?: string;
  'content/content.ts'?: string;
  'content/content.css'?: string;
  
  // Options page
  'options/options.html'?: string;
  'options/options.js'?: string;
  'options/options.css'?: string;
  
  // Allow arbitrary paths
  [key: string]: string | undefined;
}

/**
 * Flattened file map (path -> contents)
 */
export type FileMap = Record<string, string>;

/**
 * File tree node for UI display
 */
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  content?: string;
}

/**
 * Preview state
 */
export interface PreviewState {
  status: string; // BuildStatus enum value
  previewUrl: string | null;
  error: string | null;
  logs: LogEntry[];
  files: FileMap;
  selectedFile: string | null;
}

/**
 * Log entry
 */
export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  source?: string;
}

/**
 * Terminal state
 */
export interface TerminalState {
  output: string[];
  isRunning: boolean;
}

/**
 * WebContainer boot options
 */
export interface WebContainerOptions {
  coep?: 'require-corp' | 'credentialless';
  workdirName?: string;
}

/**
 * Preview panel props
 */
export interface PreviewPanelProps {
  files: FileMap;
  onFilesChange?: (files: FileMap) => void;
  className?: string;
  autoRun?: boolean;
}

/**
 * Code editor props
 */
export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
  fileName?: string;
}

/**
 * File tree props
 */
export interface FileTreeProps {
  files: FileMap;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile?: (path: string) => void;
  onDeleteFile?: (path: string) => void;
  className?: string;
}

/**
 * Terminal props
 */
export interface TerminalProps {
  onInput?: (data: string) => void;
  className?: string;
}

/**
 * Preview frame props
 */
export interface PreviewFrameProps {
  url: string | null;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  /** Whether there are files in the project (used to show loading vs empty state) */
  hasFiles?: boolean;
  /** Current build status */
  buildStatus?: string;
  /** Whether AI is currently working on the extension */
  isAIWorking?: boolean;
}

/**
 * Convert file map to file tree
 */
export function fileMapToTree(files: FileMap): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const nodeMap = new Map<string, FileTreeNode>();

  // Sort paths for consistent ordering
  const paths = Object.keys(files).sort();

  for (const path of paths) {
    const parts = path.split('/');
    let currentLevel = root;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = i === parts.length - 1;

      let node = nodeMap.get(currentPath);

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'directory',
          children: isLast ? undefined : [],
          content: isLast ? files[path] : undefined
        };
        nodeMap.set(currentPath, node);
        currentLevel.push(node);
      }

      if (!isLast && node.children) {
        currentLevel = node.children;
      }
    }
  }

  // Sort: directories first, then alphabetically
  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    }).map(node => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined
    }));
  };

  return sortNodes(root);
}

/**
 * Get file extension
 */
export function getFileExtension(path: string): string {
  const lastDot = path.lastIndexOf('.');
  return lastDot >= 0 ? path.slice(lastDot + 1).toLowerCase() : '';
}

/**
 * Get language from file extension
 */
export function getLanguageFromExtension(ext: string): string {
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    html: 'html',
    css: 'css',
    md: 'markdown',
    svg: 'xml'
  };
  return map[ext] || 'plaintext';
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(path: string): string {
  const ext = getFileExtension(path);
  const icons: Record<string, string> = {
    js: '📜',
    jsx: '⚛️',
    ts: '📘',
    tsx: '⚛️',
    json: '📋',
    html: '🌐',
    css: '🎨',
    md: '📝',
    png: '🖼️',
    jpg: '🖼️',
    svg: '🎭'
  };
  return icons[ext] || '📄';
}

