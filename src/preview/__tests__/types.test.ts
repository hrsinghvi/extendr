/**
 * Types Unit Tests
 * 
 * Tests for type utilities and helper functions.
 */

import { describe, it, expect } from 'vitest';
import {
  fileMapToTree,
  getFileExtension,
  getLanguageFromExtension,
  getFileIcon
} from '../types';
import type { FileMap, FileTreeNode } from '../types';

describe('Type Utilities', () => {
  describe('fileMapToTree', () => {
    it('should convert empty file map to empty tree', () => {
      const result = fileMapToTree({});
      expect(result).toEqual([]);
    });

    it('should convert single file to tree', () => {
      const files: FileMap = {
        'manifest.json': '{}'
      };
      
      const result = fileMapToTree(files);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('manifest.json');
      expect(result[0].type).toBe('file');
      expect(result[0].path).toBe('manifest.json');
    });

    it('should create directory structure', () => {
      const files: FileMap = {
        'popup/popup.html': '<html>',
        'popup/popup.css': '.class {}'
      };
      
      const result = fileMapToTree(files);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('popup');
      expect(result[0].type).toBe('directory');
      expect(result[0].children).toHaveLength(2);
    });

    it('should sort directories before files', () => {
      const files: FileMap = {
        'manifest.json': '{}',
        'popup/popup.html': '<html>',
        'background/service-worker.js': '//'
      };
      
      const result = fileMapToTree(files);
      
      // First two should be directories (background, popup alphabetically)
      expect(result[0].type).toBe('directory');
      expect(result[1].type).toBe('directory');
      expect(result[2].type).toBe('file');
    });

    it('should handle nested directories', () => {
      const files: FileMap = {
        'src/components/Button.tsx': 'export const Button',
        'src/utils/helpers.ts': 'export function'
      };
      
      const result = fileMapToTree(files);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('src');
      expect(result[0].children).toHaveLength(2);
    });
  });

  describe('getFileExtension', () => {
    it('should return extension for files with extension', () => {
      expect(getFileExtension('file.js')).toBe('js');
      expect(getFileExtension('file.ts')).toBe('ts');
      expect(getFileExtension('file.json')).toBe('json');
      expect(getFileExtension('file.html')).toBe('html');
      expect(getFileExtension('file.css')).toBe('css');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('Makefile')).toBe('');
      expect(getFileExtension('README')).toBe('');
    });

    it('should handle multiple dots in filename', () => {
      expect(getFileExtension('file.test.ts')).toBe('ts');
      expect(getFileExtension('file.min.js')).toBe('js');
    });

    it('should handle paths with directories', () => {
      expect(getFileExtension('src/components/Button.tsx')).toBe('tsx');
      expect(getFileExtension('popup/popup.html')).toBe('html');
    });

    it('should return lowercase extension', () => {
      expect(getFileExtension('file.JS')).toBe('js');
      expect(getFileExtension('file.TSX')).toBe('tsx');
    });
  });

  describe('getLanguageFromExtension', () => {
    it('should return correct language for JavaScript', () => {
      expect(getLanguageFromExtension('js')).toBe('javascript');
      expect(getLanguageFromExtension('jsx')).toBe('javascript');
    });

    it('should return correct language for TypeScript', () => {
      expect(getLanguageFromExtension('ts')).toBe('typescript');
      expect(getLanguageFromExtension('tsx')).toBe('typescript');
    });

    it('should return correct language for markup', () => {
      expect(getLanguageFromExtension('html')).toBe('html');
      expect(getLanguageFromExtension('css')).toBe('css');
      expect(getLanguageFromExtension('json')).toBe('json');
    });

    it('should return plaintext for unknown extensions', () => {
      expect(getLanguageFromExtension('xyz')).toBe('plaintext');
      expect(getLanguageFromExtension('')).toBe('plaintext');
    });
  });

  describe('getFileIcon', () => {
    it('should return JavaScript icon', () => {
      expect(getFileIcon('file.js')).toBe('📜');
    });

    it('should return TypeScript icon', () => {
      expect(getFileIcon('file.ts')).toBe('📘');
    });

    it('should return React icon for JSX/TSX', () => {
      expect(getFileIcon('file.jsx')).toBe('⚛️');
      expect(getFileIcon('file.tsx')).toBe('⚛️');
    });

    it('should return HTML icon', () => {
      expect(getFileIcon('file.html')).toBe('🌐');
    });

    it('should return CSS icon', () => {
      expect(getFileIcon('file.css')).toBe('🎨');
    });

    it('should return JSON icon', () => {
      expect(getFileIcon('file.json')).toBe('📋');
    });

    it('should return default icon for unknown types', () => {
      expect(getFileIcon('file.xyz')).toBe('📄');
      expect(getFileIcon('Makefile')).toBe('📄');
    });
  });
});

