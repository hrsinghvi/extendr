/**
 * ModelSelector - AI model hotswapping UI (single-model mode only)
 *
 * Receives config/setter as props from Build.tsx so there is a single
 * source of truth — no separate useModelConfig() call inside this component.
 */

import { useState } from 'react';
import { ChevronDown, Plus, X, Check, Cpu, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  PROVIDER_MODELS,
  PROVIDER_DISPLAY_NAMES,
  ALL_PROVIDERS,
  type ModelEntry,
  type StoredModelConfig,
} from '@/hooks/useModelConfig';
import type { AIProviderType } from '@/lib/ai/types';

// ============================================================================
// Helpers
// ============================================================================

function shortModelName(model: string): string {
  if (model.includes('/')) {
    const parts = model.split('/');
    return parts[parts.length - 1];
  }
  return model;
}

// ============================================================================
// Props
// ============================================================================

interface ModelSelectorProps {
  config: StoredModelConfig;
  setPrimary: (entry: ModelEntry) => void;
  getApiKeyForProvider: (provider: AIProviderType) => string;
}

// ============================================================================
// Main Component
// ============================================================================

export function ModelSelector({ config, setPrimary, getApiKeyForProvider }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AIProviderType>(
    config.primary.provider
  );
  const [customModel, setCustomModel] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const triggerLabel = shortModelName(config.primary.model);

  const handleSelect = (entry: ModelEntry) => {
    setPrimary(entry);
    setOpen(false);
  };

  const handleCustomAdd = () => {
    const m = customModel.trim();
    if (!m) return;
    handleSelect({ provider: activeProvider, model: m });
    setCustomModel('');
    setShowCustom(false);
  };

  const models = PROVIDER_MODELS[activeProvider] || [];
  const activeProviderAvailable = getApiKeyForProvider(activeProvider).length > 10;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-md px-2.5 py-1.5 transition-colors max-w-[180px] focus:outline-none">
          <Cpu className="w-3 h-3 flex-shrink-0 text-[#5A9665]" />
          <span className="truncate font-mono">{triggerLabel}</span>
          <ChevronDown className="w-3 h-3 flex-shrink-0 ml-auto" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        avoidCollisions
        collisionPadding={12}
        className="w-[300px] p-0 bg-[#1F2020] border-[#2a2a2a] text-white shadow-xl"
        style={{ maxHeight: 'min(400px, calc(100vh - 120px))' }}
      >
        {/* Header */}
        <div className="px-3 pt-3 pb-2 border-b border-[#2a2a2a]">
          <span className="text-sm font-semibold text-white">Model</span>
        </div>

        {/* Provider tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-[#2a2a2a] overflow-x-auto scrollbar-none">
          {ALL_PROVIDERS.map(p => {
            const available = getApiKeyForProvider(p).length > 10;
            const isActive = activeProvider === p;
            return (
              <button
                key={p}
                onClick={() => setActiveProvider(p)}
                className={`flex-shrink-0 px-2.5 py-1 rounded text-xs transition-colors font-medium
                  ${isActive ? 'bg-[#3a3a3a] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                  ${!available ? 'opacity-50' : ''}`}
              >
                {PROVIDER_DISPLAY_NAMES[p]}
                {!available && <Lock className="w-2.5 h-2.5 inline ml-1 opacity-60" />}
              </button>
            );
          })}
        </div>

        {/* Model list */}
        <div className="px-3 py-2 overflow-y-auto scrollbar-none" style={{ maxHeight: '200px' }}>
          {!activeProviderAvailable && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-md px-2.5 py-1.5 mb-2">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>No API key set for this provider</span>
            </div>
          )}
          <div className="space-y-0.5">
            {models.map((model) => {
              const isSelected = config.primary.provider === activeProvider && config.primary.model === model;
              return (
                <button
                  key={model}
                  onClick={() => handleSelect({ provider: activeProvider, model })}
                  disabled={!activeProviderAvailable}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between gap-2 group
                    ${activeProviderAvailable ? 'hover:bg-white/[0.12] cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                    ${isSelected ? 'bg-[#5A9665]/20 text-[#5A9665]' : 'text-gray-300'}`}
                >
                  <span className="font-mono truncate">{model}</span>
                  {isSelected
                    ? <Check className="w-3 h-3 flex-shrink-0 text-[#5A9665]" />
                    : <span className="text-[10px] flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity">Use</span>
                  }
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom model input */}
        <div className="px-3 py-2 border-t border-[#2a2a2a]">
          {showCustom ? (
            <div className="flex gap-1.5">
              <Input
                value={customModel}
                onChange={e => setCustomModel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomAdd()}
                placeholder={activeProvider === 'openrouter' ? 'org/model-name' : 'model-id'}
                className="h-7 text-xs bg-[#1a1a1a] border-[#3a3a3a] text-white flex-1"
                autoFocus
                disabled={!activeProviderAvailable}
              />
              <Button size="sm" className="h-7 px-2 text-xs" onClick={handleCustomAdd} disabled={!customModel.trim() || !activeProviderAvailable}>
                Use
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-gray-400" onClick={() => { setShowCustom(false); setCustomModel(''); }}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              disabled={!activeProviderAvailable}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
              Custom model ID
            </button>
          )}
        </div>

        {/* Active model footer */}
        <div className="px-3 py-2 border-t border-[#2a2a2a] flex items-center gap-2 min-h-[32px]">
          <span className="text-[10px] text-gray-500 flex-shrink-0">Active:</span>
          <Badge variant="outline" className="text-[10px] font-mono border-[#3a3a3a] text-gray-300 py-0 flex-shrink-0">
            {PROVIDER_DISPLAY_NAMES[config.primary.provider]}
          </Badge>
          <span className="text-[10px] font-mono text-[#5A9665] truncate min-w-0">
            {shortModelName(config.primary.model)}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
