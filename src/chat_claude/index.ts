#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { AnthropicService } from './services/anthropic.js';
import { 
  MODEL_MAPPING,
  TASK_PROMPTS,
  AnthropicError, 
  ChatRequest, 
  ModelName,
  TaskType,
  MCPMessage 
} from './types.js';

// Validate environment
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Anthropic service
const anthropicService = AnthropicService.getInstance(ANTHROPIC_API_KEY);

// Define available tools
const CHAT_TOOL: Tool = {
  name: "chat_with_claude",
  description: `Talk directly with Anthropic's Claude models. You can use this tool to get responses from different versions of Claude.

Example usage:
  "Can you ask claude-3o about ..."
  "Let's see what claude-3.5s thinks about ..."

Available models:

- claude-3o      : Claude 3 Opus - Most capable, best for complex tasks
- claude-3.5s    : Claude 3.5 Sonnet - Strong general-purpose model
- claude-3.5h    : Claude 3.5 Haiku - Fast, efficient for simpler tasks

Task-specific prompts available:
- analysis: Detailed analytical thinking
- coding: Programming and software development
- writing: Content creation and writing

Default model: claude-3o`,
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        description: "Array of messages for the conversation",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              enum: ["user", "assistant"],
              description: "Role of the message sender"
            },
            content: {
              type: "string",
              description: "Content of the message"
            }
          },
          required: ["role", "content"]
        }
      },
      model: {
        type: "string",
        enum: Object.keys(MODEL_MAPPING),
        description: "Model to use for the chat completion",
        default: "claude-3o"
      },
      temperature: {
        type: "number",
        description: "Sampling temperature (0-2.0). Lower values make responses more focused and deterministic",
        minimum: 0,
        maximum: 2,
        default: 0.7
      },
      maxTokens: {
        type: "number",
        description: "Maximum length of the response in tokens",
        minimum: 1,
        maximum: 4096
      },
      system: {
        type: "string",
        description: "Optional system prompt to guide Claude's behavior"
      },
      task: {
        type: "string",
        enum: Object.keys(TASK_PROMPTS),
        description: "Optional task-specific prompt template"
      }
    },
    required: ["messages"]
  }
};

interface MCPArguments {
  messages: Array<MCPMessage>;
  model?: ModelName;
  temperature?: number;
  maxTokens?: number;
  system?: string;
  task?: TaskType;
}

// Validate and transform incoming requests
function validateAndTransformRequest(args: unknown): ChatRequest {
  const typedArgs = args as MCPArguments;
  
  if (!typedArgs || typeof typedArgs !== 'object') {
    throw new McpError(
      ErrorCode.ParseError,
      'Invalid request format'
    );
  }

  if (!Array.isArray(typedArgs.messages) || typedArgs.messages.length === 0) {
    throw new McpError(
      ErrorCode.ParseError,
      'Messages array is required and must not be empty'
    );
  }

  // Validate each message
  for (const msg of typedArgs.messages) {
    if (!msg || typeof msg !== 'object' || 
        !msg.role || !msg.content || 
        typeof msg.role !== 'string' || 
        typeof msg.content !== 'string' ||
        !['user', 'assistant'].includes(msg.role)) {
      throw new McpError(
        ErrorCode.ParseError,
        'Each message must have a valid role (user or assistant) and content string'
      );
    }
  }

  // Validate model if provided
  if (typedArgs.model !== undefined && 
      !Object.keys(MODEL_MAPPING).includes(typedArgs.model)) {
    throw new McpError(
      ErrorCode.ParseError,
      `Invalid model. Must be one of: ${Object.keys(MODEL_MAPPING).join(', ')}`
    );
  }

  // Validate temperature if provided
  if (typedArgs.temperature !== undefined &&
      (typeof typedArgs.temperature !== 'number' ||
       typedArgs.temperature < 0 ||
       typedArgs.temperature > 2)) {
    throw new McpError(
      ErrorCode.ParseError,
      'Temperature must be a number between 0 and 2'
    );
  }

  // Validate maxTokens if provided
  if (typedArgs.maxTokens !== undefined &&
      (typeof typedArgs.maxTokens !== 'number' ||
       typedArgs.maxTokens < 1 ||
       typedArgs.maxTokens > 4096)) {
    throw new McpError(
      ErrorCode.ParseError,
      'maxTokens must be a number between 1 and 4096'
    );
  }

  return {
    messages: typedArgs.messages,
    model: typedArgs.model || 'claude-3o',
    temperature: typedArgs.temperature,
    maxTokens: typedArgs.maxTokens,
    system: typedArgs.system,
    task: typedArgs.task
  };
}

// Initialize MCP server
const server = new Server(
  {
    name: "mcp-claude",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register tool listing handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [CHAT_TOOL]
}));

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "chat_with_claude") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${name}`
    );
  }

  try {
    const chatRequest = validateAndTransformRequest(args);
    const response = await anthropicService.chat(chatRequest);

    return {
      content: [{
        type: "text",
        text: response.content
      }]
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    if (error instanceof AnthropicError) {
      throw new McpError(
        ErrorCode.InternalError,
        `Anthropic API error: ${error.message}`
      );
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

// Start server
async function runServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Claude MCP Server running on stdio");
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

runServer();