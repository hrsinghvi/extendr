/**
 * PreviewFrame Component
 * 
 * An iframe wrapper for displaying the extension preview.
 */

import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PreviewFrameProps } from '../types';
import { BuildStatus } from '../useWebContainer';

/**
 * PreviewFrame component
 */
export function PreviewFrame({
  url,
  className,
  onLoad,
  onError,
  hasFiles = false,
  buildStatus,
  isAIWorking = false
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);
  
  // Track if we've successfully loaded the current URL (prevents flicker on tab switch)
  const lastLoadedUrlRef = useRef<string | null>(null);
  
  // Check if we're currently building
  const isBuilding = buildStatus === BuildStatus.BOOTING || 
                     buildStatus === BuildStatus.MOUNTING || 
                     buildStatus === BuildStatus.INSTALLING || 
                     buildStatus === BuildStatus.STARTING;
  
  // Clear lastLoadedUrlRef when URL is cleared (project switch)
  useEffect(() => {
    if (!url) {
      lastLoadedUrlRef.current = null;
    }
  }, [url]);

  /**
   * Handle iframe load
   */
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    // Remember that we successfully loaded this URL
    lastLoadedUrlRef.current = url;
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

  // Reset state when URL changes to a NEW URL (not on tab switch)
  useEffect(() => {
    if (url && url !== lastLoadedUrlRef.current) {
      // Only show loading for a genuinely new URL
      setIsLoading(true);
      setHasError(false);
    }
  }, [url]);

  // No URL state - show loading if files exist or building, otherwise show empty state
  if (!url) {
    // If we have files or are actively building, show loading/building state
    if (hasFiles || isBuilding) {
      return (
        <div className={cn(
          'flex flex-col items-center justify-center h-full bg-[#1a1a1a] text-gray-400',
          className
        )}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5A9665] to-[#5f87a3] animate-pulse shadow-[0_0_15px_rgba(90,150,101,0.5)]" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300 mb-1">
                {isBuilding ? 'Building your extension...' : 'Preparing preview...'}
              </p>
              <p className="text-xs text-gray-500">
                {isBuilding ? 'This may take a moment' : 'Your extension will appear here'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Truly empty state - only for new projects with no files
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
      {/* Preview content */}
      <div className="relative flex-1">
        {/* Floating reload button - top right corner */}
        <div className="absolute top-3 right-3 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white bg-[#232323]/90 hover:bg-[#232323] backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg"
            title="Refresh preview"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
        {/* AI Working overlay - shows when AI is creating/modifying the extension */}
        {isAIWorking && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5A9665] to-[#5f87a3] animate-pulse shadow-[0_0_15px_rgba(90,150,101,0.5)]" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-300 mb-1">AI is working...</p>
                <p className="text-xs text-gray-500">Your extension will appear here</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading overlay - only when not AI working */}
        {isLoading && !isAIWorking && (
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
          className="w-full h-full border-0 bg-[#1a1a1a]"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title="Extension Preview"
        />
      </div>
    </div>
  );
}

export default PreviewFrame;

