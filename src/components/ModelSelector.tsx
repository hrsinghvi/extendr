/**
 * ModelSelector - AI model hotswapping UI
 *
 * Compact trigger button + popover panel that lets the user:
 * - Switch provider and model (single mode)
 * - Build a rotation list (rotation mode)
 * - Enter custom model IDs
 */

import { useState } from 'react';
import { ChevronDown, Plus, X, RotateCcw, Check, Cpu, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useModelConfig,
  PROVIDER_MODELS,
  PROVIDER_DISPLAY_NAMES,
  ALL_PROVIDERS,
  type ModelEntry,
} from '@/hooks/useModelConfig';
import type { AIProviderType } from '@/lib/ai/types';

// ============================================================================
// Helpers
// ============================================================================

/** Shorten a model ID for compact display */
function shortModelName(model: string): string {
  // For OpenRouter models like "anthropic/claude-sonnet-4" → "claude-sonnet-4"
  if (model.includes('/')) {
    const parts = model.split('/');
    return parts[parts.length - 1];
  }
  return model;
}

// ============================================================================
// Provider Tab
// ============================================================================

interface ProviderTabProps {
  provider: AIProviderType;
  isAvailable: boolean;
  selectedModel: string;
  onSelect: (entry: ModelEntry) => void;
  actionLabel?: string;
}

function ProviderTab({ provider, isAvailable, selectedModel, onSelect, actionLabel = 'Use' }: ProviderTabProps) {
  const models = PROVIDER_MODELS[provider] || [];
  const [customModel, setCustomModel] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomAdd = () => {
    const m = customModel.trim();
    if (!m) return;
    onSelect({ provider, model: m });
    setCustomModel('');
    setShowCustom(false);
  };

  return (
    <div className="space-y-1">
      {!isAvailable && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-md px-2.5 py-1.5 mb-2">
          <Lock className="w-3 h-3 flex-shrink-0" />
          <span>No API key set for this provider</span>
        </div>
      )}

      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
        {models.map((model) => {
          const isSelected = model === selectedModel;
          return (
            <button
              key={model}
              onClick={() => onSelect({ provider, model })}
              disabled={!isAvailable}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between gap-2 group
                ${isAvailable ? 'hover:bg-white/8 cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                ${isSelected ? 'bg-[#5A9665]/20 text-[#5A9665]' : 'text-gray-300'}`}
            >
              <span className="font-mono truncate">{model}</span>
              {isSelected ? (
                <Check className="w-3 h-3 flex-shrink-0 text-[#5A9665]" />
              ) : (
                <span className={`text-[10px] flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity`}>
                  {actionLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom model input */}
      <div className="pt-1.5 border-t border-white/8 mt-1.5">
        {showCustom ? (
          <div className="flex gap-1.5">
            <Input
              value={customModel}
              onChange={e => setCustomModel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomAdd()}
              placeholder={provider === 'openrouter' ? 'org/model-name' : 'model-id'}
              className="h-7 text-xs bg-[#1a1a1a] border-[#3a3a3a] text-white flex-1"
              autoFocus
              disabled={!isAvailable}
            />
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleCustomAdd}
              disabled={!customModel.trim() || !isAvailable}
            >
              {actionLabel}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-gray-400"
              onClick={() => { setShowCustom(false); setCustomModel(''); }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            disabled={!isAvailable}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            Custom model ID
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ModelSelector() {
  const {
    config,
    currentEntry,
    availableProviders,
    getApiKeyForProvider,
    setPrimary,
    setRotationEnabled,
    addRotationModel,
    removeRotationModel,
  } = useModelConfig();

  const [open, setOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AIProviderType>(
    currentEntry.provider
  );

  const isRotation = config.rotationEnabled && config.rotationModels.length > 0;

  // Build trigger label
  const triggerLabel = isRotation
    ? `Rotate (${config.rotationModels.length})`
    : shortModelName(currentEntry.model);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-md px-2.5 py-1.5 transition-colors max-w-[220px] focus:outline-none">
          <Cpu className="w-3 h-3 flex-shrink-0 text-[#5A9665]" />
          <span className="truncate font-mono">{triggerLabel}</span>
          {isRotation && (
            <RotateCcw className="w-3 h-3 flex-shrink-0 text-[#5A9665]" />
          )}
          <ChevronDown className="w-3 h-3 flex-shrink-0 ml-auto" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-[420px] p-0 bg-[#1F2020] border-[#2a2a2a] text-white shadow-xl"
      >
        <Tabs defaultValue="single" className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#2a2a2a]">
            <span className="text-sm font-semibold text-white">Model</span>
            <TabsList className="bg-[#2a2a2a] h-7">
              <TabsTrigger value="single" className="text-xs h-6 data-[state=active]:bg-[#3a3a3a]">
                Single
              </TabsTrigger>
              <TabsTrigger value="rotation" className="text-xs h-6 data-[state=active]:bg-[#3a3a3a]">
                Rotation
                {config.rotationModels.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 px-1 text-[10px] bg-[#5A9665]/30 text-[#5A9665] border-0">
                    {config.rotationModels.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Single mode ──────────────────────────────────────────────── */}
          <TabsContent value="single" className="m-0">
            {/* Provider tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-[#2a2a2a] overflow-x-auto">
              {ALL_PROVIDERS.map(p => {
                const available = getApiKeyForProvider(p).length > 10;
                const isActive = activeProvider === p;
                return (
                  <button
                    key={p}
                    onClick={() => setActiveProvider(p)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded text-xs transition-colors font-medium
                      ${isActive
                        ? 'bg-[#3a3a3a] text-white'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                      ${!available ? 'opacity-50' : ''}`}
                  >
                    {PROVIDER_DISPLAY_NAMES[p]}
                    {!available && <Lock className="w-2.5 h-2.5 inline ml-1 opacity-60" />}
                  </button>
                );
              })}
            </div>

            <div className="px-3 py-3">
              <ProviderTab
                provider={activeProvider}
                isAvailable={getApiKeyForProvider(activeProvider).length > 10}
                selectedModel={
                  config.primary.provider === activeProvider ? config.primary.model : ''
                }
                onSelect={(entry) => {
                  setPrimary(entry);
                  setRotationEnabled(false);
                  setOpen(false);
                }}
                actionLabel="Select"
              />
            </div>

            {/* Current selection footer */}
            <div className="px-3 py-2 border-t border-[#2a2a2a] flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Active:</span>
              <Badge variant="outline" className="text-[10px] font-mono border-[#3a3a3a] text-gray-300 py-0">
                {PROVIDER_DISPLAY_NAMES[config.primary.provider]}
              </Badge>
              <span className="text-[10px] font-mono text-[#5A9665] truncate">
                {shortModelName(config.primary.model)}
              </span>
            </div>
          </TabsContent>

          {/* ── Rotation mode ─────────────────────────────────────────────── */}
          <TabsContent value="rotation" className="m-0">
            {/* Provider tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-[#2a2a2a] overflow-x-auto">
              {ALL_PROVIDERS.map(p => {
                const available = getApiKeyForProvider(p).length > 10;
                const isActive = activeProvider === p;
                return (
                  <button
                    key={p}
                    onClick={() => setActiveProvider(p)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded text-xs transition-colors font-medium
                      ${isActive
                        ? 'bg-[#3a3a3a] text-white'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                      ${!available ? 'opacity-50' : ''}`}
                  >
                    {PROVIDER_DISPLAY_NAMES[p]}
                    {!available && <Lock className="w-2.5 h-2.5 inline ml-1 opacity-60" />}
                  </button>
                );
              })}
            </div>

            <div className="px-3 py-3 space-y-3">
              {/* Add from model list */}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
                  Add to rotation
                </p>
                <ProviderTab
                  provider={activeProvider}
                  isAvailable={getApiKeyForProvider(activeProvider).length > 10}
                  selectedModel=""
                  onSelect={(entry) => addRotationModel(entry)}
                  actionLabel="Add"
                />
              </div>

              {/* Current rotation queue */}
              {config.rotationModels.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
                    Rotation queue ({config.rotationModels.length})
                  </p>
                  <div className="space-y-1">
                    {config.rotationModels.map((entry, idx) => (
                      <div
                        key={`${entry.provider}-${entry.model}-${idx}`}
                        className="flex items-center gap-2 bg-[#2a2a2a] rounded-md px-2.5 py-1.5 group"
                      >
                        <span className="text-[10px] text-gray-500 w-4 flex-shrink-0 text-center">{idx + 1}</span>
                        <Badge variant="outline" className="text-[10px] border-[#444] text-gray-400 py-0 flex-shrink-0">
                          {PROVIDER_DISPLAY_NAMES[entry.provider]}
                        </Badge>
                        <span className="text-xs font-mono text-gray-300 truncate flex-1">
                          {shortModelName(entry.model)}
                        </span>
                        <button
                          onClick={() => removeRotationModel(idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enable/disable rotation */}
            <div className="px-3 py-2 border-t border-[#2a2a2a] flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-white">
                  {config.rotationEnabled ? 'Rotation active' : 'Rotation paused'}
                </p>
                <p className="text-[10px] text-gray-500">
                  {config.rotationEnabled
                    ? 'Each message uses the next model in queue'
                    : 'Enable to cycle through models per message'}
                </p>
              </div>
              <Button
                size="sm"
                className={`text-xs h-7 px-3 ${config.rotationEnabled
                  ? 'bg-[#5A9665] hover:bg-[#5A9665]/80 text-white'
                  : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 border border-[#444]'}`}
                onClick={() => {
                  if (config.rotationModels.length === 0 && !config.rotationEnabled) return;
                  setRotationEnabled(!config.rotationEnabled);
                  if (!config.rotationEnabled) setOpen(false);
                }}
                disabled={config.rotationModels.length === 0}
              >
                {config.rotationEnabled ? 'Enabled' : 'Enable'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
