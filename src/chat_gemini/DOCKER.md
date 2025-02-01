# Docker Instructions for Gemini MCP Server

This document provides instructions for building, running, and deploying the Gemini MCP server using Docker.

## Prerequisites

- Docker installed and running
- Google AI API key
- BuildKit enabled (for efficient builds)

## Build Location

All build commands should be run from the `src/chat_gemini` directory:

```bash
# Navigate to the correct directory
cd /path/to/CSA-MCP-servers/src/chat_gemini

# Verify you're in the correct location
ls
# Should show: Dockerfile, index.ts, package.json, etc.
```

## Quick Start

```bash
# Build the image with BuildKit enabled
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-gemini:latest .

# Run the container
docker run -i --rm \
  -e GOOGLE_AI_API_KEY="your-key-here" \
  cloudsecurityallianceorg/mcp-chat-gemini
```

## Integration with Claude Desktop

Add this configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GOOGLE_AI_API_KEY",
        "cloudsecurityallianceorg/mcp-chat-gemini"
      ],
      "env": {
        "GOOGLE_AI_API_KEY": "your-key-here"
      }
    }
  }
}
```

## Version Tagging

For production deployments:

```bash
# Build with version tag
VERSION=0.1.0
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-gemini:${VERSION} .

# Tag as latest
docker tag cloudsecurityallianceorg/mcp-chat-gemini:${VERSION} cloudsecurityallianceorg/mcp-chat-gemini:latest

# Push to registry (if needed)
docker push cloudsecurityallianceorg/mcp-chat-gemini:${VERSION}
docker push cloudsecurityallianceorg/mcp-chat-gemini:latest
```

## Environment Variables

- `GOOGLE_AI_API_KEY`: Required. Your Google AI API key for accessing Gemini models.

## Security Notes

The container:
- Runs as a non-root user
- Contains only production dependencies
- Uses multi-stage build to minimize image size
- Exposes no ports (uses stdio for communication)

## Troubleshooting

1. If you get permission errors:
   ```bash
   # Check that the API key is set correctly
   echo $GOOGLE_AI_API_KEY
   ```

2. If the container exits immediately:
   ```bash
   # Run with more verbose output
   docker run -i --rm -e GOOGLE_AI_API_KEY="your-key-here" cloudsecurityallianceorg/mcp-chat-gemini 2>&1 | tee output.log
   ```

3. To check the built image:
   ```bash
   # List image details
   docker images cloudsecurityallianceorg/mcp-chat-gemini
   ```