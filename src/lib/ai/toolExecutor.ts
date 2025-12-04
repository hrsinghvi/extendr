/**
 * Tool Executor - Executes AI tools against WebContainer
 * 
 * Handles the execution of all 13 tools, interfacing with
 * the WebContainer sandbox and React state.
 */

import type { ToolCall, ToolResult, ToolContext, ToolHandler, ToolHandlers } from './types';
import { TOOL_NAMES } from './tools';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique tool call ID
 */
function generateToolCallId(): string {
  return `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a successful tool result
 */
function successResult(toolCallId: string, name: string, content: string): ToolResult {
  return {
    toolCallId,
    name,
    content,
    success: true
  };
}

/**
 * Create a failed tool result
 */
function errorResult(toolCallId: string, name: string, error: string): ToolResult {
  return {
    toolCallId,
    name,
    content: `Error: ${error}`,
    success: false,
    error
  };
}

// ============================================================================
// Tool Handler Implementations
// ============================================================================

/**
 * ext_write_file - Write or create a file
 */
const handleWriteFile: ToolHandler = async (args, context) => {
  const { file_path, content } = args as { file_path: string; content: string };
  const id = generateToolCallId();
  
  try {
    // Write to WebContainer
    await context.writeFile(file_path, content);
    
    // Update React state
    context.updateFile(file_path, content);
    
    context.writeToTerminal(`\x1b[32m✓\x1b[0m Created/updated: ${file_path}\r\n`);
    
    return successResult(id, TOOL_NAMES.WRITE_FILE, `Successfully wrote ${file_path} (${content.length} bytes)`);
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.WRITE_FILE, error.message);
  }
};

/**
 * ext_read_file - Read file contents
 */
const handleReadFile: ToolHandler = async (args, context) => {
  const { file_path } = args as { file_path: string };
  const id = generateToolCallId();
  
  try {
    // First try to read from state (faster)
    const files = context.getFiles();
    if (files[file_path]) {
      return successResult(id, TOOL_NAMES.READ_FILE, files[file_path]);
    }
    
    // Fall back to WebContainer
    const content = await context.readFile(file_path);
    return successResult(id, TOOL_NAMES.READ_FILE, content);
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.READ_FILE, `File not found: ${file_path}`);
  }
};

/**
 * ext_delete_file - Delete a file
 */
const handleDeleteFile: ToolHandler = async (args, context) => {
  const { file_path } = args as { file_path: string };
  const id = generateToolCallId();
  
  try {
    await context.deleteFile(file_path);
    
    // Update React state
    const files = context.getFiles();
    const newFiles = { ...files };
    delete newFiles[file_path];
    context.setFiles(newFiles);
    
    context.writeToTerminal(`\x1b[33m✗\x1b[0m Deleted: ${file_path}\r\n`);
    
    return successResult(id, TOOL_NAMES.DELETE_FILE, `Successfully deleted ${file_path}`);
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.DELETE_FILE, error.message);
  }
};

/**
 * ext_rename_file - Rename or move a file
 */
const handleRenameFile: ToolHandler = async (args, context) => {
  const { old_path, new_path } = args as { old_path: string; new_path: string };
  const id = generateToolCallId();
  
  try {
    // Read old file
    const files = context.getFiles();
    const content = files[old_path];
    
    if (!content) {
      return errorResult(id, TOOL_NAMES.RENAME_FILE, `File not found: ${old_path}`);
    }
    
    // Write to new location
    await context.writeFile(new_path, content);
    
    // Delete old file
    await context.deleteFile(old_path);
    
    // Update state
    const newFiles = { ...files };
    delete newFiles[old_path];
    newFiles[new_path] = content;
    context.setFiles(newFiles);
    
    context.writeToTerminal(`\x1b[34m→\x1b[0m Renamed: ${old_path} → ${new_path}\r\n`);
    
    return successResult(id, TOOL_NAMES.RENAME_FILE, `Successfully renamed ${old_path} to ${new_path}`);
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.RENAME_FILE, error.message);
  }
};

/**
 * ext_list_files - List files in directory
 */
const handleListFiles: ToolHandler = async (args, context) => {
  const { directory } = args as { directory?: string };
  const id = generateToolCallId();
  
  try {
    // Get from state (most accurate)
    const files = context.getFiles();
    let paths = Object.keys(files);
    
    // Filter by directory if specified
    if (directory && directory !== '.') {
      const prefix = directory.endsWith('/') ? directory : `${directory}/`;
      paths = paths.filter(p => p.startsWith(prefix));
    }
    
    const result = paths.length > 0 
      ? paths.join('\n')
      : 'No files found';
    
    return successResult(id, TOOL_NAMES.LIST_FILES, result);
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.LIST_FILES, error.message);
  }
};

/**
 * ext_search_files - Search for text in files
 */
const handleSearchFiles: ToolHandler = async (args, context) => {
  const { query, include_pattern, case_sensitive } = args as {
    query: string;
    include_pattern?: string;
    case_sensitive?: boolean;
  };
  const id = generateToolCallId();
  
  try {
    const files = context.getFiles();
    const results: string[] = [];
    const flags = case_sensitive ? 'g' : 'gi';
    const regex = new RegExp(query, flags);
    
    for (const [path, content] of Object.entries(files)) {
      // Apply include pattern filter
      if (include_pattern) {
        const pattern = include_pattern
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        if (!new RegExp(pattern).test(path)) continue;
      }
      
      // Search in content
      const matches = content.match(regex);
      if (matches) {
        results.push(`${path}: ${matches.length} match(es)`);
      }
    }
    
    const result = results.length > 0
      ? results.join('\n')
      : `No matches found for "${query}"`;
    
    return successResult(id, TOOL_NAMES.SEARCH_FILES, result);
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.SEARCH_FILES, error.message);
  }
};

/**
 * ext_add_dependency - Install npm package
 */
const handleAddDependency: ToolHandler = async (args, context) => {
  const { package: packageName } = args as { package: string };
  const id = generateToolCallId();
  
  try {
    context.writeToTerminal(`\x1b[36m📦\x1b[0m Installing ${packageName}...\r\n`);
    
    const result = await context.runCommand('npm', ['install', packageName]);
    
    if (result.exitCode === 0) {
      return successResult(id, TOOL_NAMES.ADD_DEPENDENCY, `Successfully installed ${packageName}`);
    } else {
      return errorResult(id, TOOL_NAMES.ADD_DEPENDENCY, `npm install failed: ${result.output}`);
    }
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.ADD_DEPENDENCY, error.message);
  }
};

/**
 * ext_remove_dependency - Uninstall npm package
 */
const handleRemoveDependency: ToolHandler = async (args, context) => {
  const { package: packageName } = args as { package: string };
  const id = generateToolCallId();
  
  try {
    context.writeToTerminal(`\x1b[33m📦\x1b[0m Removing ${packageName}...\r\n`);
    
    const result = await context.runCommand('npm', ['uninstall', packageName]);
    
    if (result.exitCode === 0) {
      return successResult(id, TOOL_NAMES.REMOVE_DEPENDENCY, `Successfully removed ${packageName}`);
    } else {
      return errorResult(id, TOOL_NAMES.REMOVE_DEPENDENCY, `npm uninstall failed: ${result.output}`);
    }
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.REMOVE_DEPENDENCY, error.message);
  }
};

/**
 * ext_build_preview - Build and start preview
 */
const handleBuildPreview: ToolHandler = async (args, context) => {
  const { install_deps } = args as { install_deps?: boolean };
  const id = generateToolCallId();
  
  try {
    context.writeToTerminal(`\x1b[35m🔨\x1b[0m Building extension preview...\r\n`);
    
    const files = context.getFiles();
    await context.build(files, install_deps !== false);
    
    return successResult(
      id, 
      TOOL_NAMES.BUILD_PREVIEW, 
      'Build started. Preview will be available shortly.'
    );
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.BUILD_PREVIEW, error.message);
  }
};

/**
 * ext_stop_preview - Stop preview server
 */
const handleStopPreview: ToolHandler = async (_args, context) => {
  const id = generateToolCallId();
  
  try {
    context.stop();
    context.writeToTerminal(`\x1b[31m⏹\x1b[0m Preview stopped\r\n`);
    return successResult(id, TOOL_NAMES.STOP_PREVIEW, 'Preview server stopped');
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.STOP_PREVIEW, error.message);
  }
};

/**
 * ext_run_command - Run shell command
 */
const handleRunCommand: ToolHandler = async (args, context) => {
  const { command } = args as { command: string };
  const id = generateToolCallId();
  
  try {
    // Parse command into command and args
    const parts = command.split(' ');
    const cmd = parts[0];
    const cmdArgs = parts.slice(1);
    
    const result = await context.runCommand(cmd, cmdArgs);
    
    return successResult(
      id, 
      TOOL_NAMES.RUN_COMMAND, 
      `Exit code: ${result.exitCode}\n${result.output}`
    );
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.RUN_COMMAND, error.message);
  }
};

/**
 * ext_read_console_logs - Read console logs
 */
const handleReadConsoleLogs: ToolHandler = async (args, context) => {
  const { filter } = args as { filter?: string };
  const id = generateToolCallId();
  
  try {
    let logs = context.getLogs();
    
    // Apply filter if provided
    if (filter) {
      const regex = new RegExp(filter, 'i');
      logs = logs.filter(log => regex.test(log));
    }
    
    const result = logs.length > 0
      ? logs.slice(-50).join('\n') // Last 50 logs
      : 'No logs found';
    
    return successResult(id, TOOL_NAMES.READ_CONSOLE_LOGS, result);
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.READ_CONSOLE_LOGS, error.message);
  }
};

/**
 * ext_get_project_info - Get project information
 */
const handleGetProjectInfo: ToolHandler = async (_args, context) => {
  const id = generateToolCallId();
  
  try {
    const files = context.getFiles();
    const fileList = Object.keys(files);
    
    // Parse manifest if exists
    let manifest = null;
    if (files['manifest.json']) {
      try {
        manifest = JSON.parse(files['manifest.json']);
      } catch {
        manifest = { error: 'Invalid JSON' };
      }
    }
    
    const info = {
      fileCount: fileList.length,
      files: fileList,
      manifest: manifest,
      isRunning: context.isRunning()
    };
    
    return successResult(id, TOOL_NAMES.GET_PROJECT_INFO, JSON.stringify(info, null, 2));
  } catch (error: any) {
    return errorResult(id, TOOL_NAMES.GET_PROJECT_INFO, error.message);
  }
};

// ============================================================================
// Tool Handler Registry
// ============================================================================

/**
 * All tool handlers mapped by name
 */
export const TOOL_HANDLERS: ToolHandlers = {
  [TOOL_NAMES.WRITE_FILE]: handleWriteFile,
  [TOOL_NAMES.READ_FILE]: handleReadFile,
  [TOOL_NAMES.DELETE_FILE]: handleDeleteFile,
  [TOOL_NAMES.RENAME_FILE]: handleRenameFile,
  [TOOL_NAMES.LIST_FILES]: handleListFiles,
  [TOOL_NAMES.SEARCH_FILES]: handleSearchFiles,
  [TOOL_NAMES.ADD_DEPENDENCY]: handleAddDependency,
  [TOOL_NAMES.REMOVE_DEPENDENCY]: handleRemoveDependency,
  [TOOL_NAMES.BUILD_PREVIEW]: handleBuildPreview,
  [TOOL_NAMES.STOP_PREVIEW]: handleStopPreview,
  [TOOL_NAMES.RUN_COMMAND]: handleRunCommand,
  [TOOL_NAMES.READ_CONSOLE_LOGS]: handleReadConsoleLogs,
  [TOOL_NAMES.GET_PROJECT_INFO]: handleGetProjectInfo
};

// ============================================================================
// Main Executor
// ============================================================================

/**
 * Execute a single tool call
 */
export async function executeTool(
  toolCall: ToolCall,
  context: ToolContext
): Promise<ToolResult> {
  const handler = TOOL_HANDLERS[toolCall.name];
  
  if (!handler) {
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      content: `Unknown tool: ${toolCall.name}`,
      success: false,
      error: `Tool "${toolCall.name}" is not implemented`
    };
  }
  
  console.log(`[ToolExecutor] Executing tool: ${toolCall.name}`, toolCall.arguments);
  
  try {
    const result = await handler(toolCall.arguments, context);
    // Use the original tool call ID
    result.toolCallId = toolCall.id;
    return result;
  } catch (error: any) {
    console.error(`[ToolExecutor] Tool ${toolCall.name} failed:`, error);
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      content: `Tool execution failed: ${error.message}`,
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute multiple tool calls in parallel
 */
export async function executeToolCalls(
  toolCalls: ToolCall[],
  context: ToolContext
): Promise<ToolResult[]> {
  // Execute tools in parallel for better performance
  const results = await Promise.all(
    toolCalls.map(tc => executeTool(tc, context))
  );
  
  return results;
}

/**
 * Track which files were modified during tool execution
 */
export function getModifiedFiles(results: ToolResult[]): string[] {
  const modified: string[] = [];
  
  for (const result of results) {
    if (result.success && result.name === TOOL_NAMES.WRITE_FILE) {
      // Extract file path from success message
      const match = result.content.match(/Successfully wrote (\S+)/);
      if (match) {
        modified.push(match[1]);
      }
    }
  }
  
  return modified;
}

/**
 * Check if build was triggered during tool execution
 */
export function wasBuildTriggered(results: ToolResult[]): boolean {
  return results.some(
    r => r.success && r.name === TOOL_NAMES.BUILD_PREVIEW
  );
}

