require_relative 'base_widget'

module LabDash
  module Widgets
    class SonarrWidget < BaseWidget
      def fetch_data
        return { error: 'Widget not enabled' } unless enabled?
        
        # Get series
        series = http_get('/api/v3/series')
        return series if series.is_a?(Hash) && series[:error]
        
        # Get queue
        queue = http_get('/api/v3/queue')
        return queue if queue.is_a?(Hash) && queue[:error]
        
        # Get calendar (upcoming episodes)
        today = Time.now.strftime('%Y-%m-%d')
        end_date = (Time.now + (7 * 24 * 60 * 60)).strftime('%Y-%m-%d')
        calendar = http_get("/api/v3/calendar?start=#{today}&end=#{end_date}")
        calendar = [] if calendar.is_a?(Hash) && calendar[:error]
        
        # Calculate statistics
        total_series = series.count
        monitored_series = series.select { |s| s['monitored'] }.count
        
        total_episodes = series.sum { |s| s['statistics']&.dig('episodeCount') || 0 }
        downloaded_episodes = series.sum { |s| s['statistics']&.dig('episodeFileCount') || 0 }
        missing_episodes = series.sum { |s| s['statistics']&.dig('episodeCount').to_i - s['statistics']&.dig('episodeFileCount').to_i }
        
        {
          total_series: total_series,
          monitored: monitored_series,
          total_episodes: total_episodes,
          downloaded_episodes: downloaded_episodes,
          missing_episodes: missing_episodes,
          upcoming_episodes: calendar.count,
          queue_count: queue.is_a?(Hash) ? queue['totalRecords'] : 0,
          disk_space: format_bytes(get_disk_space)
        }
      rescue => e
        { error: e.message }
      end
      
      def icon
        '📺'
      end
      
      def color
        '#3a3f51'
      end
      
      private
      
      def get_disk_space
        disk_info = http_get('/api/v3/diskspace')
        return 0 if disk_info.is_a?(Hash) && disk_info[:error]
        
        disk_info.first&.dig('freeSpace') || 0
      end
      
      def format_bytes(bytes)
        return '0 B' if bytes.nil? || bytes == 0
        
        units = ['B', 'KB', 'MB', 'GB', 'TB']
        index = 0
        size = bytes.to_f
        
        while size >= 1024 && index < units.length - 1
          size /= 1024
          index += 1
        end
        
        "#{size.round(2)} #{units[index]}"
      end
    end
  end
end
