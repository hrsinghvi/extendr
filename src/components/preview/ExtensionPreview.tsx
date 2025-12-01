import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Eye } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { CodeEditor } from "./CodeEditor";
import { PreviewFrame } from "./PreviewFrame";
import { FileTree } from './FileTree';

export interface ExtensionFiles {
  react: string;
  html: string;
  css: string;
  js: string;
  manifest: string;
}

interface ExtensionPreviewProps {
  className?: string;
  files?: ExtensionFiles;
}

const EMPTY_EXTENSION_FILES: ExtensionFiles = {
  react: "",
  html: "",
  css: "",
  js: "",
  manifest: "",
};

export const DEFAULT_EXTENSION_FILES: ExtensionFiles = EMPTY_EXTENSION_FILES;

type TabType = 'preview' | 'code';

function getLanguageForFile(fileName: keyof ExtensionFiles): 'javascript' | 'css' | 'html' | 'json' {
  switch (fileName) {
    case 'react':
    case 'js':
      return 'javascript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'manifest':
      return 'json';
    default:
      return 'javascript'; // Default to JS for unknown types
  }
}

export function ExtensionPreview({
  className,
  files,
}: ExtensionPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const resolvedFiles = files ?? DEFAULT_EXTENSION_FILES;

  const [selectedFile, setSelectedFile] = useState<keyof ExtensionFiles>('react');

  const hasUserCode = Object.values(resolvedFiles).some(code => code.trim() !== '');

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName as keyof ExtensionFiles);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
    { id: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-[#1a1a1a] rounded-lg overflow-hidden", className)}>
      {/* Tab bar */}
      <div className="flex items-center bg-[#252525] border-b border-[#333] px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {hasUserCode ? (
                <PreviewFrame
                  react={resolvedFiles.react}
                  html={resolvedFiles.html}
                  css={resolvedFiles.css}
                  javascript={resolvedFiles.js}
                  title="Extension Preview"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6 text-gray-400">
                  <p className="text-base font-medium text-white">
                    Nothing to preview yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Ask the AI to generate an extension or paste code into the panels to see it here.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                  <div className="h-full bg-[#2a2a2a]/50 overflow-y-auto custom-scrollbar">
                    <FileTree
                      files={resolvedFiles}
                      selectedFile={selectedFile}
                      onSelectFile={handleFileSelect}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={70}>
                  <CodeEditor
                    value={resolvedFiles[selectedFile] ?? ''}
                    language={getLanguageForFile(selectedFile)}
                    readOnly={true}
                    onChange={() => {}}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
