/**
 * Legacy Preview Module
 * 
 * Re-exports from the new preview system for backwards compatibility.
 */

export { 
  PreviewPanel,
  FileTree,
  CodeEditor,
  Terminal,
  PreviewFrame,
  LogPanel
} from '@/preview';

export type { 
  FileMap,
  ExtensionFiles 
} from '@/preview';
