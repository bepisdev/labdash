require 'yaml'

module LabDash
  class ConfigLoader
    attr_reader :config_path
    
    def initialize(config_path)
      @config_path = config_path
      @cache = nil
      @last_mtime = nil
    end
    
    def load
      return @cache if cached? && !modified?
      
      unless File.exist?(@config_path)
        raise "Configuration file not found: #{@config_path}"
      end
      
      config = YAML.load_file(@config_path)
      validate!(config)
      
      @cache = config
      @last_mtime = File.mtime(@config_path)
      @cache
    end
    
    private
    
    def cached?
      !@cache.nil?
    end
    
    def modified?
      return true unless @last_mtime
      File.mtime(@config_path) > @last_mtime
    rescue
      true
    end
    
    def validate!(config)
      raise "Configuration must be a hash" unless config.is_a?(Hash)
      
      # Validate services
      if config['services']
        raise "Services must be an array" unless config['services'].is_a?(Array)
        
        config['services'].each_with_index do |service, idx|
          raise "Service #{idx} must be a hash" unless service.is_a?(Hash)
          raise "Service #{idx} missing 'name'" unless service['name']
          raise "Service #{idx} missing 'url'" unless service['url']
        end
      end
      
      # Validate categories
      if config['categories']
        raise "Categories must be an array" unless config['categories'].is_a?(Array)
      end
      
      # Validate widgets
      if config['widgets']
        raise "Widgets must be an array" unless config['widgets'].is_a?(Array)
        
        config['widgets'].each_with_index do |widget, idx|
          raise "Widget #{idx} must be a hash" unless widget.is_a?(Hash)
          raise "Widget #{idx} missing 'name'" unless widget['name']
          raise "Widget #{idx} missing 'type'" unless widget['type']
          raise "Widget #{idx} missing 'url'" unless widget['url']
        end
      end
      
      true
    end
  end
end
