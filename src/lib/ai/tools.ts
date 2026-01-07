/**
 * AI Tools - Provider-agnostic tool definitions
 * 
 * Defines all tools the AI can use to interact with the sandbox.
 * These definitions can be converted to any provider's format.
 */

import type { ToolDefinition } from './types';

// ============================================================================
// File Operation Tools
// ============================================================================

/**
 * Write or create a file in the sandbox
 */
export const EXT_WRITE_FILE: ToolDefinition = {
  name: 'ext_write_file',
  description: `Create or update a file in the extension sandbox.

IMPORTANT: Before using this tool, use ext_list_files to check what files already exist.
- If scaffolding files already exist (package.json, manifest.json, configs), DO NOT recreate them
- Only write files that are NEW or that specifically need modifications

Common extension files:
- manifest.json - Extension configuration (permissions, scripts, UI)
- src/App.tsx - Popup UI component
- src/background/index.ts - Background service worker
- src/content/index.ts - Content script (DOM access)
- src/content/styles.css - Content script CSS
- options.html - Options page entry
- sidepanel.html - Side panel entry
- rules/block_rules.json - Ad blocking rules (declarativeNetRequest)
- icons/*.png - Extension icons

Guidelines:
- Always use forward slashes for paths
- When creating background/content scripts, also update vite.config.ts entry points
- When adding new capabilities, update manifest.json permissions`,
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file relative to project root (e.g., "src/background/index.ts")'
      },
      content: {
        type: 'string',
        description: 'The complete file content to write'
      }
    },
    required: ['file_path', 'content']
  }
};

/**
 * Read contents of a file (with optional line range)
 */
export const EXT_READ_FILE: ToolDefinition = {
  name: 'ext_read_file',
  description: `Read the contents of a file from the sandbox.

Use this to:
- Check existing code before making modifications
- Read manifest.json to understand current permissions
- Read vite.config.ts to check entry points
- Read specific line ranges in large files (optional start_line/end_line)

For large files, consider using start_line and end_line to read only the relevant section.`,
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file to read (e.g., "src/App.tsx", "manifest.json")'
      },
      start_line: {
        type: 'number',
        description: 'Optional: Start reading from this line number (1-indexed)'
      },
      end_line: {
        type: 'number',
        description: 'Optional: Stop reading at this line number (inclusive)'
      }
    },
    required: ['file_path']
  }
};

/**
 * Delete a file from the sandbox
 */
export const EXT_DELETE_FILE: ToolDefinition = {
  name: 'ext_delete_file',
  description: `Delete a file from the sandbox.

Use with caution. Common use cases:
- Remove unused components
- Clean up old files during refactoring
- Remove temporary files`,
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file to delete'
      }
    },
    required: ['file_path']
  }
};

/**
 * Rename or move a file
 */
export const EXT_RENAME_FILE: ToolDefinition = {
  name: 'ext_rename_file',
  description: `Rename or move a file to a new location.

Use cases:
- Reorganize project structure
- Rename components
- Move files between directories`,
  parameters: {
    type: 'object',
    properties: {
      old_path: {
        type: 'string',
        description: 'Current path of the file'
      },
      new_path: {
        type: 'string',
        description: 'New path for the file'
      }
    },
    required: ['old_path', 'new_path']
  }
};

/**
 * List files in a directory
 */
export const EXT_LIST_FILES: ToolDefinition = {
  name: 'ext_list_files',
  description: `List all files in the sandbox or a specific directory. Returns file paths.

IMPORTANT: Use this tool FIRST before creating any files to:
- Check what files already exist in the project
- Avoid recreating existing config files
- Understand the current project structure
- See if background/content scripts already exist

If you see package.json, manifest.json, and config files already exist,
DO NOT recreate them - only modify the specific file(s) needed.`,
  parameters: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description: 'Directory to list (optional, defaults to root). Use "." for root, "src" for src folder.'
      }
    },
    required: []
  }
};

/**
 * Search for text in files
 */
export const EXT_SEARCH_FILES: ToolDefinition = {
  name: 'ext_search_files',
  description: `Search for text or regex patterns across files in the sandbox.

Returns file paths and match counts. Useful for:
- Finding where a function/variable is used
- Locating specific code patterns
- Finding Chrome API usage (e.g., "chrome.storage", "chrome.tabs")
- Checking for duplicate code
- Finding import statements`,
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Text or regex pattern to search for (e.g., "chrome.runtime", "sendMessage")'
      },
      include_pattern: {
        type: 'string',
        description: 'Glob pattern to include files (e.g., "*.tsx", "src/**", "*.ts")'
      },
      exclude_pattern: {
        type: 'string',
        description: 'Glob pattern to exclude files (e.g., "node_modules/**", "*.test.ts")'
      },
      case_sensitive: {
        type: 'boolean',
        description: 'Whether search is case-sensitive (default: false)'
      }
    },
    required: ['query']
  }
};

/**
 * Replace specific lines in a file (surgical edit)
 */
export const EXT_REPLACE_LINES: ToolDefinition = {
  name: 'ext_replace_lines',
  description: `Surgical code edit: Replace specific text in a file.

PREFER THIS over ext_write_file when making small changes to existing files.
This avoids rewriting the entire file and is safer for targeted edits.

Common use cases:
- Add a new permission to manifest.json
- Add an entry point to vite.config.ts
- Modify a specific function
- Update imports

How it works:
1. Specify the file path
2. Provide a unique search string (existing code to find)
3. Provide the replacement string

The search string must be unique in the file to avoid ambiguity.`,
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file to modify'
      },
      search: {
        type: 'string',
        description: 'The exact text/code to find (must be unique in the file)'
      },
      replace: {
        type: 'string',
        description: 'The new text/code to replace it with'
      }
    },
    required: ['file_path', 'search', 'replace']
  }
};

/**
 * Download a file from a URL to the project
 */
export const EXT_DOWNLOAD_FILE: ToolDefinition = {
  name: 'ext_download_file',
  description: `Download a file from a URL and save it to the project.

Use this to:
- Download extension icons from the web
- Fetch external resources (fonts, data files)
- Import files from CDNs or GitHub raw URLs
- Download ad blocking filter lists

Supported formats: images (png, jpg, svg, ico), fonts, JSON, text files, CSS.

Common paths:
- icons/icon16.png, icons/icon48.png, icons/icon128.png (extension icons)
- src/assets/*.png (UI assets)`,
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to download from (must be publicly accessible)'
      },
      file_path: {
        type: 'string',
        description: 'Where to save the file in the project (e.g., "icons/icon48.png")'
      }
    },
    required: ['url', 'file_path']
  }
};

// ============================================================================
// Package Management Tools
// ============================================================================

/**
 * Add a dependency
 */
export const EXT_ADD_DEPENDENCY: ToolDefinition = {
  name: 'ext_add_dependency',
  description: `Install an npm package. Use this to add libraries the extension needs.

Common packages for Chrome extensions:
- @types/chrome - TypeScript types for Chrome APIs
- dexie - IndexedDB wrapper for large data storage
- webextension-polyfill - Cross-browser compatibility
- zustand - Lightweight state management
- react-query - Data fetching and caching
- lucide-react - Icon library`,
  parameters: {
    type: 'object',
    properties: {
      package: {
        type: 'string',
        description: 'Package name with optional version (e.g., "@types/chrome", "dexie@latest")'
      }
    },
    required: ['package']
  }
};

/**
 * Remove a dependency
 */
export const EXT_REMOVE_DEPENDENCY: ToolDefinition = {
  name: 'ext_remove_dependency',
  description: 'Uninstall an npm package from the project.',
  parameters: {
    type: 'object',
    properties: {
      package: {
        type: 'string',
        description: 'Package name to remove'
      }
    },
    required: ['package']
  }
};

// ============================================================================
// Build & Preview Tools
// ============================================================================

/**
 * Build and start preview
 */
export const EXT_BUILD_PREVIEW: ToolDefinition = {
  name: 'ext_build_preview',
  description: `Build the extension and start the preview server. Call this after creating/updating files.

This will:
1. Mount all files to the sandbox
2. Install dependencies if needed
3. Run vite build (compiles all entry points)
4. Start the preview server
5. Return the preview URL

IMPORTANT:
- You can call this after modifying just 1 file
- Make sure vite.config.ts has all entry points before building
- Background and content scripts will be compiled to assets/ folder
- The preview shows the popup UI; actual extension behavior requires loading in Chrome`,
  parameters: {
    type: 'object',
    properties: {
      install_deps: {
        type: 'boolean',
        description: 'Whether to run npm install (default: true for first build, false for rebuilds)'
      }
    },
    required: []
  }
};

/**
 * Stop the preview server
 */
export const EXT_STOP_PREVIEW: ToolDefinition = {
  name: 'ext_stop_preview',
  description: 'Stop the running preview server.',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
};

// ============================================================================
// Terminal Tool
// ============================================================================

/**
 * Run a shell command
 */
export const EXT_RUN_COMMAND: ToolDefinition = {
  name: 'ext_run_command',
  description: `Execute a shell command in the sandbox. Use for custom build steps, file operations, etc.

Common commands:
- npm install <package> - Install a package
- npm run build - Run production build
- ls -la - List files with details
- mkdir -p <path> - Create directory
- cat <file> - View file contents
- rm -rf <path> - Remove files/directories

Note: Long-running processes like servers should use ext_build_preview instead.`,
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The command to run (e.g., "npm install lodash", "mkdir -p icons")'
      }
    },
    required: ['command']
  }
};

// ============================================================================
// Debug Tools
// ============================================================================

/**
 * Read console logs
 */
export const EXT_READ_CONSOLE_LOGS: ToolDefinition = {
  name: 'ext_read_console_logs',
  description: `Read recent console logs from the preview. Useful for debugging errors.

Check for:
- JavaScript errors
- Chrome API errors
- Network request failures
- Missing permissions errors
- Build/compilation errors`,
  parameters: {
    type: 'object',
    properties: {
      filter: {
        type: 'string',
        description: 'Optional filter to search logs (e.g., "error", "chrome", "undefined")'
      }
    },
    required: []
  }
};

/**
 * Get project info
 */
export const EXT_GET_PROJECT_INFO: ToolDefinition = {
  name: 'ext_get_project_info',
  description: `Get information about the current project structure.

Returns:
- File list with sizes
- manifest.json details (name, permissions, scripts)
- Package.json dependencies
- Build status`,
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
};

// ============================================================================
// All Tools Export
// ============================================================================

/**
 * All available tools (15 total)
 */
export const ALL_TOOLS: ToolDefinition[] = [
  // File operations (8 tools)
  EXT_WRITE_FILE,
  EXT_READ_FILE,
  EXT_DELETE_FILE,
  EXT_RENAME_FILE,
  EXT_LIST_FILES,
  EXT_SEARCH_FILES,
  EXT_REPLACE_LINES,
  EXT_DOWNLOAD_FILE,
  // Package management (2 tools)
  EXT_ADD_DEPENDENCY,
  EXT_REMOVE_DEPENDENCY,
  // Build & preview (2 tools)
  EXT_BUILD_PREVIEW,
  EXT_STOP_PREVIEW,
  // Terminal (1 tool)
  EXT_RUN_COMMAND,
  // Debug (2 tools)
  EXT_READ_CONSOLE_LOGS,
  EXT_GET_PROJECT_INFO
];

/**
 * Get tool by name
 */
export function getToolByName(name: string): ToolDefinition | undefined {
  return ALL_TOOLS.find(tool => tool.name === name);
}

/**
 * Tool names as const for type safety
 */
export const TOOL_NAMES = {
  WRITE_FILE: 'ext_write_file',
  READ_FILE: 'ext_read_file',
  DELETE_FILE: 'ext_delete_file',
  RENAME_FILE: 'ext_rename_file',
  LIST_FILES: 'ext_list_files',
  SEARCH_FILES: 'ext_search_files',
  REPLACE_LINES: 'ext_replace_lines',
  DOWNLOAD_FILE: 'ext_download_file',
  ADD_DEPENDENCY: 'ext_add_dependency',
  REMOVE_DEPENDENCY: 'ext_remove_dependency',
  BUILD_PREVIEW: 'ext_build_preview',
  STOP_PREVIEW: 'ext_stop_preview',
  RUN_COMMAND: 'ext_run_command',
  READ_CONSOLE_LOGS: 'ext_read_console_logs',
  GET_PROJECT_INFO: 'ext_get_project_info'
} as const;

export type ToolName = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];
