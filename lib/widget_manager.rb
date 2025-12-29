require_relative 'widgets/base_widget'
require_relative 'widgets/qbittorrent_widget'
require_relative 'widgets/radarr_widget'
require_relative 'widgets/sonarr_widget'

module LabDash
  class WidgetManager
    WIDGET_CLASSES = {
      'qbittorrent' => Widgets::QBittorrentWidget,
      'radarr' => Widgets::RadarrWidget,
      'sonarr' => Widgets::SonarrWidget
    }.freeze
    
    def initialize(config)
      @widgets = []
      
      # Load widgets from configuration
      if config['widgets']
        config['widgets'].each do |widget_config|
          widget = create_widget(widget_config)
          @widgets << widget if widget
        end
      end
    end
    
    def enabled_widgets
      @widgets.select(&:enabled?)
    end
    
    def get_widget(name)
      @widgets.find { |w| w.name == name }
    end
    
    def fetch_all_data
      result = {}
      
      enabled_widgets.each do |widget|
        begin
          result[widget.name] = {
            data: widget.fetch_data,
            config: widget.display_config
          }
        rescue => e
          result[widget.name] = {
            data: { error: e.message },
            config: widget.display_config
          }
        end
      end
      
      result
    end
    
    def fetch_widget_data(name)
      widget = get_widget(name)
      return { error: 'Widget not found' } unless widget
      return { error: 'Widget not enabled' } unless widget.enabled?
      
      {
        data: widget.fetch_data,
        config: widget.display_config
      }
    rescue => e
      { error: e.message }
    end
    
    private
    
    def create_widget(config)
      type = config['type']&.downcase
      widget_class = WIDGET_CLASSES[type]
      
      if widget_class
        widget_class.new(config)
      else
        warn "Unknown widget type: #{type}"
        nil
      end
    end
  end
end
