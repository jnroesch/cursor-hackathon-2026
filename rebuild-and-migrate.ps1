# Inkspire - Rebuild and Migrate Script
# This script rebuilds the Docker containers and runs the database migration

Write-Host "Building frontend container..." -ForegroundColor Cyan
docker-compose build frontend

Write-Host "Building backend container..." -ForegroundColor Cyan
docker-compose build backend

Write-Host "Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Running database migration..." -ForegroundColor Cyan
docker-compose exec backend dotnet ef database update --project Inkspire.Infrastructure --startup-project Inkspire.Api

Write-Host "Done! Frontend and backend have been rebuilt and migration applied." -ForegroundColor Green
