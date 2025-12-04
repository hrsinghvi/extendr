/**
 * AI Tools - Provider-agnostic tool definitions
 * 
 * Defines all 13 tools the AI can use to interact with the sandbox.
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
  description: `Create or update a file in the extension sandbox. Use this for all file creation and modification.

Guidelines:
- Always use forward slashes for paths (e.g., 'popup/popup.html')
- Common extension files: manifest.json, popup/popup.html, popup/popup.css, popup/popup.js
- For background scripts: background/service-worker.js
- For content scripts: content/content.js, content/content.css
- Escape special characters properly in file content`,
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file relative to project root (e.g., "popup/popup.html")'
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
 * Read contents of a file
 */
export const EXT_READ_FILE: ToolDefinition = {
  name: 'ext_read_file',
  description: 'Read the contents of a file from the sandbox. Use this to check existing code before making modifications.',
  parameters: {
    type: 'object',
    properties: {
      file_path: {
        type: 'string',
        description: 'Path to the file to read (e.g., "manifest.json")'
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
  description: 'Delete a file from the sandbox. Use with caution.',
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
  description: 'Rename or move a file to a new location.',
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
  description: 'List all files in the sandbox or a specific directory. Returns file paths.',
  parameters: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description: 'Directory to list (optional, defaults to root). Use "." for root.'
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
  description: 'Search for text or regex patterns across files in the sandbox.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Text or regex pattern to search for'
      },
      include_pattern: {
        type: 'string',
        description: 'Glob pattern to filter files (e.g., "*.js", "popup/**")'
      },
      case_sensitive: {
        type: 'boolean',
        description: 'Whether search is case-sensitive (default: false)'
      }
    },
    required: ['query']
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
  description: 'Install an npm package. Use this to add libraries the extension needs.',
  parameters: {
    type: 'object',
    properties: {
      package: {
        type: 'string',
        description: 'Package name with optional version (e.g., "lodash@latest", "react@18")'
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
  description: `Build the extension and start the preview server. Call this after creating/updating files to show the user their extension.

This will:
1. Mount all files to the sandbox
2. Install dependencies if needed
3. Start the Vite dev server
4. Return the preview URL`,
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
- npm install <package>
- npm run <script>
- ls, cat, mkdir, rm

Note: Long-running processes like servers should use ext_build_preview instead.`,
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The command to run (e.g., "npm install lodash")'
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
  description: 'Read recent console logs from the preview. Useful for debugging errors.',
  parameters: {
    type: 'object',
    properties: {
      filter: {
        type: 'string',
        description: 'Optional filter to search logs (e.g., "error", "warning")'
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
  description: 'Get information about the current project structure, including file list and manifest details.',
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
 * All available tools
 */
export const ALL_TOOLS: ToolDefinition[] = [
  // File operations
  EXT_WRITE_FILE,
  EXT_READ_FILE,
  EXT_DELETE_FILE,
  EXT_RENAME_FILE,
  EXT_LIST_FILES,
  EXT_SEARCH_FILES,
  // Package management
  EXT_ADD_DEPENDENCY,
  EXT_REMOVE_DEPENDENCY,
  // Build & preview
  EXT_BUILD_PREVIEW,
  EXT_STOP_PREVIEW,
  // Terminal
  EXT_RUN_COMMAND,
  // Debug
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
  ADD_DEPENDENCY: 'ext_add_dependency',
  REMOVE_DEPENDENCY: 'ext_remove_dependency',
  BUILD_PREVIEW: 'ext_build_preview',
  STOP_PREVIEW: 'ext_stop_preview',
  RUN_COMMAND: 'ext_run_command',
  READ_CONSOLE_LOGS: 'ext_read_console_logs',
  GET_PROJECT_INFO: 'ext_get_project_info'
} as const;

export type ToolName = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];

