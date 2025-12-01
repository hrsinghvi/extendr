import React from 'react';
import { FileCode } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIMessageProps {
  content: string;
}

const codeBlockRegex = /```json\n([\s\S]*?)\n```/;

export function AIMessage({ content }: AIMessageProps) {
  const codeBlockMatch = content.match(codeBlockRegex);
  const jsonString = codeBlockMatch ? codeBlockMatch[0] : null;
  const explanatoryText = jsonString ? content.replace(jsonString, '').trim() : content;

  let editedFiles: string[] = [];
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const parsedCode = JSON.parse(codeBlockMatch[1]);
      editedFiles = Object.keys(parsedCode).filter(key => 
        typeof parsedCode[key] === 'string' && parsedCode[key].trim() !== ''
      );
    } catch (e) {
      console.error("Failed to parse AI message JSON", e);
    }
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown>
        {explanatoryText}
      </ReactMarkdown>
      {editedFiles.length > 0 && (
        <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
          <h4 className="font-semibold text-xs text-gray-400 mb-2">Edits made</h4>
          <ul className="space-y-1.5 list-none p-0">
            {editedFiles.map(file => (
              <li key={file} className="flex items-center gap-2 text-xs text-gray-300">
                <FileCode className="w-3.5 h-3.5 text-gray-500" />
                <span>{file}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
