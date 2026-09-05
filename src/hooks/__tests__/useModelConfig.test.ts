import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModelConfig, LOCKED_PROVIDERS } from '../useModelConfig';

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

  it('keeps a stored provider that is still usable', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      primary: { provider: 'gemini', model: 'gemini-2.0-flash' },
      rotationModels: [],
      rotationEnabled: false,
    }));

    const { result } = renderHook(() => useModelConfig());
    expect(result.current.config.primary.model).toBe('gemini-2.0-flash');
  });

  it('leaves gemini unlocked so the picker can reach it', () => {
    expect(LOCKED_PROVIDERS.has('gemini')).toBe(false);
  });
});
