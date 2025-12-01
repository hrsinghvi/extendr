/**
 * PreviewPanel Component
 * 
 * Main preview panel that combines file tree, code editor, terminal, and preview.
 */

import React, { useState, useCallback } from 'react';
import { 
  Code2, 
  Eye, 
  Terminal as TerminalIcon, 
  FileCode,
  Play,
  Square,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { Terminal, useTerminalRef } from './Terminal';
import { PreviewFrame } from './PreviewFrame';
import { LogPanel } from './LogPanel';
import { BuildStatus } from '../postMessageBridge';
import type { FileMap, PreviewPanelProps } from '../types';

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: BuildStatus }) {
  const config = {
    [BuildStatus.IDLE]: { label: 'Idle', color: 'bg-gray-500' },
    [BuildStatus.INSTALLING]: { label: 'Installing...', color: 'bg-yellow-500 animate-pulse' },
    [BuildStatus.BUILDING]: { label: 'Building...', color: 'bg-blue-500 animate-pulse' },
    [BuildStatus.RUNNING]: { label: 'Running', color: 'bg-green-500' },
    [BuildStatus.ERROR]: { label: 'Error', color: 'bg-red-500' }
  };

  const { label, color } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

/**
 * PreviewPanel component
 */
export function PreviewPanel({
  files,
  onFilesChange,
  className,
  status = BuildStatus.IDLE,
  previewUrl,
  logs = [],
  onBuild,
  onRun,
  onStop,
  onClearLogs
}: PreviewPanelProps & {
  status?: BuildStatus;
  previewUrl?: string | null;
  logs?: Array<{ id: string; level: string; message: string; timestamp: number; source?: string }>;
  onBuild?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onClearLogs?: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'terminal'>('code');
  const [bottomTab, setBottomTab] = useState<'terminal' | 'logs'>('terminal');
  const { ref: terminalRef, write: writeToTerminal } = useTerminalRef();

  // Get selected file content
  const selectedFileContent = selectedFile ? files[selectedFile] || '' : '';

  // Handle file selection
  const handleSelectFile = useCallback((path: string) => {
    setSelectedFile(path);
    setActiveTab('code');
  }, []);

  // Handle code change
  const handleCodeChange = useCallback((newContent: string) => {
    if (!selectedFile || !onFilesChange) return;
    
    onFilesChange({
      ...files,
      [selectedFile]: newContent
    });
  }, [selectedFile, files, onFilesChange]);

  // Handle terminal input
  const handleTerminalInput = useCallback((data: string) => {
    // Echo input back to terminal
    writeToTerminal(data);
  }, [writeToTerminal]);

  const isRunning = status === BuildStatus.RUNNING;
  const isBusy = status === BuildStatus.INSTALLING || status === BuildStatus.BUILDING;

  return (
    <div className={cn('flex flex-col h-full bg-[#1a1a1a]', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-[#232323]">
        <div className="flex items-center gap-4">
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button
              size="sm"
              onClick={onBuild}
              disabled={isBusy || Object.keys(files).length === 0}
              className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-700"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  {status === BuildStatus.INSTALLING ? 'Installing...' : 'Building...'}
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1.5" />
                  Build & Run
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onRun}
                className="h-7 px-3 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Rebuild
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onStop}
                className="h-7 px-3 text-xs"
              >
                <Square className="w-3 h-3 mr-1.5" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* File tree sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-gray-800 bg-[#1e1e1e] overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-800">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Files
            </span>
          </div>
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            className="h-full"
          />
        </div>

        {/* Editor/Preview area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <TabsList className="h-9 px-2 bg-[#232323] border-b border-gray-800 rounded-none justify-start">
              <TabsTrigger 
                value="code" 
                className="h-7 px-3 text-xs data-[state=active]:bg-[#1a1a1a] rounded-sm"
              >
                <Code2 className="w-3 h-3 mr-1.5" />
                Code
                {selectedFile && (
                  <span className="ml-2 text-gray-500">
                    {selectedFile.split('/').pop()}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="h-7 px-3 text-xs data-[state=active]:bg-[#1a1a1a] rounded-sm"
              >
                <Eye className="w-3 h-3 mr-1.5" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="flex-1 m-0 data-[state=inactive]:hidden">
              {selectedFile ? (
                <CodeEditor
                  value={selectedFileContent}
                  onChange={handleCodeChange}
                  fileName={selectedFile}
                  className="h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  <FileCode className="w-5 h-5 mr-2" />
                  Select a file to edit
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 data-[state=inactive]:hidden">
              <PreviewFrame url={previewUrl || null} className="h-full" />
            </TabsContent>
          </Tabs>

          {/* Bottom panel (Terminal/Logs) */}
          <div className="h-48 border-t border-gray-800 flex flex-col">
            <div className="flex items-center px-2 py-1 bg-[#232323] border-b border-gray-800">
              <button
                onClick={() => setBottomTab('terminal')}
                className={cn(
                  'px-3 py-1 text-xs rounded-sm transition-colors',
                  bottomTab === 'terminal' 
                    ? 'bg-[#1a1a1a] text-white' 
                    : 'text-gray-400 hover:text-white'
                )}
              >
                <TerminalIcon className="w-3 h-3 inline mr-1.5" />
                Terminal
              </button>
              <button
                onClick={() => setBottomTab('logs')}
                className={cn(
                  'px-3 py-1 text-xs rounded-sm transition-colors',
                  bottomTab === 'logs' 
                    ? 'bg-[#1a1a1a] text-white' 
                    : 'text-gray-400 hover:text-white'
                )}
              >
                <FileCode className="w-3 h-3 inline mr-1.5" />
                Logs
                {logs.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">
                    {logs.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {bottomTab === 'terminal' ? (
                <div ref={terminalRef} className="h-full">
                  <Terminal onInput={handleTerminalInput} className="h-full" />
                </div>
              ) : (
                <LogPanel 
                  logs={logs as any} 
                  onClear={onClearLogs}
                  className="h-full" 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewPanel;

