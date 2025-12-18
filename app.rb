require 'sinatra/base'
require 'sinatra/json'
require 'yaml'
require 'json'
require_relative 'lib/config_loader'

module LabDash
  class Application < Sinatra::Base
    set :public_folder, File.expand_path('public', __dir__)
    set :views, File.expand_path('views', __dir__)
    
    configure do
      config_path = ENV['CONFIG_PATH'] || './dashboard.yml'
      set :config_loader, ConfigLoader.new(config_path)
    end
    
    before do
      begin
        @config = settings.config_loader.load
      rescue => e
        halt 500, erb(:error, locals: { error: "Configuration error: #{e.message}" })
      end
    end
    
    get '/' do
      erb :dashboard, locals: { 
        config: @config,
        title: @config['title'] || 'LabDash',
        categories: @config['categories'] || []
      }
    end
    
    get '/api/services' do
      # Flatten services from all categories
      all_services = (@config['categories'] || []).flat_map { |cat| cat['services'] || [] }
      json all_services
    end
    
    get '/api/config' do
      json @config
    end
    
    get '/health' do
      json status: 'ok', timestamp: Time.now.iso8601
    end
    
    error 500 do
      'Internal Server Error'
    end
    
    run! if app_file == $0
  end
end
