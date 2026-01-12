# Troubleshooting Guide

Common issues and their solutions.

## Configuration Issues

### Dashboard Won't Start

**Symptoms**: Container exits immediately or shows configuration errors

**Solutions**:

1. **Check YAML syntax**:
```bash
# Validate YAML
docker run --rm -v $(pwd)/dashboard.yml:/config.yml:ro \
  python:3-alpine python -c "import yaml; yaml.safe_load(open('/config.yml'))"
```

2. **Check logs**:
```bash
docker logs labdash
```

3. **Verify file permissions**:
```bash
ls -la dashboard.yml
# Should be readable (at least 644)
```

4. **Check required fields**:
   - Ensure `title` is present
   - All services have `name` and `url`

### "Configuration file not found"

**Cause**: The `dashboard.yml` file isn't mounted correctly

**Solutions**:

1. **Check volume mount**:
```yaml
volumes:
  - ./dashboard.yml:/config/dashboard.yml:ro  # Use absolute path if needed
```

2. **Use absolute paths**:
```bash
docker run -d \
  -v /full/path/to/dashboard.yml:/config/dashboard.yml:ro \
  bepisdev/labdash:latest
```

3. **Verify file exists**:
```bash
ls -la dashboard.yml
```

### Invalid Widget Configuration

**Symptoms**: Widgets don't display or show errors

**Solutions**:

1. **Check widget type**: Must be one of: `qbittorrent`, `radarr`, `sonarr`, `jellyfin`, `bazarr`, `prowlarr`, `lidarr`

2. **Verify required fields**:
```yaml
widgets:
  - name: "Required"
    type: "Required"
    url: "Required"
    api_key: "Required for most widgets"
```

3. **Test service connection**:
```bash
curl http://your-service-url/api/endpoint
```

## Connection Issues

### Services Not Loading

**Symptoms**: Dashboard loads but services show as unavailable

**Solutions**:

1. **Check service URLs**: Ensure services are accessible from where LabDash is running

2. **Test connectivity**:
```bash
# From host
curl http://service-url

# From container
docker exec labdash wget -O- http://service-url
```

3. **Check Docker networks**: If services are in Docker, ensure they're on the same network:
```yaml
services:
  labdash:
    networks:
      - homelab
  
  your-service:
    networks:
      - homelab

networks:
  homelab:
    external: true
```

### Status Checks Not Working

**Symptoms**: All services show as "Unknown" or status never updates

**Cause**: CORS policy or network restrictions

**Solutions**:

1. **Use status_url**: Point to an endpoint that allows CORS:
```yaml
services:
  - name: "My Service"
    url: "http://localhost:8080"
    status_url: "http://localhost:8080/health"
```

2. **This is normal**: Client-side status checks are often blocked by CORS policies. This doesn't affect functionality.

### Widgets Not Loading

**Symptoms**: Widgets show "Loading..." forever or display errors

**Solutions**:

1. **Check API key**:
```bash
# Test Radarr
curl -H "X-Api-Key: YOUR_API_KEY" http://localhost:7878/api/v3/system/status

# Test qBittorrent
curl -u "username:password" http://localhost:8080/api/v2/torrents/info
```

2. **Verify service is running**:
```bash
docker ps | grep radarr
```

3. **Check logs for errors**:
```bash
docker logs labdash | grep -i widget
```

4. **Ensure `enabled: true`**:
```yaml
widgets:
  - name: "Movies"
    type: "radarr"
    enabled: true  # Check this
```

## Docker Issues

### Port Already in Use

**Symptoms**: `Error starting userland proxy: listen tcp 0.0.0.0:4567: bind: address already in use`

**Solutions**:

1. **Find what's using the port**:
```bash
# macOS/Linux
lsof -i :4567

# Linux
netstat -tulpn | grep 4567
```

2. **Use a different port**:
```yaml
ports:
  - "8080:4567"  # Change host port
```

3. **Stop conflicting service**:
```bash
docker stop $(docker ps -q --filter "publish=4567")
```

### Container Keeps Restarting

**Symptoms**: Container starts then immediately stops

**Solutions**:

1. **Check logs**:
```bash
docker logs labdash
```

2. **Remove restart policy temporarily**:
```yaml
# Comment out or remove:
# restart: unless-stopped
```

3. **Run interactively to debug**:
```bash
docker run -it --rm \
  -v $(pwd)/dashboard.yml:/config/dashboard.yml:ro \
  labdash:latest \
  /bin/sh
```

### Permission Denied

**Symptoms**: Cannot read `dashboard.yml`

**Solutions**:

1. **Fix file permissions**:
```bash
chmod 644 dashboard.yml
```

2. **Check SELinux (if applicable)**:
```bash
# Add SELinux context
chcon -Rt svirt_sandbox_file_t dashboard.yml

# Or use :Z flag
docker run -v $(pwd)/dashboard.yml:/config/dashboard.yml:ro,Z labdash:latest
```

## Browser Issues

### Dashboard Not Loading

**Symptoms**: Blank page or connection refused

**Solutions**:

1. **Check container is running**:
```bash
docker ps | grep labdash
```

2. **Verify port mapping**:
```bash
docker port labdash
# Should show: 4567/tcp -> 0.0.0.0:4567
```

3. **Test locally first**:
```bash
curl http://localhost:4567
```

4. **Check browser console**: Press F12 and look for errors

### Styles Not Loading

**Symptoms**: Dashboard shows but looks broken (no colors/layout)

**Solutions**:

1. **Hard refresh**: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (macOS)

2. **Clear browser cache**

3. **Check network tab**: Look for 404 errors on CSS files

4. **Verify public folder is mounted** (if using custom volumes)

### Background Image Not Showing

**Symptoms**: Background appears as solid color

**Solutions**:

1. **Check image URL**:
```bash
curl -I https://your-background-image-url.jpg
# Should return 200 OK
```

2. **Try a different image**

3. **Check browser console** for CORS errors

4. **Use local image**:
```yaml
background_image: "/images/background.jpg"
```

## Performance Issues

### Slow Loading

**Symptoms**: Dashboard takes long to load

**Solutions**:

1. **Reduce number of widgets**: Widgets make API calls

2. **Check service response times**:
```bash
time curl http://your-service/api/endpoint
```

3. **Increase container resources**:
```yaml
services:
  labdash:
    deploy:
      resources:
        limits:
          memory: 512M
```

### High CPU Usage

**Symptoms**: Container using excessive CPU

**Solutions**:

1. **Check logs for errors**:
```bash
docker logs labdash | tail -100
```

2. **Monitor resource usage**:
```bash
docker stats labdash
```

3. **Restart container**:
```bash
docker restart labdash
```

## Development Issues

### Changes Not Reflected

**Symptoms**: Code changes don't appear in running container

**Solutions**:

1. **Rebuild image**:
```bash
docker-compose build --no-cache
docker-compose up -d
```

2. **For development, mount code**:
```yaml
volumes:
  - ./lib:/app/lib
  - ./views:/app/views
  - ./public:/app/public
```

3. **Use development mode**:
```yaml
environment:
  - RACK_ENV=development
```

### Bundle Install Fails

**Symptoms**: Build fails during gem installation

**Solutions**:

1. **Update Bundler**:
```dockerfile
RUN gem install bundler:2.4.0
```

2. **Clear bundle cache**:
```bash
docker-compose build --no-cache
```

3. **Check Gemfile.lock** compatibility

## Getting Help

If you're still stuck:

1. **Check logs**:
```bash
docker logs labdash > labdash-logs.txt
```

2. **Gather info**:
   - LabDash version
   - Docker version: `docker --version`
   - OS and version
   - Configuration file (sanitized - remove API keys!)

3. **Create an issue** on GitHub with:
   - Clear description of the problem
   - Steps to reproduce
   - Relevant logs
   - Configuration (sanitized)

4. **Search existing issues**: Your problem might already be solved

## Useful Commands

```bash
# View container status
docker ps -a | grep labdash

# View logs (last 100 lines)
docker logs --tail 100 labdash

# Follow logs in real-time
docker logs -f labdash

# Execute command in container
docker exec -it labdash /bin/sh

# Inspect container
docker inspect labdash

# Check resource usage
docker stats labdash

# Remove container
docker rm -f labdash

# Remove image
docker rmi labdash:latest

# Complete cleanup
docker-compose down -v
docker system prune -a
```

## Next Steps

- [Configuration Guide](configuration.md) - Review configuration options
- [Widget Guide](widgets.md) - Widget-specific troubleshooting
- [Deployment Guide](deployment.md) - Deployment best practices
- [FAQ](faq.md) - Frequently asked questions
