#!/bin/bash

echo "Starting Prelegal on Linux..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t prelegal:latest .

# Run the container
echo "Starting container..."
docker run -d \
    --name prelegal \
    -p 8000:8000 \
    -p 3000:3000 \
    -v "$(pwd)/backend:/app/backend" \
    -v "$(pwd)/frontend:/app/frontend" \
    --env-file .env \
    prelegal:latest

echo "Prelegal is running!"
echo "Backend: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:3000"

echo "To view logs: docker logs -f prelegal"
echo "To stop: ./scripts/stop-linux.sh"
