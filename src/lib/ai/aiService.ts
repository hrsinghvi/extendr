/**
 * AI Service - Main orchestration service
 * 
 * Handles the complete AI interaction flow:
 * 1. Send user message to AI provider
 * 2. Execute any tool calls
 * 3. Return tool results to AI
 * 4. Repeat until AI returns final text response
 */

import type {
  AIProvider,
  AIResponse,
  AIServiceOptions,
  AIServiceResult,
  Message,
  ToolCall,
  ToolContext,
  ToolResult
} from './types';
import { ALL_TOOLS } from './tools';
import { executeToolCalls, getModifiedFiles, wasBuildTriggered } from './toolExecutor';
import { getSystemPrompt } from './systemPrompt';
import { createProvider } from './providers';

// ============================================================================
// AI Service Class
// ============================================================================

export class AIService {
  private provider: AIProvider;
  private maxIterations: number;
  private onToolCall?: (toolCall: ToolCall) => void;
  private onToolResult?: (result: ToolResult) => void;
  private onStreamChunk?: (chunk: string) => void;
  private cancelled: boolean = false;
  
  constructor(options: AIServiceOptions) {
    this.provider = createProvider(options.provider);
    this.maxIterations = options.maxToolIterations || 20;
    this.onToolCall = options.onToolCall;
    this.onToolResult = options.onToolResult;
    this.onStreamChunk = options.onStreamChunk;
  }

  /**
   * Cancel the current AI operation
   */
  cancel(): void {
    this.cancelled = true;
  }

  /**
   * Reset cancellation state (for new requests)
   */
  reset(): void {
    this.cancelled = false;
  }
  
  /**
   * Execute a chat interaction with tool support
   * 
   * @param userMessage The user's message
   * @param history Previous conversation history
   * @param context Tool execution context (WebContainer functions)
   * @returns Final response with all tool call information
   */
  async chat(
    userMessage: string,
    history: Message[],
    context: ToolContext
  ): Promise<AIServiceResult> {
    const result: AIServiceResult = {
      response: '',
      toolCalls: [],
      toolResults: [],
      modifiedFiles: [],
      buildTriggered: false,
      errors: []
    };
    
    // Build conversation with history + new user message
    const messages: Message[] = [
      ...history,
      { role: 'user', content: userMessage }
    ];
    
    // Get system prompt
    const systemPrompt = getSystemPrompt();
    
    // Reset cancellation state for new request
    this.cancelled = false;
    
    // Iteration loop - AI may make multiple tool calls
    let iterations = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    
    while (iterations < this.maxIterations) {
      // Check for cancellation
      if (this.cancelled) {
        console.log('[AIService] Operation cancelled by user');
        result.response = 'Operation cancelled.';
        break;
      }
      
      iterations++;
      console.log(`[AIService] Iteration ${iterations}`);
      
      try {
        // Call AI provider
        const response = await this.provider.chat(messages, ALL_TOOLS, systemPrompt);
        
        // Handle different response types
        if (response.type === 'error') {
          consecutiveErrors++;
          result.errors.push(response.error || 'Unknown error');
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            result.response = `I encountered ${consecutiveErrors} consecutive errors. Stopping to prevent infinite loops. Last error: ${response.error}`;
            break;
          }
          
          // Continue to retry, but track the error
          continue;
        }
        
        // Reset error counter on success
        consecutiveErrors = 0;
        
        if (response.type === 'text') {
          // Final text response - we're done
          result.response = response.content || '';
          break;
        }
        
        if (response.type === 'tool_calls' && response.toolCalls) {
          // Execute tool calls
          const toolCalls = response.toolCalls;
          
          // Notify about tool calls
          for (const tc of toolCalls) {
            this.onToolCall?.(tc);
            result.toolCalls.push(tc);
          }
          
          // Add assistant message with tool calls to conversation
          messages.push({
            role: 'assistant',
            content: '',
            toolCalls
          });
          
          // Execute tools
          const toolResults = await executeToolCalls(toolCalls, context);
          
          // Process results
          for (const tr of toolResults) {
            this.onToolResult?.(tr);
            result.toolResults.push(tr);
            
            // Add tool result to conversation
            messages.push({
              role: 'tool',
              content: tr.content,
              toolResult: tr
            });
            
            // Track errors
            if (!tr.success && tr.error) {
              result.errors.push(`${tr.name}: ${tr.error}`);
            }
          }
          
          // Track modified files and build status
          result.modifiedFiles.push(...getModifiedFiles(toolResults));
          if (wasBuildTriggered(toolResults)) {
            result.buildTriggered = true;
          }
          
          // Continue loop to get next response
          continue;
        }
        
        // Unknown response type
        result.response = 'Received an unexpected response from the AI.';
        break;
        
      } catch (error: any) {
        consecutiveErrors++;
        console.error('[AIService] Error:', error);
        result.errors.push(error.message);
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          result.response = `I encountered ${consecutiveErrors} consecutive errors. Stopping to prevent infinite loops. Last error: ${error.message}`;
          break;
        }
        
        // Continue to retry
        continue;
      }
    }
    
    if (iterations >= this.maxIterations) {
      result.errors.push('Maximum tool iterations reached');
      result.response += '\n\n(Note: Reached maximum iterations. Some operations may be incomplete.)';
    }
    
    // Generate user-friendly summary if we have actions to report
    if (result.modifiedFiles.length > 0 || result.buildTriggered) {
      const summary = this.generateUserFriendlySummary(result);
      if (summary && (!result.response || result.response.trim() === '')) {
        result.response = summary;
      } else if (summary) {
        result.response = result.response + '\n\n' + summary;
      }
    }
    
    return result;
  }
  
  /**
   * Generate a user-friendly summary of what was done
   */
  private generateUserFriendlySummary(result: AIServiceResult): string {
    const parts: string[] = [];
    
    // File operations
    if (result.modifiedFiles.length > 0) {
      const fileCount = result.modifiedFiles.length;
      if (fileCount === 1) {
        parts.push(`Created 1 file for your extension`);
      } else {
        parts.push(`Created ${fileCount} files for your extension`);
      }
    }
    
    // Build status
    if (result.buildTriggered) {
      parts.push(`Built and started your extension preview`);
    }
    
    // Errors
    if (result.errors.length > 0 && result.errors.length <= 2) {
      parts.push(`Encountered ${result.errors.length} issue(s) that may need attention`);
    }
    
    return parts.length > 0 ? parts.join('. ') + '.' : '';
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return this.provider.isConfigured();
  }
  
  /**
   * Get provider name
   */
  getProviderName(): string {
    return this.provider.displayName;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create an AI service with the given configuration
 */
export function createAIService(options: AIServiceOptions): AIService {
  return new AIService(options);
}

/**
 * Create an AI service from environment variables
 * Tries to auto-detect the provider based on available keys
 */
export function createAIServiceFromEnv(callbacks?: {
  onToolCall?: (toolCall: ToolCall) => void;
  onToolResult?: (result: ToolResult) => void;
}): AIService | null {
  // Try Gemini first (current default)
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    return new AIService({
      provider: {
        type: 'gemini',
        apiKey: geminiKey.replace(/^["'](.*)["']$/, '$1').trim()
      },
      ...callbacks
    });
  }
  
  // Try OpenAI
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (openaiKey) {
    return new AIService({
      provider: {
        type: 'openai',
        apiKey: openaiKey
      },
      ...callbacks
    });
  }
  
  // Try Claude
  const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (claudeKey) {
    return new AIService({
      provider: {
        type: 'claude',
        apiKey: claudeKey
      },
      ...callbacks
    });
  }
  
  return null;
}

// ============================================================================
// Helper to create ToolContext from WebContainer hooks
// ============================================================================

/**
 * Create a ToolContext from WebContainer hook functions
 * 
 * @param wcHooks Object containing WebContainer hook functions
 * @param stateHooks Object containing React state hooks
 */
export function createToolContext(
  wcHooks: {
    writeFile: (path: string, content: string) => Promise<void>;
    readFile: (path: string) => Promise<string>;
    runCommand: (cmd: string, args?: string[]) => Promise<number>;
    build: (files: Record<string, string>, installDeps?: boolean) => Promise<void>;
    stop: () => void;
    isRunning: () => boolean;
    writeToTerminal: (data: string) => void;
    getLogs: () => string[];
    clearLogs: () => void;
  },
  stateHooks: {
    getFiles: () => Record<string, string>;
    setFiles: (files: Record<string, string>) => void;
  }
): ToolContext {
  return {
    // File operations from WebContainer
    writeFile: wcHooks.writeFile,
    readFile: wcHooks.readFile,
    deleteFile: async (path: string) => {
      // WebContainer doesn't have direct delete, we'll handle via state
      const files = stateHooks.getFiles();
      const newFiles = { ...files };
      delete newFiles[path];
      stateHooks.setFiles(newFiles);
    },
    listFiles: async (directory?: string) => {
      const files = stateHooks.getFiles();
      let paths = Object.keys(files);
      if (directory && directory !== '.') {
        const prefix = directory.endsWith('/') ? directory : `${directory}/`;
        paths = paths.filter(p => p.startsWith(prefix));
      }
      return paths;
    },
    
    // State hooks
    getFiles: stateHooks.getFiles,
    setFiles: stateHooks.setFiles,
    updateFile: (path: string, content: string) => {
      const files = stateHooks.getFiles();
      stateHooks.setFiles({ ...files, [path]: content });
    },
    
    // Build operations
    build: wcHooks.build,
    stop: wcHooks.stop,
    isRunning: wcHooks.isRunning,
    
    // Command execution
    runCommand: async (command: string, args: string[] = []) => {
      let output = '';
      const exitCode = await wcHooks.runCommand(command, args);
      // Note: Actual output capture would need enhancement in webcontainerBridge
      return { exitCode, output };
    },
    
    // Logs
    getLogs: wcHooks.getLogs,
    clearLogs: wcHooks.clearLogs,
    
    // Terminal
    writeToTerminal: wcHooks.writeToTerminal
  };
}

// ============================================================================
// Exports
// ============================================================================

// AIService class is already exported at definition
// Re-export types for convenience
export type { AIServiceOptions, AIServiceResult } from './types';

