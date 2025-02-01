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
import { GeminiService } from './services/gemini.js';
import { 
  MODEL_MAPPING,
  GeminiError, 
  ChatRequest, 
  ModelName,
  MCPMessage 
} from './types.js';

// Validate environment
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
if (!GOOGLE_AI_API_KEY) {
  console.error('Error: GOOGLE_AI_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Gemini service
const geminiService = GeminiService.getInstance(GOOGLE_AI_API_KEY);

// Define available tools
const CHAT_TOOL: Tool = {
  name: "chat_with_gemini",
  description: `Talk directly with Google's Gemini models. You can use this tool to get responses from different versions of Gemini.

Example usage:
  "Can you ask gemini-1.5-flash about ..."
  "Let's see what gemini-2.0-flash-exp thinks about ..."

Available models:
- gemini-1.5-flash     : Fast and efficient model based on Gemini 1.5 Pro
- gemini-2.0-flash-exp : More capable experimental model based on Gemini 2.0 Pro

Default model: gemini-1.5-flash`,
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
              enum: ["system", "user", "assistant"],
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
        default: "gemini-1.5-flash"
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
        !['system', 'user', 'assistant'].includes(msg.role)) {
      throw new McpError(
        ErrorCode.ParseError,
        'Each message must have a valid role (system, user, or assistant) and content string'
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
    model: typedArgs.model || 'gemini-1.5-flash',
    temperature: typedArgs.temperature,
    maxTokens: typedArgs.maxTokens
  };
}

// Initialize MCP server
const server = new Server(
  {
    name: "mcp-gemini",
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

  if (name !== "chat_with_gemini") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${name}`
    );
  }

  try {
    const chatRequest = validateAndTransformRequest(args);
    const response = await geminiService.chat(chatRequest);

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

    if (error instanceof GeminiError) {
      throw new McpError(
        ErrorCode.InternalError,
        `Gemini API error: ${error.message}`
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
    console.error("Gemini MCP Server running on stdio");
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

runServer();