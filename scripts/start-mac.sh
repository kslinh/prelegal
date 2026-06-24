#!/bin/bash

set -e

echo "Starting Prelegal on Mac..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q '^prelegal$'; then
    echo "Removing existing container..."
    docker stop prelegal 2>/dev/null || true
    docker rm prelegal 2>/dev/null || true
fi

# Build the Docker image
echo ""
echo "Building Docker image (this may take a few minutes)..."
echo ""

if docker build -t prelegal:latest .; then
    echo ""
    echo "✅ Docker image built successfully"
else
    echo ""
    echo "❌ Docker build failed. Check the errors above."
    exit 1
fi

# Check if image exists
if ! docker image inspect prelegal:latest > /dev/null 2>&1; then
    echo "❌ Docker image not found after build"
    exit 1
fi

echo "✅ Docker image verified"
echo ""

# Run the container
echo "Starting container..."
if docker run -d \
    --name prelegal \
    -p 8000:8000 \
    --env-file .env \
    -v prelegal-data:/app/data \
    prelegal:latest > /dev/null; then

    echo "✅ Container started successfully"
    echo ""
    echo "═══════════════════════════════════════"
    echo "Prelegal is running!"
    echo "═══════════════════════════════════════"
    echo ""
    echo "Application: http://localhost:8000"
    echo "API Docs:    http://localhost:8000/docs"
    echo "Health:      http://localhost:8000/health"
    echo ""
    echo "View logs:   docker logs -f prelegal"
    echo "Stop:        ./scripts/stop-mac.sh"
    echo ""
else
    echo "❌ Failed to start container"
    docker logs prelegal 2>/dev/null || true
    exit 1
fi
