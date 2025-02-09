import { z } from "zod";

// New type for email pattern matching
export type EmailPattern = {
  pattern: string;
  type: 'exact' | 'domain' | 'wildcard';
};

// Updated server configuration type
export type ServerConfig = {
  email_service: string;
  email_from: string;
  email_username: string;
  email_password: string;
  allow_list?: EmailPattern[];
  block_list?: EmailPattern[];
};

// Schema for email patterns
const emailPatternSchema = z.object({
  pattern: z.string(),
  type: z.enum(['exact', 'domain', 'wildcard'])
});

// Updated server config validation
export const serverConfigSchema = z.object({
  email_service: z.string(),
  email_from: z.string().email(),
  email_username: z.string(),
  email_password: z.string(),
  allow_list: z.array(emailPatternSchema).optional(),
  block_list: z.array(emailPatternSchema).optional()
}).refine(data => !(data.allow_list && data.block_list), {
  message: "Cannot specify both allow_list and block_list"
});

// Validation schema for email arguments
export const sendEmailArgsSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  message_content: z.string(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string().optional(),
    contentType: z.string().optional(),
    generateContent: z.object({
      type: z.enum(["conversation_summary", "custom"]),
      parameters: z.object({
        format: z.enum(["markdown", "text", "json"]).optional(),
        style: z.string().optional(),
        custom_prompt: z.string().optional(),
      }).optional(),
    }).optional(),
  })).optional(),
});

// JSON Schema for tool definition
export const sendEmailToolSchema = {
  type: "object",
  properties: {
    to: {
      type: "string",
      format: "email",
      description: "Recipient email address",
    },
    subject: {
      type: "string",
      description: "Email subject line",
    },
    message_content: {
      type: "string",
      description: "Email content (can be text or HTML)",
    },
    attachments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          filename: { type: "string" },
          content: { type: "string" },
          contentType: { type: "string" },
          generateContent: {
            type: "object",
            properties: {
              type: { 
                type: "string",
                enum: ["conversation_summary", "custom"]
              },
              parameters: {
                type: "object",
                properties: {
                  format: {
                    type: "string",
                    enum: ["markdown", "text", "json"]
                  },
                  style: { type: "string" },
                  custom_prompt: { type: "string" }
                }
              }
            }
          }
        },
        required: ["filename"]
      }
    }
  },
  required: ["to", "subject", "message_content"]
} as const;