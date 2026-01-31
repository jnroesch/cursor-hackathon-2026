@echo off
echo ========================================
echo Inkspire - Rebuild Docker Containers
echo ========================================
echo.

echo [1/3] Building frontend container...
docker-compose build frontend
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building backend container...
docker-compose build backend
if %errorlevel% neq 0 (
    echo ERROR: Failed to build backend
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Starting services (migration will auto-apply)...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start services
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo SUCCESS! Containers rebuilt and started.
echo Migration will be applied automatically.
echo ========================================
pause
