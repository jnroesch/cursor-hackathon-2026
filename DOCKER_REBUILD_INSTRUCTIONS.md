# Docker Rebuild Instructions

## Issue
If you're getting "Access is denied" errors when trying to rebuild Docker containers, try these solutions:

## Solution 1: Run PowerShell as Administrator
1. Right-click on PowerShell
2. Select "Run as Administrator"
3. Navigate to the project directory:
   ```powershell
   cd "c:\Users\chris\Hackathon\Stuff\cursor-hackathon-2026"
   ```
4. Run the rebuild commands:
   ```powershell
   docker-compose build frontend
   docker-compose build backend
   docker-compose up -d
   ```

## Solution 2: Use the Batch File (Run as Administrator)
1. Right-click on `rebuild-containers.bat`
2. Select "Run as Administrator"
3. The script will rebuild both containers and start them

## Solution 3: Restart Docker Desktop
1. Right-click Docker Desktop icon in system tray
2. Select "Restart Docker Desktop"
3. Wait for it to fully start
4. Try the commands again

## Solution 4: Check Docker Desktop Settings
1. Open Docker Desktop
2. Go to Settings → General
3. Ensure "Use the WSL 2 based engine" is checked (if using WSL)
4. Or try unchecking it if you're not using WSL

## Manual Commands (if Docker is accessible)
```powershell
# Rebuild frontend
docker-compose build frontend

# Rebuild backend  
docker-compose build backend

# Start services (migration auto-applies on backend startup)
docker-compose up -d

# Check logs to verify migration
docker-compose logs backend
```

## What Gets Rebuilt
- **Frontend**: New ProfileComponent, routes, navigation updates
- **Backend**: New migration for User profile fields (Roles, FavoriteMedia, AboutMe)
- **Database**: Migration auto-applies when backend starts (see Program.cs)

## Verify It Worked
1. Check containers are running:
   ```powershell
   docker-compose ps
   ```
2. Check backend logs for migration:
   ```powershell
   docker-compose logs backend | Select-String -Pattern "migration"
   ```
3. Access frontend at http://localhost:4200
4. Navigate to Profile page - you should see the new profile icon in the nav rail
