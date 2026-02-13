/**
 * OpenRouter Provider
 * 
 * Implements the AI provider interface for OpenRouter.
 * OpenRouter provides access to multiple AI models through a unified API.
 * Uses OpenAI-compatible API format.
 */

import type {
  AIProviderType,
  AIResponse,
  Message,
  ProviderConfig,
  ToolDefinition,
} from '../types';
import { OpenAIProvider } from './openai';

// ============================================================================
// OpenRouter Provider Implementation
// ============================================================================

export class OpenRouterProvider extends OpenAIProvider {
  readonly name: AIProviderType = 'openrouter';
  readonly displayName = 'OpenRouter';

  constructor(config: ProviderConfig) {
    // Set OpenRouter's base URL
    super({
      ...config,
      baseUrl: config.baseUrl || 'https://openrouter.ai/api/v1'
    });
  }

  /**
   * Get available OpenRouter models
   * OpenRouter supports many models - these are popular ones
   */
  getAvailableModels(): string[] {
    return [
      'mistralai/devstral-2512:free',
      'anthropic/claude-sonnet-4',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-flash-1.5',
      'meta-llama/llama-3.1-70b-instruct',
      'mistralai/mistral-large',
      'deepseek/deepseek-chat',
      'qwen/qwen-2.5-72b-instruct'
    ];
  }

  protected getDefaultModel(): string {
    // Default to Qwen 2.5 72B as requested
    return 'qwen/qwen-2.5-72b-instruct';
  }

  /**
   * Override chat to add OpenRouter-specific headers
   */
  async chat(
    messages: Message[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      return this.errorResponse('OpenRouter API key not configured');
    }

    // OpenRouter uses the same endpoint structure as OpenAI
    // but requires additional headers for attribution
    const url = `https://openrouter.ai/api/v1/chat/completions`;

    try {
      // Convert messages to OpenAI format (inherited method)
      const openaiMessages = this.convertMessagesPublic(messages, systemPrompt);

      // Build request body
      const requestBody: Record<string, unknown> = {
        model: this.getModel(),
        messages: openaiMessages,
        temperature: this.getTemperature(),
        max_tokens: this.getMaxTokens()
      };

      // Add tools if provided
      if (tools && tools.length > 0) {
        requestBody.tools = this.convertToolsPublic(tools);
        requestBody.tool_choice = 'auto';
      }

      this.log('Sending request to', this.getModel());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': window.location.origin, // Required by OpenRouter
          'X-Title': 'Extendr' // App name for OpenRouter dashboard
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || `HTTP ${response.status}`;
        this.logError('API error', errorMsg);
        return this.errorResponse(errorMsg, data);
      }

      return this.parseResponsePublic(data);

    } catch (error: any) {
      this.logError('Request failed', error);
      return this.errorResponse(error.message);
    }
  }

  /**
   * Public wrapper for convertMessages (since parent method is private)
   */
  private convertMessagesPublic(messages: Message[], systemPrompt?: string) {
    const openaiMessages: Array<{
      role: 'system' | 'user' | 'assistant' | 'tool';
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
      tool_call_id?: string;
    }> = [];

    if (systemPrompt) {
      openaiMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      if (msg.role === 'system') {
        openaiMessages.push({ role: 'system', content: msg.content });
      } else if (msg.role === 'user') {
        openaiMessages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        const message: any = { role: 'assistant', content: msg.content || null };
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
   * Public wrapper for convertTools
   */
  private convertToolsPublic(tools: ToolDefinition[]) {
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
   * Public wrapper for parseResponse
   */
  private parseResponsePublic(data: any): AIResponse {
    const choice = data.choices?.[0];

    if (!choice) {
      return this.errorResponse('No response choice');
    }

    const message = choice.message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCalls = message.tool_calls.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: this.parseToolArgumentsPublic(tc.function.arguments)
      }));

      this.log('Received tool calls', toolCalls.map((tc: any) => tc.name));
      return this.toolCallsResponse(toolCalls, data, message.content || undefined);
    }

    const content = message.content || '';
    this.log('Received text response', content.substring(0, 100) + '...');
    return this.textResponse(content, data);
  }

  /**
   * Parse tool arguments from JSON string
   */
  private parseToolArgumentsPublic(argsString: string): Record<string, unknown> {
    try {
      return JSON.parse(argsString);
    } catch {
      this.logError('Failed to parse tool arguments', argsString);
      return {};
    }
  }
}

/**
 * Create an OpenRouter provider instance
 */
export function createOpenRouterProvider(apiKey: string, model?: string): OpenRouterProvider {
  return new OpenRouterProvider({
    type: 'openrouter',
    apiKey,
    model
  });
}

