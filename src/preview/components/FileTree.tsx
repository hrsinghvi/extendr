/**
 * FileTree Component
 * 
 * Displays a hierarchical file tree with expand/collapse functionality.
 */

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileMap, FileTreeNode, FileTreeProps } from '../types';
import { fileMapToTree, getFileExtension } from '../types';

/**
 * File icon based on extension
 */
function FileIcon({ path }: { path: string }) {
  const ext = getFileExtension(path);
  
  const iconColors: Record<string, string> = {
    js: 'text-yellow-400',
    jsx: 'text-cyan-400',
    ts: 'text-blue-400',
    tsx: 'text-blue-400',
    json: 'text-yellow-300',
    html: 'text-orange-400',
    css: 'text-pink-400',
    md: 'text-gray-400'
  };
  
  return <File className={cn('w-4 h-4', iconColors[ext] || 'text-gray-400')} />;
}

/**
 * Tree node component
 */
interface TreeNodeProps {
  node: FileTreeNode;
  depth: number;
  selectedFile: string | null;
  expandedDirs: Set<string>;
  onSelectFile: (path: string) => void;
  onToggleDir: (path: string) => void;
}

function TreeNode({
  node,
  depth,
  selectedFile,
  expandedDirs,
  onSelectFile,
  onToggleDir
}: TreeNodeProps) {
  const isExpanded = expandedDirs.has(node.path);
  const isSelected = selectedFile === node.path;
  const isDirectory = node.type === 'directory';

  const handleClick = () => {
    if (isDirectory) {
      onToggleDir(node.path);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 cursor-pointer rounded-sm text-sm',
          'hover:bg-white/5 transition-colors',
          isSelected && 'bg-white/10 text-white',
          !isSelected && 'text-gray-300'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/collapse icon for directories */}
        {isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" /> {/* Spacer for alignment */}
            <FileIcon path={node.path} />
          </>
        )}
        
        <span className="truncate">{node.name}</span>
      </div>

      {/* Children */}
      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              expandedDirs={expandedDirs}
              onSelectFile={onSelectFile}
              onToggleDir={onToggleDir}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * FileTree component
 */
export function FileTree({
  files,
  selectedFile,
  onSelectFile,
  className
}: FileTreeProps) {
  // Build tree structure from flat file map
  const tree = useMemo(() => fileMapToTree(files), [files]);

  // Track expanded directories
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(() => {
    // Expand root directories by default
    const initial = new Set<string>();
    tree.forEach(node => {
      if (node.type === 'directory') {
        initial.add(node.path);
      }
    });
    return initial;
  });

  const handleToggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  if (Object.keys(files).length === 0) {
    return (
      <div className={cn('p-4 text-center text-gray-500 text-sm', className)}>
        No files yet
      </div>
    );
  }

  return (
    <div className={cn('py-2 overflow-auto', className)}>
      {tree.map(node => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedFile={selectedFile}
          expandedDirs={expandedDirs}
          onSelectFile={onSelectFile}
          onToggleDir={handleToggleDir}
        />
      ))}
    </div>
  );
}

export default FileTree;

