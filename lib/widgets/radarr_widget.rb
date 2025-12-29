require_relative 'base_widget'

module LabDash
  module Widgets
    class RadarrWidget < BaseWidget
      def fetch_data
        return { error: 'Widget not enabled' } unless enabled?
        
        # Get movies
        movies = http_get('/api/v3/movie')
        return movies if movies.is_a?(Hash) && movies[:error]
        
        # Get queue
        queue = http_get('/api/v3/queue')
        return queue if queue.is_a?(Hash) && queue[:error]
        
        # Calculate statistics
        total_movies = movies.count
        monitored_movies = movies.select { |m| m['monitored'] }.count
        downloaded_movies = movies.select { |m| m['hasFile'] }.count
        missing_movies = monitored_movies - downloaded_movies
        
        # Get upcoming movies (next 30 days)
        today = Time.now
        upcoming = movies.select do |m|
          release_date = m['inCinemas'] ? Time.parse(m['inCinemas']) : nil
          release_date && release_date > today && release_date < (today + (30 * 24 * 60 * 60))
        end
        
        {
          total_movies: total_movies,
          monitored: monitored_movies,
          downloaded: downloaded_movies,
          missing: missing_movies,
          upcoming: upcoming.count,
          queue_count: queue.is_a?(Hash) ? queue['totalRecords'] : 0,
          disk_space: format_bytes(get_disk_space)
        }
      rescue => e
        { error: e.message }
      end
      
      def icon
        '🎬'
      end
      
      def color
        '#ffc230'
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
