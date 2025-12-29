/**
 * Main Application Entry Point
 * Coordinates initialization of all modules
 */

// Configuration
const APP_CONFIG = {
  refreshInterval: 30000 // 30 seconds
};

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('Initializing LabDash...');
  
  // Initialize all modules
  FilterManager.initialize();
  ServiceMonitor.initialize();
  WidgetManager.initialize();
  
  // Start auto-refresh for services and widgets
  setInterval(() => {
    ServiceMonitor.refreshAll();
    WidgetManager.refresh();
  }, APP_CONFIG.refreshInterval);
  
  // Setup keyboard shortcuts
  initializeKeyboardShortcuts();
  
  console.log('LabDash initialized successfully');
}

/**
 * Setup keyboard shortcuts
 */
function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Future: Add search functionality with '/' key
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      // TODO: Implement search functionality
    }
    
    // ESC to clear filters
    if (e.key === 'Escape') {
      FilterManager.clearFilters();
    }
  });
}

/**
 * Handle any global errors
 */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
