#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolRequest,
  McpError,
  ErrorCode
} from "@modelcontextprotocol/sdk/types.js";
import nodemailer, { type SendMailOptions } from 'nodemailer';
import { sendEmailArgsSchema, sendEmailToolSchema, serverConfigSchema, type ServerConfig, type EmailPattern } from "./schema.js";
import { EmailValidator } from "./email-validator.js";

class EmailServer {
  private transporter: nodemailer.Transporter;
  private config: ServerConfig;
  private server: Server;
  private emailValidator: EmailValidator;

  constructor(config: ServerConfig) {
    // Validate config
    const validatedConfig = serverConfigSchema.parse(config);
    this.config = validatedConfig;
    
    // Initialize email validator
    this.emailValidator = new EmailValidator(
      validatedConfig.allow_list,
      validatedConfig.block_list
    );

    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      service: config.email_service,
      auth: {
        user: config.email_username,
        pass: config.email_password,
      },
    });

    // Initialize MCP server
    this.server = new Server({
      name: "nodemailer-kurtseifried",
      version: "1.0.0",
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: "send_email",
        description: "Send an email with optional attachments and generated content",
        inputSchema: sendEmailToolSchema
      }]
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      if (request.params.name !== "send_email") {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      try {
        const args = sendEmailArgsSchema.parse(request.params.arguments);
        
        // Check if email is allowed
        if (!this.emailValidator.isEmailAllowed(args.to)) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Email to ${args.to} is not allowed by current configuration`
          );
        }

        // Prepare email options
        const mailOptions: SendMailOptions = {
          from: this.config.email_from,
          to: args.to,
          subject: args.subject,
          html: args.message_content, // Allow HTML content
          text: args.message_content.replace(/<[^>]*>?/gm, ''), // Strip HTML for plaintext alternative
          attachments: [], // Initialize empty array for attachments
        };

        // Handle attachments
        if (args.attachments) {
          for (const attachment of args.attachments) {
            // Handle generated content if specified
            if (attachment.generateContent) {
              // Here we would normally implement the content generation logic
              // For now, just use a placeholder
              const generatedContent = "Generated content placeholder";
              if (mailOptions.attachments) {
                mailOptions.attachments.push({
                  filename: attachment.filename,
                  content: generatedContent,
                  contentType: attachment.contentType || 'text/plain',
                });
              }
            } else if (attachment.content) {
              // Direct content attachment
              if (mailOptions.attachments) {
                mailOptions.attachments.push({
                  filename: attachment.filename,
                  content: attachment.content,
                  contentType: attachment.contentType,
                });
              }
            }
          }
        }

        await this.transporter.sendMail(mailOptions);
        return {
          content: [{
            type: "text",
            text: `Email sent successfully to ${args.to}`,
          }],
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Function to parse email patterns from environment variable
function parseEmailPatterns(envVar: string | undefined): EmailPattern[] | undefined {
  if (!envVar) return undefined;
  
  // Split on commas and trim whitespace
  const patterns = envVar.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  // Convert each pattern to an EmailPattern object
  return patterns.map(pattern => EmailValidator.parseEmailPattern(pattern));
}

// Get configuration from environment variables
const config: ServerConfig = {
  email_service: process.env.EMAIL_SERVICE || '',
  email_from: process.env.EMAIL_FROM || '',
  email_username: process.env.EMAIL_USERNAME || '',
  email_password: process.env.EMAIL_PASSWORD || '',
  allow_list: parseEmailPatterns(process.env.EMAIL_ALLOW_LIST),
  block_list: parseEmailPatterns(process.env.EMAIL_BLOCK_LIST),
};

// Validate config
if (!config.email_service || !config.email_from || !config.email_username || !config.email_password) {
  throw new Error('Missing required environment variables. Please set EMAIL_SERVICE, EMAIL_FROM, EMAIL_USERNAME, and EMAIL_PASSWORD');
}

// Start the server
const server = new EmailServer(config);
await server.start();