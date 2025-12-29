require_relative 'base_widget'

module LabDash
  module Widgets
    class LidarrWidget < BaseWidget
      def fetch_data
        return { error: 'Widget not enabled' } unless enabled?
        
        # Get artists
        artists = http_get('/api/v1/artist')
        return artists if artists.is_a?(Hash) && artists[:error]
        
        # Get queue
        queue = http_get('/api/v1/queue')
        return queue if queue.is_a?(Hash) && queue[:error]
        
        # Get calendar (upcoming releases - next 30 days)
        today = Time.now.strftime('%Y-%m-%d')
        end_date = (Time.now + (30 * 24 * 60 * 60)).strftime('%Y-%m-%d')
        calendar = http_get("/api/v1/calendar?start=#{today}&end=#{end_date}")
        calendar = [] if calendar.is_a?(Hash) && calendar[:error]
        
        # Calculate statistics
        total_artists = artists.count
        monitored_artists = artists.select { |a| a['monitored'] }.count
        
        total_albums = artists.sum { |a| a['statistics']&.dig('albumCount') || 0 }
        total_tracks = artists.sum { |a| a['statistics']&.dig('trackCount') || 0 }
        downloaded_tracks = artists.sum { |a| a['statistics']&.dig('trackFileCount') || 0 }
        missing_tracks = total_tracks - downloaded_tracks
        
        {
          total_artists: total_artists,
          monitored: monitored_artists,
          total_albums: total_albums,
          total_tracks: total_tracks,
          downloaded_tracks: downloaded_tracks,
          missing_tracks: missing_tracks,
          upcoming_releases: calendar.count,
          queue_count: queue.is_a?(Hash) ? queue['totalRecords'] : 0,
          disk_space: format_bytes(get_disk_space)
        }
      rescue => e
        { error: e.message }
      end
      
      def icon
        '🎵'
      end
      
      def color
        '#159552'
      end
      
      private
      
      def get_disk_space
        disk_info = http_get('/api/v1/diskspace')
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
