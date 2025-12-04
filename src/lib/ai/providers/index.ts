/**
 * AI Providers Index
 * 
 * Factory and exports for all AI provider implementations.
 */

import type { AIProvider, AIProviderType, ProviderConfig } from '../types';
import { GeminiProvider, createGeminiProvider } from './gemini';
import { OpenAIProvider, createOpenAIProvider } from './openai';
import { ClaudeProvider, createClaudeProvider } from './claude';

// ============================================================================
// Provider Factory
// ============================================================================

/**
 * Create an AI provider based on configuration
 */
export function createProvider(config: ProviderConfig): AIProvider {
  switch (config.type) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'claude':
      return new ClaudeProvider(config);
    case 'deepseek':
      // DeepSeek uses OpenAI-compatible API
      return new OpenAIProvider({
        ...config,
        baseUrl: config.baseUrl || 'https://api.deepseek.com/v1'
      });
    default:
      throw new Error(`Unknown provider type: ${config.type}`);
  }
}

/**
 * Create provider from API key (auto-detects type)
 */
export function createProviderFromKey(apiKey: string, preferredType?: AIProviderType): AIProvider {
  // Try to auto-detect based on key format
  let type = preferredType;
  
  if (!type) {
    if (apiKey.startsWith('AIza')) {
      type = 'gemini';
    } else if (apiKey.startsWith('sk-ant-')) {
      type = 'claude';
    } else if (apiKey.startsWith('sk-')) {
      type = 'openai';
    } else {
      throw new Error('Could not detect provider type from API key. Please specify explicitly.');
    }
  }
  
  return createProvider({ type, apiKey });
}

// ============================================================================
// Provider Info
// ============================================================================

/**
 * Provider metadata for UI display
 */
export interface ProviderInfo {
  type: AIProviderType;
  displayName: string;
  keyPrefix: string;
  keyPlaceholder: string;
  defaultModel: string;
  models: string[];
}

/**
 * Get information about all supported providers
 */
export function getProviderInfoList(): ProviderInfo[] {
  return [
    {
      type: 'gemini',
      displayName: 'Google Gemini',
      keyPrefix: 'AIza',
      keyPlaceholder: 'AIza...',
      defaultModel: 'gemini-2.0-flash',
      models: [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash-8b'
      ]
    },
    {
      type: 'openai',
      displayName: 'OpenAI',
      keyPrefix: 'sk-',
      keyPlaceholder: 'sk-...',
      defaultModel: 'gpt-4o-mini',
      models: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo'
      ]
    },
    {
      type: 'claude',
      displayName: 'Anthropic Claude',
      keyPrefix: 'sk-ant-',
      keyPlaceholder: 'sk-ant-...',
      defaultModel: 'claude-sonnet-4-20250514',
      models: [
        'claude-sonnet-4-20250514',
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-haiku-20240307'
      ]
    },
    {
      type: 'deepseek',
      displayName: 'DeepSeek',
      keyPrefix: 'sk-',
      keyPlaceholder: 'sk-...',
      defaultModel: 'deepseek-chat',
      models: [
        'deepseek-chat',
        'deepseek-coder'
      ]
    }
  ];
}

/**
 * Get provider info by type
 */
export function getProviderInfo(type: AIProviderType): ProviderInfo | undefined {
  return getProviderInfoList().find(p => p.type === type);
}

/**
 * Check if a provider type is supported
 */
export function isProviderSupported(type: string): type is AIProviderType {
  return ['gemini', 'openai', 'claude', 'deepseek'].includes(type);
}

// ============================================================================
// Exports
// ============================================================================

export {
  // Base
  BaseAIProvider,
  messagesToSimpleFormat,
  validateApiKey
} from './base';

export {
  // Gemini
  GeminiProvider,
  createGeminiProvider
} from './gemini';

export {
  // OpenAI
  OpenAIProvider,
  createOpenAIProvider
} from './openai';

export {
  // Claude
  ClaudeProvider,
  createClaudeProvider
} from './claude';

