# LabDash 🚀

A lightweight, configurable homelab dashboard built with Ruby and Sinatra. Designed to be deployed as a Docker container with simple YAML-based configuration.

![LabDash](https://img.shields.io/badge/status-active-success)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🎨 Modern, responsive dark theme UI
- 📝 Simple YAML configuration
- 🐳 Docker-ready with easy deployment
- 🔄 Service status monitoring
- 📂 Category organization
- 🏷️ Service tagging and filtering
- 🔍 Custom icons support
- ⚡ Fast and lightweight
- 📊 Optional widgets for qBittorrent, Radarr, Sonarr, Jellyfin, Bazarr, Prowlarr, and Lidarr

## Installation

### Using Docker Compose (Recommended)

1. Create a `dashboard.yml` configuration file (see Configuration section below)

2. Create a `docker-compose.yml`:
```yaml
version: '3.8'

services:
  labdash:
    image: bepisdev/labdash:latest
    container_name: labdash
    ports:
      - "4567:4567"
    volumes:
      - ./dashboard.yml:/config/dashboard.yml:ro
    environment:
      - CONFIG_PATH=/config/dashboard.yml
      - RACK_ENV=production
    restart: unless-stopped
```

3. Start the service:
```bash
docker-compose up -d
```

4. Access your dashboard at `http://localhost:4567`

### Using Docker

```bash
docker run -d \
  --name labdash \
  -p 4567:4567 \
  -v $(pwd)/dashboard.yml:/config/dashboard.yml:ro \
  -e CONFIG_PATH=/config/dashboard.yml \
  -e RACK_ENV=production \
  bepisdev/labdash:latest
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

## Quick Start

Get up and running in 2 minutes with this minimal configuration:

**dashboard.yml:**
```yaml
title: "My Homelab"
subtitle: "All my services in one place"

categories:
  - name: "Media"
    services:
      - name: "Plex"
        url: "http://192.168.1.100:32400"
        description: "Movie & TV streaming"
        tags: ["streaming", "media"]

  - name: "Infrastructure"
    services:
      - name: "Portainer"
        url: "http://192.168.1.100:9000"
        description: "Docker management"
        tags: ["docker"]
```

Then run:
```bash
docker-compose up -d
```

## Configuration

### Basic Settings

```yaml
# Dashboard Settings (Required)
title: "My Homelab Dashboard"
subtitle: "Central hub for all your services"  # Optional
background_image: "https://example.com/bg.jpg"  # Optional

# Categories (Optional but recommended)
categories:
  - name: "Media"
    description: "Entertainment and media services"
    services:
      - name: "Service Name"
        url: "http://service-url:port"
        description: "Service description"
        icon: "https://example.com/icon.svg"  # Optional
        status_url: "http://service-url:port"  # Optional, defaults to url
        tags: ["tag1", "tag2"]  # Optional
```

### Configuration Options

#### Dashboard Settings
- `title` (required): Main dashboard title
- `subtitle` (optional): Dashboard subtitle
- `background_image` (optional): URL to background image

#### Categories
- `name` (required): Category name
- `description` (optional): Category description
- `services` (array): List of services in this category

#### Service Options
- `name` (required): Service name
- `url` (required): Service URL
- `description` (optional): Service description
- `icon` (optional): URL to custom icon
- `status_url` (optional): URL for status checks (defaults to `url`)
- `tags` (array, optional): Tags for filtering

### Widgets

Add real-time statistics from your services:

```yaml
widgets:
  - name: "Torrent Stats"
    type: "qbittorrent"
    url: "http://localhost:8080"
    username: "admin"  # Optional
    password: "adminpass"  # Optional
    enabled: true

  - name: "Movies"
    type: "radarr"
    url: "http://localhost:7878"
    api_key: "your_api_key_here"
    enabled: true

  - name: "TV Shows"
    type: "sonarr"
    url: "http://localhost:8989"
    api_key: "your_api_key_here"
    enabled: true
```

**Supported widget types:**
- `qbittorrent` - Download/upload stats
- `radarr` - Movie library statistics
- `sonarr` - TV show library statistics
- `jellyfin` - Media server statistics
- `bazarr` - Subtitle management
- `prowlarr` - Indexer manager stats
- `lidarr` - Music library statistics

**Widget Options:**
- `name` (required): Display name
- `type` (required): Widget type
- `url` (required): Service URL
- `enabled` (optional): Enable/disable (default: true)
- `api_key` (optional): Required for most widgets except qBittorrent
- `username` (optional): For basic auth (qBittorrent)
- `password` (optional): For basic auth (qBittorrent)

### Environment Variables

- `CONFIG_PATH`: Path to configuration file (default: `./dashboard.yml`)
- `RACK_ENV`: Environment mode (`production` or `development`)

## Complete Configuration Example

```yaml
title: "My Homelab Dashboard"
subtitle: "Central hub for all your services"
background_image: "https://w.wallhaven.cc/full/ne/wallhaven-nevkvw.jpg"

categories:
  - name: "Media"
    description: "Entertainment and media services"
    services:
      - name: "Plex"
        url: "http://192.168.1.100:32400"
        description: "Media streaming server"
        icon: "https://www.plex.tv/wp-content/uploads/2022/04/plex-icon.svg"
        tags: ["streaming", "movies", "tv"]

      - name: "Radarr"
        url: "http://192.168.1.100:7878"
        description: "Movie collection manager"
        tags: ["media", "automation", "movies"]

      - name: "Sonarr"
        url: "http://192.168.1.100:8989"
        description: "TV series collection manager"
        tags: ["media", "automation", "tv"]

  - name: "Infrastructure"
    description: "Core infrastructure and networking"
    services:
      - name: "Portainer"
        url: "http://192.168.1.100:9000"
        description: "Docker container management"
        tags: ["docker", "management"]

      - name: "Pi-hole"
        url: "http://192.168.1.10/admin"
        description: "Network-wide ad blocking"
        tags: ["dns", "ad-blocking"]

widgets:
  - name: "Torrent Stats"
    type: "qbittorrent"
    url: "http://192.168.1.100:8080"
    username: "admin"
    password: "adminpass"
    enabled: true

  - name: "Movies"
    type: "radarr"
    url: "http://192.168.1.100:7878"
    api_key: "your_radarr_api_key"
    enabled: true

  - name: "TV Shows"
    type: "sonarr"
    url: "http://192.168.1.100:8989"
    api_key: "your_sonarr_api_key"
    enabled: true
```

## Documentation

For more detailed information, see the [full documentation](docs/README.md):

- 📖 [Full Documentation](docs/README.md) - Complete guides and references
- 🔧 [Configuration Guide](docs/configuration.md) - All configuration options
- 🎨 [Widget Guide](docs/widgets.md) - Widget setup and API keys
- 🐳 [Deployment Guide](docs/deployment.md) - Docker, Kubernetes, reverse proxy
- 🏗️ [Architecture](docs/architecture.md) - Technical overview
- ❓ [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔌 Add support for new services
- 📝 Improve documentation

## License

MIT License - Feel free to use and modify as needed!

## Acknowledgments

Inspired by [Homepage](https://github.com/gethomepage/homepage) and [Organizr](https://github.com/causefx/Organizr).

---

**Built with ❤️ using Ruby and Sinatra**
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
    image: bepisdev/labdash:latest
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
