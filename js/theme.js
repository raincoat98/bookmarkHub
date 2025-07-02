/**
 * ThemeManager - Manages theme preferences
 */
export class ThemeManager {
  constructor() {
    this.currentTheme = 'system';
    this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Initialize theme manager
   */
  async initialize() {
    // Get stored theme
    const settings = await chrome.storage.local.get('settings');
    if (settings.settings && settings.settings.theme) {
      this.currentTheme = settings.settings.theme;
    }
    
    // Set up system theme change detection
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.systemPrefersDark = e.matches;
      if (this.currentTheme === 'system') {
        this.applyTheme();
      }
    });
    
    // Apply theme
    this.applyTheme();
  }

  /**
   * Apply current theme to document
   */
  applyTheme() {
    let isDark = false;
    
    if (this.currentTheme === 'system') {
      isDark = this.systemPrefersDark;
    } else if (this.currentTheme === 'dark') {
      isDark = true;
    }
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Update toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = isDark 
        ? '<svg class="icon" viewBox="0 0 24 24" width="20" height="20"><path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>'
        : '<svg class="icon" viewBox="0 0 24 24" width="20" height="20"><path d="M12,18C8.68,18 6,15.32 6,12C6,8.68 8.68,6 12,6C15.32,6 18,8.68 18,12C18,15.32 15.32,18 12,18ZM12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4Z" /></svg>';
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    if (this.currentTheme === 'light') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  /**
   * Set specific theme
   * @param {string} theme - Theme to set ('light', 'dark', or 'system')
   */
  async setTheme(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) {
      return;
    }
    
    this.currentTheme = theme;
    
    // Save theme preference
    const settings = await chrome.storage.local.get('settings');
    const updatedSettings = settings.settings || {};
    updatedSettings.theme = theme;
    await chrome.storage.local.set({ settings: updatedSettings });
    
    // Apply theme
    this.applyTheme();
  }
}