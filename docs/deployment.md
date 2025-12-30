# Deployment Guide

Complete guide for deploying LabDash in various environments.

## Docker Deployment

### Using Docker Compose (Recommended)

The easiest way to deploy LabDash is with Docker Compose.

**1. Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  labdash:
    image: labdash:latest
    container_name: labdash
    ports:
      - "4567:4567"
    volumes:
      - ./dashboard.yml:/config/dashboard.yml:ro
    environment:
      - CONFIG_PATH=/config/dashboard.yml
      - RACK_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4567/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

**2. Start the service:**

```bash
docker-compose up -d
```

**3. View logs:**

```bash
docker-compose logs -f
```

**4. Stop the service:**

```bash
docker-compose down
```

### Using Docker Run

For quick deployments without Docker Compose:

```bash
docker run -d \
  --name labdash \
  -p 4567:4567 \
  -v $(pwd)/dashboard.yml:/config/dashboard.yml:ro \
  -e CONFIG_PATH=/config/dashboard.yml \
  -e RACK_ENV=production \
  --restart unless-stopped \
  labdash:latest
```

### Custom Port

Change the host port while keeping the container port at 4567:

**Docker Compose:**
```yaml
ports:
  - "8080:4567"  # Access at http://localhost:8080
```

**Docker Run:**
```bash
docker run -d \
  --name labdash \
  -p 8080:4567 \
  -v $(pwd)/dashboard.yml:/config/dashboard.yml:ro \
  labdash:latest
```

## Building from Source

### Build Docker Image

```bash
# Clone the repository
git clone https://github.com/yourusername/labdash.git
cd labdash

# Build the image
docker build -t labdash:latest .

# Run the container
docker run -d \
  --name labdash \
  -p 4567:4567 \
  -v $(pwd)/dashboard.yml:/config/dashboard.yml:ro \
  labdash:latest
```

### Build with Custom Tag

```bash
docker build -t labdash:1.0.0 .
docker build -t my-registry.com/labdash:latest .
```

## Reverse Proxy Configuration

### Nginx

**Basic Configuration:**

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

**With SSL (Let's Encrypt):**

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashboard.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/dashboard.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dashboard.yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:4567;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Traefik

**Docker Compose with Traefik:**

```yaml
version: '3.8'

services:
  labdash:
    image: labdash:latest
    container_name: labdash
    volumes:
      - ./dashboard.yml:/config/dashboard.yml:ro
    environment:
      - CONFIG_PATH=/config/dashboard.yml
      - RACK_ENV=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.labdash.rule=Host(`dashboard.yourdomain.com`)"
      - "traefik.http.routers.labdash.entrypoints=websecure"
      - "traefik.http.routers.labdash.tls.certresolver=letsencrypt"
      - "traefik.http.services.labdash.loadbalancer.server.port=4567"
    networks:
      - traefik

networks:
  traefik:
    external: true
```

### Caddy

**Caddyfile:**

```caddy
dashboard.yourdomain.com {
    reverse_proxy localhost:4567
}
```

Caddy automatically handles SSL certificates via Let's Encrypt.

## Environment-Specific Configurations

### Development

```yaml
version: '3.8'

services:
  labdash:
    build: .
    ports:
      - "4567:4567"
    volumes:
      - ./dashboard.yml:/config/dashboard.yml:ro
      - ./lib:/app/lib  # Live code updates
      - ./views:/app/views
      - ./public:/app/public
    environment:
      - CONFIG_PATH=/config/dashboard.yml
      - RACK_ENV=development
```

### Production

```yaml
version: '3.8'

services:
  labdash:
    image: labdash:latest
    ports:
      - "4567:4567"
    volumes:
      - ./dashboard.yml:/config/dashboard.yml:ro
    environment:
      - CONFIG_PATH=/config/dashboard.yml
      - RACK_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4567/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Container Orchestration

### Docker Swarm

**Deploy as a service:**

```bash
docker service create \
  --name labdash \
  --publish 4567:4567 \
  --mount type=bind,source=$(pwd)/dashboard.yml,target=/config/dashboard.yml,readonly \
  --env CONFIG_PATH=/config/dashboard.yml \
  --env RACK_ENV=production \
  --replicas 1 \
  labdash:latest
```

### Kubernetes

**deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: labdash
spec:
  replicas: 1
  selector:
    matchLabels:
      app: labdash
  template:
    metadata:
      labels:
        app: labdash
    spec:
      containers:
      - name: labdash
        image: labdash:latest
        ports:
        - containerPort: 4567
        env:
        - name: CONFIG_PATH
          value: /config/dashboard.yml
        - name: RACK_ENV
          value: production
        volumeMounts:
        - name: config
          mountPath: /config
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: labdash-config
---
apiVersion: v1
kind: Service
metadata:
  name: labdash
spec:
  selector:
    app: labdash
  ports:
  - protocol: TCP
    port: 80
    targetPort: 4567
  type: LoadBalancer
```

## Health Checks

LabDash includes a health check endpoint at `/health`:

```bash
curl http://localhost:4567/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-12-31T12:00:00Z"
}
```

## Backup and Updates

### Backing Up Configuration

Your `dashboard.yml` file contains all your configuration:

```bash
# Backup
cp dashboard.yml dashboard.yml.backup

# Or with date
cp dashboard.yml dashboard.yml.$(date +%Y%m%d)
```

### Updating LabDash

**Docker Compose:**

```bash
# Pull latest image
docker-compose pull

# Restart with new image
docker-compose up -d
```

**Docker Run:**

```bash
# Stop and remove old container
docker stop labdash
docker rm labdash

# Pull latest image
docker pull labdash:latest

# Start new container
docker run -d \
  --name labdash \
  -p 4567:4567 \
  -v $(pwd)/dashboard.yml:/config/dashboard.yml:ro \
  labdash:latest
```

## Monitoring

### Check Container Status

```bash
docker ps -a | grep labdash
```

### View Logs

```bash
# Docker Compose
docker-compose logs -f labdash

# Docker
docker logs -f labdash

# Last 100 lines
docker logs --tail 100 labdash
```

### Resource Usage

```bash
docker stats labdash
```

## Security Best Practices

1. **Use read-only volumes**: Mount `dashboard.yml` as read-only (`:ro`)
2. **Run behind reverse proxy**: Use Nginx/Traefik with SSL
3. **Keep updated**: Regularly pull and deploy latest images
4. **Network isolation**: Use Docker networks to isolate containers
5. **Limit exposure**: Don't expose port 4567 publicly, use reverse proxy
6. **API key security**: Store API keys securely, don't commit to git

## Next Steps

- [Configuration Guide](configuration.md) - Configure your dashboard
- [Reverse Proxy Setup](reverse-proxy.md) - Detailed proxy configurations
- [Production Best Practices](production.md) - Security and performance
- [Troubleshooting](troubleshooting.md) - Common deployment issues
