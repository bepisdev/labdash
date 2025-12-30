# Widget Guide

Widgets provide real-time statistics and information from your services.

## Overview

Widgets are displayed at the top of your dashboard and refresh automatically to show live data. They're perfect for monitoring download progress, library stats, or system status at a glance.

## Supported Widgets

- **qBittorrent** - Torrent client statistics
- **Radarr** - Movie library statistics
- **Sonarr** - TV show library statistics
- **Jellyfin** - Media server statistics
- **Bazarr** - Subtitle management statistics
- **Prowlarr** - Indexer manager statistics
- **Lidarr** - Music library statistics

## General Configuration

All widgets share these common options:

```yaml
widgets:
  - name: string (required)        # Display name
    type: string (required)        # Widget type
    url: string (required)         # Service URL
    enabled: boolean (optional)    # Enable/disable widget (default: true)
```

## qBittorrent Widget

Displays download/upload speeds, active torrents, and ratio statistics.

### Configuration

```yaml
widgets:
  - name: "Torrent Stats"
    type: "qbittorrent"
    url: "http://localhost:8080"
    username: "admin"              # Optional
    password: "adminpass"          # Optional
    enabled: true
```

### Options

- `username` (string, optional): qBittorrent username
- `password` (string, optional): qBittorrent password

### Displayed Data

- Download speed (MB/s)
- Upload speed (MB/s)
- Number of active torrents
- Overall ratio

## Radarr Widget

Shows movie library statistics including total movies, downloads, and upcoming releases.

### Configuration

```yaml
widgets:
  - name: "Movies"
    type: "radarr"
    url: "http://localhost:7878"
    api_key: "your_api_key_here"
    enabled: true
```

### Options

- `api_key` (string, required): Radarr API key

**Finding your API key**: Radarr → Settings → General → Security → API Key

### Displayed Data

- Total movies in library
- Movies with files
- Missing movies
- Movies in queue

## Sonarr Widget

Displays TV series statistics including episodes, upcoming shows, and queue status.

### Configuration

```yaml
widgets:
  - name: "TV Shows"
    type: "sonarr"
    url: "http://localhost:8989"
    api_key: "your_api_key_here"
    enabled: true
```

### Options

- `api_key` (string, required): Sonarr API key

**Finding your API key**: Sonarr → Settings → General → Security → API Key

### Displayed Data

- Total series
- Total episodes
- Missing episodes
- Episodes in queue

## Jellyfin Widget

Shows Jellyfin media server statistics including movies, series, albums, and active streams.

### Configuration

```yaml
widgets:
  - name: "Media Server"
    type: "jellyfin"
    url: "http://localhost:8096"
    api_key: "your_api_key_here"
    enabled: true
```

### Options

- `api_key` (string, required): Jellyfin API key

**Finding your API key**: Jellyfin → Dashboard → Advanced → API Keys

### Displayed Data

- Total movies
- Total series
- Total albums
- Active streams

## Bazarr Widget

Displays subtitle management statistics for movies and series.

### Configuration

```yaml
widgets:
  - name: "Subtitles"
    type: "bazarr"
    url: "http://localhost:6767"
    api_key: "your_api_key_here"
    enabled: true
```

### Options

- `api_key` (string, required): Bazarr API key

**Finding your API key**: Bazarr → Settings → General → Security → API Key

### Displayed Data

- Total movies with subtitles
- Total series with subtitles
- Missing movie subtitles
- Missing series subtitles

## Prowlarr Widget

Shows indexer manager statistics including total queries, grabs, and response times.

### Configuration

```yaml
widgets:
  - name: "Indexers"
    type: "prowlarr"
    url: "http://localhost:9696"
    api_key: "your_api_key_here"
    enabled: true
```

### Options

- `api_key` (string, required): Prowlarr API key

**Finding your API key**: Prowlarr → Settings → General → Security → API Key

### Displayed Data

- Total indexers
- Total queries (24h)
- Total grabs (24h)
- Average response time

## Lidarr Widget

Displays music library statistics including artists, albums, tracks, and upcoming releases.

### Configuration

```yaml
widgets:
  - name: "Music Library"
    type: "lidarr"
    url: "http://localhost:8686"
    api_key: "your_api_key_here"
    enabled: true
```

### Options

- `api_key` (string, required): Lidarr API key

**Finding your API key**: Lidarr → Settings → General → Security → API Key

### Displayed Data

- Total artists
- Total albums
- Total tracks
- Albums in queue

## Multiple Widgets

You can add as many widgets as you want. They'll be displayed in a responsive grid.

```yaml
widgets:
  - name: "Downloads"
    type: "qbittorrent"
    url: "http://localhost:8080"
    enabled: true

  - name: "Movies"
    type: "radarr"
    url: "http://localhost:7878"
    api_key: "your_radarr_key"
    enabled: true

  - name: "TV Shows"
    type: "sonarr"
    url: "http://localhost:8989"
    api_key: "your_sonarr_key"
    enabled: true

  - name: "Media Server"
    type: "jellyfin"
    url: "http://localhost:8096"
    api_key: "your_jellyfin_key"
    enabled: true
```

## Disabling Widgets

Temporarily disable a widget without removing it:

```yaml
widgets:
  - name: "Movies"
    type: "radarr"
    url: "http://localhost:7878"
    api_key: "your_api_key"
    enabled: false  # Widget won't be displayed
```

## Widget Refresh

Widgets automatically refresh their data every 30 seconds. This interval is currently fixed but may become configurable in future versions.

## Troubleshooting

### Widget Not Displaying

1. Check that `enabled: true` is set
2. Verify the service URL is correct and accessible
3. Check the browser console for error messages
4. Ensure API key is valid (if required)

### Authentication Errors

- **Radarr/Sonarr/etc**: Verify API key is correct
- **qBittorrent**: Check username/password
- Ensure the service allows API access

### Connection Errors

- Verify service is running and accessible
- Check firewall rules
- Ensure URL includes the correct protocol (http/https)
- Try accessing the service URL directly in your browser

### Data Not Updating

- Check browser console for errors
- Verify the service API is responding (check network tab)
- Restart the LabDash container

## API Endpoints

Widgets fetch data from these endpoints:

- `GET /api/widgets` - All widget data
- `GET /api/widgets/:name` - Specific widget data

You can test these endpoints directly:

```bash
curl http://localhost:4567/api/widgets
```

## Next Steps

- [Configuration Guide](configuration.md) - Full configuration options
- [Troubleshooting](troubleshooting.md) - Common issues and solutions
- [API Reference](api.md) - Complete API documentation
