$pidDir = ".dev"

Write-Host "Stopping Laravel Backend..." -ForegroundColor Yellow

if (Test-Path "$pidDir/backend.pid") {
    $backendId = Get-Content "$pidDir/backend.pid"

    taskkill /PID $backendId /T /F 2>$null

    Remove-Item "$pidDir/backend.pid" -Force
}

Write-Host "Stopping Frontend (Vite)..." -ForegroundColor Yellow

if (Test-Path "$pidDir/frontend.pid") {
    $frontendId = Get-Content "$pidDir/frontend.pid"

    taskkill /PID $frontendId /T /F 2>$null

    Remove-Item "$pidDir/frontend.pid" -Force
}

Write-Host "All services stopped!" -ForegroundColor Cyan