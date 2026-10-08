import type { TeachBackFeedback } from '../../types';
import type { AIProvider } from './AIProvider';
import type { EvaluateTeachBackInput } from './types';

export class TeachBackEvaluator {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async evaluate(input: EvaluateTeachBackInput): Promise<TeachBackFeedback> {
    const text = input.userExplanation.trim();

    const systemPrompt = `Sen PUSULA AI Feynman & Teach-Back Koçusun.
Öğrencinin kendi cümleleriyle yaptığı konu anlatımını şu kriterlere göre değerlendir:
1. Doğruluk (Accuracy) [0-100]
2. Açıklık ve Netlik (Clarity) [0-100]
3. Eksiksizlik (Completeness) [0-100]
4. Eksik Kalan Kavramlar (missingConcepts: string dizisi)
5. Yanlış Anlaşılmalar / Kavram Yanılgıları (misconceptions: string dizisi)
6. Güçlü Yönler (positiveFeedback: string)
7. Eyleme Dönük Geliştirme Önerisi (actionableImprovement: string)
8. Genel Başarı Puanı (overallScore: number 0-100)

SADECE JSON döndür:
{
  "overallScore": number,
  "accuracyScore": number,
  "clarityScore": number,
  "completenessScore": number,
  "missingConcepts": string[],
  "misconceptions": string[],
  "positiveFeedback": string,
  "actionableImprovement": string,
  "suggestedNextStep": string
}`;

    const userPrompt = `Konu: ${input.topicName} (${input.topicKey})
Öğrencinin Kendi Açıklaması:
"${text}"
Beklenen Kilit Kavramlar: ${input.expectedKeyConcepts?.join(', ') || 'Temel mekanizma, gerçek dünya analojisi, kod bağlantısı'}`;

    try {
      if (this.provider.isConfigured() && this.provider.id !== 'demo') {
        const raw = await this.provider.generateJSON<any>(systemPrompt, userPrompt, null);
        if (raw && typeof raw.overallScore === 'number') {
          return {
            topicKey: input.topicKey,
            topicName: input.topicName,
            userExplanation: text,
            overallScore: Math.min(100, Math.max(0, raw.overallScore)),
            accuracyScore: raw.accuracyScore || 75,
            clarityScore: raw.clarityScore || 80,
            completenessScore: raw.completenessScore || 70,
            missingConcepts: Array.isArray(raw.missingConcepts) ? raw.missingConcepts : [],
            misconceptions: Array.isArray(raw.misconceptions) ? raw.misconceptions : [],
            positiveFeedback: raw.positiveFeedback || 'Açıklaman genel hatlarıyla iyi bir kavrayış sergiliyor.',
            actionableImprovement: raw.actionableImprovement || 'Eksik kavramları somut bir örnekle güçlendirebilirsin.',
            suggestedNextStep: raw.suggestedNextStep || 'Kavramı pekiştirmek için bir kod uygulaması yap.',
            evaluatedAt: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn('[TeachBackEvaluator] AI çağrısı hatası, yerel değerlendirici kullanılıyor:', err);
    }

    return this.createLocalEvaluation(input);
  }

  private createLocalEvaluation(input: EvaluateTeachBackInput): TeachBackFeedback {
    const text = input.userExplanation.toLowerCase();
    const length = input.userExplanation.trim().split(/\s+/).length;

    let accuracy = 70;
    let clarity = 75;
    let completeness = 65;
    const missing: string[] = [];
    const misconceptions: string[] = [];

    // Keyword detection based on topic
    if (input.topicKey === 'polymorphism' || input.topicName.toLowerCase().includes('polymorphism') || input.topicName.toLowerCase().includes('çok biçimlilik')) {
      const hasDuck = text.includes('duck') || text.includes('ördek') || text.includes('tip');
      const hasOverriding = text.includes('override') || text.includes('ezme') || text.includes('aynı isim');

      if (!hasDuck) missing.push('Duck Typing mekanizması');
      if (!hasOverriding) missing.push('Metot ezme (Method Overriding) ilişkisi');
      if (text.includes('aşırı yükleme') || text.includes('overload')) {
        misconceptions.push('Python varsayılan olarak method overloading desteklemez; runtime polimorfizmi kullanılır.');
      }

      if (hasDuck && hasOverriding) {
        accuracy = 92;
        completeness = 88;
        clarity = 90;
      } else if (hasDuck || hasOverriding) {
        accuracy = 78;
        completeness = 68;
        clarity = 75;
      } else {
        accuracy = 58;
        completeness = 45;
        clarity = 60;
      }
    } else if (input.topicKey === 'inheritance' || input.topicName.toLowerCase().includes('kalıtım')) {
      const hasSuper = text.includes('super') || text.includes('üst sınıf');
      const hasMro = text.includes('mro') || text.includes('sıra') || text.includes('miras');

      if (!hasSuper) missing.push('super() fonksiyonunun yapıcıyı tetiklemesi');
      if (!hasMro) missing.push('Metot arama sırası (Method Resolution Order)');

      if (hasSuper) {
        accuracy = 86;
        completeness = 80;
      } else {
        accuracy = 62;
        completeness = 50;
      }
    } else {
      // General heuristics based on depth
      if (length < 15) {
        accuracy = 55;
        clarity = 60;
        completeness = 40;
        missing.push('Temel çalışma mekanizması', 'Somut kod örneği veya benzetme');
      } else if (length < 40) {
        accuracy = 75;
        clarity = 78;
        completeness = 70;
        missing.push('Uç senaryolardaki davranış veya mimari avantaj');
      } else {
        accuracy = 88;
        clarity = 85;
        completeness = 84;
      }
    }

    const overall = Math.round((accuracy * 0.45) + (clarity * 0.25) + (completeness * 0.3));

    let positive = 'Kavramı kendi cümlelerinle ifade etme cesaretin ve temel mantığı yakalayışın oldukça başarılı.';
    let improvement = 'Açıklamana somut bir kod örneği veya gerçek dünya analojisi eklersen kalıcılık iki katına çıkacaktır.';

    if (missing.length > 0) {
      improvement = `Bu konuda şu ${missing.length} kavramı eksik anlattın: ${missing.join(', ')}. Bunları da ekleyerek zihnindeki resmi tamamlayabilirsin.`;
    }

    return {
      topicKey: input.topicKey,
      topicName: input.topicName,
      userExplanation: input.userExplanation,
      overallScore: overall,
      accuracyScore: accuracy,
      clarityScore: clarity,
      completenessScore: completeness,
      missingConcepts: missing,
      misconceptions: misconceptions,
      positiveFeedback: positive,
      actionableImprovement: improvement,
      suggestedNextStep: overall >= 80 ? 'Tebrikler! Konu mastery puanın güncellendi.' : 'Bu konuyu tekrar kartlarına ekledik.',
      evaluatedAt: new Date().toISOString(),
    };
  }
}
