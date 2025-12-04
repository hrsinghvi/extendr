import React from 'react';
import { FileCode, Terminal, Package, Play, Search, Trash2, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ToolCall } from '@/lib/ai/types';

interface AIMessageProps {
  content: string;
  /** Files modified during this message (from tool execution) */
  modifiedFiles?: string[];
  /** Tool calls made during this message */
  toolCalls?: ToolCall[];
}

/**
 * Get icon for a tool based on its name
 */
function getToolIcon(toolName: string) {
  if (toolName.includes('write_file') || toolName.includes('read_file')) {
    return FileCode;
  }
  if (toolName.includes('delete_file')) {
    return Trash2;
  }
  if (toolName.includes('rename_file')) {
    return Edit3;
  }
  if (toolName.includes('search')) {
    return Search;
  }
  if (toolName.includes('dependency') || toolName.includes('package')) {
    return Package;
  }
  if (toolName.includes('build') || toolName.includes('run') || toolName.includes('command')) {
    return Terminal;
  }
  if (toolName.includes('preview')) {
    return Play;
  }
  return Terminal;
}

/**
 * Format tool name for display
 */
function formatToolName(toolName: string): string {
  return toolName
    .replace('ext_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Group tool calls by type for cleaner display
 */
function groupToolCalls(toolCalls: ToolCall[]): Record<string, ToolCall[]> {
  const groups: Record<string, ToolCall[]> = {};
  
  for (const tc of toolCalls) {
    const category = tc.name.includes('file') ? 'files' :
                     tc.name.includes('dependency') ? 'packages' :
                     tc.name.includes('build') || tc.name.includes('preview') ? 'build' :
                     tc.name.includes('command') ? 'commands' :
                     'other';
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tc);
  }
  
  return groups;
}

export function AIMessage({ content, modifiedFiles, toolCalls }: AIMessageProps) {
  // Check for legacy JSON code block format (fallback)
const codeBlockRegex = /```json\n([\s\S]*?)\n```/;
  const codeBlockMatch = content.match(codeBlockRegex);
  const jsonString = codeBlockMatch ? codeBlockMatch[0] : null;
  const explanatoryText = jsonString ? content.replace(jsonString, '').trim() : content;

  // Get files from either new tool system or legacy JSON parsing
  let filesCreated: string[] = modifiedFiles || [];
  
  // Fallback: try to parse from JSON code block if no modifiedFiles provided
  if (filesCreated.length === 0 && codeBlockMatch && codeBlockMatch[1]) {
    try {
      const parsedCode = JSON.parse(codeBlockMatch[1]);
      filesCreated = Object.keys(parsedCode).filter(key => 
        typeof parsedCode[key] === 'string' && parsedCode[key].trim() !== ''
      );
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Group tool calls for display
  const groupedToolCalls = toolCalls ? groupToolCalls(toolCalls) : null;
  const hasToolActivity = filesCreated.length > 0 || (toolCalls && toolCalls.length > 0);

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      {/* Main text content */}
      <ReactMarkdown>
        {explanatoryText}
      </ReactMarkdown>
      
      {/* Tool activity summary */}
      {hasToolActivity && (
        <div className="mt-4 bg-gray-800/50 rounded-lg p-3 not-prose">
          {/* Files created/modified */}
          {filesCreated.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                Files created
              </h4>
              <ul className="space-y-1 list-none p-0 m-0">
                {filesCreated.map(file => (
              <li key={file} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="text-green-400">+</span>
                    <span className="font-mono">{file}</span>
              </li>
            ))}
          </ul>
            </div>
          )}
          
          {/* Tool calls breakdown */}
          {groupedToolCalls && Object.keys(groupedToolCalls).length > 0 && (
            <div>
              {/* Build/Preview tools */}
              {groupedToolCalls.build && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Play className="w-3 h-3 text-[#5A9665]" />
                  <span>Preview started</span>
                </div>
              )}
              
              {/* Package operations */}
              {groupedToolCalls.packages && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Package className="w-3 h-3 text-blue-400" />
                  <span>{groupedToolCalls.packages.length} package(s) installed</span>
                </div>
              )}
              
              {/* Commands run */}
              {groupedToolCalls.commands && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Terminal className="w-3 h-3 text-yellow-400" />
                  <span>{groupedToolCalls.commands.length} command(s) executed</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
