#!/bin/bash

# Exit on any error
set -e

echo "🧹 Cleaning up local build environment..."

# Remove build directory if it exists
if [ -d "build" ]; then
    echo "Removing build directory..."
    rm -rf build
fi

# Remove node_modules if it exists
if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
fi

# Clean up Docker build cache and dangling images
echo "🐳 Cleaning up Docker artifacts..."
docker builder prune -f --filter until=24h
docker image prune -f

# Get current timestamp for tag
TAG=$(date +%Y-%m-%d-%H-%M)
echo "📦 Building Docker image with tag: $TAG"

# Build the Docker image with both timestamp and latest tags
docker build -t cloudsecurityallianceorg/mcp-nodemailer:$TAG \
             -t cloudsecurityallianceorg/mcp-nodemailer:latest .

echo "✅ Build complete!"
echo "Image tags created:"
echo "- cloudsecurityallianceorg/mcp-nodemailer:$TAG"
echo "- cloudsecurityallianceorg/mcp-nodemailer:latest"
