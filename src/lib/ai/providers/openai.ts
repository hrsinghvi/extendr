/**
 * OpenAI Provider
 * 
 * Implements the AI provider interface for OpenAI's GPT models.
 * Supports function calling for tool execution.
 */

import type {
  AIProviderType,
  AIResponse,
  Message,
  ProviderConfig,
  ToolDefinition,
  ToolCall
} from '../types';
import { BaseAIProvider } from './base';

// ============================================================================
// OpenAI-specific Types
// ============================================================================

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: string;
  }>;
  error?: {
    message: string;
    type?: string;
  };
}

// ============================================================================
// OpenAI Provider Implementation
// ============================================================================

export class OpenAIProvider extends BaseAIProvider {
  readonly name: AIProviderType = 'openai';
  readonly displayName = 'OpenAI';
  
  private baseUrl = 'https://api.openai.com/v1';
  
  constructor(config: ProviderConfig) {
    super(config);
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  
  /**
   * Get available OpenAI models
   */
  getAvailableModels(): string[] {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ];
  }
  
  protected getDefaultModel(): string {
    return 'gpt-4o-mini';
  }
  
  /**
   * Send chat request to OpenAI API
   */
  async chat(
    messages: Message[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      return this.errorResponse('OpenAI API key not configured');
    }
    
    const url = `${this.baseUrl}/chat/completions`;
    
    try {
      // Convert messages to OpenAI format
      const openaiMessages = this.convertMessages(messages, systemPrompt);
      
      // Build request body
      const requestBody: Record<string, unknown> = {
        model: this.getModel(),
        messages: openaiMessages,
        temperature: this.getTemperature(),
        max_tokens: this.getMaxTokens()
      };
      
      // Add tools if provided
      if (tools && tools.length > 0) {
        requestBody.tools = this.convertTools(tools);
        requestBody.tool_choice = 'auto';
      }
      
      this.log('Sending request to', this.getModel());
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const data: OpenAIResponse = await response.json();
      
      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || `HTTP ${response.status}`;
        this.logError('API error', errorMsg);
        return this.errorResponse(errorMsg, data);
      }
      
      return this.parseResponse(data);
      
    } catch (error: any) {
      this.logError('Request failed', error);
      return this.errorResponse(error.message);
    }
  }
  
  /**
   * Convert our Message format to OpenAI format
   */
  private convertMessages(messages: Message[], systemPrompt?: string): OpenAIMessage[] {
    const openaiMessages: OpenAIMessage[] = [];
    
    // Add system prompt first if provided
    if (systemPrompt) {
      openaiMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        openaiMessages.push({
          role: 'system',
          content: msg.content
        });
      } else if (msg.role === 'user') {
        openaiMessages.push({
          role: 'user',
          content: msg.content
        });
      } else if (msg.role === 'assistant') {
        const message: OpenAIMessage = {
          role: 'assistant',
          content: msg.content || null
        };
        
        // Add tool calls if present
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          message.tool_calls = msg.toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments)
            }
          }));
        }
        
        openaiMessages.push(message);
      } else if (msg.role === 'tool' && msg.toolResult) {
        openaiMessages.push({
          role: 'tool',
          content: msg.toolResult.content,
          tool_call_id: msg.toolResult.toolCallId
        });
      }
    }
    
    return openaiMessages;
  }
  
  /**
   * Convert our tool definitions to OpenAI format
   */
  private convertTools(tools: ToolDefinition[]): OpenAITool[] {
    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }
  
  /**
   * Parse OpenAI response into our format
   */
  private parseResponse(data: OpenAIResponse): AIResponse {
    const choice = data.choices?.[0];
    
    if (!choice) {
      return this.errorResponse('No response choice');
    }
    
    const message = choice.message;
    
    // Check for tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCalls: ToolCall[] = message.tool_calls.map(tc => ({
        id: tc.id,
        name: tc.function.name,
        arguments: this.parseToolArguments(tc.function.arguments)
      }));
      
      this.log('Received tool calls', toolCalls.map(tc => tc.name));
      return this.toolCallsResponse(toolCalls, data);
    }
    
    // Return text content
    const content = message.content || '';
    this.log('Received text response', content.substring(0, 100) + '...');
    return this.textResponse(content, data);
  }
  
  /**
   * Parse tool arguments from JSON string
   */
  private parseToolArguments(argsString: string): Record<string, unknown> {
    try {
      return JSON.parse(argsString);
    } catch {
      this.logError('Failed to parse tool arguments', argsString);
      return {};
    }
  }
}

/**
 * Create an OpenAI provider instance
 */
export function createOpenAIProvider(apiKey: string, model?: string): OpenAIProvider {
  return new OpenAIProvider({
    type: 'openai',
    apiKey,
    model
  });
}

