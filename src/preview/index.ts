/**
 * Preview Module Index
 * 
 * Main entry point for the preview system.
 */

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
export { useWebContainer, BuildStatus } from './useWebContainer';

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
  updateFilesInContainer,
  stopExtension,
  getWebContainer,
  teardown,
  setTerminalWriter,
  setStatusCallback,
  setErrorCallback,
  setUrlCallback,
  fileMapToFileSystemTree,
  isBooted
} from './webcontainerBridge';

export type {
  TerminalWriter,
  StatusCallback,
  ErrorCallback,
  UrlCallback,
  WebContainerStatus
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
