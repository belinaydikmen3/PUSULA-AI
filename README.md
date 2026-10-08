# PUSULA AI

> **"Ne öğrenmek istediğini söyle. PUSULA yolunu oluştursun."**  
> *Türkiye'deki üniversite öğrencileri için kişiselleştirilmiş ve adaptif AI öğrenme platformu.*

---

> [!NOTE]
> Bu proje, Y Combinator Summer 2026 şirketi Wondering'in kişiselleştirilmiş öğrenme yaklaşımından ilham alınarak geliştirilmiş, bağımsız ve Türkçe/üniversite odaklı bir yorumdur. Wondering'in marka varlıkları, logoları veya özgün metinleri kopyalanmamış; mikro ders pedagojisi Türkiye üniversite sınav ve müfredat dinamiklerine uyarlanmıştır.

---

## 🎯 Proje Hakkında

**PUSULA AI**, üniversite öğrencilerinin ders çalışma, sınavlara hazırlanma ve teknik konuları (OOP, Yazılım Testi, Veri Yapıları, Algoritmalar, Yapay Zeka vb.) öğrenme süreçlerini hızlandıran adaptif bir eğitim teknolojisi (EdTech) platformudur.

Kullanıcı yalnızca öğrenmek istediği konuyu veya yaklaşan sınavını belirtir; sistem konuyu seviyesine göre analiz eder, alt başlıklara böler, 3-7 dakikalık interaktif mikro derslere dönüştürür ve öğrencinin quiz performansına göre müfredatı dinamik olarak uyarlar.

---

## ❓ Problem

Türkiye'deki üniversite öğrencileri akademik hazırlık süreçlerinde şu kronik engellerle karşılaşmaktadır:
1. **Zaman Darlığı & Sınav Stresi:** Vize ve final dönemlerinde yüzlerce sayfalık dağınık slayt ve amfi notu arasında kaybolmak.
2. **Pasif Öğrenme Tuzağı:** Saatlerce video izleyip veya metin okuyup aslında konuyu kavramadığını sınav anında fark etmek.
3. **Eksiklerin Teşhis Edilememesi:** Öğrencinin hangi alt kavramda (örneğin Polymorphism veya Boundary Value Analysis) tökezlediğini gösteren kişiselleştirilmiş bir teşhis mekanizmasının olmaması.
4. **Unutma Eğrisi:** Vizeye çalışılan konuların finale kadar hafızadan silinmesi ve aralıklı tekrar eksikliği.

---

## 💡 Çözüm

PUSULA, öğrenmeyi pasif bir içerik tüketiminden çıkarıp **aktif, adaptif ve ölçülebilir bir öğrenme döngüsüne** dönüştürür:

$$\text{ÖĞREN} \longrightarrow \text{UYGULA} \longrightarrow \text{ÖLÇ} \longrightarrow \text{EKSİĞİ BUL} \longrightarrow \text{TEKRAR ET} \longrightarrow \text{ADAPTE ET} \longrightarrow \text{YENİDEN ÖĞREN}$$

* **Mikro Öğrenme:** Konuları 3-7 dakikalık sindirilebilir parçalara ayırır.
* **Aktif Geri Bildirim:** Anlık checkpoint soruları ve mini kod görevleri sunar.
* **Dinamik Müfredat:** Zayıf kalınan kavramlara otomatik telafi ve ek örnekler üretir.
* **Sınav Geri Sayımı:** Sınav tarihine kadar kalan süreyi günlük çalışma planına dönüştürür.

---

## 🚀 Özellikler

### 1. Adaptive Learning (Adaptif Öğrenme Motoru)
Sıradan bir statik ders akışı sunmaz. Her quiz denemesinde ve pratikte öğrencinin performansını puanlar:
* **Skor $\ge 85$ (Mastered):** Konuya tam hakim. Bir sonraki aşamaya geçer, tekrar aralığı uzatılır.
* **Skor $70 - 84$ (Proficient):** Yeterli kavrayış. İnce detaylar pekiştirilerek devam edilir.
* **Skor $50 - 69$ (Needs Practice):** Ek alıştırma ve pratik görevler önerilir.
* **Skor $< 50$ (Critical):** Kavramı yeniden öğretme + yeni analoji + tekrar quiz.
* Dashboard'da **"Zayıf Konularım"** teşhis paneli ile bilgi skorları (`knowledgeScore`) anlık güncellenir.

### 2. Exam Mode (Sınav Modu)
* Ders adı, sınav türü (*Vize, Final, Bütünleme, Kısa Sınav*), sınav tarihi ve günlük çalışma süresi tanımlanır.
* Sistem sınav gününe kadar gün gün kişiselleştirilmiş çalışma takvimi çıkarır.
* **"Bu Sınav İçin En Riskli Konular"** analizi yaparak zayıf alanlara telafi günleri ayırır.
* Sınavdan önceki son iki güne süre tutmalı **Deneme Sınavı (Mock Exam)** ve **Hızlı Formül/Kavram Tekrarı** planlar.

### 3. Teach-Back (Öğreterek Öğrenme / Feynman Koçu)
* Kullanıcıya: *"Bu konuyu kendi cümlelerinle bana anlat"* denir.
* AI Koçu öğrencinin açıklamasını 5 eksende analiz eder:
  1. **Doğruluk (Accuracy)**
  2. **Açıklık ve Netlik (Clarity)**
  3. **Kapsam ve Eksiksizlik (Completeness)**
  4. **Eksik Kalan Kavramlar:** Değinilmeyen kilit terimlerin uyarısı.
  5. **Kavram Yanılgıları (Misconceptions):** Yanlış kurulan mantıkların düzeltilmesi.
* Değerlendirme sonucu doğrudan konu bilgi skoruna yansır.

### 4. Smart Review (Akıllı Tekrar / Spaced Repetition)
* SuperMemo SM-2 algoritmasından esinlenen bilimsel aralıklı tekrar mekanizması.
* Kolay hatırlanan kartların aralığı 1 gün $\rightarrow$ 3 gün $\rightarrow$ 7 gün şeklinde kademeli olarak açılır.
* Yanlış yapılan veya zorlanılan kartlar ertesi güne çekilerek unutma eğrisi kırılır.

### 5. Source-Based Learning (Kaynaktan Öğren)
* Öğrenci ders slaytını, PDF amfi notunu veya metin özetini sisteme yükler.
* PUSULA belgeyi analiz eder, kilit tanımları ve formülleri çıkarır.
* Üretilen ders ve quiz çıktılarında kaynak referansı açıkça belirtilir.
* Genel ve alakasız bilgiler yerine doğrudan amfi müfredatına odaklanılır.

### 6. Türkçe Üniversite Odaklı Yaklaşım
* Türkiye üniversitelerinin mühendislik ve temel bilimler ders yapısına (vize/final takvimleri, kredili dersler, teorik + pratik sınavlar) göre modellenmiştir.
* Terimler Türkçe akademik literatür ve evrensel teknik kavramlar dengelenerek sunulur.
* Web SpeechSynthesis API ile Türkçe sesli dinleme ve hız kontrolü (0.8x, 1.0x, 1.2x) entegredir.

---

## 🛠️ Teknolojiler

* **Frontend:** React 19, TypeScript
* **Build Aracı:** Vite 8
* **Routing:** React Router DOM v7 (SPA)
* **İkonlar:** Lucide React
* **Kutlama Efektleri:** Canvas Confetti
* **Stil Mimarisi:** Vanilla CSS (Modern CSS Variables, Cam/Glassmorphism Efektleri, Responsive Grid & Flexbox, Koyu/Açık Tema)
* **Ses Motoru:** Web SpeechSynthesis API (Türkçe ses algılama & oynatıcı)
* **Yerel Depolama:** Type-Safe LocalStorage Servisi (Local-First mimari)
* **Birim Testleri:** Vitest Framework

---

## ⚙️ Kurulum

### Gereksinimler
* Node.js 18+ veya 20+
* npm

### Adımlar

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/belinaydikmen3/PUSULA-AI.git
   cd PUSULA-AI
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

4. Tarayıcınızda açın:
   ```
   http://127.0.0.1:5173/
   ```

5. Testleri çalıştırın:
   ```bash
   npm test
   ```

6. Üretim (Production) derlemesi oluşturun:
   ```bash
   npm run build
   ```

---

## 🔑 Environment Variables

API anahtarı tanımlamak **zorunlu değildir**. Uygulama hiçbir anahtar girilmediğinde de tam fonksiyonel Demo Modunda kusursuz çalışır.

Canlı yapay zeka modellerini (Gemini / OpenAI) kullanmak isterseniz proje kökünde bir `.env` dosyası oluşturabilirsiniz:

```env
# Google Gemini API Anahtarı
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Anahtarı
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

> **Alternatif:** API anahtarlarınızı doğrudan uygulama arayüzündeki **Ayarlar (`/settings`)** sayfasından girerek tarayıcınızın yerel belleğinde güvenle saklayabilirsiniz.

---

## 🛡️ Demo Mode

İnternet kesintisi, API kota sınırları veya sunum ortamı risklerinden bağımsız olarak uygulamanın tüm yeteneklerini deneyimleyebilmeniz için **Demo Modu** yerleşik olarak sunulmaktadır.

Varsayılan Hazır Veri Seti:
* **Öğrenme Yolu:** *Python'da Nesne Yönelimli Programlama (OOP)* (%64 tamamlanma, 4 ders bitmiş, 5. ders aktif).
* **Güçlü Konular:** *Class & Object (%95), Constructor (%90), Encapsulation (%88)*.
* **Zayıf Konular:** *Inheritance (%68), Polymorphism (%48)*.
* **Üniversite Sınavı:** *Yazılım Gerçekleme ve Test (CENG-302)* (12 gün kaldı, %61 hazırlık düzeyi, 3 riskli konu).
* **Akıllı Tekrar:** Bugün tekrar edilmesi gereken hazır bilgi kartları.
* **Akademik Kaynaklar:** *YZ_Ders_Notlari_Hafta1_4.pdf* ve *Yazilim_Test_Final_Ozeti.txt*.

---

## 🏗️ Proje Mimarisi

```
PUSULA/
├── public/
│   └── favicon.svg                    # Pusula modern SVG logosu
├── src/
│   ├── components/
│   │   ├── common/                    # Ortak UI bileşenleri (ProgressBar, TTS, Confetti)
│   │   └── layout/                    # Sidebar, Header, MobileNav
│   ├── pages/
│   │   ├── DashboardPage.tsx          # Ana Sayfa, metrikler ve zayıf konu teşhisi
│   │   ├── LearnPage.tsx              # Yeni yol oluşturucu
│   │   ├── PathDetailPage.tsx         # Görsel yol haritası & timeline
│   │   ├── LessonPage.tsx             # 8 aşamalı mikro ders & sesli anlatım
│   │   ├── QuizPage.tsx               # Çok tipli quiz & adaptif değerlendirme
│   │   ├── ReviewPage.tsx             # Akıllı tekrar (Spaced Repetition)
│   │   ├── ExamModePage.tsx           # Üniversite sınav takvimi & planlayıcı
│   │   ├── TeachBackPage.tsx          # Feynman öğreterek öğren koçu
│   │   ├── ResourcesPage.tsx          # PDF / slayt kaynak analizi
│   │   ├── ProgressPage.tsx           # Analitik & rozetler
│   │   ├── ProfilePage.tsx            # Akademik profil
│   │   └── SettingsPage.tsx           # AI sağlayıcı ve tema ayarları
│   ├── services/
│   │   ├── adaptive/                  # Algoritmalar (Adaptive, SM-2, Study Plan)
│   │   ├── ai/                        # AI Servisleri & Provider mimarisi
│   │   ├── audio/                     # Web Speech TTS ses servisi
│   │   └── storage/                   # LocalStorage & Seed veri yönetimi
│   ├── types/
│   │   └── index.ts                   # Domain TypeScript tip tanımları
│   ├── App.tsx                        # Ana Router ve sayfa yerleşimi
│   ├── index.css                      # Vanilla CSS tasarım sistemi & temalar
│   └── main.tsx                       # React başlangıç noktası
├── .env.example                       # Ortam değişkenleri şablonu
├── .gitignore                         # Git yoksayma kuralları
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🏛️ AI Mimarisi

PUSULA, tek bir monolitik prompt yerine katmanlı ve sağlayıcıdan bağımsız bir servis mimarisi ile inşa edilmiştir:

```
                  ┌───────────────────────┐
                  │    AIService Facade   │
                  └───────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
 ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
 │ Gemini 1.5   │      │ OpenAI Mini  │      │ Mock/Demo Engine │
 │ Provider     │      │ Provider     │      │ (Güvenilir & Hızlı)│
 └──────────────┘      └──────────────┘      └──────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
 ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
 │LearningPathGenerator │  │ QuizGenerator        │  │ TeachBackEvaluator   │
 └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
    │                         │                         │
 ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
 │ SourceAnalyzer       │  │ StudyPlanGenerator   │  │ AdaptiveEngine       │
 └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

* **Sağlayıcı Soyutlaması (Provider Abstraction):** `AIProvider` arayüzü sayesinde tek tıkla Gemini, OpenAI veya yerleşik Demo motoru arasında geçiş yapılabilir.
* **Yapılandırılmış JSON Doğrulaması:** Tüm AI yanıtları katı JSON şemalarıyla alınır ve XSS açıklarını önlemek için güvenli biçimde render edilir.
* **Kademeli Geri Dönüş (Graceful Fallback):** API anahtarı girilmediğinde, internet kesildiğinde veya kota aşıldığında sistem çökmez; otomatik olarak zengin yerel demo içeriğine geçiş yapar.

---

## 💡 Kullanım

1. **Dashboard (`/`):** Günlük çalışma özeti, sınav geri sayımı, aktif öğrenme yolu ve en zayıf konular incelenir.
2. **Mikro Ders (`/lesson/:id`):** 8 aşamalı modüler ders içeriği okunabilir veya Türkçe sesli olarak dinlenebilir. Checkpoint soruları ve kod pratikleri çözülür.
3. **Adaptif Quiz (`/quiz/:id`):** Çoktan seçmeli ve kod tamamlama sorularıyla kavram pekiştirilir; anlık doğru/yanlış analizleri alınır.
4. **Teach-Back Feynman Koçu (`/teach-back`):** Konu kendi cümlelerinizle özetlenir; yapay zeka koçu eksik kavramları ve yanılgıları tespit eder.
5. **Sınav Modu (`/exam-mode`):** Yaklaşan sınavlar için gün bazlı çalışma takvimi oluşturulur ve hazırlık yüzdesi takip edilir.
6. **Akıllı Tekrar (`/review`):** Aralıklı tekrar algoritmalarıyla unutulmaya yüz tutmuş kavram kartları tekrar edilir.
7. **Kaynaktan Öğren (`/resources`):** Ders notları veya slaytlar yüklenerek doğrudan kaynak bazlı içerik türetilir.

---

## 🔮 Gelecek Geliştirmeler

* [ ] Üniversite Öğrenci Bilgi Sistemleri (OBS / BYS) ile otomatik sınav takvimi entegrasyonu
* [ ] Akran öğrenmesi (Peer study) ve grup çalışma modları
* [ ] Mobil uygulama (PWA / Capacitor) ve çevrimdışı çalışma desteği
* [ ] Vektör veritabanı (RAG) ile yüzlerce sayfalık ders kitaplarının semantik taranması

---

## 📄 License

Bu proje [MIT](LICENSE) lisansı altında sunulmaktadır.

---

## 📌 Referans / İlham Kaynağı

PUSULA projesinin fikir ve konsept geliştirme sürecinde, öğrenme deneyimini etkileşimli ve kişiselleştirilmiş bir yapıya dönüştürmeyi amaçlayan Wondering girişimi referans olarak incelenmiştir. PUSULA ise bu yaklaşımdan farklı olarak kendi hedefleri, özellikleri ve kullanıcı deneyimi doğrultusunda geliştirilmiştir. Wondering projesi geliştirme sürecinde yalnızca kavramsal bir referans olarak incelenmiş olup, PUSULA doğrudan bir kopyası değildir; bağımsız bir mimari, özgün kullanıcı deneyimi ve Türkiye üniversite dinamiklerine özel geliştirilmiş yeteneklerle inşa edilmiştir.

* **Proje:** Wondering
* **Platform:** Y Combinator
* **Batch:** Summer 2026
* **Yıl:** 2026
* **Referans:** [https://www.ycombinator.com/companies/wondering](https://www.ycombinator.com/companies/wondering)


