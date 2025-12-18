// Check service status for cards with status_url
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tag filter
  initializeTagFilter();
  
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

// Tag filter functionality
function initializeTagFilter() {
  const tagFilter = document.getElementById('tag-filter');
  if (!tagFilter) return;
  
  tagFilter.addEventListener('change', (e) => {
    const selectedTag = e.target.value;
    filterServicesByTag(selectedTag);
  });
}

function filterServicesByTag(tag) {
  const serviceCards = document.querySelectorAll('.service-card');
  const categorySections = document.querySelectorAll('.category-section');
  
  serviceCards.forEach(card => {
    const cardTags = card.dataset.tags || '';
    const tagsArray = cardTags.split(',').filter(t => t.trim());
    
    if (tag === '' || tagsArray.includes(tag)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Hide categories that have no visible services
  categorySections.forEach(section => {
    const visibleCards = section.querySelectorAll('.service-card:not([style*="display: none"])');
    if (visibleCards.length === 0) {
      section.style.display = 'none';
    } else {
      section.style.display = '';
    }
  });
}
