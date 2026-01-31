# Inkspire Backend - Multi-stage Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files first for better caching
COPY Inkspire.Core/Inkspire.Core.csproj Inkspire.Core/
COPY Inkspire.Infrastructure/Inkspire.Infrastructure.csproj Inkspire.Infrastructure/
COPY Inkspire.Api/Inkspire.Api.csproj Inkspire.Api/
COPY Inkspire.sln .

# Restore dependencies
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Build and publish
RUN dotnet publish Inkspire.Api/Inkspire.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published output
COPY --from=build /app/publish .

# Expose port
EXPOSE 5000

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Start the application
ENTRYPOINT ["dotnet", "Inkspire.Api.dll"]
