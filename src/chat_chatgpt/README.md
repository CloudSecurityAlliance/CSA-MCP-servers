# ChatGPT MCP Server

An MCP server implementation that provides access to OpenAI's ChatGPT models through a standardized interface, offering both general-purpose and specialized reasoning models.

## Features

- **Multiple Model Support**: Access to both GPT-4 and GPT-3.5 variants
- **Specialized Reasoning Models**: Models optimized for step-by-step problem solving
- **Configurable Parameters**: Control over temperature and response length
- **Error Handling**: Robust error handling for API and runtime issues
- **Singleton Pattern**: Efficient management of API connections

## Tools

- **chat_with_chatgpt**
  - Execute chat completions with various GPT models
  - Inputs:
    - `messages` (array): Conversation messages with roles and content
    - `model` (string, optional): Model selection (default: gpt-4o)
    - `temperature` (number, optional): Response randomness (0-2, default: 0.7)
    - `maxTokens` (number, optional): Maximum response length (1-4096)

### Available Models

**GPT Models (Fast and versatile):**
- `gpt-4o`: Latest GPT-4 Turbo - Best for general use
- `gpt-4o-mini`: GPT-3.5 Turbo - Faster and more cost-effective

**Reasoning Models (Specialized in step-by-step analysis):**
- `o1`: Advanced reasoning with GPT-4
- `o1-mini`: Balanced reasoning with GPT-3.5
- `o3-mini`: Efficient reasoning with GPT-3.5

## Configuration

### Getting an API Key
1. Sign up for an [OpenAI account](https://platform.openai.com/signup)
2. Navigate to the [API keys section](https://platform.openai.com/account/api-keys)
3. Create a new API key with appropriate permissions

### Usage with Claude Desktop
Add this to your `claude_desktop_config.json`:

### Docker

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
        "OPENAI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "chatgpt": {
      "command": "npx",
      "args": [
        "-y",
        "@cloudecurityalliance/mcp-chat-chatgpt"
      ],
      "env": {
        "OPENAI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

## Build

Docker build:

```bash
# Build with BuildKit enabled
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-chatgpt:latest .

# Or build with version tag
VERSION=0.1.0
DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-chatgpt:${VERSION} .
```

## Version Tagging

For production deployments:

```bash
VERSION=0.1.0

# Tag as latest
docker tag cloudsecurityallianceorg/mcp-chat-chatgpt:${VERSION} cloudsecurityallianceorg/mcp-chat-chatgpt:latest

# Push to registry
docker push cloudsecurityallianceorg/mcp-chat-chatgpt:${VERSION}
docker push cloudsecurityallianceorg/mcp-chat-chatgpt:latest
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.