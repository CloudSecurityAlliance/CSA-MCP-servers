# Docker Instructions for Claude MCP Server

This document provides instructions for building, running, and deploying the Claude MCP server using Docker.

## Build Location

All build commands should be run from the `src/chat_claude` directory, which contains the Dockerfile and source files:

```bash
# Navigate to the correct directory
cd /path/to/CSA-MCP-servers/src/chat_claude

# Verify you're in the correct location
ls
# Should show: Dockerfile, index.ts, package.json, etc.
```

## Quick Start

```bash
# Build the image with BuildKit enabled (run from src/chat_claude directory)
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-claude:latest .

# Run the container
docker run -i --rm -e ANTHROPIC_API_KEY="your-key-here" cloudsecurityallianceorg/mcp-chat-claude
```

## Integration with Claude Desktop

Add this configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "claude": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "ANTHROPIC_API_KEY",
        "cloudsecurityallianceorg/mcp-chat-claude"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "your-key-here"
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
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-claude:${VERSION} .

# Tag as latest
docker tag cloudsecurityallianceorg/mcp-chat-claude:${VERSION} cloudsecurityallianceorg/mcp-chat-claude:latest

# Optionally push to registry
docker push cloudsecurityallianceorg/mcp-chat-claude:${VERSION}
docker push cloudsecurityallianceorg/mcp-chat-claude:latest
```