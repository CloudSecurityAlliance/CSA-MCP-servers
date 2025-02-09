# Docker Build Instructions

This document describes how to build and use the Docker image for the MCP Nodemailer server.

## Building the Image

### Basic Build
From within the `/src/nodemailer` directory:
```bash
docker build .
```

### Building with Tags
To build with a timestamp tag (recommended):
```bash
TAG=$(date +%Y-%m-%d-%H-%M)
docker build -t cloudsecurityallianceorg/mcp-nodemailer:$TAG .
```

To build with both timestamp and latest tags:
```bash
TAG=$(date +%Y-%m-%d-%H-%M)
docker build -t cloudsecurityallianceorg/mcp-nodemailer:$TAG -t cloudsecurityallianceorg/mcp-nodemailer:latest .
```

## Environment Variables

The Docker container requires several environment variables to be set:

Required:
- `EMAIL_SERVICE`: Email service to use (e.g., "gmail", "outlook")
- `EMAIL_FROM`: Sender email address
- `EMAIL_USERNAME`: Authentication username
- `EMAIL_PASSWORD`: Authentication password

Optional:
- `EMAIL_ALLOW_LIST`: JSON array of allowed email patterns
- `EMAIL_BLOCK_LIST`: JSON array of blocked email patterns

## Running the Container

Basic run command:
```bash
docker run -e EMAIL_SERVICE=gmail \
           -e EMAIL_FROM=your-email@gmail.com \
           -e EMAIL_USERNAME=your-email@gmail.com \
           -e EMAIL_PASSWORD=your-app-password \
           cloudsecurityallianceorg/mcp-nodemailer:latest
```

With allow list:
```bash
docker run -e EMAIL_SERVICE=gmail \
           -e EMAIL_FROM=your-email@gmail.com \
           -e EMAIL_USERNAME=your-email@gmail.com \
           -e EMAIL_PASSWORD=your-app-password \
           -e EMAIL_ALLOW_LIST='["@company.com", "partner@external.com"]' \
           cloudsecurityallianceorg/mcp-nodemailer:latest
```

## Development and Testing

To build a development version:
```bash
docker build --target builder .
```

To run tests in a container:
```bash
docker build --target builder . -t mcp-nodemailer-builder
docker run mcp-nodemailer-builder npm test
```

## Publishing the Image

To push the image to the Docker registry:
```bash
# Push both timestamp and latest tags if you built with both
TAG=$(date +%Y-%m-%d-%H-%M)
docker push cloudsecurityallianceorg/mcp-nodemailer:$TAG
docker push cloudsecurityallianceorg/mcp-nodemailer:latest
```

If you only built with a timestamp tag and want to add latest later:
```bash
# Tag an existing timestamped version as latest
docker tag cloudsecurityallianceorg/mcp-nodemailer:$TAG cloudsecurityallianceorg/mcp-nodemailer:latest

# Then push the latest tag
docker push cloudsecurityallianceorg/mcp-nodemailer:latest
```

## Security Notes

1. Never commit Docker images with credentials
2. Use `.dockerignore` to prevent sensitive files from being copied
3. Use multi-stage builds to minimize the final image size
4. Consider using Docker secrets for production deployments
5. Regularly update base images for security patches