/**
 * Options Page Script
 * 
 * Handles settings management for the extension.
 */

// DOM Elements
const enableExtensionEl = document.getElementById('enableExtension') as HTMLInputElement;
const showNotificationsEl = document.getElementById('showNotifications') as HTMLInputElement;
const themeEl = document.getElementById('theme') as HTMLSelectElement;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  showNotifications: true,
  theme: 'auto'
};

/**
 * Initialize options page
 */
async function initialize(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = { ...DEFAULT_SETTINGS, ...result.settings };
    
    // Populate UI
    enableExtensionEl.checked = settings.enabled;
    showNotificationsEl.checked = settings.showNotifications;
    themeEl.value = settings.theme;
    
    console.log('[Options] Loaded settings:', settings);
  } catch (error) {
    console.error('[Options] Initialization error:', error);
  }
}

/**
 * Save settings to storage
 */
async function saveSettings(): Promise<void> {
  const settings = {
    enabled: enableExtensionEl.checked,
    showNotifications: showNotificationsEl.checked,
    theme: themeEl.value
  };
  
  try {
    await chrome.storage.local.set({ settings });
    
    // Notify background about settings change
    chrome.runtime.sendMessage({
      type: 'SETTINGS_CHANGED',
      data: settings
    });
    
    console.log('[Options] Settings saved:', settings);
    showToast('Settings saved');
  } catch (error) {
    console.error('[Options] Save error:', error);
    showToast('Failed to save settings', 'error');
  }
}

/**
 * Export settings as JSON file
 */
async function exportSettings(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(null);
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extendr-settings.json';
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('Settings exported');
  } catch (error) {
    console.error('[Options] Export error:', error);
    showToast('Failed to export settings', 'error');
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings(): Promise<void> {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }
  
  try {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    
    // Update UI
    enableExtensionEl.checked = DEFAULT_SETTINGS.enabled;
    showNotificationsEl.checked = DEFAULT_SETTINGS.showNotifications;
    themeEl.value = DEFAULT_SETTINGS.theme;
    
    // Notify background
    chrome.runtime.sendMessage({
      type: 'SETTINGS_CHANGED',
      data: DEFAULT_SETTINGS
    });
    
    showToast('Settings reset to defaults');
  } catch (error) {
    console.error('[Options] Reset error:', error);
    showToast('Failed to reset settings', 'error');
  }
}

/**
 * Show a toast notification
 */
function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  const toast = document.createElement('div');
  toast.textContent = message;
  
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    background: type === 'success' 
      ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
      : '#f44336',
    color: 'white',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: '9999',
    opacity: '0',
    transform: 'translateY(10px)',
    transition: 'all 0.3s ease'
  });
  
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Event listeners
enableExtensionEl.addEventListener('change', saveSettings);
showNotificationsEl.addEventListener('change', saveSettings);
themeEl.addEventListener('change', saveSettings);
exportBtn.addEventListener('click', exportSettings);
resetBtn.addEventListener('click', resetSettings);

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);

export {};

