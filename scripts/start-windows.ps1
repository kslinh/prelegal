Write-Host "Starting Prelegal on Windows..."

# Check if Docker is running
$docker = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Please start Docker Desktop first."
    exit 1
}

# Build the Docker image
Write-Host "Building Docker image..."
docker build -t prelegal:latest .

# Run the container
Write-Host "Starting container..."
docker run -d `
    --name prelegal `
    -p 8000:8000 `
    -p 3000:3000 `
    -v "$(Get-Location)/backend:/app/backend" `
    -v "$(Get-Location)/frontend:/app/frontend" `
    --env-file .env `
    prelegal:latest

Write-Host "Prelegal is running!"
Write-Host "Backend: http://localhost:8000"
Write-Host "API Docs: http://localhost:8000/docs"
Write-Host "Frontend: http://localhost:3000"
Write-Host ""
Write-Host "To view logs: docker logs -f prelegal"
Write-Host "To stop: .\scripts\stop-windows.ps1"
