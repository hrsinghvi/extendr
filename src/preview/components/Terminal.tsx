/**
 * Terminal Component
 * 
 * A terminal emulator component using xterm.js for WebContainer output.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { cn } from '@/lib/utils';
import type { TerminalProps } from '../types';

// Import xterm CSS
import '@xterm/xterm/css/xterm.css';

/**
 * Terminal component
 */
export function Terminal({ onInput, className }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  /**
   * Write to terminal
   */
  const write = useCallback((data: string) => {
    terminalRef.current?.write(data);
  }, []);

  /**
   * Clear terminal
   */
  const clear = useCallback(() => {
    terminalRef.current?.clear();
  }, []);

  /**
   * Initialize terminal
   */
  useEffect(() => {
    if (!containerRef.current) return;

    // Create terminal instance
    const terminal = new XTerm({
      theme: {
        background: '#1a1a1a',
        foreground: '#e0e0e0',
        cursor: '#667eea',
        cursorAccent: '#1a1a1a',
        selectionBackground: '#667eea44',
        black: '#1a1a1a',
        red: '#f44336',
        green: '#4caf50',
        yellow: '#ffeb3b',
        blue: '#2196f3',
        magenta: '#9c27b0',
        cyan: '#00bcd4',
        white: '#e0e0e0',
        brightBlack: '#616161',
        brightRed: '#ef5350',
        brightGreen: '#66bb6a',
        brightYellow: '#ffee58',
        brightBlue: '#42a5f5',
        brightMagenta: '#ab47bc',
        brightCyan: '#26c6da',
        brightWhite: '#fafafa'
      },
      fontSize: 13,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 1000,
      convertEol: true
    });

    // Create fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal
    terminal.open(containerRef.current);
    fitAddon.fit();

    // Store refs
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Handle input
    terminal.onData((data) => {
      onInput?.(data);
    });

    // Welcome message
    terminal.writeln('\x1b[1;35m╭──────────────────────────────────────╮\x1b[0m');
    terminal.writeln('\x1b[1;35m│\x1b[0m  \x1b[1;36mExtendr Terminal\x1b[0m                    \x1b[1;35m│\x1b[0m');
    terminal.writeln('\x1b[1;35m│\x1b[0m  \x1b[90mWebContainer-powered development\x1b[0m    \x1b[1;35m│\x1b[0m');
    terminal.writeln('\x1b[1;35m╰──────────────────────────────────────╯\x1b[0m');
    terminal.writeln('');

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        // Ignore fit errors during resize
      }
    });
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [onInput]);

  // Expose write and clear methods via ref
  useEffect(() => {
    // Attach methods to container for external access
    if (containerRef.current) {
      (containerRef.current as any).terminalWrite = write;
      (containerRef.current as any).terminalClear = clear;
    }
  }, [write, clear]);

  return (
    <div 
      ref={containerRef} 
      className={cn('w-full h-full min-h-[200px] bg-[#1a1a1a]', className)}
    />
  );
}

/**
 * Hook to access terminal methods
 */
export function useTerminalRef() {
  const ref = useRef<HTMLDivElement>(null);

  const write = useCallback((data: string) => {
    (ref.current as any)?.terminalWrite?.(data);
  }, []);

  const clear = useCallback(() => {
    (ref.current as any)?.terminalClear?.();
  }, []);

  return { ref, write, clear };
}

export default Terminal;

