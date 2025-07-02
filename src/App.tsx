import { useState } from 'react'
import './App.css'

interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  collectionId: string;
  createdAt: string;
}

interface Collection {
  id: string;
  name: string;
  color: string;
}

type ViewType = 'grid' | 'list';

const defaultCollections: Collection[] = [
  { id: 'default', name: 'Default', color: '#007AFF' },
  { id: 'work', name: 'Work', color: '#5856D6' },
  { id: 'personal', name: 'Personal', color: '#FF2D55' }
];

const sampleBookmarks: Bookmark[] = [
  {
    id: '1',
    title: 'Google',
    url: 'https://google.com',
    favicon: 'https://www.google.com/favicon.ico',
    collectionId: 'default',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'GitHub',
    url: 'https://github.com',
    favicon: 'https://github.com/favicon.ico',
    collectionId: 'work',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'YouTube',
    url: 'https://youtube.com',
    favicon: 'https://www.youtube.com/favicon.ico',
    collectionId: 'personal',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    favicon: 'https://stackoverflow.com/favicon.ico',
    collectionId: 'work',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Netflix',
    url: 'https://netflix.com',
    favicon: 'https://netflix.com/favicon.ico',
    collectionId: 'personal',
    createdAt: new Date().toISOString()
  }
];

function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(sampleBookmarks)
  const [collections, setCollections] = useState<Collection[]>(defaultCollections)
  const [activeCollection, setActiveCollection] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewType, setViewType] = useState<ViewType>('grid')
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false)
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false)
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '', collectionId: 'default' })
  const [newCollection, setNewCollection] = useState({ name: '', color: '#007AFF' })

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesCollection = activeCollection === 'all' || bookmark.collectionId === activeCollection
    const matchesSearch = searchQuery === '' || 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCollection && matchesSearch
  })

  const getCollectionName = () => {
    if (activeCollection === 'all') return 'All Bookmarks'
    const collection = collections.find(c => c.id === activeCollection)
    return collection?.name || 'Bookmarks'
  }

  const getBookmarkCount = (collectionId: string) => {
    if (collectionId === 'all') return bookmarks.length
    return bookmarks.filter(b => b.collectionId === collectionId).length
  }

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBookmark.title || !newBookmark.url) return

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: newBookmark.title,
      url: newBookmark.url.startsWith('http') ? newBookmark.url : `https://${newBookmark.url}`,
      collectionId: newBookmark.collectionId,
      createdAt: new Date().toISOString()
    }

    setBookmarks([...bookmarks, bookmark])
    setNewBookmark({ title: '', url: '', collectionId: 'default' })
    setShowAddBookmarkModal(false)
  }

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCollection.name) return

    const collection: Collection = {
      id: Date.now().toString(),
      name: newCollection.name,
      color: newCollection.color
    }

    setCollections([...collections, collection])
    setNewCollection({ name: '', color: '#007AFF' })
    setShowAddCollectionModal(false)
  }

  const openBookmark = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <h1>BookmarkHub</h1>
          </div>
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={`view-toggle-btn ${viewType === 'grid' ? 'active' : ''}`}
                onClick={() => setViewType('grid')}
                title="Grid view"
              >
                <svg className="icon" viewBox="0 0 24 24" width="18" height="18">
                  <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3" />
                </svg>
              </button>
              <button 
                className={`view-toggle-btn ${viewType === 'list' ? 'active' : ''}`}
                onClick={() => setViewType('list')}
                title="List view"
              >
                <svg className="icon" viewBox="0 0 24 24" width="18" height="18">
                  <path d="M3,5H21V7H3V5M3,13V11H21V13H3M3,19V17H21V19H3Z" />
                </svg>
              </button>
            </div>
            <button className="icon-button" title="Settings">
              <svg className="icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
            <input
              type="text"
              placeholder="Search bookmarks..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Sidebar */}
        <div className="collections-sidebar">
          <div className="sidebar-header">
            <h2>Collections</h2>
            <button 
              className="icon-button" 
              title="Add collection"
              onClick={() => setShowAddCollectionModal(true)}
            >
              <svg className="icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            </button>
          </div>
          
          <ul className="collections-list">
            <li>
              <button
                className={`collection-item ${activeCollection === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCollection('all')}
              >
                <div className="collection-color" style={{ backgroundColor: '#8E8E93' }}></div>
                <span className="collection-name">All Bookmarks</span>
                <span className="collection-count">{getBookmarkCount('all')}</span>
              </button>
            </li>
            {collections.map(collection => (
              <li key={collection.id}>
                <button
                  className={`collection-item ${activeCollection === collection.id ? 'active' : ''}`}
                  onClick={() => setActiveCollection(collection.id)}
                >
                  <div className="collection-color" style={{ backgroundColor: collection.color }}></div>
                  <span className="collection-name">{collection.name}</span>
                  <span className="collection-count">{getBookmarkCount(collection.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bookmarks Container */}
        <div className={`bookmarks-container ${viewType}`}>
          <div className="bookmarks-header">
            <h2>{getCollectionName()}</h2>
            <button 
              className="primary-button"
              onClick={() => setShowAddBookmarkModal(true)}
            >
              <svg className="icon" viewBox="0 0 24 24" width="16" height="16">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Add Bookmark
            </button>
          </div>
          
          <div className={`bookmarks-${viewType}`}>
            {filteredBookmarks.length === 0 ? (
              <div className="empty-state">
                <p>No bookmarks found</p>
                <button 
                  className="secondary-button"
                  onClick={() => setShowAddBookmarkModal(true)}
                >
                  Add Bookmark
                </button>
              </div>
            ) : (
              filteredBookmarks.map(bookmark => {
                const collection = collections.find(c => c.id === bookmark.collectionId)
                return (
                  <div 
                    key={bookmark.id} 
                    className={`bookmark-card ${viewType}`}
                    onClick={() => openBookmark(bookmark.url)}
                  >
                    <div 
                      className="bookmark-thumbnail" 
                      style={{ borderTop: viewType === 'grid' ? `3px solid ${collection?.color || '#8E8E93'}` : 'none' }}
                    >
                      {bookmark.favicon ? (
                        <img src={bookmark.favicon} className="bookmark-favicon" alt="Favicon" />
                      ) : (
                        <div className="bookmark-favicon-placeholder">
                          <svg viewBox="0 0 24 24" width="24" height="24">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" fill="currentColor"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="bookmark-info">
                      <h3 className="bookmark-title">{bookmark.title}</h3>
                      <p className="bookmark-url">{new URL(bookmark.url).hostname}</p>
                      {viewType === 'list' && (
                        <div 
                          className="bookmark-collection-indicator"
                          style={{ backgroundColor: collection?.color || '#8E8E93' }}
                        ></div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* Add Bookmark Modal */}
      {showAddBookmarkModal && (
        <div className="modal-overlay" onClick={() => setShowAddBookmarkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Bookmark</h3>
              <button 
                className="icon-button"
                onClick={() => setShowAddBookmarkModal(false)}
              >
                <svg className="icon" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddBookmark} className="modal-content">
              <div className="form-group">
                <label htmlFor="bookmark-title">Title</label>
                <input
                  type="text"
                  id="bookmark-title"
                  value={newBookmark.title}
                  onChange={(e) => setNewBookmark({...newBookmark, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookmark-url">URL</label>
                <input
                  type="url"
                  id="bookmark-url"
                  value={newBookmark.url}
                  onChange={(e) => setNewBookmark({...newBookmark, url: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookmark-collection">Collection</label>
                <select
                  id="bookmark-collection"
                  value={newBookmark.collectionId}
                  onChange={(e) => setNewBookmark({...newBookmark, collectionId: e.target.value})}
                >
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setShowAddBookmarkModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Collection Modal */}
      {showAddCollectionModal && (
        <div className="modal-overlay" onClick={() => setShowAddCollectionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Collection</h3>
              <button 
                className="icon-button"
                onClick={() => setShowAddCollectionModal(false)}
              >
                <svg className="icon" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddCollection} className="modal-content">
              <div className="form-group">
                <label htmlFor="collection-name">Name</label>
                <input
                  type="text"
                  id="collection-name"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({...newCollection, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="collection-color">Color</label>
                <input
                  type="color"
                  id="collection-color"
                  value={newCollection.color}
                  onChange={(e) => setNewCollection({...newCollection, color: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setShowAddCollectionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App