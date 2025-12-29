require_relative 'base_widget'

module LabDash
  module Widgets
    class ProwlarrWidget < BaseWidget
      def fetch_data
        return { error: 'Widget not enabled' } unless enabled?
        
        # Get indexers
        indexers = http_get('/api/v1/indexer')
        return indexers if indexers.is_a?(Hash) && indexers[:error]
        
        # Get indexer stats
        indexer_stats = http_get('/api/v1/indexerstats')
        return indexer_stats if indexer_stats.is_a?(Hash) && indexer_stats[:error]
        
        # Get system status
        status = http_get('/api/v1/system/status')
        return status if status.is_a?(Hash) && status[:error]
        
        # Count enabled indexers
        enabled_indexers = indexers.select { |i| i['enable'] || i['enabled'] }.count
        
        # Calculate stats
        total_queries = indexer_stats.is_a?(Array) ? indexer_stats.sum { |s| s['numberOfQueries'] || 0 } : 0
        total_grabs = indexer_stats.is_a?(Array) ? indexer_stats.sum { |s| s['numberOfGrabs'] || 0 } : 0
        
        {
          version: status['version'],
          total_indexers: indexers.count,
          enabled_indexers: enabled_indexers,
          disabled_indexers: indexers.count - enabled_indexers,
          total_queries: total_queries,
          total_grabs: total_grabs,
          average_response_time: calculate_avg_response_time(indexer_stats)
        }
      rescue => e
        { error: e.message }
      end
      
      def icon
        '🔍'
      end
      
      def color
        '#3a3f51'
      end
      
      private
      
      def calculate_avg_response_time(stats)
        return 'N/A' unless stats.is_a?(Array) && !stats.empty?
        
        total_time = stats.sum { |s| s['averageResponseTime'] || 0 }
        avg = total_time / stats.count
        
        "#{avg.round(0)}ms"
      end
    end
  end
end
