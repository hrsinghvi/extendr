/**
 * useModelConfig - Model hotswapping hook
 *
 * Manages AI provider and model selection with:
 * - Single model mode: one provider/model at a time
 * - Rotation mode: cycle through multiple models across messages
 * - localStorage persistence across sessions
 */

import { useState, useCallback, useRef } from 'react';
import type { AIProviderType } from '@/lib/ai/types';
import { OPENROUTER_DEFAULT_MODEL } from '@/lib/ai';

// ============================================================================
// Types
// ============================================================================

export interface ModelEntry {
  provider: AIProviderType;
  model: string;
}

export interface StoredModelConfig {
  primary: ModelEntry;
  rotationModels: ModelEntry[];
  rotationEnabled: boolean;
}

// ============================================================================
// Provider / Model Catalog
// ============================================================================

export const PROVIDER_MODELS: Record<AIProviderType, string[]> = {
  openrouter: [
    'qwen/qwen3-coder',
    'qwen/qwen3-coder:free',
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
    'qwen/qwen-2.5-72b-instruct',
  ],
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-8b',
  ],
  openai: [
    'gpt-5-mini-2025-08-07',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
  ],
  claude: [
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
  ],
  deepseek: [
    'deepseek-chat',
    'deepseek-coder',
  ],
  huggingface: [
    'Qwen/Qwen2.5-Coder-32B-Instruct',
  ],
};

export const PROVIDER_DISPLAY_NAMES: Record<AIProviderType, string> = {
  openrouter: 'OpenRouter',
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  claude: 'Anthropic Claude',
  deepseek: 'DeepSeek',
  huggingface: 'Hugging Face',
};

export const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openrouter: OPENROUTER_DEFAULT_MODEL,
  gemini: 'gemini-2.0-flash',
  openai: 'gpt-5-mini-2025-08-07',
  claude: 'claude-sonnet-4-20250514',
  deepseek: 'deepseek-chat',
  huggingface: 'Qwen/Qwen2.5-Coder-32B-Instruct',
};

// Ordered list of all supported providers (add new ones here)
export const ALL_PROVIDERS: AIProviderType[] = [
  'huggingface',
  'openai',
  'claude',
  'gemini',
  'openrouter',
];

// Providers that are always locked (not included in any plan yet)
export const LOCKED_PROVIDERS: Set<AIProviderType> = new Set(['openai', 'gemini', 'claude', 'openrouter']);

// Providers that require Premium or Ultra plan
export const PREMIUM_PROVIDERS: Set<AIProviderType> = new Set([]);

// ============================================================================
// API Key Utilities
// ============================================================================

function cleanKey(key: string | undefined): string {
  if (!key) return '';
  return key.replace(/^["'](.*)["']$/, '$1').trim();
}

export function getApiKeyForProvider(provider: AIProviderType): string {
  switch (provider) {
    case 'openrouter': return cleanKey(import.meta.env.VITE_OPENROUTER_API_KEY);
    case 'gemini': return cleanKey(import.meta.env.VITE_GEMINI_API_KEY);
    case 'openai': return cleanKey(import.meta.env.VITE_OPENAI_API_KEY);
    case 'claude': return cleanKey(import.meta.env.VITE_CLAUDE_API_KEY);
    case 'deepseek': return cleanKey(import.meta.env.VITE_DEEPSEEK_API_KEY);
    case 'huggingface': return cleanKey(import.meta.env.VITE_HUGGINGFACE_API_KEY);
    default: return '';
  }
}

export function getAvailableProviders(): AIProviderType[] {
  return ALL_PROVIDERS.filter(p => getApiKeyForProvider(p).length > 10);
}

// ============================================================================
// Storage
// ============================================================================

const STORAGE_KEY = 'extendr_model_config';

function getDefaultPrimary(): ModelEntry {
  return { provider: 'huggingface', model: DEFAULT_MODELS['huggingface'] };
}

function loadConfig(): StoredModelConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as StoredModelConfig;
    }
  } catch {
    // ignore parse errors
  }
  return {
    primary: getDefaultPrimary(),
    rotationModels: [],
    rotationEnabled: false,
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useModelConfig() {
  const [config, setConfigState] = useState<StoredModelConfig>(() => loadConfig());
  // Rotation index lives in a ref so advancing it doesn't trigger re-renders
  const rotationIndexRef = useRef(0);

  const saveConfig = useCallback((next: StoredModelConfig) => {
    setConfigState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, []);

  // ---- Single model -------------------------------------------------------

  const setPrimary = useCallback((entry: ModelEntry) => {
    saveConfig({ ...config, primary: entry, rotationEnabled: false });
  }, [config, saveConfig]);

  // ---- Rotation -----------------------------------------------------------

  const setRotationEnabled = useCallback((enabled: boolean) => {
    rotationIndexRef.current = 0;
    saveConfig({ ...config, rotationEnabled: enabled });
  }, [config, saveConfig]);

  const addRotationModel = useCallback((entry: ModelEntry) => {
    const exists = config.rotationModels.some(
      m => m.provider === entry.provider && m.model === entry.model
    );
    if (exists) return;
    saveConfig({ ...config, rotationModels: [...config.rotationModels, entry] });
  }, [config, saveConfig]);

  const removeRotationModel = useCallback((index: number) => {
    const next = config.rotationModels.filter((_, i) => i !== index);
    rotationIndexRef.current = 0;
    saveConfig({ ...config, rotationModels: next });
  }, [config, saveConfig]);

  const reorderRotationModels = useCallback((models: ModelEntry[]) => {
    saveConfig({ ...config, rotationModels: models });
  }, [config, saveConfig]);

  // ---- Per-message model selection ----------------------------------------

  /**
   * Returns the model entry to use for the next message.
   * In rotation mode this also advances the rotation pointer.
   */
  const getNextEntry = useCallback((): ModelEntry => {
    if (!config.rotationEnabled || config.rotationModels.length === 0) {
      return config.primary;
    }
    const list = config.rotationModels;
    const idx = rotationIndexRef.current % list.length;
    rotationIndexRef.current = (idx + 1) % list.length;
    return list[idx];
  }, [config]);

  // ---- Derived state -------------------------------------------------------

  // What to show in the UI as the "current" model
  const currentEntry: ModelEntry =
    config.rotationEnabled && config.rotationModels.length > 0
      ? config.rotationModels[rotationIndexRef.current % config.rotationModels.length]
      : config.primary;

  return {
    config,
    currentEntry,
    availableProviders: getAvailableProviders(),
    providerModels: PROVIDER_MODELS,
    providerDisplayNames: PROVIDER_DISPLAY_NAMES,
    defaultModels: DEFAULT_MODELS,
    getApiKeyForProvider,
    setPrimary,
    setRotationEnabled,
    addRotationModel,
    removeRotationModel,
    reorderRotationModels,
    getNextEntry,
  };
}
