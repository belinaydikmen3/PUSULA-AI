export interface AIProvider {
  readonly id: 'demo' | 'gemini' | 'openai';
  readonly name: string;
  isConfigured(): boolean;
  generateJSON<T>(systemPrompt: string, userPrompt: string, fallback: T): Promise<T>;
}
