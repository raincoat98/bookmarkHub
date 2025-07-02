/**
 * UIManager - Manages the user interface
 */
export class UIManager {
  constructor(bookmarkManager, storageManager, themeManager) {
    this.bookmarkManager = bookmarkManager;
    this.storageManager = storageManager;
    this.themeManager = themeManager;
    this.settings = null;
    this.activeModal = null;
  }

  /**
   * Initialize the UI
   */
  initialize() {
    this.loadSettings();
    this.renderCollections();
    this.renderBookmarks();
    this.setupEventListeners();
  }

  /**
   * Load user settings
   */
  async loadSettings() {
    this.settings = await this.storageManager.getSettings();
    this.applySettings();
  }

  /**
   * Apply user settings to UI
   */
  applySettings() {
    // Apply view type
    const bookmarksContainer = document.querySelector('.bookmarks-container');
    bookmarksContainer.setAttribute('data-view', this.settings.viewType);
    
    // Set theme selectors
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.value = this.settings.theme;
    }
    
    // Set view type selector
    const viewTypeSelect = document.getElementById('view-type');
    if (viewTypeSelect) {
      viewTypeSelect.value = this.settings.viewType;
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.themeManager.toggleTheme();
    });
    
    // Settings button
    document.getElementById('settings-button').addEventListener('click', () => {
      this.openModal('settings-modal');
    });
    
    // Add bookmark button
    document.getElementById('add-bookmark').addEventListener('click', () => {
      this.openModal('add-bookmark-modal');
    });
    
    // Add collection button
    document.getElementById('add-collection').addEventListener('click', () => {
      this.openModal('add-collection-modal');
    });
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
      button.addEventListener('click', () => {
        this.closeModal();
      });
    });
    
    // Modal backdrop
    document.querySelector('.modal-backdrop').addEventListener('click', () => {
      this.closeModal();
    });
    
    // Add bookmark form
    document.getElementById('add-bookmark-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddBookmark();
    });
    
    // Add collection form
    document.getElementById('add-collection-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddCollection();
    });
    
    // Search input
    document.getElementById('search-input').addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
    
    // Theme select
    document.getElementById('theme-select').addEventListener('change', (e) => {
      this.handleThemeChange(e.target.value);
    });
    
    // View type select
    document.getElementById('view-type').addEventListener('change', (e) => {
      this.handleViewTypeChange(e.target.value);
    });
    
    // Import/Export buttons
    document.getElementById('import-bookmarks').addEventListener('click', () => {
      this.handleImport();
    });
    
    document.getElementById('export-bookmarks').addEventListener('click', () => {
      this.handleExport();
    });
  }

  /**
   * Render collections in sidebar
   */
  renderCollections() {
    const collectionsListElement = document.getElementById('collections-list');
    const collections = this.bookmarkManager.getAllCollections();
    const bookmarks = this.bookmarkManager.getAllBookmarks();
    
    // Clear current list
    collectionsListElement.innerHTML = '';
    
    // Add "All Bookmarks" option
    const allBookmarksItem = document.createElement('li');
    allBookmarksItem.classList.add('collection-item');
    if (this.bookmarkManager.activeCollectionId === 'all') {
      allBookmarksItem.classList.add('active');
    }
    allBookmarksItem.dataset.id = 'all';
    allBookmarksItem.innerHTML = `
      <div class="collection-color" style="background-color: #8E8E93;"></div>
      <span class="collection-name">All Bookmarks</span>
      <span class="collection-count">${bookmarks.length}</span>
    `;
    collectionsListElement.appendChild(allBookmarksItem);
    
    // Render each collection
    collections.forEach(collection => {
      const collectionCount = bookmarks.filter(b => b.collectionId === collection.id).length;
      const item = document.createElement('li');
      item.classList.add('collection-item');
      if (this.bookmarkManager.activeCollectionId === collection.id) {
        item.classList.add('active');
      }
      item.dataset.id = collection.id;
      item.innerHTML = `
        <div class="collection-color" style="background-color: ${collection.color};"></div>
        <span class="collection-name">${collection.name}</span>
        <span class="collection-count">${collectionCount}</span>
      `;
      collectionsListElement.appendChild(item);
    });
    
    // Update collection selector in add bookmark form
    const collectionSelect = document.getElementById('bookmark-collection');
    collectionSelect.innerHTML = '';
    collections.forEach(collection => {
      const option = document.createElement('option');
      option.value = collection.id;
      option.textContent = collection.name;
      collectionSelect.appendChild(option);
    });
    
    // Add collection click listeners
    document.querySelectorAll('.collection-item').forEach(item => {
      item.addEventListener('click', () => {
        this.handleCollectionSelect(item.dataset.id);
      });
    });
  }

  /**
   * Render bookmarks
   * @param {Array} [bookmarksToRender] - Optional array of bookmarks to render
   */
  renderBookmarks(bookmarksToRender) {
    const bookmarksGridElement = document.getElementById('bookmarks-grid');
    const collectionId = this.bookmarkManager.activeCollectionId;
    const bookmarks = bookmarksToRender || this.bookmarkManager.getBookmarksByCollection(collectionId);
    
    // Clear current bookmarks
    bookmarksGridElement.innerHTML = '';
    
    // Update collection name
    const collectionName = document.getElementById('current-collection-name');
    if (collectionId === 'all') {
      collectionName.textContent = 'All Bookmarks';
    } else {
      const collection = this.bookmarkManager.getCollectionById(collectionId);
      collectionName.textContent = collection ? collection.name : 'Bookmarks';
    }
    
    // If no bookmarks, show empty state
    if (bookmarks.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.classList.add('empty-state');
      emptyState.innerHTML = `
        <p>No bookmarks found</p>
        <button id="empty-add-bookmark" class="secondary-button">Add Bookmark</button>
      `;
      bookmarksGridElement.appendChild(emptyState);
      
      document.getElementById('empty-add-bookmark').addEventListener('click', () => {
        this.openModal('add-bookmark-modal');
      });
      
      return;
    }
    
    // Render each bookmark
    bookmarks.forEach(bookmark => {
      const card = document.createElement('div');
      card.classList.add('bookmark-card');
      card.dataset.id = bookmark.id;
      
      // Get collection color
      const collection = this.bookmarkManager.getCollectionById(bookmark.collectionId);
      const collectionColor = collection ? collection.color : '#8E8E93';
      
      card.innerHTML = `
        <div class="bookmark-thumbnail" style="border-top: 3px solid ${collectionColor};">
          ${bookmark.favicon ? 
            `<img src="${bookmark.favicon}" class="bookmark-favicon" alt="Favicon">` : 
            `<div class="bookmark-favicon-placeholder"></div>`
          }
        </div>
        <div class="bookmark-info">
          <h3 class="bookmark-title">${bookmark.title}</h3>
          <p class="bookmark-url">${this.formatUrl(bookmark.url)}</p>
        </div>
      `;
      
      // Add click listener to open bookmark
      card.addEventListener('click', () => {
        this.openBookmark(bookmark);
      });
      
      bookmarksGridElement.appendChild(card);
    });
  }

  /**
   * Open a bookmark URL
   * @param {Object} bookmark - Bookmark to open
   */
  openBookmark(bookmark) {
    chrome.tabs.create({ url: bookmark.url });
    this.bookmarkManager.recordVisit(bookmark.id);
  }

  /**
   * Format URL for display
   * @param {string} url - URL to format
   * @returns {string} - Formatted URL
   */
  formatUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  }

  /**
   * Open a modal
   * @param {string} modalId - ID of modal to open
   */
  openModal(modalId) {
    const modalContainer = document.getElementById('modal-container');
    const modal = document.getElementById(modalId);
    
    // Hide current active modal if any
    if (this.activeModal) {
      this.activeModal.classList.remove('active');
    }
    
    // Show modal container
    modalContainer.classList.remove('hidden');
    
    // Show requested modal
    modal.classList.add('active');
    this.activeModal = modal;
    
    // Focus first input if exists
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Close active modal
   */
  closeModal() {
    const modalContainer = document.getElementById('modal-container');
    
    // Hide active modal if any
    if (this.activeModal) {
      this.activeModal.classList.remove('active');
      this.activeModal = null;
    }
    
    // Hide modal container
    modalContainer.classList.add('hidden');
  }

  /**
   * Handle adding a new bookmark
   */
  async handleAddBookmark() {
    const titleInput = document.getElementById('bookmark-title');
    const urlInput = document.getElementById('bookmark-url');
    const collectionSelect = document.getElementById('bookmark-collection');
    
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const collectionId = collectionSelect.value;
    
    if (!title || !url) {
      return;
    }
    
    // Add http:// if missing
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    
    // Create bookmark
    const favicon = this.bookmarkManager.currentTab && 
                   this.bookmarkManager.currentTab.url === formattedUrl ? 
                   this.bookmarkManager.currentTab.favIconUrl : null;
    
    await this.bookmarkManager.addBookmark({
      title,
      url: formattedUrl,
      collectionId,
      favicon
    });
    
    // Reset form
    titleInput.value = '';
    urlInput.value = '';
    
    // Update UI
    this.renderCollections();
    this.renderBookmarks();
    
    // Close modal
    this.closeModal();
  }

  /**
   * Handle adding a new collection
   */
  async handleAddCollection() {
    const nameInput = document.getElementById('collection-name');
    const colorInput = document.getElementById('collection-color');
    
    const name = nameInput.value.trim();
    const color = colorInput.value;
    
    if (!name) {
      return;
    }
    
    // Create collection
    await this.bookmarkManager.addCollection({
      name,
      color
    });
    
    // Reset form
    nameInput.value = '';
    
    // Update UI
    this.renderCollections();
    
    // Close modal
    this.closeModal();
  }

  /**
   * Handle collection selection
   * @param {string} collectionId - Selected collection ID
   */
  handleCollectionSelect(collectionId) {
    // Update active collection
    this.bookmarkManager.setActiveCollection(collectionId);
    
    // Update UI
    document.querySelectorAll('.collection-item').forEach(item => {
      item.classList.toggle('active', item.dataset.id === collectionId);
    });
    
    // Render bookmarks for selected collection
    this.renderBookmarks();
  }

  /**
   * Handle search input
   * @param {string} query - Search query
   */
  handleSearch(query) {
    if (!query || query.trim() === '') {
      this.renderBookmarks();
      return;
    }
    
    const results = this.bookmarkManager.searchBookmarks(query);
    this.renderBookmarks(results);
  }

  /**
   * Handle theme change
   * @param {string} theme - New theme value
   */
  async handleThemeChange(theme) {
    this.settings.theme = theme;
    await this.storageManager.saveSettings(this.settings);
    this.themeManager.setTheme(theme);
  }

  /**
   * Handle view type change
   * @param {string} viewType - New view type value
   */
  async handleViewTypeChange(viewType) {
    this.settings.viewType = viewType;
    await this.storageManager.saveSettings(this.settings);
    this.applySettings();
  }

  /**
   * Handle import bookmarks
   */
  handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const success = await this.storageManager.importData(event.target.result);
        
        if (success) {
          await this.bookmarkManager.loadBookmarks();
          await this.bookmarkManager.loadCollections();
          this.renderCollections();
          this.renderBookmarks();
          this.closeModal();
          alert('Bookmarks imported successfully!');
        } else {
          alert('Failed to import bookmarks. Invalid data format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }

  /**
   * Handle export bookmarks
   */
  async handleExport() {
    const data = await this.storageManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarkhub-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}