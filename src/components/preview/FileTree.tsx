import React from 'react';
import { File, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExtensionFiles } from './ExtensionPreview';

export interface FileTreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

interface FileTreeProps {
  files: ExtensionFiles;
  onSelectFile: (fileName: keyof ExtensionFiles) => void;
  selectedFile: keyof ExtensionFiles;
}

export function FileTree({ files, onSelectFile, selectedFile }: FileTreeProps) {
  const fileNodes = (Object.keys(files) as Array<keyof ExtensionFiles>)
    .filter(name => files[name]?.trim() !== '')
    .map(name => ({ name, type: 'file' as const }));

  if (fileNodes.length === 0) {
    return (
      <div className="p-4 text-xs text-gray-500">
        No files have been generated yet.
      </div>
    );
  }

  return (
    <div className="p-2 text-white">
      <ul>
        {fileNodes.map(node => (
          <li key={node.name}>
            <button
              onClick={() => onSelectFile(node.name)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs rounded-md transition-colors',
                selectedFile === node.name
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'hover:bg-white/5'
              )}
            >
              <File className="w-3.5 h-3.5 text-gray-500" />
              <span>{node.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
