import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  AlertTriangle,
  RotateCcw,
  Flame,
  MessageSquareShare,
  Calendar,
  Layers,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import { calculateOverallProgress, getWeakTopics } from '../services/adaptive/adaptiveEngine';
import { getDueReviews } from '../services/adaptive/spacedRepetition';
import { ProgressBar } from '../components/common/ProgressBar';
import { KnowledgeScoreBadge } from '../components/common/KnowledgeScoreBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickTopic, setQuickTopic] = useState('');

  const profile = StorageService.getProfile();
  const paths = StorageService.getPaths();
  const activePathId = StorageService.getActivePathId();
  const currentPath = paths.find((p) => p.id === activePathId) || paths[0];

  const masteries = StorageService.getTopicMasteries();
  const weakTopics = getWeakTopics(masteries, 3);
  const overallProgress = calculateOverallProgress(masteries);

  const reviews = StorageService.getReviews();
  const dueReviews = getDueReviews(reviews);

  const exam = StorageService.getExam();

  // Find next uncompleted or currently active lesson in path
  let activeLesson = currentPath?.modules[0]?.lessons[0];
  if (currentPath) {
    for (const mod of currentPath.modules) {
      const found = mod.lessons.find((l) => !l.isCompleted && !l.isLocked);
      if (found) {
        activeLesson = found;
        break;
      }
    }
  }

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTopic.trim()) return;
    navigate(`/learn?topic=${encodeURIComponent(quickTopic)}`);
  };

  const sampleSuggestions = [
    "Python'da OOP",
    'Yazılım Testi & AAA Kalıbı',
    'Veri Yapıları & Ağaçlar',
    '12 Gün Sonra Java Sınavım Var',
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero Welcome & Value Proposition */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
          padding: '30px 28px',
        }}
      >
        <div style={{ maxWidth: 760, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-blue">
              <Sparkles size={12} />
              Kişisel & Adaptif AI Rehberin
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Merhaba, {profile.name} 👋
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(22px, 3.2vw, 30px)',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.5px',
              marginBottom: 10,
              color: 'var(--text-primary)',
            }}
          >
            "Öğrenmek istediğin şeyi söyle. <br />
            <span style={{ color: 'var(--primary)' }}>Yolunu birlikte oluşturalım."</span>
          </h1>

          <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Üniversite derslerine hazırlan, eksik kavramlarını adaptif AI ile tespit et ve sınava eksiksiz yetiş.
          </p>

          {/* Quick Input Bar */}
          <form onSubmit={handleQuickSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Bugün ne öğrenmek istiyorsun? (Örn: Python'da OOP öğrenmek istiyorum...)"
                value={quickTopic}
                onChange={(e) => setQuickTopic(e.target.value)}
                style={{ paddingRight: 40, height: 48, fontSize: 14.5 }}
              />
              <Sparkles
                size={18}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ height: 48, padding: '0 24px' }}>
              <span>Yol Haritası Çıkar</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Preset quick pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Hızlı Başla:</span>
            {sampleSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setQuickTopic(sug)}
                className="badge badge-purple"
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 11.5 }}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative Compass watermark */}
        <div
          style={{
            position: 'absolute',
            right: -25,
            bottom: -35,
            opacity: 0.05,
            pointerEvents: 'none',
            fontSize: 240,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          🧭
        </div>
      </div>

      {/* 4-Column Quick Overview Metrics (Section 36) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {/* Metric 1: Exam Countdown */}
        <div
          className="card"
          onClick={() => navigate('/exam-mode')}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>SINAV GERİ SAYIMI</span>
            <div className="badge badge-red" style={{ fontSize: 11 }}>
              <Calendar size={12} />
              {exam.daysLeft} Gün Kaldı
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {exam.courseName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Hazırlık: %{exam.currentReadiness}</span>
            <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>{exam.riskyTopics.length} riskli konu</span>
          </div>
          <ProgressBar value={exam.currentReadiness} color="var(--danger)" height={6} />
        </div>

        {/* Metric 2: Today's Smart Recommendation */}
        <div
          className="card"
          onClick={() => activeLesson && navigate(`/lesson/${activeLesson.id}`)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>BUGÜNKÜ ÖNERİN</span>
            <span className="badge badge-blue">
              <Clock size={12} /> 20 dk
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {activeLesson?.title || 'Ders Seçin'}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Zayıf alanın olan Polymorphism ve Duck Typing üzerine mikro ders.
          </p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
            <span>Derse Başla</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Metric 3: Weakest Topic Alert */}
        <div
          className="card"
          onClick={() => navigate('/teach-back?topic=polymorphism')}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>EN ZAYIF KONUN</span>
            <KnowledgeScoreBadge score={weakTopics[0]?.score || 48} size="sm" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {weakTopics[0]?.topicName || 'Polymorphism'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Duck Typing ve Metot Ezme kavramlarında desteğe ihtiyaç var.
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-purple)', fontSize: 12, fontWeight: 600 }}>
            <MessageSquareShare size={13} />
            <span>Teach-Back ile Anlat</span>
          </div>
        </div>

        {/* Metric 4: Due Reviews */}
        <div
          className="card"
          onClick={() => navigate('/review')}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>BUGÜN TEKRAR</span>
            <span className="badge badge-amber">
              <RotateCcw size={12} />
              {dueReviews.length} Konu
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Akıllı Spaced Repetition
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Unutma eğrisini sıfırlamak için bugün 2 kavram kartını tekrar etmelisin.
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--warning)', fontSize: 12, fontWeight: 600 }}>
            <span>Tekrarı Başlat</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>

      {/* Main Grid: Continue Path + Daily Targets & Weak Topics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24,
        }}
      >
        {/* Left Column: Active Learning Path (Devam Et) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Aktif Öğrenme Yolu</h2>
              </div>
              <button
                onClick={() => navigate(`/path/${currentPath.id}`)}
                className="btn btn-outline btn-sm"
              >
                Haritaya Git
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>
                {currentPath.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {currentPath.description}
              </p>
            </div>

            {/* Path Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {currentPath.completedLessons} / {currentPath.totalLessons} Ders Tamamlandı • Genel Kavrayış: %{overallProgress}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  %{currentPath.progressPercent}
                </span>
              </div>
              <ProgressBar value={currentPath.progressPercent} height={10} />
            </div>

            {/* Current Target Lesson Banner */}
            {activeLesson && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    →
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Sıradaki Mikro Ders
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {activeLesson.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      ⏱ ~{activeLesson.estimatedMinutes} dakika • Checkpoint & Uygulama
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/lesson/${activeLesson.id}`)}
                  className="btn btn-primary"
                >
                  <span>Derse Devam Et</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Daily Study Goal Widget */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flame size={18} color="var(--streak-color)" />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Bugünkü Öğrenme Hedefi</h3>
              </div>
              <span className="badge badge-amber">7 Günlük Seri 🔥</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Süre</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>22 / 25 dk</div>
                <div style={{ fontSize: 10, color: 'var(--success)' }}>%88 tamam</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tamamlanan Ders</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>1 / 2 ders</div>
                <div style={{ fontSize: 10, color: 'var(--primary)' }}>Hedefe yakın</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Çözülen Soru</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>4 / 8 soru</div>
                <div style={{ fontSize: 10, color: 'var(--warning)' }}>4 soru kaldı</div>
              </div>
            </div>

            <ProgressBar value={75} color="var(--warning)" height={7} />
          </div>
        </div>

        {/* Right Column: Adaptive Weak Areas + Spaced Repetition Due List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Weak Topics (Zayıf Konularım - Section 5 & 15) */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="var(--warning)" />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Zayıf Konularım (Adaptif Teşhis)</h3>
              </div>
              <span className="badge badge-red" style={{ fontSize: 11 }}>Müdahale Gerekli</span>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Quiz ve pratiklerde en çok hata yapılan konular. Sistem sınav tarihine göre bu başlıklara öncelik verir.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {weakTopics.map((topic) => (
                <div
                  key={topic.topicKey}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {topic.topicName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {topic.category}
                      </div>
                    </div>
                    <KnowledgeScoreBadge score={topic.score} size="sm" />
                  </div>

                  {topic.weakConcepts.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {topic.weakConcepts.map((wc, i) => (
                        <span key={i} className="badge badge-amber" style={{ fontSize: 10.5, padding: '2px 7px' }}>
                          ⚠️ {wc}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => navigate(`/teach-back?topic=${encodeURIComponent(topic.topicKey)}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11.5, padding: '4px 10px' }}
                    >
                      <MessageSquareShare size={12} />
                      <span>Teach-Back Yap</span>
                    </button>
                    <button
                      onClick={() => navigate('/learn')}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11.5, padding: '4px 10px' }}
                    >
                      <span>Alıştırma Çöz</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Spaced Repetition Due (Bugün Tekrar - Section 10 & 15) */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RotateCcw size={18} color="var(--primary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Bugün Tekrar Edilecekler</h3>
              </div>
              <span className="badge badge-amber">{dueReviews.length} Kart Bekliyor</span>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Kalıcı hafızaya aktarım için SuperMemo algoritmasıyla hesaplanan günlük tekrar seti.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {dueReviews.slice(0, 2).map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rev.topicName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {rev.category} • Aralık: {rev.intervalDays} gün
                    </div>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: 10 }}>Bugün</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/review')}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Akıllı Tekrar Seansını Başlat</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
