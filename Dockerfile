FROM ruby:3.2-alpine

# Install dependencies
RUN apk add --no-cache build-base

# Set working directory
WORKDIR /app

# Copy Gemfile and install gems
COPY Gemfile ./
RUN bundle install --without development

# Copy application code
COPY . .

# Create directory for mounted config
RUN mkdir -p /config

# Set environment variable for config path
ENV CONFIG_PATH=/config/dashboard.yml
ENV RACK_ENV=production

# Expose port
EXPOSE 4567

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4567/health || exit 1

# Run the application
CMD ["bundle", "exec", "rackup", "--host", "0.0.0.0", "--port", "4567"]
