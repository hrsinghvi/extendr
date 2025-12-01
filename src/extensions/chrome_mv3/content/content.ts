/**
 * Content Script
 * 
 * Runs in the context of web pages. Has access to the DOM but limited Chrome APIs.
 * Communicates with background service worker via chrome.runtime.sendMessage.
 */

// Prevent multiple injections
if (!(window as any).__EXTENDR_INJECTED__) {
  (window as any).__EXTENDR_INJECTED__ = true;
  
  console.log('[Extendr Content] Script loaded on:', window.location.href);

  /**
   * Initialize content script
   */
  async function initialize(): Promise<void> {
    try {
      // Check if extension is enabled
      const result = await chrome.storage.local.get(['settings']);
      const settings = result.settings || { enabled: true };
      
      if (!settings.enabled) {
        console.log('[Extendr Content] Extension is disabled');
        return;
      }
      
      // Setup message listener
      setupMessageListener();
      
      // Notify background that content script is ready
      chrome.runtime.sendMessage({ 
        type: 'CONTENT_SCRIPT_READY',
        data: { url: window.location.href }
      });
      
      console.log('[Extendr Content] Initialized successfully');
    } catch (error) {
      console.error('[Extendr Content] Initialization error:', error);
    }
  }

  /**
   * Setup listener for messages from popup/background
   */
  function setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[Extendr Content] Message received:', message);
      
      switch (message.type) {
        case 'PERFORM_ACTION':
          handleAction(message.data);
          sendResponse({ success: true });
          break;
          
        case 'GET_PAGE_INFO':
          sendResponse({
            title: document.title,
            url: window.location.href,
            selection: window.getSelection()?.toString() || ''
          });
          break;
          
        default:
          sendResponse({ error: 'Unknown message type' });
      }
      
      return false;
    });
  }

  /**
   * Handle action from popup
   */
  function handleAction(data: { timestamp: number }): void {
    console.log('[Extendr Content] Performing action at:', data.timestamp);
    
    // Example: Show a notification overlay
    showNotification('Extendr action performed!');
  }

  /**
   * Show a temporary notification on the page
   */
  function showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'extendr-notification';
    notification.textContent = message;
    
    // Inline styles to avoid CSS conflicts
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: '2147483647',
      opacity: '0',
      transform: 'translateY(-10px)',
      transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}

export {};

