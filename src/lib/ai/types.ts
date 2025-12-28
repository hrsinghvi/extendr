/**
 * AI Types - Common interfaces for AI providers and tools
 * 
 * Provider-agnostic type definitions that work across
 * Gemini, OpenAI, Claude, DeepSeek, and other AI providers.
 */

import type { FileMap } from '@/preview/types';

// ============================================================================
// JSON Schema Types (for tool parameters)
// ============================================================================

export type JSONSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

export interface JSONSchemaProperty {
  type: JSONSchemaType;
  description?: string;
  enum?: string[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  default?: unknown;
}

export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

// ============================================================================
// Tool Definitions
// ============================================================================

/**
 * Provider-agnostic tool definition
 * Can be converted to any provider's function/tool format
 */
export interface ToolDefinition {
  /** Unique tool name (e.g., 'ext_write_file') */
  name: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** JSON Schema defining the tool's parameters */
  parameters: JSONSchema;
}

/**
 * A tool call request from the AI
 */
export interface ToolCall {
  /** Unique ID for this call (some providers require this) */
  id: string;
  /** Name of the tool to execute */
  name: string;
  /** Arguments passed to the tool */
  arguments: Record<string, unknown>;
}

/**
 * Result of executing a tool
 */
export interface ToolResult {
  /** The tool call this result corresponds to */
  toolCallId: string;
  /** Tool name */
  name: string;
  /** Result content (stringified for the AI) */
  content: string;
  /** Whether the tool execution succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * A chat message
 */
export interface Message {
  role: MessageRole;
  content: string;
  /** Tool calls made by the assistant (if role is 'assistant') */
  toolCalls?: ToolCall[];
  /** Tool result (if role is 'tool') */
  toolResult?: ToolResult;
}

/**
 * Conversation history for context
 */
export type ConversationHistory = Message[];

// ============================================================================
// AI Response Types
// ============================================================================

export type AIResponseType = 'text' | 'tool_calls' | 'error';

/**
 * Response from an AI provider
 */
export interface AIResponse {
  /** Type of response */
  type: AIResponseType;
  /** Text content (if type is 'text') */
  content?: string;
  /** Tool calls to execute (if type is 'tool_calls') */
  toolCalls?: ToolCall[];
  /** Error message (if type is 'error') */
  error?: string;
  /** Raw response from provider (for debugging) */
  raw?: unknown;
}

// ============================================================================
// Tool Execution Context
// ============================================================================

/**
 * Context passed to tool executor
 * Contains all the WebContainer and state functions tools need
 */
export interface ToolContext {
  // File operations
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  listFiles: (directory?: string) => Promise<string[]>;
  
  // State access
  getFiles: () => FileMap;
  setFiles: (files: FileMap) => void;
  updateFile: (path: string, content: string) => void;
  
  // Build operations
  build: (files: FileMap, installDeps?: boolean) => Promise<void>;
  stop: () => void;
  isRunning: () => boolean;
  
  // Command execution
  runCommand: (command: string, args?: string[]) => Promise<{ exitCode: number; output: string }>;
  
  // Logs
  getLogs: () => string[];
  clearLogs: () => void;
  
  // Terminal output
  writeToTerminal: (data: string) => void;
}

// ============================================================================
// Provider Configuration
// ============================================================================

export type AIProviderType = 'gemini' | 'openai' | 'claude' | 'deepseek' | 'openrouter';

export interface ProviderConfig {
  type: AIProviderType;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

// ============================================================================
// Provider Interface
// ============================================================================

/**
 * Interface that all AI providers must implement
 */
export interface AIProvider {
  /** Provider name for identification */
  readonly name: AIProviderType;
  
  /** Provider display name */
  readonly displayName: string;
  
  /**
   * Send a chat request with optional tools
   * @param messages Conversation history
   * @param tools Available tools (optional)
   * @param systemPrompt System prompt to use
   * @returns AI response
   */
  chat(
    messages: Message[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIResponse>;
  
  /**
   * Check if the provider is configured and ready
   */
  isConfigured(): boolean;
  
  /**
   * Get available models for this provider
   */
  getAvailableModels(): string[];
}

// ============================================================================
// AI Service Types
// ============================================================================

/**
 * Options for the AI service
 */
export interface AIServiceOptions {
  provider: ProviderConfig;
  maxToolIterations?: number;
  onToolCall?: (toolCall: ToolCall) => void;
  onToolResult?: (result: ToolResult) => void;
  onStreamChunk?: (chunk: string) => void;
}

/**
 * Result of an AI service execution
 */
export interface AIServiceResult {
  /** Final text response from AI */
  response: string;
  /** All tool calls made during execution */
  toolCalls: ToolCall[];
  /** All tool results */
  toolResults: ToolResult[];
  /** Files that were modified */
  modifiedFiles: string[];
  /** Whether a build was triggered */
  buildTriggered: boolean;
  /** Any errors that occurred */
  errors: string[];
}

// ============================================================================
// Tool Execution Types
// ============================================================================

/**
 * Handler function for a specific tool
 */
export type ToolHandler = (
  args: Record<string, unknown>,
  context: ToolContext
) => Promise<ToolResult>;

/**
 * Map of tool names to their handlers
 */
export type ToolHandlers = Record<string, ToolHandler>;

