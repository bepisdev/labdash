require_relative 'base_widget'

module LabDash
  module Widgets
    class QBittorrentWidget < BaseWidget
      def fetch_data
        return { error: 'Widget not enabled' } unless enabled?
        
        # Authenticate if needed
        login if needs_authentication?
        
        # Get transfer info
        transfer_info = http_get('/api/v2/transfer/info')
        return transfer_info if transfer_info[:error]
        
        # Get torrents list
        torrents = http_get('/api/v2/torrents/info')
        return torrents if torrents.is_a?(Hash) && torrents[:error]
        
        # Calculate statistics
        active_downloads = torrents.select { |t| t['state'] == 'downloading' }.count
        active_uploads = torrents.select { |t| t['state'] == 'uploading' || t['state'] == 'seeding' }.count
        
        {
          download_speed: format_bytes(transfer_info['dl_info_speed']),
          upload_speed: format_bytes(transfer_info['up_info_speed']),
          total_torrents: torrents.count,
          active_downloads: active_downloads,
          active_uploads: active_uploads,
          downloaded: format_bytes(transfer_info['dl_info_data']),
          uploaded: format_bytes(transfer_info['up_info_data']),
          ratio: transfer_info['up_info_data'] > 0 ? (transfer_info['up_info_data'].to_f / transfer_info['dl_info_data']).round(2) : 0
        }
      rescue => e
        { error: e.message }
      end
      
      def icon
        '⬇️'
      end
      
      def color
        '#2b5278'
      end
      
      private
      
      def needs_authentication?
        @config['username'] && @config['password']
      end
      
      def login
        # qBittorrent authentication would go here
        # This is a simplified version
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
        
        "#{size.round(2)} #{units[index]}/s"
      end
    end
  end
end
