/**
 * PreviewFrame Component
 * 
 * An iframe wrapper for displaying the extension preview.
 */

import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PreviewFrameProps } from '../types';

/**
 * PreviewFrame component
 */
export function PreviewFrame({
  url,
  className,
  onLoad,
  onError
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  /**
   * Handle iframe load
   */
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  /**
   * Handle iframe error
   */
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.('Failed to load preview');
  };

  /**
   * Refresh the preview
   */
  const refresh = () => {
    setKey(k => k + 1);
    setIsLoading(true);
    setHasError(false);
  };

  /**
   * Open in new tab
   */
  const openInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Reset state when URL changes
  useEffect(() => {
    if (url) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [url]);

  // No URL state
  if (!url) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center h-full bg-[#1a1a1a] text-gray-400',
        className
      )}>
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium mb-1">No Preview Available</p>
        <p className="text-xs text-gray-500">Build your extension to see a preview</p>
      </div>
    );
  }

  return (
    <div className={cn('relative flex flex-col h-full bg-[#1a1a1a]', className)}>
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-[#232323]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* URL bar */}
          <div className="flex-1 px-3 py-1.5 bg-[#1a1a1a] rounded text-xs text-gray-400 truncate border border-gray-700">
            {url}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openInNewTab}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview content */}
      <div className="relative flex-1">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5A9665] to-[#5f87a3] animate-pulse shadow-[0_0_15px_rgba(90,150,101,0.5)]" />
              <p className="text-sm font-medium text-gray-400">Your extension will appear here</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] z-10">
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-gray-300">Failed to load preview</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          key={key}
          ref={iframeRef}
          src={url}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title="Extension Preview"
        />
      </div>
    </div>
  );
}

export default PreviewFrame;

