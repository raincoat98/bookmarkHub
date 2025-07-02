/**
 * Content script for BookmarkHub extension
 * Executes in the context of web pages
 */

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'capturePageInfo') {
    // Get page information
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      description: getMetaDescription(),
      favicon: getFaviconUrl()
    };
    
    sendResponse(pageInfo);
  }
});

/**
 * Get meta description from page
 * @returns {string} - Page description or empty string
 */
function getMetaDescription() {
  const metaDescription = document.querySelector('meta[name="description"]');
  return metaDescription ? metaDescription.getAttribute('content') : '';
}

/**
 * Get favicon URL from page
 * @returns {string} - Favicon URL or empty string
 */
function getFaviconUrl() {
  const faviconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (faviconLink) {
    const faviconHref = faviconLink.getAttribute('href');
    if (faviconHref.startsWith('http')) {
      return faviconHref;
    } else {
      // Convert relative path to absolute
      return new URL(faviconHref, window.location.origin).href;
    }
  }
  
  // Default to standard favicon location if not found
  return window.location.origin + '/favicon.ico';
}