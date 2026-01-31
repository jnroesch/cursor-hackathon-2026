#!/bin/bash
# Inkspire - Rebuild and Migrate Script
# This script rebuilds the Docker containers and runs the database migration

echo "Building frontend container..."
docker-compose build frontend

echo "Building backend container..."
docker-compose build backend

echo "Starting services..."
docker-compose up -d

echo "Waiting for backend to be ready..."
sleep 10

echo "Running database migration..."
docker-compose exec backend dotnet ef database update --project Inkspire.Infrastructure --startup-project Inkspire.Api

echo "Done! Frontend and backend have been rebuilt and migration applied."
