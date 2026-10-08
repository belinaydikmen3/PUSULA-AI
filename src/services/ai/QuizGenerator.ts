import type { Question, Quiz } from '../../types';
import type { AIProvider } from './AIProvider';
import type { GenerateQuizInput } from './types';

export class QuizGenerator {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async generate(input: GenerateQuizInput, lessonId: string, pathId: string): Promise<Quiz> {
    const quizId = `quiz-${lessonId}`;

    const systemPrompt = `Sen PUSULA AI soru hazırlama motorusun. Üniversite öğrencileri için kaliteli, adaptif ve öğretici sorular üretirsin.
Soru tipleri: "multiple-choice", "true-false", "code-completion".
Her soru için mutlaka:
- prompt
- type
- options (string dizisi)
- correctAnswer (doğru seçeneğin index'i sayı olarak 0, 1, 2 vb.)
- explanation (kapsamlı Türkçe açıklama)
- whyCorrect (neden doğru)
- commonPitfall (öğrencilerin en sık yaptığı hata)
- difficulty ("easy", "medium", "hard")
üret. SADECE JSON formatında bir dizi döndür: { "questions": [...] }`;

    const userPrompt = `Ders: "${input.lessonTitle}"
Konu Anahtarı: "${input.topicName || input.topicKey}"
Soru Sayısı: ${input.questionCount || 4}`;

    try {
      if (this.provider.isConfigured() && this.provider.id !== 'demo') {
        const raw = await this.provider.generateJSON<any>(systemPrompt, userPrompt, null);
        if (raw && Array.isArray(raw.questions) && raw.questions.length > 0) {
          const questions: Question[] = raw.questions.map((q: any, idx: number) => ({
            id: `q-${quizId}-${idx + 1}`,
            type: q.type || 'multiple-choice',
            prompt: q.prompt || 'Soru metni',
            codeSnippet: q.codeSnippet,
            options: Array.isArray(q.options) ? q.options : ['Seçenek A', 'Seçenek B', 'Seçenek C', 'Seçenek D'],
            correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
            explanation: q.explanation || 'Açıklama',
            whyCorrect: q.whyCorrect || 'Kurala uygun olan seçenektir.',
            commonPitfall: q.commonPitfall || 'Kavram karmaşası yaşanabilir.',
            topicKey: input.topicKey,
            difficulty: q.difficulty || 'medium',
          }));

          return {
            id: quizId,
            lessonId,
            pathId,
            topicKey: input.topicKey,
            title: `${input.lessonTitle} — Adaptif Değerlendirme`,
            questions,
          };
        }
      }
    } catch (err) {
      console.warn('[QuizGenerator] AI çağrısı başarısız, yerel sorular üretiliyor:', err);
    }

    return this.createFallbackQuiz(quizId, lessonId, pathId, input);
  }

  private createFallbackQuiz(
    quizId: string,
    lessonId: string,
    pathId: string,
    input: GenerateQuizInput
  ): Quiz {
    const topic = input.topicName || input.lessonTitle;
    const questions: Question[] = [
      {
        id: `q-${quizId}-1`,
        type: 'multiple-choice',
        prompt: `"${topic}" konusunda temel amaca en uygun ifade hangisidir?`,
        options: [
          'Sistemi daha modüler, anlaşılır ve bakımı kolay hale getirmek',
          'Sadece kodun boyutunu artırmak',
          'İşlemci kullanımını gereksiz yere zorlamak',
          'Tüm değişkenleri kontrolsüzce genel (global) yapmak',
        ],
        correctAnswer: 0,
        explanation: `${topic} kavramı, yazılım mühendisliğinde kodun sürdürülebilirliğini, modülerliğini ve doğruluğunu artırmak için kullanılır.`,
        whyCorrect: 'Temel mühendislik prensipleri kodun anlaşılır ve modüler olmasını hedefler.',
        commonPitfall: 'Sadece syntax ezberlemek yerine arkasındaki mimari felsefeyi kaçırmak.',
        topicKey: input.topicKey,
        difficulty: 'easy',
      },
      {
        id: `q-${quizId}-2`,
        type: 'true-false',
        prompt: `"${topic}" uygulanırken sınır koşulları ve olası hata senaryoları önceden test edilmelidir.`,
        options: ['Doğru', 'Yanlış'],
        correctAnswer: 0,
        explanation: 'Doğrudur. Gerçek dünya uygulamalarında beklenmeyen durumlar ve sınır değerler göz önüne alınarak tasarım yapılmalıdır.',
        whyCorrect: 'Yazılım güvenilirliği sınır şartlarının doğru yönetilmesine dayanır.',
        commonPitfall: 'Sadece ideal (happy-path) senaryoyu düşünerek kod yazmak.',
        topicKey: input.topicKey,
        difficulty: 'medium',
      },
      {
        id: `q-${quizId}-3`,
        type: 'code-completion',
        prompt: `Aşağıdaki kod parçasında standart fonksiyon çağrısını tamamlayınız:`,
        codeSnippet: `# ${topic} uygulanırken\nsonuc = nesne.____()\nprint(sonuc)`,
        options: ['calistir', 'test_et', 'coz', 'yurut'],
        correctAnswer: 0,
        explanation: 'Nesne yönelimli veya modüler çağırmada uygun metod adı çağrılmalıdır.',
        whyCorrect: 'Standart arayüz metodunun doğru tanımlanması beklenir.',
        commonPitfall: 'Fonksiyon parantezlerini () unutarak metodun referansını döndürmek.',
        topicKey: input.topicKey,
        difficulty: 'medium',
      },
      {
        id: `q-${quizId}-4`,
        type: 'multiple-choice',
        prompt: `Bu konuyla ilgili bir mülakatta "Bu yaklaşımın dezavantajı nedir?" diye sorulduğunda en tutarlı cevap ne olurdu?`,
        options: [
          'Gereksiz karmaşıklık (over-engineering) yaratılırsa küçük projelerde ek maliyet getirebilir.',
          'Hiçbir dezavantajı olamaz, her zaman körü körüne uygulanmalıdır.',
          'Tüm bilgisayarları yavaşlatır.',
          'Sadece Python dilinde çalışır.',
        ],
        correctAnswer: 0,
        explanation: 'Mühendislikte her çözüm bir takastır (trade-off). İhtiyaç duyulmadığı halde aşırı soyutlama yapmak kodu karmaşıklaştırır.',
        whyCorrect: 'Her tasarım deseninin ve tekniğinin bağlama uygun seçilmesi gerekir.',
        commonPitfall: 'Gümüş kurşun (silver bullet) olduğuna inanmak.',
        topicKey: input.topicKey,
        difficulty: 'hard',
      },
    ];

    return {
      id: quizId,
      lessonId,
      pathId,
      topicKey: input.topicKey,
      title: `${input.lessonTitle} — Mini Değerlendirme`,
      questions,
    };
  }
}
