/**
 * Background script for BookmarkHub extension
 * Handles background tasks and events
 */

// Listen for installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('BookmarkHub Extension installed');
    
    // Initialize default data
    const defaultCollections = [
      { id: 'default', name: 'Default', color: '#007AFF', createdAt: new Date().toISOString() },
      { id: 'work', name: 'Work', color: '#5856D6', createdAt: new Date().toISOString() },
      { id: 'personal', name: 'Personal', color: '#FF2D55', createdAt: new Date().toISOString() }
    ];
    
    const defaultSettings = {
      theme: 'system',
      viewType: 'grid'
    };
    
    // Save default data
    await chrome.storage.local.set({
      collections: defaultCollections,
      bookmarks: [],
      settings: defaultSettings
    });
  }
});

// Listen for context menu clicks (for right-click bookmark saving)
chrome.contextMenus.create({
  id: 'add-to-boomarkhub',
  title: 'Add to BookmarkHub',
  contexts: ['page', 'link']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'add-to-boomarkhub') {
    const url = info.linkUrl || info.pageUrl;
    const title = tab.title;
    
    // Open popup with pre-filled data
    chrome.storage.local.set({
      'tempBookmark': {
        url,
        title,
        favIconUrl: tab.favIconUrl
      }
    });
    
    chrome.action.openPopup();
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getBookmarks') {
    chrome.storage.local.get('bookmarks', (data) => {
      sendResponse({ bookmarks: data.bookmarks || [] });
    });
    return true; // Indicates async response
  }
  
  if (message.action === 'getCollections') {
    chrome.storage.local.get('collections', (data) => {
      sendResponse({ collections: data.collections || [] });
    });
    return true;
  }
});