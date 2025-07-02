/**
 * StorageManager - Handles all interactions with Chrome storage
 */
export class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  /**
   * Get data from storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} - Stored data
   */
  async get(key) {
    return new Promise((resolve) => {
      this.storage.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  /**
   * Set data in storage
   * @param {string} key - Storage key
   * @param {any} value - Data to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    return new Promise((resolve) => {
      this.storage.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  /**
   * Remove data from storage
   * @param {string} key - Storage key to remove
   * @returns {Promise<void>}
   */
  async remove(key) {
    return new Promise((resolve) => {
      this.storage.remove(key, () => {
        resolve();
      });
    });
  }

  /**
   * Get all bookmarks from storage
   * @returns {Promise<Array>} - Array of bookmarks
   */
  async getBookmarks() {
    const bookmarks = await this.get('bookmarks');
    return bookmarks || [];
  }

  /**
   * Save bookmarks to storage
   * @param {Array} bookmarks - Array of bookmark objects
   * @returns {Promise<void>}
   */
  async saveBookmarks(bookmarks) {
    await this.set('bookmarks', bookmarks);
  }

  /**
   * Get all collections from storage
   * @returns {Promise<Array>} - Array of collections
   */
  async getCollections() {
    const collections = await this.get('collections');
    return collections || [
      { id: 'default', name: 'Default', color: '#007AFF' }
    ];
  }

  /**
   * Save collections to storage
   * @param {Array} collections - Array of collection objects
   * @returns {Promise<void>}
   */
  async saveCollections(collections) {
    await this.set('collections', collections);
  }

  /**
   * Get user settings
   * @returns {Promise<Object>} - User settings
   */
  async getSettings() {
    const settings = await this.get('settings');
    return settings || {
      theme: 'system',
      viewType: 'grid'
    };
  }

  /**
   * Save user settings
   * @param {Object} settings - User settings object
   * @returns {Promise<void>}
   */
  async saveSettings(settings) {
    await this.set('settings', settings);
  }

  /**
   * Export all data as JSON
   * @returns {Promise<string>} - JSON string of all data
   */
  async exportData() {
    const bookmarks = await this.getBookmarks();
    const collections = await this.getCollections();
    const settings = await this.getSettings();
    
    const data = {
      bookmarks,
      collections,
      settings,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   * @param {string} jsonData - JSON string to import
   * @returns {Promise<boolean>} - Success status
   */
  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.bookmarks) {
        await this.saveBookmarks(data.bookmarks);
      }
      
      if (data.collections) {
        await this.saveCollections(data.collections);
      }
      
      if (data.settings) {
        await this.saveSettings(data.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}