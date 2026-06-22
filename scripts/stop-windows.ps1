Write-Host "Stopping Prelegal..."

$running = docker ps -q -f name=prelegal 2>$null
if ($running) {
    docker stop prelegal 2>$null
    docker rm prelegal 2>$null
    Write-Host "✅ Prelegal stopped"
} else {
    Write-Host "ℹ️  Prelegal is not running"
}
