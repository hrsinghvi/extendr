/**
 * Gemini AI Provider
 * 
 * Implements the AI provider interface for Google's Gemini models.
 * Supports function calling for tool execution.
 */

import type {
  AIProviderType,
  AIResponse,
  Message,
  ProviderConfig,
  ToolDefinition,
  ToolCall,
  JSONSchema
} from '../types';
import { BaseAIProvider } from './base';

// ============================================================================
// Gemini-specific Types
// ============================================================================

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text?: string; functionCall?: GeminiFunctionCall; functionResponse?: GeminiFunctionResponse }>;
}

interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

interface GeminiFunctionResponse {
  name: string;
  response: { result: string };
}

interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface GeminiTool {
  functionDeclarations: GeminiFunctionDeclaration[];
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
        functionCall?: GeminiFunctionCall;
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message: string;
    code?: number;
  };
}

// ============================================================================
// Gemini Provider Implementation
// ============================================================================

export class GeminiProvider extends BaseAIProvider {
  readonly name: AIProviderType = 'gemini';
  readonly displayName = 'Google Gemini';
  
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  
  constructor(config: ProviderConfig) {
    super(config);
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }
  
  /**
   * Get available Gemini models
   */
  getAvailableModels(): string[] {
    return [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash-8b'
    ];
  }
  
  protected getDefaultModel(): string {
    return 'gemini-2.5-pro';
  }
  
  /**
   * Check if the provider is configured
   */
  isConfigured(): boolean {
    // If we have an API key, we're configured
    if (this.config.apiKey) return true;
    
    // If we have a Supabase URL, we can use the proxy
    return Boolean(import.meta.env.VITE_SUPABASE_URL);
  }

  /**
   * Send chat request to Gemini API
   */
  async chat(
    messages: Message[],
    tools?: ToolDefinition[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    // If no API key is configured, we'll try to use the Supabase Edge Function proxy
    const useProxy = !this.config.apiKey;
    
    const model = this.getModel();
    let url: string;

    if (useProxy) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        return this.errorResponse('Supabase URL not configured');
      }
      url = `${supabaseUrl}/functions/v1/gemini-generate?model=${model}`;
    } else {
      url = `${this.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`;
    }
    
    try {
      // Convert messages to Gemini format
      const contents = this.convertMessages(messages);
      
      // Build request body
      const requestBody: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: this.getTemperature(),
          maxOutputTokens: this.getMaxTokens()
        }
      };
      
      // Add system instruction if provided
      if (systemPrompt) {
        requestBody.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }
      
      // Add tools if provided
      if (tools && tools.length > 0) {
        requestBody.tools = [this.convertTools(tools)];
      }
      
      this.log('Sending request to', model, useProxy ? '(via proxy)' : '(direct)');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add Authorization header if using proxy (optional, but good practice if RLS/Auth is needed)
          // For now, we'll assume the function is public or handles anon key if needed, 
          // but usually Edge Functions need the Authorization header with the anon key.
          ...(useProxy ? {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          } : {})
        },
        body: JSON.stringify(requestBody)
      });
      
      const data: GeminiResponse = await response.json();
      
      if (!response.ok) {
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
   * Convert our Message format to Gemini content format
   */
  private convertMessages(messages: Message[]): GeminiContent[] {
    const contents: GeminiContent[] = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        // System messages are handled via systemInstruction, skip here
        continue;
      }
      
      if (msg.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.content }]
        });
      } else if (msg.role === 'assistant') {
        const parts: GeminiContent['parts'] = [];
        
        // Add text content
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        
        // Add function calls if present
        if (msg.toolCalls) {
          for (const tc of msg.toolCalls) {
            parts.push({
              functionCall: {
                name: tc.name,
                args: tc.arguments
              }
            });
          }
        }
        
        if (parts.length > 0) {
          contents.push({ role: 'model', parts });
        }
      } else if (msg.role === 'tool' && msg.toolResult) {
        // Tool results go as user messages with functionResponse
        contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: msg.toolResult.name,
              response: { result: msg.toolResult.content }
            }
          }]
        });
      }
    }
    
    return contents;
  }
  
  /**
   * Convert our tool definitions to Gemini function declarations
   */
  private convertTools(tools: ToolDefinition[]): GeminiTool {
    const functionDeclarations: GeminiFunctionDeclaration[] = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: this.convertParameters(tool.parameters)
    }));
    
    return { functionDeclarations };
  }
  
  /**
   * Convert JSON Schema to Gemini parameter format
   */
  private convertParameters(schema: JSONSchema): GeminiFunctionDeclaration['parameters'] {
    return {
      type: 'object',
      properties: this.convertProperties(schema.properties),
      required: schema.required
    };
  }
  
  /**
   * Convert schema properties recursively
   */
  private convertProperties(
    properties: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      const prop = value as Record<string, unknown>;
      result[key] = {
        type: prop.type,
        description: prop.description,
        ...(prop.enum && { enum: prop.enum })
      };
    }
    
    return result;
  }
  
  /**
   * Parse Gemini response into our format
   */
  private parseResponse(data: GeminiResponse): AIResponse {
    const candidate = data.candidates?.[0];
    
    if (!candidate) {
      return this.errorResponse('No response candidate');
    }
    
    const parts = candidate.content?.parts || [];
    const toolCalls: ToolCall[] = [];
    let textContent = '';
    
    for (const part of parts) {
      if (part.functionCall) {
        toolCalls.push({
          id: this.generateId(),
          name: part.functionCall.name,
          arguments: part.functionCall.args || {}
        });
      }
      
      if (part.text) {
        textContent += part.text;
      }
    }
    
    // If we have tool calls, return them (include any text content too)
    if (toolCalls.length > 0) {
      this.log('Received tool calls', toolCalls.map(tc => tc.name));
      if (textContent) {
        this.log('Also received text with tool calls:', textContent.substring(0, 100));
      }
      return this.toolCallsResponse(toolCalls, data, textContent || undefined);
    }
    
    // Otherwise return text
    this.log('Received text response', textContent.substring(0, 100) + '...');
    return this.textResponse(textContent, data);
  }
}

/**
 * Create a Gemini provider instance
 */
export function createGeminiProvider(apiKey: string, model?: string): GeminiProvider {
  return new GeminiProvider({
    type: 'gemini',
    apiKey,
    model
  });
}

