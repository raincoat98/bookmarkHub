// Import modules
import { StorageManager } from './storage.js';
import { UIManager } from './ui.js';
import { BookmarkManager } from './bookmarks.js';
import { ThemeManager } from './theme.js';

// Initialize managers
const storageManager = new StorageManager();
const themeManager = new ThemeManager();
const bookmarkManager = new BookmarkManager(storageManager);
const uiManager = new UIManager(bookmarkManager, storageManager, themeManager);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('BookmarkHub Extension loaded');
  
  // Initialize theme
  await themeManager.initialize();
  
  // Load bookmarks and collections
  await bookmarkManager.initialize();
  
  // Initialize UI
  uiManager.initialize();
  
  // Check current tab for potential bookmark
  getCurrentTab();
});

// Get current tab information
async function getCurrentTab() {
  try {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    
    if (tab && tab.url && tab.url.startsWith('http')) {
      // Store current tab info for potential bookmark
      bookmarkManager.setCurrentTab({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl || null
      });
      
      // Update Add Bookmark form with current tab info
      document.getElementById('bookmark-title').value = tab.title || '';
      document.getElementById('bookmark-url').value = tab.url || '';
    }
  } catch (error) {
    console.error('Error getting current tab:', error);
  }
}

// Export managers for potential use in other modules
export { storageManager, bookmarkManager, uiManager, themeManager };