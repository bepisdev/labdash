# Configuration Guide

Complete reference for configuring LabDash.

## Configuration File

LabDash uses a single YAML file (`dashboard.yml`) for all configuration. By default, it looks for this file in the current directory, or you can specify a custom path using the `CONFIG_PATH` environment variable.

## Configuration Structure

```yaml
# Dashboard Settings
title: string (required)
subtitle: string (optional)
background_image: string (optional)

# Categories
categories: array (optional)
  - name: string (required)
    description: string (optional)
    services: array (optional)

# Widgets
widgets: array (optional)
```

## Dashboard Settings

### `title` (required)
The main title displayed at the top of your dashboard.

```yaml
title: "My Homelab Dashboard"
```

### `subtitle` (optional)
A subtitle or tagline displayed below the title.

```yaml
subtitle: "Central hub for all your services"
```

### `background_image` (optional)
URL to a background image for your dashboard. Can be a local path or external URL.

```yaml
background_image: "https://example.com/background.jpg"
```

## Categories

Categories help organize your services into logical groups.

### Category Options

- `name` (string, required): Category display name
- `description` (string, optional): Category description
- `services` (array, optional): List of services in this category

### Example

```yaml
categories:
  - name: "Media"
    description: "Entertainment and media services"
    services:
      - name: "Plex"
        url: "http://localhost:32400"
        description: "Media streaming server"
        tags: ["streaming", "movies", "tv"]

  - name: "Infrastructure"
    description: "Core infrastructure services"
    services:
      - name: "Portainer"
        url: "http://localhost:9000"
        description: "Docker management"
        tags: ["docker", "management"]
```

## Services

Services are the individual applications/servers you want to display on your dashboard.

### Service Options

- `name` (string, required): Service name
- `url` (string, required): Service URL
- `description` (string, optional): Service description
- `icon` (string, optional): URL to custom icon
- `status_url` (string, optional): URL for status checks (defaults to `url`)
- `tags` (array, optional): List of tags for filtering

### Service Examples

#### Basic Service
```yaml
- name: "Jellyfin"
  url: "http://localhost:8096"
  description: "Media streaming server"
```

#### Service with Custom Icon
```yaml
- name: "Plex"
  url: "http://localhost:32400"
  description: "Media streaming server"
  icon: "https://www.plex.tv/wp-content/uploads/2022/04/plex-icon.svg"
```

#### Service with Tags
```yaml
- name: "Radarr"
  url: "http://localhost:7878"
  description: "Movie collection manager"
  tags: ["media", "automation", "movies"]
```

#### Service with Custom Status URL
```yaml
- name: "My API"
  url: "http://localhost:3000"
  status_url: "http://localhost:3000/health"
  description: "Custom API service"
```

## Tags

Tags allow you to filter and categorize services. Services can have multiple tags, and users can filter by tag using the dropdown in the dashboard.

```yaml
services:
  - name: "Service 1"
    url: "http://localhost:8080"
    tags: ["streaming", "media"]
  
  - name: "Service 2"
    url: "http://localhost:9000"
    tags: ["automation", "media"]
```

In this example:
- Filtering by "media" shows both services
- Filtering by "streaming" shows only Service 1
- Filtering by "automation" shows only Service 2

## Environment Variables

### `CONFIG_PATH`
Path to the configuration file.

**Default**: `./dashboard.yml`

**Example**:
```bash
export CONFIG_PATH=/config/dashboard.yml
```

### `RACK_ENV`
Application environment mode.

**Values**: `production`, `development`

**Default**: `production`

**Example**:
```bash
export RACK_ENV=production
```

## Configuration Validation

LabDash automatically validates your configuration on startup. Common validation errors:

- **Invalid YAML syntax**: Check for proper indentation and formatting
- **Missing required fields**: Ensure all services have `name` and `url`
- **Invalid widget type**: Check that widget `type` is supported
- **Missing API keys**: Ensure widgets requiring authentication have necessary credentials

## Complete Example

```yaml
title: "My Homelab Dashboard"
subtitle: "Central hub for all your services"
background_image: "https://example.com/background.jpg"

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
        description: "Movie management"
        status_url: "http://192.168.1.100:7878/api/system/status"
        tags: ["automation", "movies"]

  - name: "Infrastructure"
    description: "Core infrastructure services"
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
    api_key: "your_radarr_api_key_here"
    enabled: true
```

## Next Steps

- [Widget Configuration](widgets.md) - Configure widgets for real-time data
- [Deployment Guide](deployment.md) - Deploy to production
- [Troubleshooting](troubleshooting.md) - Common configuration issues
