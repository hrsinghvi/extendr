/**
 * PreviewPanel Component
 * 
 * Main preview panel that combines file tree, code editor, terminal, and preview.
 * Connects the Terminal to WebContainer for live output.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  Download,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { Terminal, type TerminalHandle } from './Terminal';
import { PreviewFrame } from './PreviewFrame';
import { LogPanel } from './LogPanel';
import { BuildStatus } from '../useWebContainer';
import type { FileMap, PreviewPanelProps, LogEntry } from '../types';
import { getFileExtension } from '../types';
import { POPUP_SIZE_PRESETS, type PopupDimensions } from '@/lib/export';

/**
 * Image file extensions
 */
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp'];

/**
 * Check if a file is an image based on extension
 */
function isImageFile(path: string): boolean {
  const ext = getFileExtension(path);
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * ImagePreview Component
 * Displays an image with zoom controls
 */
function ImagePreview({ 
  content, 
  fileName 
}: { 
  content: string; 
  fileName: string;
}) {
  const [zoom, setZoom] = useState(100);
  const ext = getFileExtension(fileName);
  
  // Determine the image source
  const imageSrc = useMemo(() => {
    // If content is already a data URL, use it directly
    if (content.startsWith('data:')) {
      return content;
    }
    
    // For SVG, we can use it as inline or convert to data URL
    if (ext === 'svg') {
      // Check if it's SVG markup
      if (content.trim().startsWith('<')) {
        return `data:image/svg+xml;base64,${btoa(content)}`;
      }
    }
    
    // Try to detect if it's base64 encoded
    try {
      // If it looks like base64, create a data URL
      if (/^[A-Za-z0-9+/=]+$/.test(content.replace(/\s/g, ''))) {
        const mimeType = ext === 'svg' ? 'image/svg+xml' : 
                         ext === 'ico' ? 'image/x-icon' :
                         `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        return `data:${mimeType};base64,${content}`;
      }
    } catch (e) {
      // Not base64
    }
    
    // For SVG text content
    if (ext === 'svg') {
      return `data:image/svg+xml;base64,${btoa(content)}`;
    }
    
    // Fallback: assume it's a path or URL
    return content;
  }, [content, ext]);

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#232323] border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ImageIcon className="w-4 h-4" />
          <span>{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(25, z - 25))}
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[3rem] text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(400, z + 25))}
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-2 py-1 text-xs rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Image container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#151515]">
        <div 
          className="relative bg-[#0a0a0a] rounded-lg border border-gray-800 p-4"
          style={{
            backgroundImage: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
          }}
        >
          <img
            src={imageSrc}
            alt={fileName}
            className="max-w-none transition-transform duration-200"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
}

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
  /** Export callback with popup dimensions for Chrome rendering */
  onExport?: (dimensions: PopupDimensions) => void;
  onPublish?: () => void;
  /** Whether AI is currently working on the extension */
  isAIWorking?: boolean;
  userEmail?: string;
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
  onExport,
  onPublish,
  isAIWorking = false,
  userEmail
}: ExtendedPreviewPanelProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [bottomTab, setBottomTab] = useState<'terminal' | 'logs'>('terminal');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const terminalRef = useRef<TerminalHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Custom size dialog state
  const [showCustomSizeDialog, setShowCustomSizeDialog] = useState(false);
  const [customWidth, setCustomWidth] = useState(400);
  const [customHeight, setCustomHeight] = useState(550);

  // Handle export with preset size
  const handleExportWithSize = useCallback((dimensions: PopupDimensions) => {
    onExport?.(dimensions);
  }, [onExport]);

  // Handle custom size export
  const handleCustomExport = useCallback(() => {
    const width = Math.max(200, Math.min(800, customWidth));
    const height = Math.max(200, Math.min(800, customHeight));
    onExport?.({ width, height });
    setShowCustomSizeDialog(false);
  }, [customWidth, customHeight, onExport]);

  // Get selected file content
  const selectedFileContent = selectedFile ? files[selectedFile] || '' : '';

  // Handle responsive sidebar with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      // Collapse sidebar if panel width is too small (e.g. < 768px)
      // This leaves enough room for the code editor
      if (width < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    });
    
    observer.observe(container);
    return () => observer.disconnect();
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
    <div ref={containerRef} className={cn('flex flex-col h-full bg-[#1a1a1a]', className)}>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                className="h-8 text-sm bg-[#5A9665] hover:bg-[#4A8655] text-white w-48 justify-between px-4"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </div>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" sideOffset={16}>
              <DropdownMenuItem 
                onClick={() => handleExportWithSize(POPUP_SIZE_PRESETS.small)}
                className="cursor-pointer"
              >
                {POPUP_SIZE_PRESETS.small.label}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExportWithSize(POPUP_SIZE_PRESETS.medium)}
                className="cursor-pointer"
              >
                {POPUP_SIZE_PRESETS.medium.label}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExportWithSize(POPUP_SIZE_PRESETS.large)}
                className="cursor-pointer"
              >
                {POPUP_SIZE_PRESETS.large.label}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowCustomSizeDialog(true)}
                className="cursor-pointer"
              >
                Custom dimensions...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Custom Size Dialog */}
      <Dialog open={showCustomSizeDialog} onOpenChange={setShowCustomSizeDialog}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle>Custom Popup Size</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="width" className="text-right">
                Width
              </Label>
              <Input
                id="width"
                type="number"
                min={200}
                max={800}
                value={customWidth}
                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 400)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="height" className="text-right">
                Height
              </Label>
              <Input
                id="height"
                type="number"
                min={200}
                max={800}
                value={customHeight}
                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 550)}
                className="col-span-3"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Dimensions in pixels (200-800px)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomSizeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCustomExport}
              className="bg-[#5A9665] hover:bg-[#4A8655]"
            >
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* File tree sidebar - collapsible */}
        <div 
          className={cn(
            "flex-shrink-0 bg-[#1e1e1e] flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden",
            isSidebarOpen ? "w-56" : "w-0"
          )}
          style={{ willChange: 'width' }}
        >
          {/* Inner wrapper with fixed width to prevent content reflow during animation */}
          <div className="w-56 h-full flex flex-col border-r border-gray-800">
            {/* FILES header with sidebar toggle */}
            <div className="px-3 py-2 border-b border-gray-800 h-10 flex items-center justify-between shrink-0">
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
              isImageFile(selectedFile) ? (
                // Image Preview
                <ImagePreview 
                  content={selectedFileContent} 
                  fileName={selectedFile} 
                />
              ) : (
                // Code Editor
                <CodeEditor
                  value={selectedFileContent}
                  onChange={handleCodeChange}
                  fileName={selectedFile}
                  className="flex-1 overflow-hidden"
                />
              )
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
