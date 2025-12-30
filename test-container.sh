#!/bin/bash

# Spawn a temporary test container for labdash
# Automatically removes container on exit

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build the image if it doesn't exist
echo "Building labdash image..."
docker build -t labdash:test "$SCRIPT_DIR"

# Run the temporary container
echo "Starting temporary test container..."
docker run --rm \
  --name labdash-test \
  -p 4567:4567 \
  -v "$SCRIPT_DIR/dashboard.yml:/config/dashboard.yml:ro" \
  -e CONFIG_PATH=/config/dashboard.yml \
  -e RACK_ENV=production \
  labdash:test
