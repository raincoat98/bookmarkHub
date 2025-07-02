/**
 * BookmarkManager - Manages bookmarks and collections
 */
export class BookmarkManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.bookmarks = [];
    this.collections = [];
    this.currentTab = null;
    this.activeCollectionId = null;
  }

  /**
   * Initialize the bookmark manager
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.loadBookmarks();
    await this.loadCollections();
    this.activeCollectionId = 'all';
  }

  /**
   * Load bookmarks from storage
   * @returns {Promise<void>}
   */
  async loadBookmarks() {
    this.bookmarks = await this.storageManager.getBookmarks();
  }

  /**
   * Load collections from storage
   * @returns {Promise<void>}
   */
  async loadCollections() {
    this.collections = await this.storageManager.getCollections();
  }

  /**
   * Set current tab information
   * @param {Object} tab - Tab information object
   */
  setCurrentTab(tab) {
    this.currentTab = tab;
  }

  /**
   * Set active collection
   * @param {string} collectionId - Collection ID
   */
  setActiveCollection(collectionId) {
    this.activeCollectionId = collectionId;
  }

  /**
   * Get all bookmarks
   * @returns {Array} - Array of all bookmarks
   */
  getAllBookmarks() {
    return this.bookmarks;
  }

  /**
   * Get bookmarks for a specific collection
   * @param {string} collectionId - Collection ID
   * @returns {Array} - Array of filtered bookmarks
   */
  getBookmarksByCollection(collectionId) {
    if (collectionId === 'all') {
      return this.bookmarks;
    }
    
    return this.bookmarks.filter(bookmark => bookmark.collectionId === collectionId);
  }

  /**
   * Get all collections
   * @returns {Array} - Array of all collections
   */
  getAllCollections() {
    return this.collections;
  }

  /**
   * Get collection by ID
   * @param {string} id - Collection ID
   * @returns {Object|null} - Collection object or null
   */
  getCollectionById(id) {
    return this.collections.find(collection => collection.id === id) || null;
  }

  /**
   * Add a new bookmark
   * @param {Object} bookmark - Bookmark object
   * @returns {Promise<string>} - New bookmark ID
   */
  async addBookmark(bookmark) {
    const newBookmark = {
      id: this.generateId(),
      title: bookmark.title,
      url: bookmark.url,
      collectionId: bookmark.collectionId || 'default',
      favicon: bookmark.favicon || null,
      createdAt: new Date().toISOString(),
      lastVisited: null
    };
    
    this.bookmarks.push(newBookmark);
    await this.saveBookmarks();
    
    return newBookmark.id;
  }

  /**
   * Edit an existing bookmark
   * @param {string} id - Bookmark ID
   * @param {Object} updates - Properties to update
   * @returns {Promise<boolean>} - Success status
   */
  async editBookmark(id, updates) {
    const index = this.bookmarks.findIndex(bookmark => bookmark.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.bookmarks[index] = {
      ...this.bookmarks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.saveBookmarks();
    return true;
  }

  /**
   * Delete a bookmark
   * @param {string} id - Bookmark ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteBookmark(id) {
    const initialLength = this.bookmarks.length;
    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
    
    if (this.bookmarks.length === initialLength) {
      return false;
    }
    
    await this.saveBookmarks();
    return true;
  }

  /**
   * Add a new collection
   * @param {Object} collection - Collection object
   * @returns {Promise<string>} - New collection ID
   */
  async addCollection(collection) {
    const newCollection = {
      id: this.generateId(),
      name: collection.name,
      color: collection.color || '#007AFF',
      createdAt: new Date().toISOString()
    };
    
    this.collections.push(newCollection);
    await this.saveCollections();
    
    return newCollection.id;
  }

  /**
   * Edit an existing collection
   * @param {string} id - Collection ID
   * @param {Object} updates - Properties to update
   * @returns {Promise<boolean>} - Success status
   */
  async editCollection(id, updates) {
    const index = this.collections.findIndex(collection => collection.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.collections[index] = {
      ...this.collections[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.saveCollections();
    return true;
  }

  /**
   * Delete a collection
   * @param {string} id - Collection ID
   * @param {string} moveToId - ID of collection to move bookmarks to
   * @returns {Promise<boolean>} - Success status
   */
  async deleteCollection(id, moveToId = 'default') {
    // Prevent deleting default collection
    if (id === 'default') {
      return false;
    }
    
    // Move bookmarks to another collection
    this.bookmarks = this.bookmarks.map(bookmark => {
      if (bookmark.collectionId === id) {
        return { ...bookmark, collectionId: moveToId };
      }
      return bookmark;
    });
    
    // Remove the collection
    const initialLength = this.collections.length;
    this.collections = this.collections.filter(collection => collection.id !== id);
    
    if (this.collections.length === initialLength) {
      return false;
    }
    
    // Save changes
    await Promise.all([
      this.saveBookmarks(),
      this.saveCollections()
    ]);
    
    return true;
  }

  /**
   * Search bookmarks by query
   * @param {string} query - Search query
   * @returns {Array} - Array of matching bookmarks
   */
  searchBookmarks(query) {
    if (!query || query.trim() === '') {
      return this.bookmarks;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return this.bookmarks.filter(bookmark => {
      return (
        bookmark.title.toLowerCase().includes(searchTerm) ||
        bookmark.url.toLowerCase().includes(searchTerm)
      );
    });
  }

  /**
   * Record bookmark visit
   * @param {string} id - Bookmark ID
   * @returns {Promise<void>}
   */
  async recordVisit(id) {
    const index = this.bookmarks.findIndex(bookmark => bookmark.id === id);
    
    if (index !== -1) {
      this.bookmarks[index].lastVisited = new Date().toISOString();
      this.bookmarks[index].visitCount = (this.bookmarks[index].visitCount || 0) + 1;
      await this.saveBookmarks();
    }
  }

  /**
   * Save bookmarks to storage
   * @returns {Promise<void>}
   */
  async saveBookmarks() {
    await this.storageManager.saveBookmarks(this.bookmarks);
  }

  /**
   * Save collections to storage
   * @returns {Promise<void>}
   */
  async saveCollections() {
    await this.storageManager.saveCollections(this.collections);
  }

  /**
   * Generate a unique ID
   * @returns {string} - Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}