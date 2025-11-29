import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: "html" | "css" | "javascript" | "json";
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * Lightweight code editor with syntax highlighting indication
 * Uses a textarea with monospace font for simplicity
 */
export function CodeEditor({
  value,
  onChange,
  language,
  className,
  placeholder,
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle tab key for indentation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);

        // Set cursor position after the inserted tab
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange]
  );

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        200,
        textareaRef.current.scrollHeight
      )}px`;
    }
  }, [value]);

  const languageColors: Record<string, string> = {
    html: "text-orange-400",
    css: "text-blue-400",
    javascript: "text-yellow-400",
    json: "text-green-400",
  };

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {/* Language badge */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className={cn(
            "px-2 py-0.5 text-xs font-mono rounded bg-black/50 backdrop-blur-sm",
            languageColors[language]
          )}
        >
          {language.toUpperCase()}
        </span>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        className={cn(
          "w-full min-h-[200px] p-4 pt-10 font-mono text-sm leading-relaxed",
          "bg-[#1e1e1e] text-gray-100 border-none outline-none resize-none",
          "placeholder:text-gray-600",
          "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent",
          readOnly && "cursor-default opacity-80"
        )}
      />
    </div>
  );
}

export default CodeEditor;

