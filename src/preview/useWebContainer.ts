/**
 * useWebContainer Hook
 * 
 * React hook for managing WebContainer state and operations.
 * Connects the WebContainer bridge to React state and the Terminal component.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  bootWebContainer,
  buildExtension,
  updateFilesInContainer,
  stopExtension,
  teardown,
  setTerminalWriter,
  setStatusCallback,
  setErrorCallback,
  setUrlCallback,
  isBooted as checkIsBooted,
  type WebContainerStatus
} from './webcontainerBridge';
import type { FileMap, LogEntry } from './types';

// Re-export BuildStatus for convenience
export enum BuildStatus {
  IDLE = 'idle',
  BOOTING = 'booting',
  MOUNTING = 'mounting',
  INSTALLING = 'installing',
  STARTING = 'starting',
  RUNNING = 'running',
  ERROR = 'error'
}

/**
 * Hook options
 */
interface UseWebContainerOptions {
  autoInit?: boolean;
  onReady?: () => void;
  onPreviewUrl?: (url: string) => void;
  onError?: (error: string) => void;
}

/**
 * Hook return type
 */
interface UseWebContainerReturn {
  // State
  isBooted: boolean;
  isLoading: boolean;
  status: BuildStatus;
  statusMessage: string;
  previewUrl: string | null;
  error: string | null;
  logs: LogEntry[];
  
  // Actions
  boot: () => Promise<void>;
  build: (files: FileMap, installDeps?: boolean) => Promise<void>;
  updateFiles: (files: FileMap) => Promise<void>;
  stop: () => void;
  destroy: () => Promise<void>;
  clearLogs: () => void;
  
  // Terminal connection
  connectTerminal: (writer: (data: string) => void) => void;
  disconnectTerminal: () => void;
}

/**
 * useWebContainer hook
 */
export function useWebContainer(options: UseWebContainerOptions = {}): UseWebContainerReturn {
  const { autoInit = false, onReady, onPreviewUrl, onError } = options;
  
  const [isBooted, setIsBooted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<BuildStatus>(BuildStatus.IDLE);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const terminalWriterRef = useRef<((data: string) => void) | null>(null);

  /**
   * Add a log entry
   */
  const addLog = useCallback((level: 'debug' | 'info' | 'warn' | 'error', message: string, source?: string) => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: Date.now(),
      source
    };
    
    setLogs(prev => [...prev.slice(-199), entry]); // Keep last 200 logs
  }, []);

  /**
   * Connect terminal writer
   */
  const connectTerminal = useCallback((writer: (data: string) => void) => {
    console.log('[useWebContainer] Connecting terminal writer');
    terminalWriterRef.current = writer;
    setTerminalWriter(writer);
  }, []);

  /**
   * Disconnect terminal writer
   */
  const disconnectTerminal = useCallback(() => {
    console.log('[useWebContainer] Disconnecting terminal writer');
    terminalWriterRef.current = null;
    setTerminalWriter(null);
  }, []);

  /**
   * Set up callbacks on mount
   */
  useEffect(() => {
    // Status callback
    setStatusCallback((wcStatus: WebContainerStatus) => {
      const statusMap: Record<string, BuildStatus> = {
        'idle': BuildStatus.IDLE,
        'booting': BuildStatus.BOOTING,
        'mounting': BuildStatus.MOUNTING,
        'installing': BuildStatus.INSTALLING,
        'starting': BuildStatus.STARTING,
        'running': BuildStatus.RUNNING,
        'error': BuildStatus.ERROR
      };
      
      setStatus(statusMap[wcStatus.phase] || BuildStatus.IDLE);
      setStatusMessage(wcStatus.message);
      
      if (wcStatus.phase === 'running') {
        setIsLoading(false);
      }
      
      if (wcStatus.phase === 'error') {
        setIsLoading(false);
      }
      
      addLog('info', wcStatus.message, 'webcontainer');
    });

    // Error callback
    setErrorCallback((errorMsg: string, details?: string) => {
      setError(errorMsg);
      setIsLoading(false);
      addLog('error', errorMsg, 'webcontainer');
      if (details) {
        addLog('error', details, 'webcontainer');
      }
      onError?.(errorMsg);
    });

    // URL callback
    setUrlCallback((url: string) => {
      console.log('[useWebContainer] Preview URL received:', url);
      setPreviewUrl(url);
      setIsLoading(false);
      onPreviewUrl?.(url);
    });

    // Cleanup
    return () => {
      setStatusCallback(null);
      setErrorCallback(null);
      setUrlCallback(null);
      setTerminalWriter(null);
    };
  }, [addLog, onError, onPreviewUrl]);

  /**
   * Boot WebContainer
   */
  const boot = useCallback(async () => {
    if (checkIsBooted()) {
      setIsBooted(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    addLog('info', 'Booting WebContainer...', 'system');
    
    try {
      await bootWebContainer();
      setIsBooted(true);
      addLog('info', 'WebContainer ready', 'system');
      onReady?.();
    } catch (err: any) {
      setError(err.message);
      addLog('error', `Boot failed: ${err.message}`, 'system');
    } finally {
      setIsLoading(false);
    }
  }, [addLog, onReady]);

  /**
   * Build extension
   */
  const build = useCallback(async (files: FileMap, installDeps = true) => {
    console.log('[useWebContainer] build() called with', Object.keys(files).length, 'files');
    
    setIsLoading(true);
    setError(null);
    setPreviewUrl(null);
    addLog('info', 'Starting build...', 'build');
    
    try {
      await buildExtension(files, installDeps);
      // Status and URL will be updated via callbacks
    } catch (err: any) {
      setError(err.message);
      addLog('error', `Build failed: ${err.message}`, 'build');
      setIsLoading(false);
    }
  }, [addLog]);

  /**
   * Update files
   */
  const updateFiles = useCallback(async (files: FileMap) => {
    try {
      await updateFilesInContainer(files);
      addLog('info', `Updated ${Object.keys(files).length} files`, 'files');
    } catch (err: any) {
      addLog('error', `Update failed: ${err.message}`, 'files');
    }
  }, [addLog]);

  /**
   * Stop extension
   */
  const stop = useCallback(() => {
    stopExtension();
    setStatus(BuildStatus.IDLE);
    setPreviewUrl(null);
    addLog('info', 'Extension stopped', 'system');
  }, [addLog]);

  /**
   * Destroy WebContainer
   */
  const destroy = useCallback(async () => {
    try {
      await teardown();
      setIsBooted(false);
      setStatus(BuildStatus.IDLE);
      setPreviewUrl(null);
      addLog('info', 'WebContainer destroyed', 'system');
    } catch (err: any) {
      addLog('error', `Teardown failed: ${err.message}`, 'system');
    }
  }, [addLog]);

  /**
   * Clear logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /**
   * Auto-init if enabled
   */
  useEffect(() => {
    if (autoInit && !isBooted && !isLoading) {
      boot();
    }
  }, [autoInit, isBooted, isLoading, boot]);

  return {
    isBooted,
    isLoading,
    status,
    statusMessage,
    previewUrl,
    error,
    logs,
    boot,
    build,
    updateFiles,
    stop,
    destroy,
    clearLogs,
    connectTerminal,
    disconnectTerminal
  };
}

export default useWebContainer;
