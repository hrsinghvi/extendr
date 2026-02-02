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
  private abortController: AbortController | null = null;
  
  constructor(options: AIServiceOptions) {
    this.provider = createProvider(options.provider);
    this.maxIterations = options.maxToolIterations || 20;
    this.onToolCall = options.onToolCall;
    this.onToolResult = options.onToolResult;
    this.onStreamChunk = options.onStreamChunk;
  }

  /**
   * Cancel the current operation
   */
  cancel() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
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
    
    // Reset abort controller
    this.abortController = new AbortController();
    
    // Build conversation with history + new user message
    const messages: Message[] = [
      ...history,
      { role: 'user', content: userMessage }
    ];
    
    // Get system prompt
    const systemPrompt = getSystemPrompt();
    
    // Track intro text from first response (before tools execute)
    let introText = '';
    
    // Iteration loop - AI may make multiple tool calls
    let iterations = 0;
    
    while (iterations < this.maxIterations) {
      if (this.abortController?.signal.aborted) {
        throw new Error('Operation cancelled');
      }

      iterations++;
      console.log(`[AIService] Iteration ${iterations}`);
      
      try {
        // Call AI provider
        const response = await this.provider.chat(messages, ALL_TOOLS, systemPrompt);
        
        if (this.abortController?.signal.aborted) {
          throw new Error('Operation cancelled');
        }

        // Handle different response types
        if (response.type === 'error') {
          result.errors.push(response.error || 'Unknown error');
          result.response = `I encountered an error: ${response.error}`;
          break;
        }
        
        if (response.type === 'text') {
          // Final text response - we're done
          // Combine intro (if any) with final response
          const finalText = response.content || '';
          result.response = introText ? `${introText}\n\n${finalText}` : finalText;
          break;
        }
        
        if (response.type === 'tool_calls' && response.toolCalls) {
          // Execute tool calls
          const toolCalls = response.toolCalls;
          
          // Capture intro text from first response with tool calls
          if (iterations === 1 && response.content) {
            introText = response.content;
            console.log('[AIService] Captured intro text:', introText.substring(0, 100));
          }
          
          // Notify about tool calls
          for (const tc of toolCalls) {
            this.onToolCall?.(tc);
            result.toolCalls.push(tc);
          }
          
          // Add assistant message with tool calls to conversation
          messages.push({
            role: 'assistant',
            content: response.content || '',
            toolCalls
          });
          
          // Execute tools
          const toolResults = await executeToolCalls(toolCalls, context);

          if (this.abortController?.signal.aborted) {
            throw new Error('Operation cancelled');
          }
          
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
        console.error('[AIService] Error:', error);
        result.errors.push(error.message);
        result.response = `I encountered an error: ${error.message}`;
        break;
      }
    }
    
    if (iterations >= this.maxIterations) {
      result.errors.push('Maximum tool iterations reached');
      result.response += '\n\n(Note: Reached maximum iterations. Some operations may be incomplete.)';
    }
    
    return result;
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
 * Priority: OpenRouter > Gemini > OpenAI > Claude
 */
export function createAIServiceFromEnv(callbacks?: {
  onToolCall?: (toolCall: ToolCall) => void;
  onToolResult?: (result: ToolResult) => void;
}): AIService | null {
  // Helper to clean API keys
  const cleanKey = (key: string | undefined): string => {
    if (!key) return "";
    return key.replace(/^["'](.*)["']$/, '$1').trim();
  };
  
  const openrouterKey = cleanKey(import.meta.env.VITE_OPENROUTER_API_KEY);
  const geminiKey = cleanKey(import.meta.env.VITE_GEMINI_API_KEY);
  const openaiKey = cleanKey(import.meta.env.VITE_OPENAI_API_KEY);
  const claudeKey = cleanKey(import.meta.env.VITE_CLAUDE_API_KEY);
  
  // Debug: Show which keys are available
  console.log('[AIService] Keys detected:', {
    openrouter: openrouterKey ? 'YES' : 'NO',
    gemini: geminiKey ? 'YES' : 'NO',
    openai: openaiKey ? 'YES' : 'NO',
    claude: claudeKey ? 'YES' : 'NO'
  });
  
  // Try Gemini
  // We can use Gemini if we have an API key OR if we have a Supabase URL (for proxy)
  if ((geminiKey && geminiKey.length > 10) || import.meta.env.VITE_SUPABASE_URL) {
    console.log('[AIService] Using Gemini API', geminiKey ? '(Direct)' : '(Proxy via Supabase)');
    return new AIService({
      provider: {
        type: 'gemini',
        apiKey: geminiKey || '' // Empty string triggers proxy mode in GeminiProvider
      },
      ...callbacks
    });
  }
  
  // Try OpenRouter (Only if Gemini is not available, though user requested to remove it from chat, keeping it as fallback if Gemini is missing might be safer, but user was explicit: "only gemini should be used for that [AI Chat feature]". So I will skip OpenRouter here for general chat)
  /*
  if (openrouterKey && openrouterKey.length > 10) {
    console.log('[AIService] ✓ Using OpenRouter API');
    return new AIService({
      provider: {
        type: 'openrouter',
        apiKey: openrouterKey
      },
      ...callbacks
    });
  }
  */
  
  // Try OpenAI
  if (openaiKey && openaiKey.length > 10) {
    console.log('[AIService] Using OpenAI API');
    return new AIService({
      provider: {
        type: 'openai',
        apiKey: openaiKey
      },
      ...callbacks
    });
  }
  
  // Try Claude
  if (claudeKey && claudeKey.length > 10) {
    console.log('[AIService] Using Claude API');
    return new AIService({
      provider: {
        type: 'claude',
        apiKey: claudeKey
      },
      ...callbacks
    });
  }
  
  console.error('[AIService] ❌ No valid API key found!');
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

