/**
 * Service Status Module
 * Handles service status checking and display
 */

const ServiceMonitor = {
  statusElements: [],
  refreshInterval: 30000, // 30 seconds

  /**
   * Initialize service status monitoring
   */
  initialize() {
    this.statusElements = document.querySelectorAll('.service-status');
    
    // Check status for all services on load
    this.statusElements.forEach(element => {
      const statusUrl = element.dataset.statusUrl;
      if (statusUrl) {
        this.checkStatus(statusUrl, element);
      }
    });

    // Add click tracking to service cards
    this.initializeClickTracking();
  },

  /**
   * Check the status of a single service
   * @param {string} url - Service URL to check
   * @param {HTMLElement} element - Status element to update
   */
  async checkStatus(url, element) {
    const indicator = element.querySelector('.status-indicator');
    const text = element.querySelector('.status-text');
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      // With no-cors, we can't actually read the response, 
      // but if fetch completes, the service is likely reachable
      indicator.className = 'status-indicator status-online';
      text.textContent = 'Online';
    } catch (error) {
      // If fetch fails, service is likely offline
      indicator.className = 'status-indicator status-offline';
      text.textContent = 'Offline';
    }
  },

  /**
   * Refresh status for all services
   */
  refreshAll() {
    this.statusElements.forEach(element => {
      const statusUrl = element.dataset.statusUrl;
      if (statusUrl) {
        this.checkStatus(statusUrl, element);
      }
    });
  },

  /**
   * Initialize click tracking for analytics
   */
  initializeClickTracking() {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const serviceName = card.querySelector('.service-name')?.textContent;
        if (serviceName) {
          console.log(`Navigating to: ${serviceName}`);
        }
      });
    });
  },

  /**
   * Start automatic refresh
   */
  startAutoRefresh() {
    setInterval(() => {
      this.refreshAll();
    }, this.refreshInterval);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServiceMonitor;
}
