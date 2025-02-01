# Gemini MCP Server

A Model Context Protocol (MCP) server implementation that provides standardized access to Google's Gemini language models, offering both the fast Gemini 1.5 and experimental Gemini 2.0 models through a consistent interface.

## Features

- **Multiple Model Support**
  - `gemini-1.5-flash`: Fast, efficient model based on Gemini 1.5 Pro
  - `gemini-2.0-flash-exp`: Experimental model based on Gemini 2.0 Pro

- **Smart Message Handling**
  - Automatic handling of conversation history
  - System message integration
  - Proper error handling and recovery

- **Configurable Parameters**
  - Temperature control for response randomness
  - Maximum token limits
  - Model selection

## Quick Start

### Prerequisites

1. Node.js 20 or higher
2. Google AI API key
3. Docker (optional, for containerized usage)

### Installation

```bash
# Clone the repository
git clone https://github.com/cloudsecurityalliance/mcp-servers.git

# Navigate to the Gemini server directory
cd mcp-servers/src/chat_gemini

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

### Running the Server

1. **Direct Node.js Usage**:
   ```bash
   export GOOGLE_AI_API_KEY="your-key-here"
   npm start
   ```

2. **Docker Usage**:
   ```bash
   DOCKER_BUILDKIT=1 docker build -t cloudsecurityallianceorg/mcp-chat-gemini:latest .
   docker run -i --rm -e GOOGLE_AI_API_KEY="your-key-here" cloudsecurityallianceorg/mcp-chat-gemini
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

## Available Tools

### chat_with_gemini

Enables direct interaction with Gemini models through a chat interface.

Parameters:
- `messages`: Array of conversation messages
  - `role`: "system", "user", or "assistant"
  - `content`: Message text
- `model`: Model selection (default: "gemini-1.5-flash")
- `temperature`: Response randomness (0-2, default: 0.7)
- `maxTokens`: Maximum response length (1-4096)

Example usage:
```javascript
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful AI assistant."
    },
    {
      "role": "user",
      "content": "What is artificial intelligence?"
    }
  ],
  "model": "gemini-1.5-flash",
  "temperature": 0.7
}
```

## Configuration

### Getting a Google AI API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in or create an account
3. Create a new API key
4. Set the `GOOGLE_AI_API_KEY` environment variable with your key

### Environment Variables

- `GOOGLE_AI_API_KEY`: Required. Your Google AI API key.
- `NODE_ENV`: Optional. Set to "production" for production use.

## Development

### Project Structure

```
src/chat_gemini/
├── services/
│   └── gemini.ts      # Gemini API service implementation
├── index.ts           # Main server implementation
├── types.ts           # Type definitions
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
├── Dockerfile         # Container definition
├── DOCKER.md         # Docker-specific instructions
└── README.md         # This file
```

### Building from Source

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch for changes during development
npm run watch
```

## Docker Support

See [DOCKER.md](DOCKER.md) for detailed instructions on:
- Building the container
- Running in production
- Version management
- Troubleshooting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security

- Runs as non-root user in Docker
- Uses secure defaults
- Implements proper error handling
- Validates all inputs

Report security issues to the Cloud Security Alliance security team.