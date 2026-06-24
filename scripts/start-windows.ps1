Write-Host "Starting Prelegal on Windows..."
Write-Host ""

# Check if Docker is running
$docker = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
}

Write-Host "✅ Docker is running"

# Remove existing container if it exists
$existing = docker ps -a --format "{{.Names}}" 2>$null | Select-String "^prelegal$"
if ($existing) {
    Write-Host "Removing existing container..."
    docker stop prelegal 2>$null
    docker rm prelegal 2>$null
}

# Build the Docker image
Write-Host ""
Write-Host "Building Docker image (this may take a few minutes)..."
Write-Host ""

$buildOutput = docker build -t prelegal:latest . 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Docker build failed. Check the errors above."
    Write-Host $buildOutput
    exit 1
}

Write-Host ""
Write-Host "✅ Docker image built successfully"

# Check if image exists
$imageCheck = docker image inspect prelegal:latest 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker image not found after build"
    exit 1
}

Write-Host "✅ Docker image verified"
Write-Host ""

# Run the container
Write-Host "Starting container..."
$containerOutput = docker run -d `
    --name prelegal `
    -p 8000:8000 `
    --env-file .env `
    -v prelegal-data:/app/data `
    prelegal:latest 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Container started successfully"
    Write-Host ""
    Write-Host "═══════════════════════════════════════"
    Write-Host "Prelegal is running!"
    Write-Host "═══════════════════════════════════════"
    Write-Host ""
    Write-Host "Backend API: http://localhost:8000"
    Write-Host "API Docs:    http://localhost:8000/docs"
    Write-Host "Health:      http://localhost:8000/health"
    Write-Host ""
    Write-Host "View logs:   docker logs -f prelegal"
    Write-Host "Stop:        .\scripts\stop-windows.ps1"
    Write-Host ""
} else {
    Write-Host "❌ Failed to start container"
    docker logs prelegal 2>$null
    exit 1
}
