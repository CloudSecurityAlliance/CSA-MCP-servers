# Docker Instructions for ChatGPT MCP Server

This document provides instructions for building, running, and deploying the ChatGPT MCP server using Docker.

## Build Location

All build commands should be run from the `src/chat_chatgpt` directory, which contains the Dockerfile and source files:

```bash
# Navigate to the correct directory
cd /path/to/PRIVATE-servers/src/chat_chatgpt

# Verify you're in the correct location
ls
# Should show: Dockerfile, index.ts, package.json, etc.
```

## Quick Start

```bash
# Build the image with BuildKit enabled (run from src/chat_chatgpt directory)
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-chatgpt:latest .

# Run the container
docker run -i --rm -e OPENAI_API_KEY="your-key-here" cloudsecurityallianceorg/mcp-chat-chatgpt
```

## Integration with Claude Desktop

Add this configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "chatgpt": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "OPENAI_API_KEY",
        "cloudsecurityallianceorg/mcp-chat-chatgpt"
      ],
      "env": {
        "OPENAI_API_KEY": "your-key-here"
      }
    }
  }
}
```

[rest of the content remains the same...]

## Version Tagging

For production deployments:

```bash
# Build with version tag
VERSION=0.1.0
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-chatgpt:${VERSION} .

# Tag as latest
docker tag cloudsecurityallianceorg/mcp-chat-chatgpt:${VERSION} cloudsecurityallianceorg/mcp-chat-chatgpt:latest

# Optionally push to registry
docker push cloudsecurityallianceorg/mcp-chat-chatgpt:${VERSION}
docker push cloudsecurityallianceorg/mcp-chat-chatgpt:latest
```