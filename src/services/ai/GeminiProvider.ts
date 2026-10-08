import type { AIProvider } from './AIProvider';

export class GeminiProvider implements AIProvider {
  readonly id = 'gemini' as const;
  readonly name = 'Google Gemini 1.5 Flash';

  private getApiKey(): string {
    const fromEnv = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY;
    if (fromEnv) return fromEnv;
    try {
      const stored = localStorage.getItem('pusula_app_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.geminiApiKey || '';
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
      console.warn('[GeminiProvider] API anahtarı girilmedi, fallback verisi kullanılıyor.');
      return fallback;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nÖNEMLİ KURAL: Yanıtı YALNIZCA geçerli bir JSON nesnesi olarak ver. Markdown kod bloğu (örn \`\`\`json) KULLANMA, doğrudan saf JSON döndür.\n\nİstek:\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API HTTP hatası: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Gemini API boş yanıt döndürdü.');

      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (err) {
      console.error('[GeminiProvider] Hata oluştu, fallback kullanılıyor:', err);
      return fallback;
    }
  }
}
