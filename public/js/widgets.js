/**
 * Widget Management Module
 * Handles initialization, rendering, and updating of dashboard widgets
 */

const WidgetManager = {
  /**
   * Initialize widgets on page load
   */
  async initialize() {
    const widgetsContainer = document.getElementById('widgets-container');
    if (!widgetsContainer) return;
    
    try {
      const response = await fetch('/api/widgets');
      const widgetsData = await response.json();
      
      // Clear loading state
      widgetsContainer.innerHTML = '';
      
      // Render each widget
      Object.entries(widgetsData).forEach(([name, widget]) => {
        this.render(name, widget);
      });
    } catch (error) {
      console.error('Failed to load widgets:', error);
      widgetsContainer.innerHTML = '<div class="widget-error">Failed to load widgets</div>';
    }
  },

  /**
   * Render a single widget
   * @param {string} name - Widget identifier
   * @param {Object} widget - Widget configuration and data
   */
  render(name, widget) {
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
      contentHTML += this.renderData(widget.config?.type, widget.data);
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
  },

  /**
   * Render widget data based on type
   * @param {string} type - Widget type
   * @param {Object} data - Widget data
   * @returns {string} HTML string
   */
  renderData(type, data) {
    if (!data) return '<div class="widget-loading">Loading...</div>';
    
    const renderers = {
      qbittorrent: () => `
        ${this.renderStat('Download Speed', data.download_speed, true)}
        ${this.renderStat('Upload Speed', data.upload_speed, true)}
        ${this.renderStat('Active Downloads', data.active_downloads)}
        ${this.renderStat('Active Uploads', data.active_uploads)}
        ${this.renderStat('Total Torrents', data.total_torrents)}
        ${this.renderStat('Ratio', data.ratio)}
      `,
      
      radarr: () => `
        ${this.renderStat('Total Movies', data.total_movies)}
        ${this.renderStat('Downloaded', data.downloaded, true)}
        ${this.renderStat('Missing', data.missing)}
        ${this.renderStat('Upcoming', data.upcoming)}
        ${this.renderStat('In Queue', data.queue_count)}
        ${this.renderStat('Free Space', data.disk_space)}
      `,
      
      sonarr: () => `
        ${this.renderStat('Total Series', data.total_series)}
        ${this.renderStat('Episodes Downloaded', data.downloaded_episodes, true)}
        ${this.renderStat('Missing Episodes', data.missing_episodes)}
        ${this.renderStat('Upcoming Episodes', data.upcoming_episodes)}
        ${this.renderStat('In Queue', data.queue_count)}
        ${this.renderStat('Free Space', data.disk_space)}
      `,
      
      jellyfin: () => `
        ${this.renderStat('Server', data.server_name || 'Jellyfin')}
        ${this.renderStat('Movies', data.movie_count)}
        ${this.renderStat('Series', data.series_count)}
        ${this.renderStat('Episodes', data.episode_count)}
        ${this.renderStat('Albums', data.album_count)}
        ${this.renderStat('Songs', data.song_count)}
        ${this.renderStat('Active Streams', data.active_streams, true)}
      `,
      
      bazarr: () => `
        ${this.renderStat('Series Total', data.total_series)}
        ${this.renderStat('Series w/ Subs', data.series_with_subtitles, true)}
        ${this.renderStat('Series Missing', data.series_without_subtitles)}
        ${this.renderStat('Movies Total', data.total_movies)}
        ${this.renderStat('Movies w/ Subs', data.movies_with_subtitles, true)}
        ${this.renderStat('Movies Missing', data.movies_without_subtitles)}
      `,
      
      prowlarr: () => `
        ${this.renderStat('Total Indexers', data.total_indexers)}
        ${this.renderStat('Enabled', data.enabled_indexers, true)}
        ${this.renderStat('Disabled', data.disabled_indexers)}
        ${this.renderStat('Total Queries', data.total_queries)}
        ${this.renderStat('Total Grabs', data.total_grabs)}
        ${this.renderStat('Avg Response', data.average_response_time)}
      `,
      
      lidarr: () => `
        ${this.renderStat('Total Artists', data.total_artists)}
        ${this.renderStat('Monitored', data.monitored)}
        ${this.renderStat('Total Albums', data.total_albums)}
        ${this.renderStat('Tracks Downloaded', data.downloaded_tracks, true)}
        ${this.renderStat('Missing Tracks', data.missing_tracks)}
        ${this.renderStat('Upcoming Releases', data.upcoming_releases)}
        ${this.renderStat('Free Space', data.disk_space)}
      `
    };
    
    const renderer = renderers[type];
    return renderer ? renderer() : '<div class="widget-loading">Unknown widget type</div>';
  },

  /**
   * Render a single stat row
   * @param {string} label - Stat label
   * @param {*} value - Stat value
   * @param {boolean} highlight - Whether to highlight the value
   * @returns {string} HTML string
   */
  renderStat(label, value, highlight = false) {
    const valueClass = highlight ? 'widget-stat-value widget-stat-highlight' : 'widget-stat-value';
    return `
      <div class="widget-stat">
        <span class="widget-stat-label">${label}:</span>
        <span class="${valueClass}">${value || 'N/A'}</span>
      </div>
    `;
  },

  /**
   * Refresh all widgets with new data
   */
  async refresh() {
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
              contentDiv.innerHTML = this.renderData(widget.config?.type, widget.data);
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to refresh widgets:', error);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WidgetManager;
}
