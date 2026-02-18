/**
 * AI Module Index
 * 
 * Main entry point for the AI system.
 * Export everything needed to integrate AI into the app.
 */

// Types
export type {
  // Core types
  ToolDefinition,
  ToolCall,
  ToolResult,
  ToolContext,
  ToolHandler,
  ToolHandlers,
  
  // Message types
  Message,
  MessageRole,
  ConversationHistory,
  
  // Response types
  AIResponse,
  AIResponseType,
  
  // Provider types
  AIProvider,
  AIProviderType,
  ProviderConfig,
  
  // Service types
  AIServiceOptions,
  AIServiceResult,
  
  // Schema types
  JSONSchema,
  JSONSchemaProperty,
  JSONSchemaType
} from './types';

// Tools
export {
  ALL_TOOLS,
  getToolByName,
  TOOL_NAMES,
  type ToolName,
  // Individual tool definitions
  EXT_WRITE_FILE,
  EXT_READ_FILE,
  EXT_DELETE_FILE,
  EXT_RENAME_FILE,
  EXT_LIST_FILES,
  EXT_SEARCH_FILES,
  EXT_ADD_DEPENDENCY,
  EXT_REMOVE_DEPENDENCY,
  EXT_BUILD_PREVIEW,
  EXT_STOP_PREVIEW,
  EXT_RUN_COMMAND,
  EXT_READ_CONSOLE_LOGS,
  EXT_GET_PROJECT_INFO
} from './tools';

// Tool executor
export {
  executeTool,
  executeToolCalls,
  getModifiedFiles,
  wasBuildTriggered,
  TOOL_HANDLERS
} from './toolExecutor';

// System prompt
export {
  EXTENSION_SYSTEM_PROMPT,
  EXTENSION_SHORT_PROMPT,
  getSystemPrompt,
  PROMPT_ADDITIONS
} from './systemPrompt';

// AI Service
export {
  AIService,
  createAIService,
  createAIServiceFromEnv,
  createToolContext
} from './aiService';

// Providers
export {
  createProvider,
  createProviderFromKey,
  getProviderInfoList,
  getProviderInfo,
  isProviderSupported,
  type ProviderInfo,
  // Individual providers
  GeminiProvider,
  createGeminiProvider,
  OpenAIProvider,
  createOpenAIProvider,
  ClaudeProvider,
  createClaudeProvider,
  OpenRouterProvider,
  createOpenRouterProvider,
  OPENROUTER_DEFAULT_MODEL,
  // Utilities
  BaseAIProvider,
  validateApiKey
} from './providers';
