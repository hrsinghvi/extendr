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

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
  error?: {
    message?: string;
    code?: number;
  };
}

export const OPENROUTER_DEFAULT_MODEL = 'qwen/qwen3-coder';
const TOOL_CALL_BLOCK_REGEX = /<tool_call>([\s\S]*?)<\/tool_call>/gi;
const TOOL_FUNCTION_REGEX = /<function=([a-zA-Z0-9_:-]+)>/i;
const TOOL_PARAMETER_REGEX = /<parameter=([a-zA-Z0-9_:-]+)>([\s\S]*?)<\/parameter>/gi;

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
      'qwen/qwen3-coder',
      'qwen/qwen3-coder:free',
      'anthropic/claude-sonnet-4',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-flash-1.5',
      'meta-llama/llama-3.1-70b-instruct',
      'mistralai/mistral-large',
      'deepseek/deepseek-chat'
    ];
  }

  protected getDefaultModel(): string {
    return OPENROUTER_DEFAULT_MODEL;
  }

  /**
   * Lower temperature for more deterministic tool behavior with Qwen.
   */
  protected getTemperature(): number {
    return this.config.temperature ?? 0.15;
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
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://localhost', // Required by OpenRouter
          'X-Title': 'Extendr' // App name for OpenRouter dashboard
        },
        body: JSON.stringify(requestBody)
      });

      const data: OpenRouterResponse = await response.json();

      if (!response.ok || data.error) {
        const rawErrorMsg = data.error?.message || `HTTP ${response.status}`;
        const isInvalidKey =
          response.status === 401 &&
          /user not found/i.test(rawErrorMsg);
        const errorMsg = isInvalidKey
          ? 'OpenRouter authentication failed: API key is invalid or revoked (User not found). Generate a new key at openrouter.ai/keys and update VITE_OPENROUTER_API_KEY, then redeploy.'
          : rawErrorMsg;
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
   * Parse OpenRouter responses, normalizing content that may arrive
   * as structured blocks instead of plain strings.
   */
  protected parseResponse(data: OpenRouterResponse): AIResponse {
    const choice = data.choices?.[0];
    const message = choice?.message;

    if (!message) {
      return this.errorResponse('No response choice');
    }

    const normalizedContent = this.normalizeContent(message.content);

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCalls = message.tool_calls.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: this.parseToolArguments(tc.function.arguments)
      }));

      this.log('Received tool calls', toolCalls.map(tc => tc.name));
      return this.toolCallsResponse(toolCalls, data, normalizedContent || undefined);
    }

    // Fallback for models that emit pseudo XML-style tool tags in plain text.
    const pseudoToolCalls = this.parsePseudoToolCalls(normalizedContent);
    if (pseudoToolCalls.length > 0) {
      const cleanedContent = normalizedContent.replace(TOOL_CALL_BLOCK_REGEX, '').trim();
      this.log('Parsed pseudo tool calls', pseudoToolCalls.map(tc => tc.name));
      return this.toolCallsResponse(pseudoToolCalls, data, cleanedContent || undefined);
    }

    this.log('Received text response', normalizedContent.substring(0, 100) + '...');
    return this.textResponse(normalizedContent, data);
  }

  private normalizeContent(content: OpenRouterResponse['choices'][number]['message']['content']): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((part) => part.text || '')
        .join('')
        .trim();
    }

    return '';
  }

  private parsePseudoToolCalls(content: string) {
    const calls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];
    if (!content || !content.includes('<tool_call>')) return calls;

    const blocks = [...content.matchAll(TOOL_CALL_BLOCK_REGEX)];
    for (const match of blocks) {
      const block = match[1] || '';
      const fnMatch = block.match(TOOL_FUNCTION_REGEX);
      const name = fnMatch?.[1]?.trim();
      if (!name) continue;

      const args: Record<string, unknown> = {};
      TOOL_PARAMETER_REGEX.lastIndex = 0;
      for (const pMatch of block.matchAll(TOOL_PARAMETER_REGEX)) {
        const key = pMatch[1]?.trim();
        if (!key) continue;
        args[key] = this.parseScalar(pMatch[2] || '');
      }

      calls.push({
        id: this.generateId(),
        name,
        arguments: args
      });
    }

    return calls;
  }

  private parseScalar(raw: string): unknown {
    const value = raw.trim();
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
    return value;
  }
}

/**
 * Create an OpenRouter provider instance
 */
export function createOpenRouterProvider(apiKey: string, model?: string): OpenRouterProvider {
  return new OpenRouterProvider({
    type: 'openrouter',
    apiKey,
    model: model || OPENROUTER_DEFAULT_MODEL
  });
}
