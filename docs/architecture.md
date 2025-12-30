# Architecture Overview

Understanding how LabDash works under the hood.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Browser                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Filters   │  │  Services  │  │  Widgets   │            │
│  │  (JS)      │  │  Monitor   │  │  Manager   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │               │               │                    │
└─────────┼───────────────┼───────────────┼────────────────────┘
          │               │               │
          └───────────────┴───────────────┘
                          │
                   HTTP/HTTPS
                          │
          ┌───────────────▼────────────────┐
          │      LabDash Server (Sinatra)   │
          │  ┌──────────┐  ┌─────────────┐ │
          │  │  Router  │  │  API        │ │
          │  └──────────┘  └─────────────┘ │
          │  ┌──────────┐  ┌─────────────┐ │
          │  │  Config  │  │  Widget     │ │
          │  │  Loader  │  │  Manager    │ │
          │  └──────────┘  └─────────────┘ │
          └─────────────────────────────────┘
                          │
          ┌───────────────▼────────────────┐
          │        Your Services           │
          │  ┌─────────┐  ┌─────────┐     │
          │  │  Radarr │  │  Sonarr │ ... │
          │  └─────────┘  └─────────┘     │
          └────────────────────────────────┘
```

## Backend Components

### Application Core (app.rb)

The main Sinatra application handles routing and request processing.

**Key responsibilities**:
- Route management
- Request/response handling
- View rendering
- Error handling

**Main routes**:
```ruby
GET  /              # Dashboard homepage
GET  /api/services  # JSON service list
GET  /api/config    # Full configuration
GET  /api/widgets   # All widget data
GET  /api/widgets/:name  # Specific widget
GET  /health        # Health check
```

### Configuration Loader (lib/config_loader.rb)

Handles loading and validating the YAML configuration file.

**Responsibilities**:
- Read and parse YAML
- Validate configuration structure
- Validate required fields
- Group services by category
- Return structured configuration

**Validation**:
```ruby
# Required fields
- Dashboard must have 'title'
- Services must have 'name' and 'url'
- Widgets must have 'name', 'type', and 'url'
```

### Widget Manager (lib/widget_manager.rb)

Coordinates widget lifecycle and data fetching.

**Responsibilities**:
- Register widget types
- Initialize widgets from configuration
- Fetch data from all enabled widgets
- Handle widget errors gracefully
- Return widget data for API

**Widget registration**:
```ruby
register_widget('qbittorrent', QBittorrentWidget)
register_widget('radarr', RadarrWidget)
register_widget('sonarr', SonarrWidget)
# ... etc
```

### Base Widget (lib/widgets/base_widget.rb)

Parent class providing common functionality for all widgets.

**Capabilities**:
- HTTP client with timeouts
- JSON parsing
- Error handling
- Basic authentication support
- API key header injection

**Interface**:
```ruby
class BaseWidget
  def initialize(config)
    # Setup widget with configuration
  end

  def fetch_data
    # Override in child classes
    # Return hash of widget data
  end
end
```

### Individual Widgets

Each service integration (Radarr, Sonarr, etc.) inherits from `BaseWidget`.

**Structure**:
```ruby
class RadarrWidget < BaseWidget
  def fetch_data
    # 1. Make API request to service
    # 2. Parse response
    # 3. Extract relevant statistics
    # 4. Return formatted data
  end

  private
  def api_headers
    # Service-specific headers
  end
end
```

## Frontend Components

### Module Organization

The frontend uses a modular JavaScript architecture:

```javascript
// main.js - Entry point
- Initialize all modules
- Setup global error handling
- Start services and widgets

// filters.js - Tag filtering
- Dropdown management
- Service filtering logic
- URL state management

// services.js - Service status
- Periodic status checks
- DOM updates
- Error handling

// widgets.js - Widget management
- Widget data fetching
- Rendering and updates
- Automatic refresh
```

### CSS Architecture

Modular CSS with clear separation of concerns:

```css
/* base.css */
- CSS variables
- Reset styles
- Typography
- Dark/light theme

/* layout.css */
- Container structure
- Grid systems
- Header/footer
- Responsive breakpoints

/* components.css */
- Toolbar
- Filters
- Tags
- Error messages

/* services.css */
- Service cards
- Status indicators
- Icons
- Hover effects

/* widgets.css */
- Widget cards
- Stats display
- Loading states
- Error states
```

## Data Flow

### 1. Initial Page Load

```
User requests /
    │
    ▼
Sinatra loads config
    │
    ▼
Renders dashboard.erb
    │
    ▼
Browser loads HTML
    │
    ▼
CSS/JS files loaded
    │
    ▼
main.js initializes
    │
    ├─▶ Filters initialized
    ├─▶ Service monitoring starts
    └─▶ Widget fetching starts
```

### 2. Widget Data Flow

```
widgets.js requests data
    │
    ▼
GET /api/widgets
    │
    ▼
WidgetManager.fetch_all
    │
    ├─▶ Widget 1.fetch_data
    ├─▶ Widget 2.fetch_data
    └─▶ Widget 3.fetch_data
    │
    ▼
HTTP requests to services
    │
    ▼
Parse and format data
    │
    ▼
Return JSON to browser
    │
    ▼
Update DOM with data
```

### 3. Service Status Flow

```
services.js checks status (periodic)
    │
    ▼
For each service:
  Fetch service.status_url (client-side)
    │
    ├─▶ Success: Update to "online"
    ├─▶ Error: Update to "offline"
    └─▶ CORS blocked: Keep as "unknown"
```

## Error Handling

### Configuration Errors

```ruby
begin
  config = ConfigLoader.load_config(path)
rescue ConfigLoader::ConfigError => e
  # Display error page with details
  erb :error, locals: { error: e.message }
end
```

### Widget Errors

```ruby
def fetch_data
  # Make API request
rescue StandardError => e
  # Log error, return empty data
  { error: e.message }
end
```

### Frontend Errors

```javascript
try {
  // Fetch widget data
  const data = await fetchWidgetData();
  renderWidget(data);
} catch (error) {
  console.error('Widget error:', error);
  displayErrorMessage(widget, error);
}
```

## Security Considerations

### Configuration File

- Mounted as read-only (`:ro`)
- Never served directly to clients
- API keys never sent to frontend
- Sanitized in API responses

### API Endpoints

- No authentication (designed for internal use)
- CORS enabled for flexibility
- Rate limiting should be handled by reverse proxy
- API keys used only server-side

### Widget Connections

- All API calls made from server
- Credentials stored server-side only
- Timeouts prevent hanging requests
- Errors logged server-side only

## Performance Characteristics

### Resource Usage

- **Memory**: ~30-50MB typical
- **CPU**: Minimal (event-driven)
- **Disk**: <10MB container image
- **Network**: Low bandwidth

### Scaling Considerations

- Stateless application (easy to scale horizontally)
- No database required
- Configuration changes require restart
- Widget requests can be cached (future enhancement)

### Optimization Strategies

1. **Client-side**:
   - Minimize DOM updates
   - Batch status checks
   - Lazy load widgets

2. **Server-side**:
   - Cache widget data (future)
   - Parallel widget fetching
   - Efficient configuration parsing

## Technology Stack

### Backend

- **Ruby 3.2**: Modern, stable Ruby version
- **Sinatra**: Lightweight web framework
- **Rack**: Ruby web server interface
- **Puma**: Concurrent web server

### Frontend

- **Vanilla JavaScript**: No frameworks, fast and simple
- **Modern CSS**: Flexbox, Grid, CSS Variables
- **ERB Templates**: Server-side rendering

### Deployment

- **Docker**: Containerization
- **Alpine Linux**: Minimal base image
- **wget**: Health checks

## Extension Points

### Adding New Widgets

1. Create widget class in `lib/widgets/`
2. Inherit from `BaseWidget`
3. Implement `fetch_data` method
4. Register in `widget_manager.rb`
5. Add type to documentation

### Adding New Features

- **Custom themes**: Extend CSS variables
- **New routes**: Add to `app.rb`
- **Additional APIs**: Add endpoints
- **Enhanced filtering**: Extend `filters.js`

## Next Steps

- [Development Guide](development.md) - Contributing code
- [API Reference](api.md) - API documentation
- [Project Structure](structure.md) - Codebase walkthrough
