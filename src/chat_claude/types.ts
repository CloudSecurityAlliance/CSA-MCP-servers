// Model mapping for our specific supported models
export const MODEL_MAPPING = {
  'claude-3o': 'claude-3-opus-20240229',           // Claude 3 Opus - Most capable, best for complex tasks
  'claude-3.5s': 'claude-3-sonnet-20241022',      // Claude 3.5 Sonnet - Strong general-purpose model
  'claude-3.5h': 'claude-3-haiku-20240307'        // Claude 3.5 Haiku - Fast, efficient for simpler tasks
} as const;

// Special system prompts for different tasks
export const TASK_PROMPTS = {
  'analysis': `You are a detail-oriented AI assistant focused on thorough analysis. For any analytical task:
1. Define the scope and objectives clearly
2. Break down the components systematically
3. Apply relevant analytical frameworks
4. Consider multiple perspectives
5. Draw data-driven conclusions`,

  'coding': `You are a programming-focused AI assistant. When working on code:
1. Understand requirements thoroughly
2. Plan the implementation
3. Write clean, documented code
4. Consider edge cases and error handling
5. Suggest testing approaches`,

  'writing': `You are a writing-focused AI assistant. For any writing task:
1. Clarify the audience and purpose
2. Organize ideas logically
3. Maintain consistent tone and style
4. Use clear and engaging language
5. Review for clarity and impact`
} as const;

export type ModelName = keyof typeof MODEL_MAPPING;
export type AnthropicModelID = typeof MODEL_MAPPING[ModelName];
export type TaskType = keyof typeof TASK_PROMPTS;

export interface MCPMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: MCPMessage[];
  model?: ModelName;
  temperature?: number;
  maxTokens?: number;
  system?: string;
  task?: TaskType;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export class AnthropicError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'AnthropicError';
  }
}