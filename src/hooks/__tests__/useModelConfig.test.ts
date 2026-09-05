import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModelConfig, LOCKED_PROVIDERS, DEFAULT_MODELS, PROVIDER_MODELS } from '../useModelConfig';

const STORAGE_KEY = 'extendr_model_config';

describe('useModelConfig stale-provider migration', () => {
  beforeEach(() => localStorage.clear());

  it('drops a stored provider that is locked and falls back to gemini', () => {
    // The real-world break: an openrouter model saved months ago, on a model
    // with no tool-call support, that the (locked) picker could not change.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      primary: { provider: 'openrouter', model: 'some/no-tools-model' },
      rotationModels: [],
      rotationEnabled: false,
    }));

    const { result } = renderHook(() => useModelConfig());
    expect(result.current.config.primary.provider).toBe('gemini');
  });

  it('drops a retired model even when its provider has a valid key', () => {
    // The second break: adding a HuggingFace key made this stale entry look
    // usable again, but Qwen2.5-Coder-32B rejects `tools` outright.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      primary: { provider: 'huggingface', model: 'Qwen/Qwen2.5-Coder-32B-Instruct' },
      rotationModels: [],
      rotationEnabled: false,
    }));

    const { result } = renderHook(() => useModelConfig());
    expect(result.current.config.primary.model).not.toBe('Qwen/Qwen2.5-Coder-32B-Instruct');
    expect(result.current.config.primary.provider).toBe('gemini');
  });

  it('every catalog model is reachable as a default', () => {
    // A DEFAULT_MODELS entry outside PROVIDER_MODELS would be dropped by the
    // staleness guard the moment it was stored.
    for (const [provider, model] of Object.entries(DEFAULT_MODELS)) {
      expect(PROVIDER_MODELS[provider as keyof typeof PROVIDER_MODELS]).toContain(model);
    }
  });

  it('keeps a stored provider that is still usable', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      primary: { provider: 'gemini', model: 'gemini-3.6-flash' },
      rotationModels: [],
      rotationEnabled: false,
    }));

    const { result } = renderHook(() => useModelConfig());
    expect(result.current.config.primary.model).toBe('gemini-3.6-flash');
  });

  it('leaves gemini unlocked so the picker can reach it', () => {
    expect(LOCKED_PROVIDERS.has('gemini')).toBe(false);
  });
});
