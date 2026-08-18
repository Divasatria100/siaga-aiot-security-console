param(
    [switch]$Fresh,
    [switch]$Rollback
)

$ErrorActionPreference = "Stop"

# ============================================
# SIAGA - Database Migration Helper
# Runs Laravel migrations inside the backend container.
#
# Usage:
#   .\migrate.ps1            -> php artisan migrate
#   .\migrate.ps1 -Fresh     -> php artisan migrate:fresh
#   .\migrate.ps1 -Rollback  -> php artisan migrate:rollback
# ============================================

$RootDir = $PSScriptRoot
$ComposeFile = Join-Path $RootDir "compose.yaml"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "       SIAGA - Database Migration           " -ForegroundColor Cyan
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
# Validate Backend Container
# ============================================

Write-Host "Checking backend container..." -ForegroundColor Yellow

$BackendStatus = docker compose ps --status running --services | Select-String "^backend$"

if (-not $BackendStatus) {
    Write-Host "[ERROR] Backend container is not running." -ForegroundColor Red
    Write-Host "        Start the environment first: .\start-dev.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Backend container is running." -ForegroundColor Green
Write-Host ""

# ============================================
# Run Migration
# ============================================

Set-Location $RootDir

if ($Fresh) {
    Write-Host "Running: php artisan migrate:fresh" -ForegroundColor Yellow
    Write-Host ""
    docker compose exec -T backend php artisan migrate:fresh --force
}
elseif ($Rollback) {
    Write-Host "Running: php artisan migrate:rollback" -ForegroundColor Yellow
    Write-Host ""
    docker compose exec -T backend php artisan migrate:rollback
}
else {
    Write-Host "Running: php artisan migrate" -ForegroundColor Yellow
    Write-Host ""
    docker compose exec -T backend php artisan migrate --force
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Migration failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Migration completed." -ForegroundColor Green
Write-Host ""