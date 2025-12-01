/**
 * PostMessage Bridge Unit Tests
 * 
 * Tests for the postMessage protocol implementation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PostMessageBridge,
  MessageType,
  LogLevel,
  BuildStatus,
  PROTOCOL_VERSION,
  CHANNEL,
  createMessage,
  isValidMessage,
  isCompatibleVersion
} from '../postMessageBridge';

describe('PostMessage Bridge', () => {
  describe('createMessage', () => {
    it('should create a message with correct structure', () => {
      const message = createMessage(MessageType.READY, {});
      
      expect(message.channel).toBe(CHANNEL);
      expect(message.version).toBe(PROTOCOL_VERSION);
      expect(message.type).toBe(MessageType.READY);
      expect(message.payload).toEqual({});
      expect(typeof message.timestamp).toBe('number');
      expect(typeof message.id).toBe('string');
    });

    it('should create BUILD_EXTENSION message with files payload', () => {
      const files = { 'manifest.json': '{}' };
      const message = createMessage(MessageType.BUILD_EXTENSION, {
        files,
        installDeps: true
      });
      
      expect(message.type).toBe(MessageType.BUILD_EXTENSION);
      expect(message.payload.files).toEqual(files);
      expect(message.payload.installDeps).toBe(true);
    });

    it('should create LOG message with level and content', () => {
      const message = createMessage(MessageType.LOG, {
        level: LogLevel.INFO,
        message: 'Test log',
        source: 'test'
      });
      
      expect(message.type).toBe(MessageType.LOG);
      expect(message.payload.level).toBe(LogLevel.INFO);
      expect(message.payload.message).toBe('Test log');
      expect(message.payload.source).toBe('test');
    });

    it('should generate unique message IDs', () => {
      const msg1 = createMessage(MessageType.READY, {});
      const msg2 = createMessage(MessageType.READY, {});
      
      expect(msg1.id).not.toBe(msg2.id);
    });
  });

  describe('isValidMessage', () => {
    it('should return true for valid messages', () => {
      const message = createMessage(MessageType.READY, {});
      expect(isValidMessage(message)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isValidMessage(null)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isValidMessage('string')).toBe(false);
      expect(isValidMessage(123)).toBe(false);
      expect(isValidMessage(undefined)).toBe(false);
    });

    it('should return false for wrong channel', () => {
      const message = { ...createMessage(MessageType.READY, {}), channel: 'WRONG' };
      expect(isValidMessage(message)).toBe(false);
    });

    it('should return false for invalid message type', () => {
      const message = { ...createMessage(MessageType.READY, {}), type: 'INVALID_TYPE' };
      expect(isValidMessage(message)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(isValidMessage({ channel: CHANNEL })).toBe(false);
      expect(isValidMessage({ channel: CHANNEL, version: '1.0.0' })).toBe(false);
    });
  });

  describe('isCompatibleVersion', () => {
    it('should return true for same major version', () => {
      expect(isCompatibleVersion('1.0.0')).toBe(true);
      expect(isCompatibleVersion('1.1.0')).toBe(true);
      expect(isCompatibleVersion('1.99.99')).toBe(true);
    });

    it('should return false for different major version', () => {
      expect(isCompatibleVersion('0.1.0')).toBe(false);
      expect(isCompatibleVersion('2.0.0')).toBe(false);
      expect(isCompatibleVersion('3.0.0')).toBe(false);
    });
  });

  describe('MessageType enum', () => {
    it('should have all required message types', () => {
      expect(MessageType.READY).toBe('READY');
      expect(MessageType.HANDSHAKE).toBe('HANDSHAKE');
      expect(MessageType.HANDSHAKE_ACK).toBe('HANDSHAKE_ACK');
      expect(MessageType.BUILD_EXTENSION).toBe('BUILD_EXTENSION');
      expect(MessageType.BUILD_PROGRESS).toBe('BUILD_PROGRESS');
      expect(MessageType.BUILD_COMPLETE).toBe('BUILD_COMPLETE');
      expect(MessageType.BUILD_ERROR).toBe('BUILD_ERROR');
      expect(MessageType.UPDATE_FILES).toBe('UPDATE_FILES');
      expect(MessageType.FILES_UPDATED).toBe('FILES_UPDATED');
      expect(MessageType.RUN_EXTENSION).toBe('RUN_EXTENSION');
      expect(MessageType.EXTENSION_RUNNING).toBe('EXTENSION_RUNNING');
      expect(MessageType.STOP_EXTENSION).toBe('STOP_EXTENSION');
      expect(MessageType.EXTENSION_STOPPED).toBe('EXTENSION_STOPPED');
      expect(MessageType.LOG).toBe('LOG');
      expect(MessageType.TERMINAL_OUTPUT).toBe('TERMINAL_OUTPUT');
      expect(MessageType.TERMINAL_INPUT).toBe('TERMINAL_INPUT');
      expect(MessageType.STATUS).toBe('STATUS');
      expect(MessageType.ERROR).toBe('ERROR');
      expect(MessageType.PREVIEW_URL).toBe('PREVIEW_URL');
    });
  });

  describe('LogLevel enum', () => {
    it('should have all log levels', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });
  });

  describe('BuildStatus enum', () => {
    it('should have all build statuses', () => {
      expect(BuildStatus.IDLE).toBe('idle');
      expect(BuildStatus.INSTALLING).toBe('installing');
      expect(BuildStatus.BUILDING).toBe('building');
      expect(BuildStatus.RUNNING).toBe('running');
      expect(BuildStatus.ERROR).toBe('error');
    });
  });

  describe('PostMessageBridge class', () => {
    let bridge: PostMessageBridge;
    let mockWindow: { postMessage: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      bridge = new PostMessageBridge();
      mockWindow = { postMessage: vi.fn() };
    });

    afterEach(() => {
      bridge.destroy();
    });

    it('should initialize without errors', () => {
      expect(() => bridge.init()).not.toThrow();
    });

    it('should register and call message handlers', () => {
      bridge.init();
      const handler = vi.fn();
      
      bridge.on(MessageType.READY, handler);
      
      // Simulate receiving a message
      const message = createMessage(MessageType.READY, {});
      window.dispatchEvent(new MessageEvent('message', { data: message }));
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: MessageType.READY
      }));
    });

    it('should unsubscribe handlers', () => {
      bridge.init();
      const handler = vi.fn();
      
      const unsubscribe = bridge.on(MessageType.READY, handler);
      unsubscribe();
      
      const message = createMessage(MessageType.READY, {});
      window.dispatchEvent(new MessageEvent('message', { data: message }));
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not call handlers for invalid messages', () => {
      bridge.init();
      const handler = vi.fn();
      
      bridge.on(MessageType.READY, handler);
      
      // Send invalid message
      window.dispatchEvent(new MessageEvent('message', { data: { invalid: true } }));
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should queue messages when not connected', () => {
      bridge.init();
      bridge.setTarget(mockWindow as unknown as Window);
      
      // Send without handshake
      bridge.send(MessageType.BUILD_EXTENSION, { files: {}, installDeps: false });
      
      // Should not post immediately (not connected)
      expect(mockWindow.postMessage).not.toHaveBeenCalled();
    });

    it('should send handshake messages immediately', () => {
      bridge.init();
      bridge.setTarget(mockWindow as unknown as Window);
      
      bridge.connect();
      
      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.HANDSHAKE
        }),
        '*'
      );
    });

    it('should clean up on destroy', () => {
      bridge.init();
      const handler = vi.fn();
      bridge.on(MessageType.READY, handler);
      
      bridge.destroy();
      
      // Should not receive messages after destroy
      const message = createMessage(MessageType.READY, {});
      window.dispatchEvent(new MessageEvent('message', { data: message }));
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should report connected status', () => {
      bridge.init();
      expect(bridge.connected).toBe(false);
    });
  });
});

describe('Protocol Constants', () => {
  it('should have correct channel name', () => {
    expect(CHANNEL).toBe('EXT_PREVIEW');
  });

  it('should have semantic version format', () => {
    expect(PROTOCOL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

