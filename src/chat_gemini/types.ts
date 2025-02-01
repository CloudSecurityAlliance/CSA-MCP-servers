/**
 * Maps user-friendly model names to actual Gemini model identifiers.
 * - gemini-1.5-flash: Optimized for speed and efficiency
 * - gemini-2.0-flash-exp: Experimental model with enhanced capabilities
 */
export const MODEL_MAPPING = {
  'gemini-1.5-flash': 'gemini-1.5-pro',
  'gemini-2.0-flash-exp': 'gemini-2.0-pro'
} as const;

/**
 * Valid model names that can be requested by users
 */
export type ModelName = keyof typeof MODEL_MAPPING;

/**
 * Actual Gemini model identifiers
 */
export type GeminiModelID = typeof MODEL_MAPPING[ModelName];

/**
 * Message role types in a conversation
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Structure of a single message in the conversation
 */
export interface MCPMessage {
  role: MessageRole;
  content: string;
}

/**
 * Chat request parameters
 */
export interface ChatRequest {
  messages: MCPMessage[];
  model?: ModelName;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Chat response structure
 */
export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Custom error class for Gemini-specific errors
 */
export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * All possible error codes that can be returned by the Gemini service
 */
export enum GeminiErrorCode {
  ConfigurationError = 'configuration_error',
  InvalidModel = 'invalid_model',
  APIError = 'api_error',
  RateLimitExceeded = 'rate_limit_exceeded',
  InvalidRequest = 'invalid_request',
  UnknownError = 'unknown_error'
}