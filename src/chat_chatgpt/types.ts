import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Model mapping for our specific supported models
export const MODEL_MAPPING = {
  'gpt-4o': 'gpt-4-turbo-preview',     // Latest GPT-4 Turbo
  'gpt-4o-mini': 'gpt-3.5-turbo',      // Latest GPT-3.5 Turbo
  'o1': 'gpt-4-turbo-preview',         // GPT-4 Turbo with reasoning
  'o1-mini': 'gpt-3.5-turbo',          // GPT-3.5 Turbo with reasoning
  'o3-mini': 'gpt-3.5-turbo'           // GPT-3.5 Turbo with focused reasoning
} as const;

// Special system prompts for reasoning models
export const REASONING_PROMPTS = {
  'o1': `You are a reasoning-focused AI assistant. Break down problems step by step using chain-of-thought reasoning.
Always structure your responses as follows:
1. First, clearly state the problem or question
2. Break down the components or key considerations
3. Think through each step logically
4. Consider alternative approaches
5. Draw a clear conclusion
Use explicit reasoning markers like "Therefore...", "Because...", "This implies..."`,

  'o1-mini': `You are an AI focused on clear step-by-step reasoning. For any question or task:
1. State what needs to be solved
2. Break it into smaller parts
3. Think through each part systematically
4. Connect the pieces
5. Summarize the conclusion`,

  'o3-mini': `You are a focused reasoning AI that excels at breaking down problems:
1. Identify the core question
2. List the key components
3. Analyze step by step
4. Form logical connections
5. Present clear conclusions
Always be concise and precise in your reasoning.`
} as const;

export type ModelName = keyof typeof MODEL_MAPPING;
export type OpenAIModelID = typeof MODEL_MAPPING[ModelName];

export interface MCPMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: MCPMessage[];
  model?: ModelName;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}