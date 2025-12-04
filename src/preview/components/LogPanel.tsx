/**
 * LogPanel Component
 * 
 * Displays build and runtime logs with filtering.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Filter, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
  onClear?: () => void;
  className?: string;
}

/**
 * Log level icons and colors
 */
const logConfig = {
  debug: {
    icon: Bug,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10'
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  warn: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10'
  }
};

/**
 * Format timestamp
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * LogPanel component
 */
export function LogPanel({ logs, onClear, className }: LogPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Filter logs
  const filteredLogs = filter
    ? logs.filter(log => log.level === filter)
    : logs;

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  // Detect manual scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className={cn('flex flex-col h-full bg-[#1a1a1a]', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-[#232323]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Logs</span>
          <span className="text-xs text-gray-600">({filteredLogs.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Filter buttons */}
          {(['error', 'warn', 'info', 'debug'] as const).map(level => {
            const config = logConfig[level];
            const count = logs.filter(l => l.level === level).length;
            const Icon = config.icon;
            
            return (
              <Button
                key={level}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(filter === level ? null : level)}
                className={cn(
                  'h-6 px-2 text-xs gap-1',
                  filter === level ? config.bg : 'hover:bg-gray-700',
                  filter === level ? config.color : 'text-gray-400'
                )}
                title={`Filter ${level} (${count})`}
              >
                <Icon className="w-3 h-3" />
                {count > 0 && <span>{count}</span>}
              </Button>
            );
          })}

          <div className="w-px h-4 bg-gray-700 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Clear logs"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto font-mono text-xs"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No logs to display
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredLogs.map(log => {
              const config = logConfig[log.level];
              const Icon = config.icon;

              return (
                <div
                  key={log.id}
                  className={cn(
                    'flex items-start gap-2 px-2 py-1 rounded',
                    config.bg
                  )}
                >
                  <Icon className={cn('w-3 h-3 mt-0.5 flex-shrink-0', config.color)} />
                  <span className="text-gray-500 flex-shrink-0">
                    {formatTime(log.timestamp)}
                  </span>
                  {log.source && (
                    <span className="text-[#5A9665] flex-shrink-0">
                      [{log.source}]
                    </span>
                  )}
                  <span className={cn('flex-1 break-all', config.color)}>
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LogPanel;

