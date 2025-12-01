/**
 * useWebContainer Hook
 * 
 * React hook for managing WebContainer state and operations.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  bootWebContainer,
  buildExtension,
  updateFiles as wcUpdateFiles,
  stopExtension,
  teardown,
  setTerminalWriter,
  setupBridgeHandlers
} from './webcontainerBridge';
import { bridge, MessageType, BuildStatus, LogLevel } from './postMessageBridge';
import type { FileMap, LogEntry, PreviewState } from './types';

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
  previewUrl: string | null;
  error: string | null;
  logs: LogEntry[];
  
  // Actions
  boot: () => Promise<void>;
  build: (files: FileMap, installDeps?: boolean) => Promise<void>;
  updateFiles: (files: FileMap, partial?: boolean) => Promise<void>;
  stop: () => Promise<void>;
  destroy: () => Promise<void>;
  clearLogs: () => void;
  
  // Terminal
  setTerminalWriter: (writer: ((data: string) => void) | null) => void;
}

/**
 * useWebContainer hook
 */
export function useWebContainer(options: UseWebContainerOptions = {}): UseWebContainerReturn {
  const { autoInit = false, onReady, onPreviewUrl, onError } = options;
  
  const [isBooted, setIsBooted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<BuildStatus>(BuildStatus.IDLE);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const cleanupRef = useRef<(() => void) | null>(null);

  /**
   * Add a log entry
   */
  const addLog = useCallback((level: LogLevel, message: string, source?: string) => {
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
   * Set up message handlers
   */
  useEffect(() => {
    // Initialize bridge
    bridge.init();

    // Set up WebContainer bridge handlers
    cleanupRef.current = setupBridgeHandlers();

    // Listen for build progress
    const unsubProgress = bridge.on(MessageType.BUILD_PROGRESS, (msg) => {
      const { status: newStatus, message } = msg.payload;
      setStatus(newStatus);
      setError(null);
      addLog(LogLevel.INFO, message, 'build');
    });

    // Listen for build complete
    const unsubComplete = bridge.on(MessageType.BUILD_COMPLETE, (msg) => {
      setStatus(BuildStatus.RUNNING);
      setIsLoading(false);
      addLog(LogLevel.INFO, 'Build complete', 'build');
    });

    // Listen for build errors
    const unsubError = bridge.on(MessageType.BUILD_ERROR, (msg) => {
      const { error: errMsg, details } = msg.payload;
      setStatus(BuildStatus.ERROR);
      setError(errMsg);
      setIsLoading(false);
      addLog(LogLevel.ERROR, errMsg, 'build');
      if (details) {
        addLog(LogLevel.ERROR, details, 'build');
      }
      onError?.(errMsg);
    });

    // Listen for preview URL
    const unsubPreviewUrl = bridge.on(MessageType.PREVIEW_URL, (msg) => {
      setPreviewUrl(msg.payload.url);
      onPreviewUrl?.(msg.payload.url);
    });

    // Listen for extension running
    const unsubRunning = bridge.on(MessageType.EXTENSION_RUNNING, (msg) => {
      setStatus(BuildStatus.RUNNING);
      setPreviewUrl(msg.payload.previewUrl);
      onPreviewUrl?.(msg.payload.previewUrl);
    });

    // Listen for extension stopped
    const unsubStopped = bridge.on(MessageType.EXTENSION_STOPPED, () => {
      setStatus(BuildStatus.IDLE);
      setPreviewUrl(null);
    });

    // Listen for logs
    const unsubLog = bridge.on(MessageType.LOG, (msg) => {
      const { level, message, source } = msg.payload;
      addLog(level as LogLevel, message, source);
    });

    // Cleanup
    return () => {
      unsubProgress();
      unsubComplete();
      unsubError();
      unsubPreviewUrl();
      unsubRunning();
      unsubStopped();
      unsubLog();
      cleanupRef.current?.();
      bridge.destroy();
    };
  }, [addLog, onError, onPreviewUrl]);

  /**
   * Boot WebContainer
   */
  const boot = useCallback(async () => {
    if (isBooted) return;
    
    setIsLoading(true);
    addLog(LogLevel.INFO, 'Booting WebContainer...', 'system');
    
    try {
      await bootWebContainer();
      setIsBooted(true);
      addLog(LogLevel.INFO, 'WebContainer ready', 'system');
      onReady?.();
    } catch (err: any) {
      setError(err.message);
      addLog(LogLevel.ERROR, `Boot failed: ${err.message}`, 'system');
      onError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isBooted, addLog, onReady, onError]);

  /**
   * Build extension
   */
  const build = useCallback(async (files: FileMap, installDeps = true) => {
    setIsLoading(true);
    setError(null);
    setStatus(BuildStatus.INSTALLING);
    addLog(LogLevel.INFO, 'Starting build...', 'build');
    
    try {
      // Boot if not already booted
      if (!isBooted) {
        await bootWebContainer();
        setIsBooted(true);
      }
      
      await buildExtension(files, installDeps);
    } catch (err: any) {
      setError(err.message);
      setStatus(BuildStatus.ERROR);
      addLog(LogLevel.ERROR, `Build failed: ${err.message}`, 'build');
      onError?.(err.message);
      setIsLoading(false);
    }
  }, [isBooted, addLog, onError]);

  /**
   * Update files
   */
  const updateFiles = useCallback(async (files: FileMap, partial = true) => {
    try {
      await wcUpdateFiles(files, partial);
      addLog(LogLevel.INFO, `Updated ${Object.keys(files).length} files`, 'files');
    } catch (err: any) {
      addLog(LogLevel.ERROR, `Update failed: ${err.message}`, 'files');
      onError?.(err.message);
    }
  }, [addLog, onError]);

  /**
   * Stop extension
   */
  const stop = useCallback(async () => {
    try {
      await stopExtension();
      setStatus(BuildStatus.IDLE);
      setPreviewUrl(null);
      addLog(LogLevel.INFO, 'Extension stopped', 'system');
    } catch (err: any) {
      addLog(LogLevel.ERROR, `Stop failed: ${err.message}`, 'system');
    }
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
      addLog(LogLevel.INFO, 'WebContainer destroyed', 'system');
    } catch (err: any) {
      addLog(LogLevel.ERROR, `Teardown failed: ${err.message}`, 'system');
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
    previewUrl,
    error,
    logs,
    boot,
    build,
    updateFiles,
    stop,
    destroy,
    clearLogs,
    setTerminalWriter
  };
}

export default useWebContainer;

