/**
 * Base AI Provider - Abstract class for all AI providers
 * 
 * Defines the common interface and utilities that all
 * provider implementations must follow.
 */

import type {
  AIProvider,
  AIProviderType,
  AIResponse,
  Message,
  ProviderConfig,
  ToolDefinition,
  ToolCall
} from '../types';

/**
 * Abstract base class for AI providers
 */
export abstract class BaseAIProvider implements AIProvider {
  protected config: ProviderConfig;
  
  abstract readonly name: AIProviderType;
  abstract readonly displayName: string;
  
  constructor(config: ProviderConfig) {
    this.config = config;
  }
  
  /**
   * Send a chat request with optional tools
   * Must be implemented by each provider
   */
  abstract chat(
    messages: Message[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIResponse>;
  
  /**
   * Check if the provider is configured
   */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }
  
  /**
   * Get available models for this provider
   * Should be overridden by specific providers
   */
  abstract getAvailableModels(): string[];
  
  /**
   * Get the current model being used
   */
  protected getModel(): string {
    return this.config.model || this.getDefaultModel();
  }
  
  /**
   * Get the default model for this provider
   * Should be overridden by specific providers
   */
  protected abstract getDefaultModel(): string;
  
  /**
   * Get max tokens for generation
   */
  protected getMaxTokens(): number {
    return this.config.maxTokens || 8192;
  }
  
  /**
   * Get temperature for generation
   */
  protected getTemperature(): number {
    return this.config.temperature ?? 0.7;
  }
  
  /**
   * Create an error response
   */
  protected errorResponse(error: string, raw?: unknown): AIResponse {
    return {
      type: 'error',
      error,
      raw
    };
  }
  
  /**
   * Create a text response
   */
  protected textResponse(content: string, raw?: unknown): AIResponse {
    return {
      type: 'text',
      content,
      raw
    };
  }
  
  /**
   * Create a tool calls response
   */
  protected toolCallsResponse(toolCalls: ToolCall[], raw?: unknown): AIResponse {
    return {
      type: 'tool_calls',
      toolCalls,
      raw
    };
  }
  
  /**
   * Generate a unique ID for tool calls
   */
  protected generateId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Log provider activity for debugging
   */
  protected log(message: string, data?: unknown): void {
    console.log(`[${this.displayName}] ${message}`, data || '');
  }
  
  /**
   * Log provider errors
   */
  protected logError(message: string, error?: unknown): void {
    console.error(`[${this.displayName}] ${message}`, error || '');
  }
}

/**
 * Convert our Message format to a simple role/content format
 * Useful for providers that use similar formats
 */
export function messagesToSimpleFormat(messages: Message[]): Array<{ role: string; content: string }> {
  return messages
    .filter(m => m.role !== 'tool') // Filter out tool messages for simple format
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
      content: m.content
    }));
}

/**
 * Validate API key format
 */
export function validateApiKey(key: string, provider: AIProviderType): boolean {
  if (!key || typeof key !== 'string') return false;
  
  switch (provider) {
    case 'gemini':
      return key.startsWith('AIza');
    case 'openai':
      return key.startsWith('sk-');
    case 'claude':
      return key.startsWith('sk-ant-');
    case 'deepseek':
      return key.startsWith('sk-');
    default:
      return key.length > 10;
  }
}

