#!/bin/bash

# Build and push Docker image to Docker Hub
# Usage: ./build-and-push.sh [tag]

set -e

# Docker Hub repository
REPO="bepisdev/labdash"

# Get tag from argument or use 'latest'
TAG="${1:-latest}"

echo "Building Docker image: ${REPO}:${TAG}"
docker build -t "${REPO}:${TAG}" .

# Also tag as latest if a specific version was provided
if [ "$TAG" != "latest" ]; then
    echo "Also tagging as latest..."
    docker tag "${REPO}:${TAG}" "${REPO}:latest"
fi

echo "Pushing to Docker Hub..."
docker push "${REPO}:${TAG}"

if [ "$TAG" != "latest" ]; then
    docker push "${REPO}:latest"
fi

echo "✓ Successfully pushed ${REPO}:${TAG} to Docker Hub"
