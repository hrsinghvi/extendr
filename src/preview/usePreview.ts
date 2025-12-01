/**
 * usePreview Hook
 * 
 * React hook for managing preview state and WebContainer interactions.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  PostMessageBridge, 
  MessageType, 
  BuildStatus,
  LogLevel,
  type Message,
  type MessagePayloads
} from './postMessageBridge';
import type { PreviewState, FileMap, LogEntry } from './types';

/**
 * Initial preview state
 */
const initialState: PreviewState = {
  status: BuildStatus.IDLE,
  previewUrl: null,
  error: null,
  logs: [],
  files: {},
  selectedFile: null
};

/**
 * Hook options
 */
interface UsePreviewOptions {
  onReady?: () => void;
  onBuildComplete?: (previewUrl: string) => void;
  onError?: (error: string) => void;
  autoConnect?: boolean;
}

/**
 * Hook return type
 */
interface UsePreviewReturn {
  state: PreviewState;
  isReady: boolean;
  bridge: PostMessageBridge;
  
  // Actions
  buildExtension: (files: FileMap, installDeps?: boolean) => void;
  updateFiles: (files: FileMap, partial?: boolean) => void;
  runExtension: () => void;
  stopExtension: () => void;
  selectFile: (path: string | null) => void;
  clearLogs: () => void;
  
  // Setters
  setFiles: (files: FileMap) => void;
  setPreviewUrl: (url: string | null) => void;
}

/**
 * usePreview hook
 */
export function usePreview(options: UsePreviewOptions = {}): UsePreviewReturn {
  const { onReady, onBuildComplete, onError, autoConnect = true } = options;
  
  const [state, setState] = useState<PreviewState>(initialState);
  const [isReady, setIsReady] = useState(false);
  const bridgeRef = useRef<PostMessageBridge>(new PostMessageBridge());

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
    
    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-99), entry] // Keep last 100 logs
    }));
  }, []);

  /**
   * Set up message handlers
   */
  useEffect(() => {
    const bridge = bridgeRef.current;

    // Ready handler
    const unsubReady = bridge.on(MessageType.READY, () => {
      setIsReady(true);
      addLog(LogLevel.INFO, 'Preview ready');
      onReady?.();
    });

    // Build progress handler
    const unsubProgress = bridge.on(MessageType.BUILD_PROGRESS, (msg: Message<MessageType.BUILD_PROGRESS>) => {
      const { status, message } = msg.payload;
      setState(prev => ({ ...prev, status, error: null }));
      addLog(LogLevel.INFO, message);
    });

    // Build complete handler
    const unsubComplete = bridge.on(MessageType.BUILD_COMPLETE, (msg: Message<MessageType.BUILD_COMPLETE>) => {
      const { previewUrl } = msg.payload;
      setState(prev => ({
        ...prev,
        status: BuildStatus.RUNNING,
        previewUrl: previewUrl || prev.previewUrl,
        error: null
      }));
      addLog(LogLevel.INFO, 'Build complete');
      if (previewUrl) {
        onBuildComplete?.(previewUrl);
      }
    });

    // Build error handler
    const unsubError = bridge.on(MessageType.BUILD_ERROR, (msg: Message<MessageType.BUILD_ERROR>) => {
      const { error, details } = msg.payload;
      setState(prev => ({
        ...prev,
        status: BuildStatus.ERROR,
        error
      }));
      addLog(LogLevel.ERROR, error);
      if (details) {
        addLog(LogLevel.ERROR, details);
      }
      onError?.(error);
    });

    // Log handler
    const unsubLog = bridge.on(MessageType.LOG, (msg: Message<MessageType.LOG>) => {
      const { level, message, source } = msg.payload;
      addLog(level as LogLevel, message, source);
    });

    // Terminal output handler
    const unsubTerminal = bridge.on(MessageType.TERMINAL_OUTPUT, (msg: Message<MessageType.TERMINAL_OUTPUT>) => {
      addLog(LogLevel.DEBUG, msg.payload.data, 'terminal');
    });

    // Preview URL handler
    const unsubPreviewUrl = bridge.on(MessageType.PREVIEW_URL, (msg: Message<MessageType.PREVIEW_URL>) => {
      setState(prev => ({ ...prev, previewUrl: msg.payload.url }));
    });

    // Extension running handler
    const unsubRunning = bridge.on(MessageType.EXTENSION_RUNNING, (msg: Message<MessageType.EXTENSION_RUNNING>) => {
      setState(prev => ({
        ...prev,
        status: BuildStatus.RUNNING,
        previewUrl: msg.payload.previewUrl
      }));
      addLog(LogLevel.INFO, 'Extension running');
    });

    // Extension stopped handler
    const unsubStopped = bridge.on(MessageType.EXTENSION_STOPPED, () => {
      setState(prev => ({
        ...prev,
        status: BuildStatus.IDLE,
        previewUrl: null
      }));
      addLog(LogLevel.INFO, 'Extension stopped');
    });

    // Cleanup
    return () => {
      unsubReady();
      unsubProgress();
      unsubComplete();
      unsubError();
      unsubLog();
      unsubTerminal();
      unsubPreviewUrl();
      unsubRunning();
      unsubStopped();
    };
  }, [addLog, onReady, onBuildComplete, onError]);

  /**
   * Initialize bridge
   */
  useEffect(() => {
    const bridge = bridgeRef.current;
    bridge.init();

    if (autoConnect) {
      bridge.ready();
    }

    return () => {
      bridge.destroy();
    };
  }, [autoConnect]);

  /**
   * Build extension
   */
  const buildExtension = useCallback((files: FileMap, installDeps = true) => {
    setState(prev => ({
      ...prev,
      status: BuildStatus.INSTALLING,
      error: null,
      files
    }));
    
    addLog(LogLevel.INFO, 'Starting build...');
    
    bridgeRef.current.send(MessageType.BUILD_EXTENSION, {
      files,
      installDeps
    });
  }, [addLog]);

  /**
   * Update files
   */
  const updateFiles = useCallback((files: FileMap, partial = true) => {
    setState(prev => ({
      ...prev,
      files: partial ? { ...prev.files, ...files } : files
    }));
    
    bridgeRef.current.send(MessageType.UPDATE_FILES, {
      files,
      partial
    });
  }, []);

  /**
   * Run extension
   */
  const runExtension = useCallback(() => {
    addLog(LogLevel.INFO, 'Starting extension...');
    bridgeRef.current.send(MessageType.RUN_EXTENSION, {});
  }, [addLog]);

  /**
   * Stop extension
   */
  const stopExtension = useCallback(() => {
    addLog(LogLevel.INFO, 'Stopping extension...');
    bridgeRef.current.send(MessageType.STOP_EXTENSION, {});
  }, [addLog]);

  /**
   * Select file
   */
  const selectFile = useCallback((path: string | null) => {
    setState(prev => ({ ...prev, selectedFile: path }));
  }, []);

  /**
   * Clear logs
   */
  const clearLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
  }, []);

  /**
   * Set files directly
   */
  const setFiles = useCallback((files: FileMap) => {
    setState(prev => ({ ...prev, files }));
  }, []);

  /**
   * Set preview URL directly
   */
  const setPreviewUrl = useCallback((url: string | null) => {
    setState(prev => ({ ...prev, previewUrl: url }));
  }, []);

  return {
    state,
    isReady,
    bridge: bridgeRef.current,
    buildExtension,
    updateFiles,
    runExtension,
    stopExtension,
    selectFile,
    clearLogs,
    setFiles,
    setPreviewUrl
  };
}

export default usePreview;

