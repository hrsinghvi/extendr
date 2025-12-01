/**
 * Chrome MV3 Background Service Worker
 * 
 * This service worker handles background tasks for the extension.
 * It runs in a separate context from the popup and content scripts.
 * 
 * Key concepts:
 * - Service workers are event-driven and terminate when idle
 * - Use chrome.storage for persistent data (not global variables)
 * - Use chrome.alarms for periodic tasks
 */

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Extendr] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // First-time installation
    chrome.storage.local.set({
      installDate: new Date().toISOString(),
      settings: {
        enabled: true,
        theme: 'auto'
      }
    });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('[Extendr] Updated from version:', details.previousVersion);
  }
});

// Message handler for communication with popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Extendr] Message received:', message, 'from:', sender);
  
  switch (message.type) {
    case 'GET_STATUS':
      sendResponse({ status: 'active', timestamp: Date.now() });
      break;
      
    case 'SAVE_DATA':
      chrome.storage.local.set({ userData: message.data }, () => {
        sendResponse({ success: true });
      });
      return true; // Keep channel open for async response
      
    case 'GET_DATA':
      chrome.storage.local.get(['userData'], (result) => {
        sendResponse({ data: result.userData || null });
      });
      return true; // Keep channel open for async response
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  return false;
});

// Tab update listener (optional - for tab-aware extensions)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('[Extendr] Tab updated:', tabId, tab.url);
  }
});

// Action click handler (when user clicks extension icon without popup)
chrome.action.onClicked.addListener((tab) => {
  console.log('[Extendr] Extension icon clicked on tab:', tab.id);
  // This only fires if no popup is defined in manifest
});

export {};

