/**
 * CodeEditor Component
 * 
 * A simple code editor with syntax highlighting using a textarea.
 * For production, consider using Monaco Editor or CodeMirror.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { CodeEditorProps } from '../types';
import { getFileExtension, getLanguageFromExtension } from '../types';

/**
 * Simple syntax highlighting (basic token coloring)
 */
function highlightCode(code: string, language: string): string {
  // Basic highlighting - in production use a proper highlighter
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (['javascript', 'typescript'].includes(language)) {
    // Keywords
    highlighted = highlighted.replace(
      /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|from|default|async|await|try|catch|throw|new|this|super|typeof|instanceof|in|of)\b/g,
      '<span class="text-purple-400">$1</span>'
    );
    // Strings
    highlighted = highlighted.replace(
      /(['"`])(?:(?!\1)[^\\]|\\.)*?\1/g,
      '<span class="text-green-400">$&</span>'
    );
    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$)/gm,
      '<span class="text-gray-500">$1</span>'
    );
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      '<span class="text-orange-400">$1</span>'
    );
  } else if (language === 'json') {
    // Keys
    highlighted = highlighted.replace(
      /"([^"]+)":/g,
      '<span class="text-cyan-400">"$1"</span>:'
    );
    // String values
    highlighted = highlighted.replace(
      /: "([^"]*)"/g,
      ': <span class="text-green-400">"$1"</span>'
    );
    // Numbers and booleans
    highlighted = highlighted.replace(
      /: (\d+|true|false|null)/g,
      ': <span class="text-orange-400">$1</span>'
    );
  } else if (language === 'html') {
    // Tags
    highlighted = highlighted.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span class="text-pink-400">$2</span>'
    );
    // Attributes
    highlighted = highlighted.replace(
      /\s([\w-]+)=/g,
      ' <span class="text-yellow-400">$1</span>='
    );
  } else if (language === 'css') {
    // Selectors
    highlighted = highlighted.replace(
      /^([.#]?[\w-]+)\s*\{/gm,
      '<span class="text-yellow-400">$1</span> {'
    );
    // Properties
    highlighted = highlighted.replace(
      /\s+([\w-]+):/g,
      ' <span class="text-cyan-400">$1</span>:'
    );
  }

  return highlighted;
}

/**
 * CodeEditor component
 */
export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  className,
  fileName
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [localValue, setLocalValue] = useState(value);

  // Detect language from filename if not provided
  const detectedLanguage = language || (fileName 
    ? getLanguageFromExtension(getFileExtension(fileName))
    : 'plaintext'
  );

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Sync scroll between textarea and highlight layer
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  // Handle tab key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = localValue.substring(0, start) + '  ' + localValue.substring(end);
      
      setLocalValue(newValue);
      onChange?.(newValue);

      // Restore cursor position
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  }, [localValue, onChange]);

  // Generate line numbers
  const lineCount = localValue.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className={cn('relative flex h-full bg-[#1a1a1a] font-mono text-sm', className)}>
      {/* Line numbers */}
      <div className="flex-shrink-0 py-3 px-2 text-right text-gray-600 select-none border-r border-gray-800 bg-[#151515]">
        {lineNumbers.map(num => (
          <div key={num} className="leading-6 h-6">
            {num}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Syntax highlighted layer */}
        <pre
          ref={highlightRef}
          className="absolute inset-0 p-3 overflow-auto pointer-events-none whitespace-pre-wrap break-words leading-6 text-gray-300"
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: highlightCode(localValue, detectedLanguage) + '\n'
          }}
        />

        {/* Editable textarea */}
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          className={cn(
            'absolute inset-0 w-full h-full p-3 resize-none',
            'bg-transparent text-transparent caret-white',
            'focus:outline-none leading-6',
            'whitespace-pre-wrap break-words',
            readOnly && 'cursor-default'
          )}
        />
      </div>
    </div>
  );
}

export default CodeEditor;

