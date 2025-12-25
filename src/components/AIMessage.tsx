import { useState } from 'react';
import { 
  Terminal, 
  Package, 
  Play, 
  Search, 
  Trash2, 
  Pencil,
  Eye,
  Download,
  FolderOpen,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Square
} from 'lucide-react';
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
 * Tool action type for display
 */
interface ToolAction {
  icon: React.ElementType;
  label: string;
  detail?: string;
  color: string;
}

/**
 * Parse a tool call into a displayable action
 */
function parseToolAction(tc: ToolCall): ToolAction {
  const args = tc.arguments as Record<string, unknown>;
  
  switch (tc.name) {
    case 'ext_write_file':
      return {
        icon: Pencil,
        label: 'Wrote',
        detail: args.file_path as string,
        color: 'text-green-400'
      };
    
    case 'ext_read_file':
      return {
        icon: Eye,
        label: 'Read',
        detail: args.file_path as string,
        color: 'text-blue-400'
      };
    
    case 'ext_delete_file':
      return {
        icon: Trash2,
        label: 'Deleted',
        detail: args.file_path as string,
        color: 'text-red-400'
      };
    
    case 'ext_rename_file':
      return {
        icon: Pencil,
        label: 'Renamed',
        detail: `${args.old_path} → ${args.new_path}`,
        color: 'text-yellow-400'
      };
    
    case 'ext_list_files':
      return {
        icon: FolderOpen,
        label: 'Listed files',
        detail: args.directory as string || 'root',
        color: 'text-gray-400'
      };
    
    case 'ext_search_files':
      return {
        icon: Search,
        label: 'Searched',
        detail: `"${args.query}"`,
        color: 'text-purple-400'
      };
    
    case 'ext_replace_lines':
      return {
        icon: Pencil,
        label: 'Edited',
        detail: args.file_path as string,
        color: 'text-orange-400'
      };
    
    case 'ext_download_file':
      return {
        icon: Download,
        label: 'Downloaded',
        detail: args.file_path as string,
        color: 'text-cyan-400'
      };
    
    case 'ext_add_dependency':
      return {
        icon: Package,
        label: 'Installed',
        detail: args.package as string,
        color: 'text-green-400'
      };
    
    case 'ext_remove_dependency':
      return {
        icon: Package,
        label: 'Uninstalled',
        detail: args.package as string,
        color: 'text-red-400'
      };
    
    case 'ext_build_preview':
      return {
        icon: Play,
        label: 'Built the project',
        color: 'text-[#5A9665]'
      };
    
    case 'ext_stop_preview':
      return {
        icon: Square,
        label: 'Stopped preview',
        color: 'text-red-400'
      };
    
    case 'ext_run_command':
      return {
        icon: Terminal,
        label: 'Ran command',
        detail: args.command as string,
        color: 'text-yellow-400'
      };
    
    case 'ext_read_console_logs':
      return {
        icon: Terminal,
        label: 'Read logs',
        color: 'text-gray-400'
      };
    
    case 'ext_get_project_info':
      return {
        icon: Wrench,
        label: 'Checked project',
        color: 'text-gray-400'
      };
    
    default:
      return {
        icon: Terminal,
        label: tc.name.replace('ext_', '').replace(/_/g, ' '),
        color: 'text-gray-400'
      };
  }
}

/**
 * Actions dropdown component
 */
function ActionsDropdown({ toolCalls }: { toolCalls: ToolCall[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const actions = toolCalls.map(tc => parseToolAction(tc));
  const actionCount = actions.length;
  
  if (actionCount === 0) return null;
  
  return (
    <div className="mt-3 bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800">
      {/* Collapsed header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">{actionCount} action{actionCount !== 1 ? 's' : ''} taken</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-800 px-3 py-2 space-y-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div key={index} className="flex items-center gap-2.5 text-sm min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${action.color}`} />
                <span className="text-gray-300 flex-shrink-0">{action.label}</span>
                {action.detail && (
                  <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 font-mono truncate min-w-0">
                    {action.detail}
                  </code>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Clean up excessive newlines in content
 * - Reduces 3+ consecutive newlines to 2
 * - Trims leading/trailing whitespace
 */
function cleanContent(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
    .replace(/^\s+|\s+$/g, '');   // Trim
}

export function AIMessage({ content, modifiedFiles, toolCalls }: AIMessageProps) {
  // Check for legacy JSON code block format (fallback)
  const codeBlockRegex = /```json\n([\s\S]*?)\n```/;
  const codeBlockMatch = content.match(codeBlockRegex);
  const jsonString = codeBlockMatch ? codeBlockMatch[0] : null;
  const rawText = jsonString ? content.replace(jsonString, '').trim() : content;
  
  // Clean up excessive spacing
  const explanatoryText = cleanContent(rawText);

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

  const hasToolCalls = toolCalls && toolCalls.length > 0;

  return (
    <div className="prose prose-invert prose-sm max-w-none break-words overflow-hidden [word-break:break-word]">
      {/* Main text content - removed whitespace-pre-wrap to avoid excessive spacing */}
      <div className="break-words [overflow-wrap:anywhere]">
        <ReactMarkdown
          components={{
            // Tighter spacing between paragraphs
            p: ({ children }) => <p className="break-words [overflow-wrap:anywhere] my-2 first:mt-0 last:mb-0">{children}</p>,
            a: ({ children, href }) => <a href={href} className="break-all text-[#5A9665] hover:underline">{children}</a>,
            code: ({ children }) => <code className="break-all bg-gray-700/50 px-1 py-0.5 rounded text-xs">{children}</code>,
            ul: ({ children }) => <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-gray-300 my-0.5">{children}</li>,
            h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
            pre: ({ children }) => <pre className="bg-gray-800 p-2 rounded my-2 overflow-x-auto">{children}</pre>,
          }}
        >
          {explanatoryText}
        </ReactMarkdown>
      </div>
      
      {/* Tool actions dropdown */}
      {hasToolCalls && <ActionsDropdown toolCalls={toolCalls} />}
    </div>
  );
}
