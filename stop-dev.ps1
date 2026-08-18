$ErrorActionPreference = "Stop"

# ============================================
# SIAGA - Development Environment Stopper
# Stops and removes containers/networks.
# Data volumes are PRESERVED (no -v flag).
# ============================================

$RootDir = $PSScriptRoot
$ComposeFile = Join-Path $RootDir "compose.yaml"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "       SIAGA Development Environment        " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Validate Docker Compose File
# ============================================

if (-not (Test-Path $ComposeFile)) {
    Write-Host "[ERROR] compose.yaml not found:" -ForegroundColor Red
    Write-Host "        $ComposeFile" -ForegroundColor Red
    exit 1
}

# ============================================
# Validate Docker
# ============================================

Write-Host "Checking Docker..." -ForegroundColor Yellow

try {
    docker info *> $null

    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running."
    }
}
catch {
    Write-Host "[ERROR] Docker is not running." -ForegroundColor Red
    Write-Host "        Nothing to stop." -ForegroundColor Yellow
    exit 0
}

Write-Host "Docker is running." -ForegroundColor Green
Write-Host ""

# ============================================
# Stop Containers
# ============================================

Write-Host "Stopping SIAGA containers..." -ForegroundColor Yellow
Write-Host ""

Set-Location $RootDir

# `down` (without -v) stops and removes the containers and the network while
# keeping the named data volumes (postgres_data, backend_vendor,
# frontend_node_modules) intact for the next start.
docker compose down

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to stop SIAGA containers." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "SIAGA containers stopped." -ForegroundColor Green
Write-Host "Data volumes are preserved (postgres_data, backend_vendor, frontend_node_modules)." -ForegroundColor DarkGray
Write-Host "To remove all data as well, run:  docker compose down -v" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Restart with: .\start-dev.ps1" -ForegroundColor White
Write-Host ""