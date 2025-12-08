// Check service status for cards with status_url
document.addEventListener('DOMContentLoaded', () => {
  const statusElements = document.querySelectorAll('.service-status');
  
  statusElements.forEach(element => {
    const statusUrl = element.dataset.statusUrl;
    if (statusUrl) {
      checkServiceStatus(statusUrl, element);
    }
  });
  
  // Refresh status every 30 seconds
  setInterval(() => {
    statusElements.forEach(element => {
      const statusUrl = element.dataset.statusUrl;
      if (statusUrl) {
        checkServiceStatus(statusUrl, element);
      }
    });
  }, 30000);
});

async function checkServiceStatus(url, element) {
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
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    // Future: add search functionality
  }
});

// Service card click tracking (optional analytics)
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', (e) => {
    const serviceName = card.querySelector('.service-name')?.textContent;
    console.log(`Navigating to: ${serviceName}`);
  });
});
