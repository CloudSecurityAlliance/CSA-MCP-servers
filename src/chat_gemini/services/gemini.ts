import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ChatRequest,
  ChatResponse,
  MODEL_MAPPING,
  GeminiError,
  ModelName,
  MCPMessage,
  GeminiErrorCode
} from '../types.js';

/**
 * Singleton service for handling Gemini API interactions
 */
export class GeminiService {
  private client: GoogleGenerativeAI;
  private static instance: GeminiService;

  private constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Get or create the singleton instance
   */
  public static getInstance(apiKey: string): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService(apiKey);
    }
    return GeminiService.instance;
  }

  /**
   * Validate API key configuration
   */
  private validateApiKey(): void {
    if (!this.client) {
      throw new GeminiError(
        'Google AI API key not configured',
        GeminiErrorCode.ConfigurationError,
        401
      );
    }
  }

  /**
   * Get the actual Gemini model ID from our friendly name
   */
  private getModelId(modelName: ModelName): string {
    const modelId = MODEL_MAPPING[modelName];
    if (!modelId) {
      throw new GeminiError(
        `Unsupported model: ${modelName}`,
        GeminiErrorCode.InvalidModel,
        400
      );
    }
    return modelId;
  }

  /**
   * Format messages for Gemini's chat format
   * Note: Gemini has a different message format than OpenAI
   */
  private formatMessagesForGemini(messages: MCPMessage[]): { role: string; parts: string[] }[] {
    const formattedMessages: { role: string; parts: string[] }[] = [];
    let systemMessage = '';

    // Process messages in order
    for (const msg of messages) {
      if (msg.role === 'system') {
        // Collect system message to prepend to next user message
        systemMessage = msg.content;
      } else if (msg.role === 'user') {
        // For user messages, include any pending system message
        const content = systemMessage 
          ? `${systemMessage}\n\nUser: ${msg.content}`
          : msg.content;
        formattedMessages.push({
          role: 'user',
          parts: [content]
        });
        systemMessage = ''; // Clear system message after using
      } else if (msg.role === 'assistant') {
        formattedMessages.push({
          role: 'model',
          parts: [msg.content]
        });
      }
    }

    return formattedMessages;
  }

  /**
   * Main chat method to interact with Gemini
   */
  public async chat(request: ChatRequest): Promise<ChatResponse> {
    this.validateApiKey();

    try {
      // Get model and format messages
      const modelId = this.getModelId(request.model || 'gemini-1.5-flash');
      const formattedMessages = this.formatMessagesForGemini(request.messages);
      
      // Initialize model and chat
      const model = this.client.getGenerativeModel({ 
        model: modelId,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens,
        },
      });

      const chat = model.startChat();
      
      // Send all messages to establish context
      for (let i = 0; i < formattedMessages.length - 1; i++) {
        const msg = formattedMessages[i];
        await chat.sendMessage(msg.parts[0]);
      }

      // Send final message and get response
      const result = await chat.sendMessage(
        formattedMessages[formattedMessages.length - 1].parts[0]
      );

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new GeminiError(
          'No response content received from Gemini',
          GeminiErrorCode.APIError,
          500
        );
      }

      return {
        content: text,
        model: modelId
      };

    } catch (error) {
      if (error instanceof GeminiError) {
        throw error;
      }

      // Handle API-specific errors
      if (error instanceof Error) {
        // Check for rate limiting
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw new GeminiError(
            'Rate limit exceeded',
            GeminiErrorCode.RateLimitExceeded,
            429
          );
        }

        throw new GeminiError(
          error.message,
          GeminiErrorCode.APIError,
          500
        );
      }

      // Handle unexpected errors
      throw new GeminiError(
        'An unexpected error occurred',
        GeminiErrorCode.UnknownError,
        500
      );
    }
  }
}