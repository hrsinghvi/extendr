/**
 * PreviewPanel Component
 * 
 * Main preview panel that combines file tree, code editor, terminal, and preview.
 * Connects the Terminal to WebContainer for live output.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Code2, 
  Eye, 
  Terminal as TerminalIcon, 
  FileCode,
  Play,
  Square,
  RefreshCw,
  Loader2,
  AlertCircle,
  PanelLeft,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { Terminal, type TerminalHandle } from './Terminal';
import { PreviewFrame } from './PreviewFrame';
import { LogPanel } from './LogPanel';
import { BuildStatus } from '../useWebContainer';
import type { FileMap, PreviewPanelProps, LogEntry } from '../types';

/**
 * Status badge component
 */
function StatusBadge({ status, message }: { status: BuildStatus; message?: string }) {
  const config: Record<BuildStatus, { label: string; color: string; animate?: boolean }> = {
    [BuildStatus.IDLE]: { label: 'Ready', color: 'bg-gray-500' },
    [BuildStatus.BOOTING]: { label: 'Booting...', color: 'bg-yellow-500', animate: true },
    [BuildStatus.MOUNTING]: { label: 'Mounting...', color: 'bg-yellow-500', animate: true },
    [BuildStatus.INSTALLING]: { label: 'Installing...', color: 'bg-blue-500', animate: true },
    [BuildStatus.STARTING]: { label: 'Starting...', color: 'bg-blue-500', animate: true },
    [BuildStatus.RUNNING]: { label: 'Running', color: 'bg-[#5A9665]' },
    [BuildStatus.ERROR]: { label: 'Error', color: 'bg-red-500' }
  };

  const { label, color, animate } = config[status] || config[BuildStatus.IDLE];

  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', color, animate && 'animate-pulse')} />
      <span className="text-xs text-gray-400">{message || label}</span>
    </div>
  );
}

/**
 * Extended PreviewPanel props
 */
interface ExtendedPreviewPanelProps extends PreviewPanelProps {
  status?: BuildStatus;
  statusMessage?: string;
  previewUrl?: string | null;
  error?: string | null;
  logs?: LogEntry[];
  onBuild?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onClearLogs?: () => void;
  onTerminalReady?: (writer: (data: string) => void) => void;
  userEmail?: string;
  onExport?: () => void;
  onPublish?: () => void;
  /** Whether AI is currently working on the extension */
  isAIWorking?: boolean;
}

/**
 * PreviewPanel component
 */
export function PreviewPanel({
  files,
  onFilesChange,
  className,
  status = BuildStatus.IDLE,
  statusMessage,
  previewUrl,
  error,
  logs = [],
  onBuild,
  onRun,
  onStop,
  onClearLogs,
  onTerminalReady,
  userEmail,
  onExport,
  onPublish,
  isAIWorking = false
}: ExtendedPreviewPanelProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [bottomTab, setBottomTab] = useState<'terminal' | 'logs'>('terminal');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const terminalRef = useRef<TerminalHandle>(null);

  // Get selected file content
  const selectedFileContent = selectedFile ? files[selectedFile] || '' : '';

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle file selection
  const handleSelectFile = useCallback((path: string) => {
    setSelectedFile(path);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
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

  // Handle terminal ready - connect to WebContainer
  const handleTerminalReady = useCallback((writer: (data: string) => void) => {
    console.log('[PreviewPanel] Terminal ready, connecting to WebContainer');
    onTerminalReady?.(writer);
  }, [onTerminalReady]);

  // Handle terminal input (for future interactive shell support)
  const handleTerminalInput = useCallback((data: string) => {
    console.log('[PreviewPanel] Terminal input:', data);
  }, []);

  // Switch to preview tab when we get a URL
  useEffect(() => {
    if (previewUrl && status === BuildStatus.RUNNING) {
      setActiveTab('preview');
    }
  }, [previewUrl, status]);

  // Auto-select first file if none selected
  useEffect(() => {
    if (!selectedFile && Object.keys(files).length > 0) {
      const preferredFiles = ['popup/popup.html', 'popup/index.html', 'manifest.json'];
      const firstPreferred = preferredFiles.find(f => files[f]);
      setSelectedFile(firstPreferred || Object.keys(files)[0]);
    }
  }, [files, selectedFile]);

  const isRunning = status === BuildStatus.RUNNING;
  const isBusy = [BuildStatus.BOOTING, BuildStatus.MOUNTING, BuildStatus.INSTALLING, BuildStatus.STARTING].includes(status);
  const hasError = status === BuildStatus.ERROR;

  return (
    <div className={cn('flex flex-col h-full bg-[#1a1a1a]', className)}>
      <div className="h-12 shrink-0 flex items-center justify-between px-4 bg-[#232323] border-b border-gray-800">
        {/* Left side - Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'preview')} className="flex items-center">
          <TabsList className="h-8 bg-transparent p-0 gap-1">
            <TabsTrigger 
              value="code" 
              className="h-8 px-4 text-sm data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white rounded-md border border-transparent data-[state=active]:border-gray-700"
            >
              <Code2 className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className={cn(
                "h-8 px-4 text-sm data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white rounded-md border border-transparent data-[state=active]:border-gray-700",
                previewUrl && "text-[#5A9665]"
              )}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
              {isRunning && <span className="ml-2 w-2 h-2 bg-[#5A9665] rounded-full" />}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Right side - Status + Actions */}
        <div className="flex items-center gap-3">
          {hasError && error && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs hidden md:flex">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="max-w-[150px] truncate">{error}</span>
            </div>
          )}

          <div className="h-6 w-px bg-gray-700" />

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-sm text-gray-400 hover:text-white hover:bg-[#2a2a2a] gap-2"
            onClick={onExport}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button 
            className="h-8 text-sm bg-[#5A9665] hover:bg-[#4A8655] text-white px-4"
            onClick={onPublish}
          >
            Publish
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-[#2a2a2a]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#5A9665] to-[#5f87a3] flex items-center justify-center text-xs font-medium">
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </div>
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* File tree sidebar - collapsible */}
        <div 
          className={cn(
            "flex-shrink-0 border-r border-gray-800 bg-[#1e1e1e] flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
            isSidebarOpen ? "w-56 opacity-100" : "w-0 opacity-0 border-none"
          )}
        >
          {/* FILES header with sidebar toggle */}
          <div className="px-3 py-2 border-b border-gray-800 h-10 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Files
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </div>
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            className="flex-1 overflow-auto"
          />
        </div>

        {/* Sidebar toggle when closed */}
        {!isSidebarOpen && (
          <div className="flex-shrink-0 border-r border-gray-800 bg-[#1e1e1e] flex flex-col">
            <div className="px-2 py-2 border-b border-gray-800 h-10 flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setIsSidebarOpen(true)}
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Editor/Preview area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Code Tab Content - hidden when preview tab is active */}
          <div className={cn(
            "flex-1 flex flex-col min-h-0 overflow-hidden",
            activeTab !== 'code' && "hidden"
          )}>
            {selectedFile ? (
              <CodeEditor
                value={selectedFileContent}
                onChange={handleCodeChange}
                fileName={selectedFile}
                className="flex-1 overflow-hidden"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                <FileCode className="w-5 h-5 mr-2" />
                Select a file to edit
              </div>
            )}
          </div>
          
          {/* Preview Tab Content - ALWAYS mounted, hidden when code tab is active */}
          {/* This prevents iframe reload flicker when switching tabs */}
          <PreviewFrame 
            url={previewUrl || null} 
            className={cn("flex-1 absolute inset-0", activeTab !== 'preview' && "hidden")}
            hasFiles={Object.keys(files).length > 0}
            buildStatus={status}
            isAIWorking={isAIWorking}
          />

          {/* Bottom panel (Terminal/Logs) - Only show in code view */}
          {activeTab === 'code' && (
            <div className="h-52 border-t border-gray-800 flex flex-col shrink-0">
              <div className="flex items-center px-2 py-1 bg-[#232323] border-b border-gray-800 h-8">
                <button
                  onClick={() => setBottomTab('terminal')}
                  className={cn(
                    'px-3 py-0.5 text-xs rounded-sm transition-colors flex items-center gap-1.5',
                    bottomTab === 'terminal' 
                      ? 'bg-[#1a1a1a] text-white' 
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <TerminalIcon className="w-3 h-3" />
                  Terminal
                </button>
                <button
                  onClick={() => setBottomTab('logs')}
                  className={cn(
                    'px-3 py-0.5 text-xs rounded-sm transition-colors flex items-center gap-1.5',
                    bottomTab === 'logs' 
                      ? 'bg-[#1a1a1a] text-white' 
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <FileCode className="w-3 h-3" />
                  Logs
                  {logs.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">
                      {logs.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-hidden bg-[#1a1a1a]">
                {bottomTab === 'terminal' ? (
                  <Terminal 
                    ref={terminalRef}
                    onInput={handleTerminalInput}
                    onReady={handleTerminalReady}
                    className="h-full" 
                  />
                ) : (
                  <LogPanel 
                    logs={logs} 
                    onClear={onClearLogs}
                    className="h-full" 
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewPanel;
