// Check service status for cards with status_url
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tag filter
  initializeTagFilter();
  
  // Initialize widgets
  initializeWidgets();
  
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
    
    // Refresh widgets
    refreshWidgets();
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
 

// Widget functionality
async function initializeWidgets() {
  const widgetsContainer = document.getElementById('widgets-container');
  if (!widgetsContainer) return;
  
  try {
    const response = await fetch('/api/widgets');
    const widgetsData = await response.json();
    
    // Clear loading state
    widgetsContainer.innerHTML = '';
    
    // Render each widget
    Object.entries(widgetsData).forEach(([name, widget]) => {
      renderWidget(name, widget);
    });
  } catch (error) {
    console.error('Failed to load widgets:', error);
    widgetsContainer.innerHTML = '<div class="widget-error">Failed to load widgets</div>';
  }
}

function renderWidget(name, widget) {
  const widgetsContainer = document.getElementById('widgets-container');
  if (!widgetsContainer) return;
  
  const widgetCard = document.createElement('div');
  widgetCard.className = 'widget-card';
  widgetCard.dataset.widgetName = name;
  
  const icon = widget.config?.icon || '📊';
  const displayName = widget.config?.name || name;
  
  let contentHTML = '';
  
  if (widget.data?.error) {
    contentHTML = `<div class="widget-error">Error: ${widget.data.error}</div>`;
  } else {
    contentHTML = '<div class="widget-content">';
    contentHTML += renderWidgetData(widget.config?.type, widget.data);
    contentHTML += '</div>';
  }
  
  widgetCard.innerHTML = `
    <div class="widget-header">
      <div class="widget-title-wrapper">
        <span class="widget-icon">${icon}</span>
        <h3 class="widget-title">${displayName}</h3>
      </div>
    </div>
    ${contentHTML}
  `;
  
  widgetsContainer.appendChild(widgetCard);
}

function renderWidgetData(type, data) {
  if (!data) return '<div class="widget-loading">Loading...</div>';
  
  let html = '';
  
  switch(type) {
    case 'qbittorrent':
      html += renderStat('Download Speed', data.download_speed, true);
      html += renderStat('Upload Speed', data.upload_speed, true);
      html += renderStat('Active Downloads', data.active_downloads);
      html += renderStat('Active Uploads', data.active_uploads);
      html += renderStat('Total Torrents', data.total_torrents);
      html += renderStat('Ratio', data.ratio);
      break;
      
    case 'radarr':
      html += renderStat('Total Movies', data.total_movies);
      html += renderStat('Downloaded', data.downloaded, true);
      html += renderStat('Missing', data.missing);
      html += renderStat('Upcoming', data.upcoming);
      html += renderStat('In Queue', data.queue_count);
      html += renderStat('Free Space', data.disk_space);
      break;
      
    case 'sonarr':
      html += renderStat('Total Series', data.total_series);
      html += renderStat('Episodes Downloaded', data.downloaded_episodes, true);
      html += renderStat('Missing Episodes', data.missing_episodes);
      html += renderStat('Upcoming Episodes', data.upcoming_episodes);
      html += renderStat('In Queue', data.queue_count);
      html += renderStat('Free Space', data.disk_space);
      break;
      
    case 'jellyfin':
      html += renderStat('Server', data.server_name || 'Jellyfin');
      html += renderStat('Movies', data.movie_count);
      html += renderStat('Series', data.series_count);
      html += renderStat('Episodes', data.episode_count);
      html += renderStat('Albums', data.album_count);
      html += renderStat('Songs', data.song_count);
      html += renderStat('Active Streams', data.active_streams, true);
      break;
      
    case 'bazarr':
      html += renderStat('Series Total', data.total_series);
      html += renderStat('Series w/ Subs', data.series_with_subtitles, true);
      html += renderStat('Series Missing', data.series_without_subtitles);
      html += renderStat('Movies Total', data.total_movies);
      html += renderStat('Movies w/ Subs', data.movies_with_subtitles, true);
      html += renderStat('Movies Missing', data.movies_without_subtitles);
      break;
      
    case 'prowlarr':
      html += renderStat('Total Indexers', data.total_indexers);
      html += renderStat('Enabled', data.enabled_indexers, true);
      html += renderStat('Disabled', data.disabled_indexers);
      html += renderStat('Total Queries', data.total_queries);
      html += renderStat('Total Grabs', data.total_grabs);
      html += renderStat('Avg Response', data.average_response_time);
      break;
      
    case 'lidarr':
      html += renderStat('Total Artists', data.total_artists);
      html += renderStat('Monitored', data.monitored);
      html += renderStat('Total Albums', data.total_albums);
      html += renderStat('Tracks Downloaded', data.downloaded_tracks, true);
      html += renderStat('Missing Tracks', data.missing_tracks);
      html += renderStat('Upcoming Releases', data.upcoming_releases);
      html += renderStat('Free Space', data.disk_space);
      break;
      
    default:
      html = '<div class="widget-loading">Unknown widget type</div>';
  }
  
  return html;
}

function renderStat(label, value, highlight = false) {
  const valueClass = highlight ? 'widget-stat-value widget-stat-highlight' : 'widget-stat-value';
  return `
    <div class="widget-stat">
      <span class="widget-stat-label">${label}:</span>
      <span class="${valueClass}">${value || 'N/A'}</span>
    </div>
  `;
}

async function refreshWidgets() {
  const widgetsContainer = document.getElementById('widgets-container');
  if (!widgetsContainer) return;
  
  try {
    const response = await fetch('/api/widgets');
    const widgetsData = await response.json();
    
    // Update each existing widget
    Object.entries(widgetsData).forEach(([name, widget]) => {
      const widgetCard = widgetsContainer.querySelector(`[data-widget-name="${name}"]`);
      if (widgetCard) {
        const contentDiv = widgetCard.querySelector('.widget-content');
        if (contentDiv) {
          if (widget.data?.error) {
            contentDiv.innerHTML = `<div class="widget-error">Error: ${widget.data.error}</div>`;
          } else {
            contentDiv.innerHTML = renderWidgetData(widget.config?.type, widget.data);
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to refresh widgets:', error);
  }
}
     section.style.display = '';
    }
  });
}
