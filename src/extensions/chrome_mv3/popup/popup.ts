/**
 * Popup Script
 * 
 * Handles popup UI interactions and communicates with the background service worker.
 */

// DOM Elements
const statusEl = document.getElementById('status') as HTMLSpanElement;
const actionBtn = document.getElementById('actionBtn') as HTMLButtonElement;
const enableToggle = document.getElementById('enableToggle') as HTMLInputElement;

/**
 * Initialize popup state from storage
 */
async function initializePopup(): Promise<void> {
  try {
    // Get stored settings
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || { enabled: true };
    
    // Update UI
    enableToggle.checked = settings.enabled;
    updateStatus(settings.enabled);
    
    // Check service worker status
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
    console.log('[Popup] Service worker status:', response);
  } catch (error) {
    console.error('[Popup] Initialization error:', error);
  }
}

/**
 * Update status indicator
 */
function updateStatus(enabled: boolean): void {
  statusEl.textContent = enabled ? 'Active' : 'Inactive';
  statusEl.classList.toggle('inactive', !enabled);
}

/**
 * Handle action button click
 */
async function handleAction(): Promise<void> {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      console.error('[Popup] No active tab found');
      return;
    }
    
    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, { 
      type: 'PERFORM_ACTION',
      data: { timestamp: Date.now() }
    });
    
    console.log('[Popup] Action sent to content script');
  } catch (error) {
    console.error('[Popup] Action error:', error);
  }
}

/**
 * Handle enable toggle change
 */
async function handleToggleChange(): Promise<void> {
  const enabled = enableToggle.checked;
  
  try {
    // Save setting
    await chrome.storage.local.set({
      settings: { enabled }
    });
    
    // Update UI
    updateStatus(enabled);
    
    // Notify background
    await chrome.runtime.sendMessage({ 
      type: 'SETTINGS_CHANGED',
      data: { enabled }
    });
    
    console.log('[Popup] Settings updated:', { enabled });
  } catch (error) {
    console.error('[Popup] Toggle error:', error);
  }
}

// Event listeners
actionBtn.addEventListener('click', handleAction);
enableToggle.addEventListener('change', handleToggleChange);

// Initialize on load
document.addEventListener('DOMContentLoaded', initializePopup);

export {};

