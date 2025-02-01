# Claude MCP Server

An MCP server implementation that provides access to Anthropic's Claude models through a standardized interface, offering both general-purpose and task-specific interactions.

## Features

- **Multiple Model Support**: Access to Claude 3, Claude 2.1, and Claude Instant variants
- **Task-Specific Templates**: Built-in prompts for analysis, coding, and writing tasks
- **Custom System Prompts**: Support for custom behavioral instructions
- **Configurable Parameters**: Control over temperature and response length
- **Error Handling**: Robust error handling for API and runtime issues
- **Singleton Pattern**: Efficient management of API connections

## Tools

- **chat_with_claude**
  - Execute chat completions with various Claude models
  - Inputs:
    - `messages` (array): Conversation messages with roles and content
    - `model` (string, optional): Model selection (default: claude-3o)
    - `temperature` (number, optional): Response randomness (0-2, default: 0.7)
    - `maxTokens` (number, optional): Maximum response length (1-4096)
    - `system` (string, optional): Custom system prompt
    - `task` (string, optional): Task-specific prompt template

### Available Models

**Available Models:**
- `claude-3o`: Claude 3 Opus - Most capable, best for complex tasks
- `claude-3.5s`: Claude 3.5 Sonnet - Strong general-purpose model
- `claude-3.5h`: Claude 3.5 Haiku - Fast, efficient for simpler tasks

### Task Templates

- `analysis`: Detailed analytical thinking
- `coding`: Programming and software development
- `writing`: Content creation and writing

## Configuration

### Getting an API Key
1. Sign up for an [Anthropic account](https://console.anthropic.com/)
2. Navigate to the [API keys section](https://console.anthropic.com/settings/keys)
3. Create a new API key

### Usage with Claude Desktop
Add this to your `claude_desktop_config.json`:

### Docker

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
        "ANTHROPIC_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "claude": {
      "command": "npx",
      "args": [
        "-y",
        "@cloudsecurityalliance/mcp-chat-claude"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

## Build

Docker build:

```bash
# Build with BuildKit enabled
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-claude:latest .

# Or build with version tag
VERSION=0.1.0
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-claude:${VERSION} .
```

## Version Tagging

For production deployments:

```bash
VERSION=0.1.0

# Tag as latest
docker tag cloudsecurityallianceorg/mcp-chat-claude:${VERSION} cloudsecurityallianceorg/mcp-chat-claude:latest

# Push to registry
docker push cloudsecurityallianceorg/mcp-chat-claude:${VERSION}
docker push cloudsecurityallianceorg/mcp-chat-claude:latest
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.