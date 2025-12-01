/**
 * PostMessage Bridge for Extension Preview
 * 
 * Handles communication between the main app and the preview iframe
 * using a versioned message protocol over postMessage.
 */

// Protocol version for compatibility checks
export const PROTOCOL_VERSION = '1.0.0';

// Channel identifier for filtering messages
export const CHANNEL = 'EXT_PREVIEW';

/**
 * Message types for the preview protocol
 */
export enum MessageType {
  // Handshake
  READY = 'READY',
  HANDSHAKE = 'HANDSHAKE',
  HANDSHAKE_ACK = 'HANDSHAKE_ACK',
  
  // Build operations
  BUILD_EXTENSION = 'BUILD_EXTENSION',
  BUILD_PROGRESS = 'BUILD_PROGRESS',
  BUILD_COMPLETE = 'BUILD_COMPLETE',
  BUILD_ERROR = 'BUILD_ERROR',
  
  // File operations
  UPDATE_FILES = 'UPDATE_FILES',
  FILES_UPDATED = 'FILES_UPDATED',
  
  // Run operations
  RUN_EXTENSION = 'RUN_EXTENSION',
  EXTENSION_RUNNING = 'EXTENSION_RUNNING',
  STOP_EXTENSION = 'STOP_EXTENSION',
  EXTENSION_STOPPED = 'EXTENSION_STOPPED',
  
  // Terminal/Logs
  LOG = 'LOG',
  TERMINAL_OUTPUT = 'TERMINAL_OUTPUT',
  TERMINAL_INPUT = 'TERMINAL_INPUT',
  
  // Status
  STATUS = 'STATUS',
  ERROR = 'ERROR',
  
  // Preview URL
  PREVIEW_URL = 'PREVIEW_URL'
}

/**
 * Log levels for LOG messages
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Build status for progress tracking
 */
export enum BuildStatus {
  IDLE = 'idle',
  INSTALLING = 'installing',
  BUILDING = 'building',
  RUNNING = 'running',
  ERROR = 'error'
}

/**
 * Base message structure
 */
export interface BaseMessage {
  channel: typeof CHANNEL;
  version: string;
  type: MessageType;
  timestamp: number;
  id: string;
}

/**
 * Message payloads by type
 */
export interface MessagePayloads {
  [MessageType.READY]: Record<string, never>;
  
  [MessageType.HANDSHAKE]: {
    origin: string;
  };
  
  [MessageType.HANDSHAKE_ACK]: {
    accepted: boolean;
    reason?: string;
  };
  
  [MessageType.BUILD_EXTENSION]: {
    files: Record<string, string>;
    installDeps?: boolean;
  };
  
  [MessageType.BUILD_PROGRESS]: {
    status: BuildStatus;
    message: string;
    progress?: number;
  };
  
  [MessageType.BUILD_COMPLETE]: {
    previewUrl?: string;
  };
  
  [MessageType.BUILD_ERROR]: {
    error: string;
    details?: string;
  };
  
  [MessageType.UPDATE_FILES]: {
    files: Record<string, string>;
    partial?: boolean;
  };
  
  [MessageType.FILES_UPDATED]: {
    updatedPaths: string[];
  };
  
  [MessageType.RUN_EXTENSION]: Record<string, never>;
  
  [MessageType.EXTENSION_RUNNING]: {
    previewUrl: string;
  };
  
  [MessageType.STOP_EXTENSION]: Record<string, never>;
  
  [MessageType.EXTENSION_STOPPED]: Record<string, never>;
  
  [MessageType.LOG]: {
    level: LogLevel;
    message: string;
    source?: string;
  };
  
  [MessageType.TERMINAL_OUTPUT]: {
    data: string;
  };
  
  [MessageType.TERMINAL_INPUT]: {
    data: string;
  };
  
  [MessageType.STATUS]: {
    status: BuildStatus;
    previewUrl?: string;
  };
  
  [MessageType.ERROR]: {
    error: string;
    code?: string;
  };
  
  [MessageType.PREVIEW_URL]: {
    url: string;
  };
}

/**
 * Typed message with payload
 */
export type Message<T extends MessageType = MessageType> = BaseMessage & {
  type: T;
  payload: MessagePayloads[T];
};

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a message with proper structure
 */
export function createMessage<T extends MessageType>(
  type: T,
  payload: MessagePayloads[T]
): Message<T> {
  return {
    channel: CHANNEL,
    version: PROTOCOL_VERSION,
    type,
    payload,
    timestamp: Date.now(),
    id: generateMessageId()
  };
}

/**
 * Validate incoming message structure
 */
export function isValidMessage(data: unknown): data is Message {
  if (typeof data !== 'object' || data === null) return false;
  
  const msg = data as Record<string, unknown>;
  
  return (
    msg.channel === CHANNEL &&
    typeof msg.version === 'string' &&
    typeof msg.type === 'string' &&
    Object.values(MessageType).includes(msg.type as MessageType) &&
    typeof msg.timestamp === 'number' &&
    typeof msg.id === 'string' &&
    'payload' in msg
  );
}

/**
 * Check protocol version compatibility
 */
export function isCompatibleVersion(version: string): boolean {
  const [major] = version.split('.');
  const [currentMajor] = PROTOCOL_VERSION.split('.');
  return major === currentMajor;
}

/**
 * Message handler callback type
 */
export type MessageHandler<T extends MessageType = MessageType> = (
  message: Message<T>
) => void | Promise<void>;

/**
 * PostMessage Bridge class
 * 
 * Manages communication between parent and iframe contexts
 */
export class PostMessageBridge {
  private handlers: Map<MessageType, Set<MessageHandler<any>>> = new Map();
  private targetWindow: Window | null = null;
  private targetOrigin: string = '*';
  private isConnected: boolean = false;
  private pendingMessages: Message[] = [];
  private boundMessageHandler: (event: MessageEvent) => void;

  constructor() {
    this.boundMessageHandler = this.handleMessage.bind(this);
  }

  /**
   * Initialize the bridge
   */
  init(targetWindow?: Window, targetOrigin?: string): void {
    this.targetWindow = targetWindow || null;
    this.targetOrigin = targetOrigin || '*';
    
    // Listen for messages
    window.addEventListener('message', this.boundMessageHandler);
    
    console.log('[PostMessageBridge] Initialized');
  }

  /**
   * Set the target window for sending messages
   */
  setTarget(targetWindow: Window, targetOrigin?: string): void {
    this.targetWindow = targetWindow;
    if (targetOrigin) {
      this.targetOrigin = targetOrigin;
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(event: MessageEvent): void {
    // Validate message
    if (!isValidMessage(event.data)) {
      return;
    }

    const message = event.data as Message;

    // Check version compatibility
    if (!isCompatibleVersion(message.version)) {
      console.warn('[PostMessageBridge] Incompatible protocol version:', message.version);
      return;
    }

    // Handle handshake
    if (message.type === MessageType.HANDSHAKE) {
      this.isConnected = true;
      this.send(MessageType.HANDSHAKE_ACK, { accepted: true });
      this.flushPendingMessages();
    }

    if (message.type === MessageType.HANDSHAKE_ACK) {
      const payload = message.payload as MessagePayloads[MessageType.HANDSHAKE_ACK];
      if (payload.accepted) {
        this.isConnected = true;
        this.flushPendingMessages();
      }
    }

    // Dispatch to handlers
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('[PostMessageBridge] Handler error:', error);
        }
      });
    }
  }

  /**
   * Register a message handler
   */
  on<T extends MessageType>(type: T, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  /**
   * Remove a message handler
   */
  off<T extends MessageType>(type: T, handler: MessageHandler<T>): void {
    this.handlers.get(type)?.delete(handler);
  }

  /**
   * Send a message to the target window
   */
  send<T extends MessageType>(type: T, payload: MessagePayloads[T]): void {
    const message = createMessage(type, payload);

    if (!this.targetWindow) {
      console.warn('[PostMessageBridge] No target window set, queuing message');
      this.pendingMessages.push(message);
      return;
    }

    if (!this.isConnected && type !== MessageType.HANDSHAKE && type !== MessageType.READY) {
      this.pendingMessages.push(message);
      return;
    }

    this.targetWindow.postMessage(message, this.targetOrigin);
  }

  /**
   * Send pending messages after connection
   */
  private flushPendingMessages(): void {
    if (!this.targetWindow || !this.isConnected) return;

    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift()!;
      this.targetWindow.postMessage(message, this.targetOrigin);
    }
  }

  /**
   * Initiate handshake
   */
  connect(): void {
    this.send(MessageType.HANDSHAKE, { origin: window.location.origin });
  }

  /**
   * Signal ready state
   */
  ready(): void {
    this.send(MessageType.READY, {});
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Destroy the bridge
   */
  destroy(): void {
    window.removeEventListener('message', this.boundMessageHandler);
    this.handlers.clear();
    this.pendingMessages = [];
    this.targetWindow = null;
    this.isConnected = false;
    console.log('[PostMessageBridge] Destroyed');
  }
}

// Singleton instance for app-wide use
export const bridge = new PostMessageBridge();

export default bridge;

