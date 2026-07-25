# ============================================================
# Frontend Dockerfile - CRM Automotora ERP (React + Vite)
# Multi-stage build: Node for building, Nginx for serving
# ============================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies (ci for deterministic builds)
RUN npm ci --silent

# Copy remaining source files
COPY . .

# Set the API URL to use the internal Docker network via nginx proxy
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build the production bundle
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:1.27-alpine AS production

# Metadata
LABEL maintainer="Automotora Origen SpA"
LABEL description="CRM Automotora ERP - Frontend (React + Nginx)"
LABEL version="1.0.0"

# Remove default nginx static assets and config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check — verifies nginx is serving
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
