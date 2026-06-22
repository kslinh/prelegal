Write-Host "Stopping Prelegal..."

$running = docker ps -q -f name=prelegal
if ($running) {
    docker stop prelegal
    docker rm prelegal
    Write-Host "Prelegal stopped"
} else {
    Write-Host "Prelegal is not running"
}
