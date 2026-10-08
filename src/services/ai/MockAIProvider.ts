import type { AIProvider } from './AIProvider';

export class MockAIProvider implements AIProvider {
  readonly id = 'demo' as const;
  readonly name = 'PUSULA Akıllı Çevrimdışı / Demo Motoru';

  isConfigured(): boolean {
    return true; // Always available and rock solid
  }

  async generateJSON<T>(_systemPrompt: string, _userPrompt: string, fallback: T): Promise<T> {
    // Simulate brief realistic AI reasoning latency (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));
    return fallback;
  }
}
