#!/bin/bash

# Exit on any error
set -e

echo "🚀 Building Docker image..."
TAG=$(date +%Y-%m-%d-%H-%M)
docker build -t cloudsecurityallianceorg/mcp-nodemailer:$TAG .

echo "📋 Running Node.js tests..."
node test-docker.js

echo "✅ All tests completed successfully!"