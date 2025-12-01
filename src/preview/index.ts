/**
 * Preview Module Index
 * 
 * Main entry point for the preview system.
 */

// PostMessage bridge
export {
  PostMessageBridge,
  bridge,
  MessageType,
  LogLevel,
  BuildStatus,
  PROTOCOL_VERSION,
  CHANNEL,
  createMessage,
  isValidMessage,
  isCompatibleVersion
} from './postMessageBridge';

export type {
  BaseMessage,
  Message,
  MessagePayloads,
  MessageHandler
} from './postMessageBridge';

// Types
export type {
  ExtensionFiles,
  FileMap,
  FileTreeNode,
  PreviewState,
  LogEntry,
  TerminalState,
  WebContainerOptions,
  PreviewPanelProps,
  CodeEditorProps,
  FileTreeProps,
  TerminalProps,
  PreviewFrameProps
} from './types';

export {
  fileMapToTree,
  getFileExtension,
  getLanguageFromExtension,
  getFileIcon
} from './types';

// Hooks
export { usePreview } from './usePreview';
export { useWebContainer } from './useWebContainer';

// WebContainer bridge
export {
  bootWebContainer,
  mountFiles,
  writeFile,
  readFile,
  runCommand,
  killProcess,
  installDependencies,
  startDevServer,
  buildExtension,
  updateFiles as wcUpdateFiles,
  stopExtension,
  getWebContainer,
  teardown,
  setupBridgeHandlers,
  setTerminalWriter,
  fileMapToFileSystemTree
} from './webcontainerBridge';

// Components
export {
  FileTree,
  CodeEditor,
  Terminal,
  useTerminalRef,
  PreviewFrame,
  LogPanel,
  PreviewPanel
} from './components';

