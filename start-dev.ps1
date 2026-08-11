$pidDir = ".dev"

if (-not (Test-Path $pidDir)) {
    New-Item -ItemType Directory -Path $pidDir | Out-Null
}

Write-Host "Starting Laravel Backend..." -ForegroundColor Green

$backend = Start-Process powershell `
    -ArgumentList "-NoProfile", "-Command", "Set-Location backend; php artisan serve" `
    -PassThru

$backend.Id | Out-File "$pidDir/backend.pid"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend (Vite)..." -ForegroundColor Green

$frontend = Start-Process powershell `
    -ArgumentList "-NoProfile", "-Command", "Set-Location frontend; npm run dev" `
    -PassThru

$frontend.Id | Out-File "$pidDir/frontend.pid"

Write-Host "All services started!" -ForegroundColor Cyan