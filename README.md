# LabDash 🚀

A lightweight, configurable homelab dashboard built with Ruby and Sinatra. Designed to be deployed as a Docker container with simple YAML-based configuration.

## Features

- 🎨 Modern, responsive dark theme UI
- 📝 Simple YAML configuration
- 🐳 Docker-ready with easy deployment
- 🔄 Service status monitoring
- 📂 Category organization
- 🏷️ Service tagging
- 🔍 Custom icons support
- ⚡ Fast and lightweight
- 📊 Optional widgets for qBittorrent, Radarr, Sonarr, and more

## Quick Start

### Using Docker Compose (Recommended)

1. Create a `dashboard.yml` configuration file (see example below)

2. Run with docker-compose:
```bash
docker-compose up -d
```

3. Access your dashboard at `http://localhost:4567`

### Using Docker

```bash
docker build -t labdash .
docker run -d -p 4567:4567 -v $(pwd)/dashboard.yml:/config/dashboard.yml:ro labdash
```

### Local Development

1. Install dependencies:
```bash
bundle install
```

2. Create your `dashboard.yml` configuration file

3. Run the application:
```bash
bundle exec rackup --host 0.0.0.0 --port 4567
```

Or with auto-reload for development:
```bash
bundle exec rerun 'rackup --host 0.0.0.0 --port 4567'
```

## Configuration

Create a `dashboard.yml` file to configure your dashboard. Here's a complete example:

```yaml
title: "My Homelab"
subtitle: "Central Hub for All Services"

categories:
  - name: "Media"
    description: "Entertainment and media services"
  - name: "Automation"
    description: "Home automation and monitoring"
  - name: "Infrastructure"
    description: "Core infrastructure services"
  - name: "Development"
    description: "Development tools and services"

# Optional widgets for displaying real-time data
widgets:
  - name: "qBittorrent Stats"
    type: "qbittorrent"
    url: "http://qbittorrent.local:8080"
    enabled: true
    # Optional authentication
    # username: "admin"
    # password: "adminpass"

  - name: "Radarr Library"
    type: "radarr"
    url: "http://radarr.local:7878"
    api_key: "your_radarr_api_key_here"
    enabled: true

  - name: "Sonarr Library"
    type: "sonarr"
    url: "http://sonarr.local:8989"
    api_key: "your_sonarr_api_key_here"
    enabled: true

services:
  # Media Services
  - name: "Plex"
    url: "http://plex.local:32400"
    description: "Media streaming server"
    category: "Media"
    icon: "https://www.plex.tv/wp-content/uploads/2022/04/plex-icon.svg"
    status_url: "http://plex.local:32400/web"
    tags: ["streaming", "movies", "tv"]

  - name: "Jellyfin"
    url: "http://jellyfin.local:8096"
    description: "Free media streaming"
    category: "Media"
    status_url: "http://jellyfin.local:8096"
    tags: ["streaming", "media"]

  - name: "Sonarr"
    url: "http://sonarr.local:8989"
    description: "TV show management"
    category: "Media"
    status_url: "http://sonarr.local:8989"
    tags: ["automation", "tv"]

  - name: "Radarr"
    url: "http://radarr.local:7878"
    description: "Movie management"
    category: "Media"
    status_url: "http://radarr.local:7878"
    tags: ["automation", "movies"]

  # Automation
  - name: "Home Assistant"
    url: "http://homeassistant.local:8123"
    description: "Home automation platform"
    category: "Automation"
    status_url: "http://homeassistant.local:8123"
    tags: ["smart-home", "automation"]

  - name: "Grafana"
    url: "http://grafana.local:3000"
    description: "Monitoring dashboards"
    category: "Automation"
    status_url: "http://grafana.local:3000"
    tags: ["monitoring", "metrics"]

  # Infrastructure
  - name: "Proxmox"
    url: "https://proxmox.local:8006"
    description: "Virtualization platform"
    category: "Infrastructure"
    tags: ["virtualization", "management"]

  - name: "TrueNAS"
    url: "http://truenas.local"
    description: "Network storage"
    category: "Infrastructure"
    status_url: "http://truenas.local"
    tags: ["storage", "nas"]

  - name: "Pi-hole"
    url: "http://pihole.local/admin"
    description: "Network-wide ad blocking"
    category: "Infrastructure"
    status_url: "http://pihole.local/admin"
    tags: ["dns", "ad-blocking"]

  # Development
- `widgets` (array, optional): Optional widgets for displaying real-time data

#### Service Options
- `name` (string, required): Service name
- `url` (string, required): Service URL
- `description` (string, optional): Service description
- `category` (string, optional): Category name (must match a defined category)
- `icon` (string, optional): URL to service icon
- `status_url` (string, optional): URL to check for service status
- `tags` (array, optional): List of tags for the service

#### Widget Options
- `name` (string, required): Widget display name
- `type` (string, required): Widget type (`qbittorrent`, `radarr`, `sonarr`, `jellyfin`, `bazarr`, `prowlarr`, or `lidarr`)
- `url` (string, required): Service URL
- `enabled` (boolean, optional): Enable/disable widget (default: `true`)
- `api_key` (string, optional): API key for authenticated services (Radarr, Sonarr, Jellyfin, Bazarr, Prowlarr, Lidarr)
- `username` (string, optional): Username for basic auth (qBittorrent)
- `password` (string, optional): Password for basic auth (qBittorrent)

### Available Widgets

#### qBittorrent Widget
Displays download/upload speeds, active torrents, and ratio statistics.

```yaml
widgets:
  - name: "Torrent Stats"
    type: "qbittorrent"
    url: "http://localhost:8080"
    enabled: true
```

#### Radarr Widget
Shows movie library statistics including total movies, downloads, and upcoming releases.

```yaml
widgets:
  - name: "Movies"
    type: "radarr"
    url: "http://localhost:7878"
    api_key: "your_api_key"
    enabapi/widgets` - All widget data
- `GET /api/widgets/:name` - Specific widget data
- `GET /led: true
```

#### Sonarr Widget
Displays TV series statistics including episodes, upcoming shows, and queue status.

```yaml
widgets:
  - name: "TV Shows"
    type: "sonarr"
    url: "http://localhost:8989"
    api_key: "your_api_key"
    enabled: true
```

#### Jellyfin Widget
Shows Jellyfin media server statistics including movies, series, albums, and active streams.

```yaml
widgets:
  - name: "Media Server"
    type: "jellyfin"
    url: "http://localhost:8096"
    api_key: "your_api_key"
    enabled: true
```

#### Bazarr Widget
Displays subtitle management statistics for movies and series.

```yaml
widgets:
  - name: "Subtitles"
    type: "bazarr"
    url: "http://localhost:6767"
    api_key: "your_api_key"
    enabled: true
```

#### Prowlarr Widget
Shows indexer manager statistics including total queries, grabs, and response times.

```yaml
widgets:
  - name: "Indexers"
    type: "prowlarr"
    url: "http://localhost:9696"
    api_key: "your_api_key"
    enabled: true
```

#### Lidarr Widget
Displays music library statistics including artists, albums, tracks, and upcoming releases.

```yaml
widgets:
  - name: "Music Library"
    type: "lidarr"
    url: "http://localhost:8686"
    api_key: "your_api_key"
    enabled: true
```

## Environment Variables

- `CONFIG_PATH`: Path to configuration file (default: `./dashboard.yml`)
- `RACK_ENV`: Environment mode (`production` or `development`)

## API Endpoints

- `GET /` - Dashboard homepage
- `GET /api/services` - JSON list of all services
- `GET /api/config` - Full configuration JSON
- `GET /api/widgets` - All widget data
- `GET /api/widgets/:name` - Specific widget data
- `GET /health` - Health check endpoint

## Deployment Examples

### Docker Compose with Custom Port

```yaml
version: '3.8'

services:
  labdash:
    image: labdash:latest
    container_name: labdash
    ports:
      - "8080:4567"
    volumes:
      - ./dashboard.yml:/config/dashboard.yml:ro
    environment:
      - CONFIG_PATH=/config/dashboard.yml
    restart: unless-stopped
```

### Behind a Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;

    location / {
        proxy_pass http://localhost:4567;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Project Structure

```
labdash/
├── app.rb                 # Main application
├── config.ru             # Rack configuration
├── Gemfile               # Ruby dependencies
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
├── dashboard.yml         # Your configuration (create this)
├── lib/
│   ├── config_loader.rb  # Configuration loader
│   ├── widget_manager.rb # Widget management
│   └── widgets/
│       ├── base_widget.rb         # Base widget class
│       ├── qbittorrent_widget.rb  # qBittorrent widget
│       ├── radarr_widget.rb       # Radarr widget
│       ├── sonarr_widget.rb       # Sonarr widget
│       ├── jellyfin_widget.rb     # Jellyfin widget
│       ├── bazarr_widget.rb       # Bazarr widget
│       ├── prowlarr_widget.rb     # Prowlarr widget
│       └── lidarr_widget.rb       # Lidarr widget
├── views/
│   ├── dashboard.erb     # Main dashboard view
│   ├── service_card.erb  # Service card partial
│   └── error.erb         # Error page
└── public/
    ├── css/              # Modular stylesheets
    │   ├── base.css          # Variables, resets, foundational styles
    │   ├── layout.css        # Container, header, footer, grids
    │   ├── components.css    # Toolbar, filters, tags, errors
    │   ├── services.css      # Service card styles
    │   └── widgets.css       # Widget card styles
    └── js/               # Modular JavaScript
        ├── filters.js        # Tag filtering functionality
        ├── services.js       # Service status monitoring
        ├── widgets.js        # Widget management
        └── main.js           # Application initialization
```

## Architecture

### Frontend Modules

The frontend is organized into modular JavaScript and CSS files for better maintainability:

**JavaScript Modules:**
- `filters.js` - Handles tag filtering and search functionality
- `services.js` - Manages service status monitoring and health checks
- `widgets.js` - Widget initialization, rendering, and data refresh
- `main.js` - Application entry point and coordination

**CSS Modules:**
- `base.css` - CSS variables, resets, and foundational styles
- `layout.css` - Container, header, footer, and grid layouts
- `components.css` - Reusable components (toolbar, filters, tags)
- `services.css` - Service card specific styles
- `widgets.css` - Widget card specific styles

### Backend Structure

The Ruby backend uses Sinatra for routing with a modular widget system:
- `ConfigLoader` - Validates and loads YAML configuration
- `WidgetManager` - Manages widget lifecycle and data fetching
- `BaseWidget` - Parent class for all widgets with common HTTP functionality
- Individual widget classes - Each service integration (qBittorrent, Radarr, etc.)

## Development

### Running Tests (Future)
```bash
bundle exec rake test
```

### Building the Docker Image
```bash
docker build -t labdash:latest .
```

### Code Style
The project follows standard Ruby conventions. Keep it clean and simple!

## Troubleshooting

### Configuration Errors
If you see a configuration error, check:
- YAML syntax is valid
- All required fields are present (`name` and `url` for services)
- Categories referenced in services are defined

### Services Not Loading
- Verify the `dashboard.yml` file is mounted correctly
- Check logs: `docker logs labdash`
- Ensure the file has read permissions

### Status Checks Not Working
Status checks use client-side requests and may be blocked by CORS policies. This is normal for cross-origin requests.

## License

MIT License - Feel free to use and modify as needed!

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## Acknowledgments

Inspired by [Homepage](https://github.com/gethomepage/homepage) and [Organizr](https://github.com/causefx/Organizr).

---

Built with ❤️ using Ruby and Sinatra
