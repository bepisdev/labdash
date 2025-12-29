require_relative 'base_widget'

module LabDash
  module Widgets
    class BazarrWidget < BaseWidget
      def fetch_data
        return { error: 'Widget not enabled' } unless enabled?
        
        # Get system status
        status = http_get('/api/system/status')
        return status if status.is_a?(Hash) && status[:error]
        
        # Get series stats
        series_stats = http_get('/api/series/stats')
        series_stats = {} if series_stats.is_a?(Hash) && series_stats[:error]
        
        # Get movies stats
        movies_stats = http_get('/api/movies/stats')
        movies_stats = {} if movies_stats.is_a?(Hash) && movies_stats[:error]
        
        # Get queue/history count
        history = http_get('/api/history?page=1&pageSize=1')
        history = {} if history.is_a?(Hash) && history[:error]
        
        {
          version: status['bazarr_version'] || status['version'],
          total_series: series_stats['total'] || 0,
          series_with_subtitles: series_stats['with_subtitle'] || 0,
          series_without_subtitles: series_stats['without_subtitle'] || 0,
          total_movies: movies_stats['total'] || 0,
          movies_with_subtitles: movies_stats['with_subtitle'] || 0,
          movies_without_subtitles: movies_stats['without_subtitle'] || 0,
          total_history: history['total'] || 0
        }
      rescue => e
        { error: e.message }
      end
      
      def icon
        '💬'
      end
      
      def color
        '#6772e5'
      end
    end
  end
end
