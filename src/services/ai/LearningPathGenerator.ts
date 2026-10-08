import type { LearningPath, Module } from '../../types';
import type { AIProvider } from './AIProvider';
import type { GeneratePathInput } from './types';

export class LearningPathGenerator {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async generate(input: GeneratePathInput): Promise<LearningPath> {
    const cleanTopic = input.topic.trim();
    const pathId = `path-${Date.now()}`;
    const level = input.level || 'beginner';
    const dailyMinutes = input.dailyMinutes || 20;

    const fallbackPath = this.createFallbackLearningPath(cleanTopic, level, dailyMinutes, pathId, input.sourceDocumentName);

    const systemPrompt = `Sen PUSULA AI öğrenme mimarısın. Üniversite öğrencileri için Wondering esintili, Türkiye üniversite müfredatına uygun adaptif mikro ders öğrenme yolları tasarlarsın.
Çıktıyı SADECE aşağıdaki JSON şemasına uygun olarak üret:
{
  "title": string,
  "description": string,
  "category": string,
  "estimatedDays": number,
  "modules": [
    {
      "title": string,
      "lessons": [
        {
          "title": string,
          "estimatedMinutes": number,
          "introduction": string,
          "simpleExplanation": string,
          "realWorldAnalogy": string,
          "codeExample": { "language": string, "code": string, "notes": string },
          "checkpoint": { "question": string, "options": string[], "correctIndex": number, "hint": string },
          "practiceTask": { "task": string, "hint": string, "solution": string },
          "teachBackPrompt": string,
          "takeaways": string[],
          "audioSummary": string
        }
      ]
    }
  ]
}`;

    const userPrompt = `Konu: "${cleanTopic}"
Hedef Seviye: ${level}
Günlük Çalışma Süresi: ${dailyMinutes} dakika
Kaynak Belge: ${input.sourceDocumentName || 'Genel Konu'}`;

    try {
      if (this.provider.isConfigured() && this.provider.id !== 'demo') {
        const result = await this.provider.generateJSON<any>(systemPrompt, userPrompt, null);
        if (result && result.title && Array.isArray(result.modules)) {
          return this.transformRawResultToLearningPath(result, pathId, level, dailyMinutes, input.sourceDocumentName);
        }
      }
    } catch (err) {
      console.warn('[LearningPathGenerator] AI hatası, yerel oluşturucu kullanılıyor:', err);
    }

    return fallbackPath;
  }

  private transformRawResultToLearningPath(
    raw: any,
    pathId: string,
    level: any,
    dailyMinutes: number,
    sourceName?: string
  ): LearningPath {
    let lessonCounter = 0;
    const modules: Module[] = (raw.modules || []).map((m: any, mIdx: number) => {
      const moduleId = `mod-${pathId}-${mIdx + 1}`;
      return {
        id: moduleId,
        pathId,
        title: m.title || `Bölüm ${mIdx + 1}`,
        order: mIdx + 1,
        lessons: (m.lessons || []).map((l: any, lIdx: number) => {
          lessonCounter++;
          const lessonId = `les-${pathId}-${mIdx + 1}-${lIdx + 1}`;
          const isFirst = lessonCounter === 1;
          const topicKey = `topic-${pathId}-${lessonCounter}`;
          return {
            id: lessonId,
            moduleId,
            pathId,
            topicKey,
            title: l.title || `Ders ${lessonCounter}`,
            order: lessonCounter,
            estimatedMinutes: l.estimatedMinutes || 6,
            isCompleted: false,
            isLocked: !isFirst,
            quizId: `quiz-${lessonId}`,
            content: {
              introduction: l.introduction || 'Konuya giriş ve genel bakış.',
              simpleExplanation: l.simpleExplanation || 'Kavramın sade anlatımı.',
              realWorldAnalogy: l.realWorldAnalogy || 'Gerçek hayattan bir benzetme.',
              codeExample: l.codeExample || { language: 'python', code: '# Örnek kod', notes: 'Temel uygulama' },
              checkpoint: l.checkpoint || {
                question: 'Bu kavramın temel amacı nedir?',
                options: ['Verimlilik sağlamak', 'Sadece görselleştirmek', 'Kod karmaşıklığını artırmak', 'Hiçbiri'],
                correctIndex: 0,
                hint: 'Verimlilik ve modülerliği hatırla.',
              },
              practiceTask: l.practiceTask || {
                task: 'Kavramı özetleyen bir fonksiyon veya sınıf yaz.',
                hint: 'Ders notundaki örneği uyarla.',
                solution: '# Çözüm kodu',
              },
              teachBackPrompt: l.teachBackPrompt || 'Bu konuyu arkadaşına nasıl anlatırdın?',
              takeaways: Array.isArray(l.takeaways) ? l.takeaways : ['Temel prensipler kavrandı.'],
              audioSummary: l.audioSummary || l.simpleExplanation || 'Ders özeti.',
            },
          };
        }),
      };
    });

    const totalLessons = lessonCounter;
    return {
      id: pathId,
      title: raw.title || 'Kişiselleştirilmiş Öğrenme Yolu',
      description: raw.description || 'PUSULA AI tarafından optimize edilmiş adaptif müfredat.',
      category: raw.category || 'Mühendislik ve Yazılım',
      level,
      estimatedDays: raw.estimatedDays || 7,
      dailyMinutes,
      totalLessons,
      completedLessons: 0,
      progressPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceDocumentName: sourceName,
      isCustom: true,
      modules,
    };
  }

  private createFallbackLearningPath(
    topic: string,
    level: any,
    dailyMinutes: number,
    pathId: string,
    sourceName?: string
  ): LearningPath {
    const lower = topic.toLowerCase();
    let title = topic;
    let description = `${topic} konusunda temel kavramlardan ileri seviye uygulamalara kişiselleştirilmiş 7 günlük öğrenme programı.`;
    let subTopics: { title: string; desc: string; analogy: string; code: string }[] = [];

    if (lower.includes('test') || lower.includes('yazılım testi')) {
      title = 'Yazılım Testi & Kalite Güvence Prensipleri';
      description = 'Birim testlerden entegrasyon testlerine, sınır değer analizinden mock mekanizmalarına modern test mühendisliği.';
      subTopics = [
        {
          title: '01 — Test Temelleri & AAA Kalıbı',
          desc: 'Test yazmanın Arrange, Act, Assert adımları ve test piramidinin tabanı.',
          analogy: 'Bir aşçının yemeği sunmadan önce tadına kaşıkla bakması (Birim Test).',
          code: `def test_toplama():\n    # Arrange\n    a, b = 3, 5\n    # Act\n    sonuc = topla(a, b)\n    # Assert\n    assert sonuc == 8`,
        },
        {
          title: '02 — Sınır Değer Analizi (BVA)',
          desc: 'Yazılım hatalarının %80’i uç değerlerde (min, max, -1, 0, +1) meydana gelir.',
          analogy: 'Bir asansörün 5 kişilik taşıma kapasitesini 0, 5 ve 6 kişiyle denemek.',
          code: `def test_yas_kontrol():\n    assert reşit_mi(17) == False\n    assert reşit_mi(18) == True\n    assert reşit_mi(19) == True`,
        },
        {
          title: '03 — Denklik Bölümleme (Equivalence Partitioning)',
          desc: 'Sonsuz sayıda test senaryosunu geçerli ve geçersiz temsilci sınıflara ayırmak.',
          analogy: 'Sepetteki binlerce elmanın hepsini ısırmak yerine her kasadan birer temsilci elma seçmek.',
          code: `# Geçerli grup: [1-100], Geçersiz: [<1], Geçersiz: [>100]`,
        },
        {
          title: '04 — Entegrasyon Testi & Servis Bağlantıları',
          desc: 'Farklı bileşenlerin bir araya geldiğinde doğru çalışıp çalışmadığını denetleme.',
          analogy: 'Motor ve tekerlek ayrı ayrı çalışıyor olabilir ama şanzıman onları bağlayınca araba hareket ediyor mu?',
          code: `def test_odeme_ve_veritabani_entegrasyonu():\n    siparis = sepet.onayla()\n    assert db.siparis_bul(siparis.id).durum == "ODENDI"`,
        },
        {
          title: '05 — Mocking & Test Doubles',
          desc: 'Dış API veya yavaş veritabanı bağımlılıklarını taklit nesnelerle soyutlama.',
          analogy: 'Aktörün tehlikeli sahnelerde dublör kullanması.',
          code: `from unittest.mock import Mock\n\nodeme_servisi = Mock()\nodeme_servisi.odeme_al.return_value = True`,
        },
        {
          title: '06 — Kod Kapsama Oranı (Code Coverage)',
          desc: 'Testlerimizin kaynak kodun kaç satırını ve hangi dallarını koşturduğunu ölçme.',
          analogy: 'Bir haritada ayak basmadığın karanlık sokakların oranını hesaplamak.',
          code: `# coverage run -m pytest\n# coverage report -m`,
        },
        {
          title: '07 — CI/CD Otomasyonu & Regresyon',
          desc: 'Her git push anında testlerin otomatik koşulması ve hata bildirilmesi.',
          analogy: 'Fabrika kapısında her üretilen ürünü otomatik tarayan lazer sensör.',
          code: `# .github/workflows/test.yml\n- run: pytest --maxfail=1`,
        },
      ];
    } else if (lower.includes('veri') || lower.includes('algoritma')) {
      title = 'Veri Yapıları & Algoritmalar: Akılcı Kodlama';
      description = 'Array, Linked List, Stack, Queue, Ağaçlar ve Grafik algoritmalarının Big-O analiziyle derinlemesine kavranması.';
      subTopics = [
        {
          title: '01 — Big-O Analizi & Zaman Karmaşıklığı',
          desc: 'Algoritmaların veri büyüklüğü arttıkça çalışma performansını matematiksel ölçme.',
          analogy: 'Bir kitabı baştan sona okumak O(n), fihristten aramak O(log n).',
          code: `def ara(liste, hedef): # O(n)\n    for x in liste:\n        if x == hedef: return True`,
        },
        {
          title: '02 — Stack & Queue Mekaniği',
          desc: 'LIFO (Son Giren İlk Çıkar) ve FIFO (İlk Giren İlk Çıkar) temel yapıları.',
          analogy: 'Stack: Üst üste tabaklar; Queue: Ekmek kuyruğunda bekleyen insanlar.',
          code: `stack = []\nstack.append("A")\nson = stack.pop()`,
        },
        {
          title: '03 — Linked List (Bağlı Liste)',
          desc: 'Bellekte ardışık olmayan, düğümlerin (node) birbirini işaret ettiği esnek yapı.',
          analogy: 'Lokomotif ve ona zincirle bağlı vagonlar.',
          code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None`,
        },
        {
          title: '04 — İkili Arama Ağaçları (BST)',
          desc: 'Sol alt ağacın küçük, sağ alt ağacın büyük olduğu hiyerarşik arama yapısı.',
          analogy: 'Sözlükte kelime ararken ortadan açıp sağa ya da sola yönelmek.',
          code: `# BST Arama: O(log n)`,
        },
        {
          title: '05 — Rekürsiyon & Böl ve Yönet',
          desc: 'Büyük bir problemi kendi benzeri küçük alt problemlere bölerek çözme.',
          analogy: 'Matruşka bebeklerini sırayla açmak.',
          code: `def faktoriyel(n):\n    return 1 if n <= 1 else n * faktoriyel(n - 1)`,
        },
        {
          title: '06 — Hash Map & Çakışma Çözümü',
          desc: 'Anahtar-değer çiftlerini O(1) anlık sürede getiren haritalama tekniği.',
          analogy: 'Okulda her öğrencinin kendine ait kilitli dolap numarası olması.',
          code: `sozluk = {"ogrenci_no": 1234}\nprint(sozluk["ogrenci_no"])`,
        },
        {
          title: '07 — Graph Arama: BFS vs DFS',
          desc: 'Ağ yapıları üzerinde katman katman veya derinlemesine gezinme stratejisi.',
          analogy: 'BFS: Su damlasının gölde dairesel yayılması; DFS: Labirentte tek bir yoldan sonuna kadar gitmek.',
          code: `# BFS kuyruk ile, DFS yığın/rekürsiyon ile kurulur.`,
        },
      ];
    } else {
      // General customized topic (Python OOP, AI, React, Database, etc.)
      title = `${topic.charAt(0).toUpperCase() + topic.slice(1)}: Hızlı ve Kalıcı Öğrenme`;
      subTopics = [
        {
          title: '01 — Temel Kavramlar & Giriş',
          desc: `${topic} konusunun temel felsefesi ve neyi çözdüğü.`,
          analogy: 'Yeni bir binanın sağlam atılan temeli.',
          code: `# ${topic} temel başlangıç kurgusu\nprint("Merhaba PUSULA")`,
        },
        {
          title: '02 — Kilit Mekanizmalar & İlk Uygulama',
          desc: 'Kavramın işleyiş motoru ve en sık kullanılan yapılar.',
          analogy: 'Bir makinenin ana dişli çarkları.',
          code: `# Temel fonksiyon veya model\ndef baslat():\n    return "Aktif"`,
        },
        {
          title: '03 — Mimari Kurallar & Yaygın Hatalar',
          desc: 'Geliştiricilerin en çok düştüğü yanılgılar ve temiz kod prensipleri.',
          analogy: 'Trafik kuralları sayesinde kazaların önlenmesi.',
          code: `# Güvenli ve doğrulanmış yaklaşım`,
        },
        {
          title: '04 — İleri Seviye İlişkiler & Esneklik',
          desc: 'Bileşenlerin birbiriyle haberleşmesi ve soyutlama ilkeleri.',
          analogy: 'Farklı müzik aletlerinin bir orkestrada uyumla çalması.',
          code: `# İleri seviye uygulama`,
        },
        {
          title: '05 — Pratik Senaryo & Problem Çözümü',
          desc: 'Gerçek üniversite sınavı veya mülakat sorusu analizi.',
          analogy: 'Pilotların uçuş simülatöründe acil durum tatbikatı yapması.',
          code: `# Vaka çalışması çözümü`,
        },
        {
          title: '06 — Performans & İyileştirme',
          desc: 'Sistem kaynaklarını verimli kullanma ve hız optimizasyonu.',
          analogy: 'Yarış arabasının aerodinamik ayarları.',
          code: `# Optimize edilmiş yapı`,
        },
        {
          title: '07 — Bütünleşik Proje & Değerlendirme',
          desc: 'Öğrenilen tüm kavramların tek bir çatı altında sentezlenmesi.',
          analogy: 'Puzzle’ın tüm parçalarının tamamlanması.',
          code: `# Final bütünleşik kod`,
        },
      ];
    }

    let lessonCount = 0;
    const module1Lessons = subTopics.slice(0, 3).map((st) => {
      lessonCount++;
      const lessonId = `les-${pathId}-${lessonCount}`;
      return {
        id: lessonId,
        moduleId: `mod-1-${pathId}`,
        pathId,
        topicKey: `topic-${pathId}-${lessonCount}`,
        title: st.title,
        order: lessonCount,
        estimatedMinutes: 5,
        isCompleted: lessonCount === 1,
        isLocked: false,
        quizId: `quiz-${lessonId}`,
        content: {
          introduction: `${st.title} konusu, modern yazılım geliştirmede temel taşlardan biridir.`,
          simpleExplanation: st.desc,
          realWorldAnalogy: st.analogy,
          codeExample: {
            language: 'python',
            code: st.code,
            notes: 'Örnek kod kurgusu',
          },
          checkpoint: {
            question: `${st.title} konusunun en kilit faydası nedir?`,
            options: ['Sistem esnekliği ve kalitesi', 'Sadece görsel düzen', 'Kod boyutunu şişirmek', 'Hiçbiri'],
            correctIndex: 0,
            hint: 'Modülerlik ve esnekliği hatırla.',
          },
          practiceTask: {
            task: `${st.title} için kendi örneğini oluştur.`,
            hint: 'Ders notundaki mantığı uyarla.',
            solution: st.code,
          },
          teachBackPrompt: `${st.title} kavramını kendi cümlelerinle bir arkadaşına nasıl anlatırsın?`,
          takeaways: ['Kavram pekiştirildi.', 'Pratik yapıldı.'],
          audioSummary: `${st.title}. ${st.desc}`,
        },
      };
    });

    const module2Lessons = subTopics.slice(3).map((st) => {
      lessonCount++;
      const lessonId = `les-${pathId}-${lessonCount}`;
      return {
        id: lessonId,
        moduleId: `mod-2-${pathId}`,
        pathId,
        topicKey: `topic-${pathId}-${lessonCount}`,
        title: st.title,
        order: lessonCount,
        estimatedMinutes: 6,
        isCompleted: false,
        isLocked: lessonCount > 4,
        quizId: `quiz-${lessonId}`,
        content: {
          introduction: `${st.title} ileri aşamada karşımıza çıkan kilit bir alandır.`,
          simpleExplanation: st.desc,
          realWorldAnalogy: st.analogy,
          codeExample: {
            language: 'python',
            code: st.code,
            notes: 'Teknik detay ve ince noktalar',
          },
          checkpoint: {
            question: `${st.title} uygulanırken dikkat edilmesi gereken kritik husus nedir?`,
            options: ['Doğru tasarım ve sınır koşulları', 'Rastgele değişken adları', 'Testleri atlamak', 'Hiçbiri'],
            correctIndex: 0,
            hint: 'Sınır koşulları ve doğru tasarımı hatırla.',
          },
          practiceTask: {
            task: `${st.title} için senaryoyu genişlet.`,
            hint: 'Fonksiyonel bağımlılıkları kontrol et.',
            solution: st.code,
          },
          teachBackPrompt: `${st.title} konusunun neden önemli olduğunu özetle.`,
          takeaways: ['İleri seviye kavrayış sağlandı.'],
          audioSummary: `${st.title}. ${st.desc}`,
        },
      };
    });

    const modules: Module[] = [
      {
        id: `mod-1-${pathId}`,
        pathId,
        title: 'Bölüm 1: Temel İlkeler ve Yapı Taşları',
        order: 1,
        lessons: module1Lessons,
      },
      {
        id: `mod-2-${pathId}`,
        pathId,
        title: 'Bölüm 2: İleri Seviye Mimari ve Uygulamalar',
        order: 2,
        lessons: module2Lessons,
      },
    ];

    return {
      id: pathId,
      title,
      description,
      category: 'Bilgisayar Mühendisliği & Yazılım',
      level,
      estimatedDays: 7,
      dailyMinutes,
      totalLessons: lessonCount,
      completedLessons: 1,
      progressPercent: Math.round((1 / lessonCount) * 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceDocumentName: sourceName,
      isCustom: true,
      modules,
    };
  }
}
