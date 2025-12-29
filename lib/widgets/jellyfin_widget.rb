require_relative 'base_widget'

module LabDash
  module Widgets
    class JellyfinWidget < BaseWidget
      def fetch_data
        return { error: 'Widget not enabled' } unless enabled?
        
        # Get system info
        system_info = http_get('/System/Info')
        return system_info if system_info.is_a?(Hash) && system_info[:error]
        
        # Get library statistics
        items_counts = http_get('/Items/Counts')
        return items_counts if items_counts.is_a?(Hash) && items_counts[:error]
        
        # Get active sessions
        sessions = http_get('/Sessions')
        sessions = [] if sessions.is_a?(Hash) && sessions[:error]
        
        # Count active streams
        active_streams = sessions.select { |s| s['NowPlayingItem'] }.count
        
        {
          server_name: system_info['ServerName'],
          version: system_info['Version'],
          movie_count: items_counts['MovieCount'] || 0,
          series_count: items_counts['SeriesCount'] || 0,
          episode_count: items_counts['EpisodeCount'] || 0,
          song_count: items_counts['SongCount'] || 0,
          album_count: items_counts['AlbumCount'] || 0,
          active_streams: active_streams,
          total_users: sessions.count
        }
      rescue => e
        { error: e.message }
      end
      
      def icon
        '🎬'
      end
      
      def color
        '#00a4dc'
      end
      
      protected
      
      def http_get(path, headers = {})
        uri = URI.join(@url, path)
        request = Net::HTTP::Get.new(uri)
        
        # Add API key header if configured
        if @api_key
          request['X-Emby-Token'] = @api_key
        end
        
        # Add custom headers
        headers.each { |k, v| request[k] = v }
        
        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https', open_timeout: 5, read_timeout: 5) do |http|
          http.request(request)
        end
        
        if response.is_a?(Net::HTTPSuccess)
          JSON.parse(response.body)
        else
          raise "HTTP Error: #{response.code} #{response.message}"
        end
      rescue => e
        { error: e.message }
      end
    end
  end
end
