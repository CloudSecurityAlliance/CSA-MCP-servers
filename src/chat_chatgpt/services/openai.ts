import OpenAI from 'openai';
import {
  ChatRequest,
  ChatResponse,
  MODEL_MAPPING,
  REASONING_PROMPTS,
  OpenAIError,
  ModelName,
} from '../types.js';

export class OpenAIService {
  private client: OpenAI;
  private static instance: OpenAIService;

  private constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      maxRetries: 3,
    });
  }

  public static getInstance(apiKey: string): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService(apiKey);
    }
    return OpenAIService.instance;
  }

  private validateApiKey() {
    if (!this.client) {
      throw new OpenAIError(
        'OpenAI API key not configured',
        'configuration_error',
        401
      );
    }
  }

  private getModelId(modelName: ModelName): string {
    const modelId = MODEL_MAPPING[modelName];
    if (!modelId) {
      throw new OpenAIError(
        `Unsupported model: ${modelName}`,
        'invalid_model',
        400
      );
    }
    return modelId;
  }

  private addReasoningPrompt(messages: Array<any>, model: ModelName) {
    if (model in REASONING_PROMPTS) {
      // Add the special system prompt for reasoning models
      return [
        {
          role: 'system',
          content: REASONING_PROMPTS[model as keyof typeof REASONING_PROMPTS]
        },
        ...messages
      ];
    }
    return messages;
  }

  public async chat(request: ChatRequest): Promise<ChatResponse> {
    this.validateApiKey();

    try {
      const modelId = this.getModelId(request.model || 'gpt-4o');
      const messages = this.addReasoningPrompt(request.messages, request.model || 'gpt-4o');

      const completion = await this.client.chat.completions.create({
        model: modelId,
        messages: messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        stream: false
      });

      const choice = completion.choices[0];
      
      if (!choice?.message?.content) {
        throw new OpenAIError(
          'No response content received from OpenAI',
          'empty_response',
          500
        );
      }

      return {
        content: choice.message.content,
        model: modelId,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      if (error instanceof OpenAIError) {
        throw error;
      }

      // Handle OpenAI API errors
      if (error instanceof OpenAI.APIError) {
        throw new OpenAIError(
          error.message,
          error.code || 'api_error',
          error.status
        );
      }

      // Handle unexpected errors
      throw new OpenAIError(
        'An unexpected error occurred',
        'unknown_error',
        500
      );
    }
  }
}