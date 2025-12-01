/**
 * Legacy ExtensionPreview
 * Re-exports from new preview system
 */
export { PreviewPanel as ExtensionPreview, PreviewPanel as default } from '@/preview';
export type { FileMap as ExtensionFiles } from '@/preview';

// Legacy default files export
export const DEFAULT_EXTENSION_FILES = {
  react: '',
  html: '',
  css: '',
  js: '',
  manifest: ''
};
