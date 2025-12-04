/**
 * Terminal Component
 * 
 * A terminal emulator component using xterm.js for WebContainer output.
 * Exposes a write function via callback for external control.
 */

import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { cn } from '@/lib/utils';

// Import xterm CSS
import '@xterm/xterm/css/xterm.css';

/**
 * Terminal props
 */
export interface TerminalProps {
  onInput?: (data: string) => void;
  onReady?: (writer: (data: string) => void) => void;
  className?: string;
}

/**
 * Terminal ref handle
 */
export interface TerminalHandle {
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  focus: () => void;
}

/**
 * Terminal component with forwardRef for imperative handle
 */
export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  function Terminal({ onInput, onReady, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const isInitializedRef = useRef(false);

    /**
     * Write to terminal
     */
    const hasWrittenSinceInitRef = useRef(false);
    const write = useCallback((data: string) => {
      if (terminalRef.current) {
        terminalRef.current.write(data);
        if (!hasWrittenSinceInitRef.current) {
          hasWrittenSinceInitRef.current = true;
          setTimeout(() => {
            try { (terminalRef.current as any).scrollToTop?.(); } catch { /* noop */ }
          }, 0);
        }
      }
    }, []);

    /**
     * Write line to terminal
     */
    const writeln = useCallback((data: string) => {
      if (terminalRef.current) {
        terminalRef.current.writeln(data);
      }
    }, []);

    /**
     * Clear terminal
     */
    const clear = useCallback(() => {
      if (terminalRef.current) {
        terminalRef.current.clear();
      }
    }, []);

    /**
     * Focus terminal
     */
    const focus = useCallback(() => {
      if (terminalRef.current) {
        terminalRef.current.focus();
      }
    }, []);

    /**
     * Expose methods via ref
     */
    useImperativeHandle(ref, () => ({
      write,
      writeln,
      clear,
      focus
    }), [write, writeln, clear, focus]);

    /**
     * Initialize terminal
     */
    useEffect(() => {
      if (!containerRef.current || isInitializedRef.current) return;
      isInitializedRef.current = true;

      console.log('[Terminal] Initializing xterm...');

      // Create terminal instance
      const terminal = new XTerm({
        theme: {
          background: '#0d0d0d',
          foreground: '#e0e0e0',
          cursor: '#667eea',
          cursorAccent: '#0d0d0d',
          selectionBackground: '#667eea44',
          black: '#0d0d0d',
          red: '#ff6b6b',
          green: '#51cf66',
          yellow: '#fcc419',
          blue: '#339af0',
          magenta: '#cc5de8',
          cyan: '#22b8cf',
          white: '#e0e0e0',
          brightBlack: '#868e96',
          brightRed: '#ff8787',
          brightGreen: '#69db7c',
          brightYellow: '#ffe066',
          brightBlue: '#5c7cfa',
          brightMagenta: '#da77f2',
          brightCyan: '#3bc9db',
          brightWhite: '#f8f9fa'
        },
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, "Courier New", monospace',
        lineHeight: 1.4,
        cursorBlink: true,
        cursorStyle: 'bar',
        scrollback: 5000,
        convertEol: true,
        allowProposedApi: true
      });

      // Create fit addon
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      // Open terminal in container
      terminal.open(containerRef.current);
      
      // Fit to container
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('[Terminal] Initial fit failed:', e);
      }

      // Store refs
      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      // Handle user input
      terminal.onData((data) => {
        onInput?.(data);
      });

      // Welcome message - DOOM ASCII font for "extendr"
      terminal.writeln('\x1b[38;2;90;150;101m  _____  _| |_ ___ _ __   __| |_ __ \x1b[0m');
      terminal.writeln('\x1b[38;2;90;150;101m / _ \\ \\/ / __/ _ \\ \'_ \\ / _` | \'__|\x1b[0m');
      terminal.writeln('\x1b[38;2;90;150;101m|  __/>  <| ||  __/ | | | (_| | |   \x1b[0m');
      terminal.writeln('\x1b[38;2;90;150;101m \\___/_/\\_\\\\__\\___|_| |_|\\__,_|_|   \x1b[0m');
      terminal.writeln('');
      terminal.writeln('~/project');


      // Scroll to top initially (best-effort after first paint)
      setTimeout(() => {
        try { (terminal as any).scrollToTop?.(); } catch { /* noop */ }
      }, 0);

      // Notify parent that terminal is ready with write function
      console.log('[Terminal] Ready, calling onReady callback');
      onReady?.(write);

      // Handle container resize
      const resizeObserver = new ResizeObserver(() => {
        try {
          if (fitAddonRef.current) {
            fitAddonRef.current.fit();
          }
        } catch (e) {
          // Ignore fit errors during resize
        }
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      // Cleanup
      return () => {
        console.log('[Terminal] Disposing...');
        resizeObserver.disconnect();
        terminal.dispose();
        terminalRef.current = null;
        fitAddonRef.current = null;
        isInitializedRef.current = false;
      };
    }, [onInput, onReady, write]);

    return (
      <div 
        ref={containerRef} 
        className={cn('w-full h-full min-h-[150px] bg-[#0d0d0d] pl-3 pt-2', className)}
      />
    );
  }
);

/**
 * Hook to create a terminal ref with write capabilities
 */
export function useTerminalRef() {
  const ref = useRef<TerminalHandle>(null);

  const write = useCallback((data: string) => {
    ref.current?.write(data);
  }, []);

  const writeln = useCallback((data: string) => {
    ref.current?.writeln(data);
  }, []);

  const clear = useCallback(() => {
    ref.current?.clear();
  }, []);

  const focus = useCallback(() => {
    ref.current?.focus();
  }, []);

  return { ref, write, writeln, clear, focus };
}

export default Terminal;
