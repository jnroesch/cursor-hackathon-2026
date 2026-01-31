# Inkspire Frontend - Multi-stage Dockerfile
FROM node:22-alpine AS build
WORKDIR /app

# Build configuration argument (production or development)
ARG BUILD_CONFIGURATION=production

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application with specified configuration
RUN npm run build -- --configuration=${BUILD_CONFIGURATION}

# Production stage with nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
