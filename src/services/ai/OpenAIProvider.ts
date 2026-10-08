import type { AIProvider } from './AIProvider';

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai' as const;
  readonly name = 'OpenAI GPT-4o Mini';

  private getApiKey(): string {
    const fromEnv = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_OPENAI_API_KEY;
    if (fromEnv) return fromEnv;
    try {
      const stored = localStorage.getItem('pusula_app_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.openaiApiKey || '';
      }
    } catch {
      // ignore
    }
    return '';
  }

  isConfigured(): boolean {
    return Boolean(this.getApiKey().trim());
  }

  async generateJSON<T>(systemPrompt: string, userPrompt: string, fallback: T): Promise<T> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('[OpenAIProvider] API anahtarı girilmedi, fallback verisi kullanılıyor.');
      return fallback;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI HTTP hatası: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('OpenAI boş yanıt döndürdü.');

      return JSON.parse(content) as T;
    } catch (err) {
      console.error('[OpenAIProvider] Hata oluştu, fallback kullanılıyor:', err);
      return fallback;
    }
  }
}
