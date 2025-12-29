require 'net/http'
require 'json'
require 'uri'

module LabDash
  module Widgets
    class BaseWidget
      attr_reader :config, :name, :type
      
      def initialize(config)
        @config = config
        @name = config['name']
        @type = config['type']
        @url = config['url']
        @api_key = config['api_key']
        @enabled = config['enabled'] != false
      end
      
      def enabled?
        @enabled
      end
      
      # Method to be implemented by each widget
      def fetch_data
        raise NotImplementedError, "#{self.class} must implement fetch_data method"
      end
      
      # Get the widget's display configuration
      def display_config
        {
          name: @name,
          type: @type,
          enabled: @enabled,
          icon: icon,
          color: color
        }
      end
      
      protected
      
      # Helper method to make HTTP requests
      def http_get(path, headers = {})
        uri = URI.join(@url, path)
        request = Net::HTTP::Get.new(uri)
        
        # Add API key header if configured
        if @api_key
          request['X-Api-Key'] = @api_key
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
      
      # Default icon (override in subclasses)
      def icon
        'widget'
      end
      
      # Default color (override in subclasses)
      def color
        '#333333'
      end
    end
  end
end
