import Anthropic from '@anthropic-ai/sdk';
import {
  ChatRequest,
  ChatResponse,
  MODEL_MAPPING,
  TASK_PROMPTS,
  AnthropicError,
  ModelName,
  TaskType,
  MCPMessage
} from '../types.js';

export class AnthropicService {
  private client: Anthropic;
  private static instance: AnthropicService;

  private constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey
    });
  }

  public static getInstance(apiKey: string): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService(apiKey);
    }
    return AnthropicService.instance;
  }

  private validateApiKey() {
    if (!this.client) {
      throw new AnthropicError(
        'Anthropic API key not configured',
        'configuration_error',
        401
      );
    }
  }

  private getModelId(modelName: ModelName): string {
    const modelId = MODEL_MAPPING[modelName];
    if (!modelId) {
      throw new AnthropicError(
        `Unsupported model: ${modelName}`,
        'invalid_model',
        400
      );
    }
    return modelId;
  }

  private getTaskPrompt(task?: TaskType): string | undefined {
    if (task && task in TASK_PROMPTS) {
      return TASK_PROMPTS[task as keyof typeof TASK_PROMPTS];
    }
    return undefined;
  }

  private prepareSystemPrompt(request: ChatRequest): string | undefined {
    // If a task is specified, use its prompt as a base
    let systemPrompt = this.getTaskPrompt(request.task);
    
    // If there's a custom system prompt, append it or use it alone
    if (request.system) {
      systemPrompt = systemPrompt 
        ? `${systemPrompt}\n\nAdditional Instructions:\n${request.system}`
        : request.system;
    }
    
    return systemPrompt;
  }

  private transformMessages(messages: MCPMessage[]): Array<{role: 'user' | 'assistant', content: string}> {
    return messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
  }

  public async chat(request: ChatRequest): Promise<ChatResponse> {
    this.validateApiKey();

    try {
      const modelId = this.getModelId(request.model || 'claude-3o');
      const systemPrompt = this.prepareSystemPrompt(request);
      const messages = this.transformMessages(request.messages);

      const response = await this.client.messages.create({
        model: modelId,
        messages,
        system: systemPrompt,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens || 1024
      });

      if (!response.content || response.content.length === 0) {
        throw new AnthropicError(
          'No response content received from Anthropic',
          'empty_response',
          500
        );
      }

      return {
        content: response.content[0].text,
        model: modelId,
        usage: response.usage ? {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        } : undefined
      };
    } catch (error) {
      if (error instanceof AnthropicError) {
        throw error;
      }

      // Handle Anthropic API errors
      if (error instanceof Anthropic.APIError) {
        throw new AnthropicError(
          error.message,
          String(error.status || 'api_error'),
          typeof error.status === 'number' ? error.status : undefined
        );
      }

      // Handle unexpected errors
      throw new AnthropicError(
        'An unexpected error occurred',
        'unknown_error',
        500
      );
    }
  }
}