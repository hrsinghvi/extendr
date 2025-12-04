/**
 * Claude AI Provider
 * 
 * Implements the AI provider interface for Anthropic's Claude models.
 * Supports tool_use for tool execution.
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
// Claude-specific Types
// ============================================================================

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ClaudeContentBlock[];
}

type ClaudeContentBlock = 
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string };

interface ClaudeTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ClaudeContentBlock[];
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';
  error?: {
    type: string;
    message: string;
  };
}

// ============================================================================
// Claude Provider Implementation
// ============================================================================

export class ClaudeProvider extends BaseAIProvider {
  readonly name: AIProviderType = 'claude';
  readonly displayName = 'Anthropic Claude';
  
  private baseUrl = 'https://api.anthropic.com/v1';
  private apiVersion = '2023-06-01';
  
  constructor(config: ProviderConfig) {
    super(config);
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  
  /**
   * Get available Claude models
   */
  getAvailableModels(): string[] {
    return [
      'claude-sonnet-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307'
    ];
  }
  
  protected getDefaultModel(): string {
    return 'claude-sonnet-4-20250514';
  }
  
  /**
   * Send chat request to Claude API
   */
  async chat(
    messages: Message[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      return this.errorResponse('Claude API key not configured');
    }
    
    const url = `${this.baseUrl}/messages`;
    
    try {
      // Convert messages to Claude format
      const claudeMessages = this.convertMessages(messages);
      
      // Build request body
      const requestBody: Record<string, unknown> = {
        model: this.getModel(),
        messages: claudeMessages,
        max_tokens: this.getMaxTokens()
      };
      
      // Add system prompt if provided
      if (systemPrompt) {
        requestBody.system = systemPrompt;
      }
      
      // Add tools if provided
      if (tools && tools.length > 0) {
        requestBody.tools = this.convertTools(tools);
      }
      
      this.log('Sending request to', this.getModel());
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': this.apiVersion
        },
        body: JSON.stringify(requestBody)
      });
      
      const data: ClaudeResponse = await response.json();
      
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
   * Convert our Message format to Claude format
   */
  private convertMessages(messages: Message[]): ClaudeMessage[] {
    const claudeMessages: ClaudeMessage[] = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        // System messages are handled separately in Claude
        continue;
      }
      
      if (msg.role === 'user') {
        claudeMessages.push({
          role: 'user',
          content: msg.content
        });
      } else if (msg.role === 'assistant') {
        const contentBlocks: ClaudeContentBlock[] = [];
        
        // Add text content
        if (msg.content) {
          contentBlocks.push({ type: 'text', text: msg.content });
        }
        
        // Add tool use blocks if present
        if (msg.toolCalls) {
          for (const tc of msg.toolCalls) {
            contentBlocks.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.name,
              input: tc.arguments
            });
          }
        }
        
        if (contentBlocks.length > 0) {
          claudeMessages.push({
            role: 'assistant',
            content: contentBlocks
          });
        }
      } else if (msg.role === 'tool' && msg.toolResult) {
        // Tool results go as user messages with tool_result blocks
        claudeMessages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.toolResult.toolCallId,
            content: msg.toolResult.content
          }]
        });
      }
    }
    
    return claudeMessages;
  }
  
  /**
   * Convert our tool definitions to Claude format
   */
  private convertTools(tools: ToolDefinition[]): ClaudeTool[] {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters
    }));
  }
  
  /**
   * Parse Claude response into our format
   */
  private parseResponse(data: ClaudeResponse): AIResponse {
    const toolCalls: ToolCall[] = [];
    let textContent = '';
    
    for (const block of data.content) {
      if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input
        });
      } else if (block.type === 'text') {
        textContent += block.text;
      }
    }
    
    // If stop_reason is tool_use, return tool calls
    if (data.stop_reason === 'tool_use' || toolCalls.length > 0) {
      this.log('Received tool calls', toolCalls.map(tc => tc.name));
      return this.toolCallsResponse(toolCalls, data);
    }
    
    // Return text content
    this.log('Received text response', textContent.substring(0, 100) + '...');
    return this.textResponse(textContent, data);
  }
}

/**
 * Create a Claude provider instance
 */
export function createClaudeProvider(apiKey: string, model?: string): ClaudeProvider {
  return new ClaudeProvider({
    type: 'claude',
    apiKey,
    model
  });
}

