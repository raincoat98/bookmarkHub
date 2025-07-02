/**
 * Background script for BookmarkHub extension
 * Handles background tasks and events
 */

// Listen for installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    console.log("BookmarkHub Extension installed");

    // Initialize default data
    const defaultCollections = [
      {
        id: "default",
        name: "Default",
        color: "#007AFF",
        createdAt: new Date().toISOString(),
      },
      {
        id: "work",
        name: "Work",
        color: "#5856D6",
        createdAt: new Date().toISOString(),
      },
      {
        id: "personal",
        name: "Personal",
        color: "#FF2D55",
        createdAt: new Date().toISOString(),
      },
    ];

    const defaultSettings = {
      theme: "system",
      viewType: "grid",
    };

    // Save default data
    await chrome.storage.local.set({
      collections: defaultCollections,
      bookmarks: [],
      settings: defaultSettings,
    });
  }
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url && tab.url.startsWith("http")) {
    try {
      // Get current bookmarks
      const data = await chrome.storage.local.get(["bookmarks", "collections"]);
      const bookmarks = data.bookmarks || [];
      const collections = data.collections || [];

      // Check if bookmark already exists
      const existingBookmark = bookmarks.find(
        (bookmark) => bookmark.url === tab.url
      );

      if (existingBookmark) {
        // Show notification that bookmark already exists
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "BookmarkHub",
          message: "이 페이지는 이미 저장되어 있습니다!",
        });
      } else {
        // Create new bookmark
        const newBookmark = {
          id: Date.now().toString(),
          title: tab.title || "Untitled",
          url: tab.url,
          favIconUrl: tab.favIconUrl || null,
          collectionId: "default",
          createdAt: new Date().toISOString(),
          tags: [],
        };

        // Add to bookmarks
        bookmarks.push(newBookmark);

        // Save to storage
        await chrome.storage.local.set({ bookmarks });

        // Show success notification
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "BookmarkHub",
          message: "북마크가 성공적으로 저장되었습니다!",
        });
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);

      // Show error notification
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "BookmarkHub",
        message: "북마크 저장 중 오류가 발생했습니다.",
      });
    }
  }
});

// Listen for context menu clicks (for right-click bookmark saving)
chrome.contextMenus.create({
  id: "add-to-boomarkhub",
  title: "Add to BookmarkHub",
  contexts: ["page", "link"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-boomarkhub") {
    const url = info.linkUrl || info.pageUrl;
    const title = tab.title;

    // Open popup with pre-filled data
    chrome.storage.local.set({
      tempBookmark: {
        url,
        title,
        favIconUrl: tab.favIconUrl,
      },
    });

    chrome.action.openPopup();
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getBookmarks") {
    chrome.storage.local.get("bookmarks", (data) => {
      sendResponse({ bookmarks: data.bookmarks || [] });
    });
    return true; // Indicates async response
  }

  if (message.action === "getCollections") {
    chrome.storage.local.get("collections", (data) => {
      sendResponse({ collections: data.collections || [] });
    });
    return true;
  }
});
