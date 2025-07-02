// Import modules
import { StorageManager } from "./storage.js";
import { UIManager } from "./ui.js";
import { BookmarkManager } from "./bookmarks.js";
import { ThemeManager } from "./theme.js";

// Initialize managers
const storageManager = new StorageManager();
const themeManager = new ThemeManager();
const bookmarkManager = new BookmarkManager(storageManager);
const uiManager = new UIManager(bookmarkManager, storageManager, themeManager);

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("BookmarkHub Extension loaded");

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

    if (tab && tab.url && tab.url.startsWith("http")) {
      // Store current tab info for potential bookmark
      bookmarkManager.setCurrentTab({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl || null,
      });

      // Update Add Bookmark form with current tab info
      document.getElementById("bookmark-thumb").src =
        tab.favIconUrl || "icons/icon48.png";
      document.getElementById("bookmark-title-view").textContent =
        tab.title || "";
      document.getElementById("bookmark-desc").textContent = "";
      document.getElementById("bookmark-url").value = tab.url || "";

      // Load collections
      const { collections } = await chrome.storage.local.get("collections");
      const select = document.getElementById("bookmark-collection");
      (collections || [{ id: "default", name: "Default" }]).forEach((col) => {
        const opt = document.createElement("option");
        opt.value = col.id;
        opt.textContent = col.name;
        select.appendChild(opt);
      });

      // Initialize toggle buttons
      let highlight = false;
      let tabbed = false;
      let favorite = false;

      document.getElementById("highlight-btn").onclick = function () {
        highlight = !highlight;
        this.classList.toggle("active", highlight);
      };
      document.getElementById("tab-btn").onclick = function () {
        tabbed = !tabbed;
        this.classList.toggle("active", tabbed);
      };
      document.getElementById("favorite-btn").onclick = function () {
        favorite = !favorite;
        this.classList.toggle("active", favorite);
      };

      // Save button
      document.getElementById("save-btn").onclick = async function () {
        const title = tab.title || "";
        const url = tab.url || "";
        const favIconUrl = tab.favIconUrl || "";
        const note = document.getElementById("bookmark-note").value;
        const collectionId = select.value;
        const tags = document
          .getElementById("bookmark-tags")
          .value.split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        const newBookmark = {
          id: Date.now().toString(),
          title,
          url,
          favIconUrl,
          note,
          collectionId,
          tags,
          highlight,
          tabbed,
          favorite,
          createdAt: new Date().toISOString(),
        };

        // Load existing bookmarks and add new one
        const { bookmarks } = await chrome.storage.local.get("bookmarks");
        const updated = Array.isArray(bookmarks)
          ? [...bookmarks, newBookmark]
          : [newBookmark];
        await chrome.storage.local.set({ bookmarks: updated });

        // Close popup after saving
        window.close();
      };
    }
  } catch (error) {
    console.error("Error getting current tab:", error);
  }
}

// Export managers for potential use in other modules
export { storageManager, bookmarkManager, uiManager, themeManager };
