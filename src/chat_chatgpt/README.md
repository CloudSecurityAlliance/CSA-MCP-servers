# ChatGPT MCP Server

[Previous content remains the same until Docker configuration section...]

### Usage with Claude Desktop
Add this to your `claude_desktop_config.json`:

#### Docker Method
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
