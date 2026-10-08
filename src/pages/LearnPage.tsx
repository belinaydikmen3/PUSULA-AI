import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { AIService } from '../services/ai/AIService';
import { StorageService } from '../services/storage/localStorageService';
import type { KnowledgeLevel, LearningPath } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';

export const LearnPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<KnowledgeLevel>('beginner');
  const [dailyMinutes, setDailyMinutes] = useState<number>(20);
  const [goal, setGoal] = useState<string>('exam'); // 'exam' | 'general' | 'interview'
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const paths = StorageService.getPaths();
  const activePathId = StorageService.getActivePathId();

  // Read URL query parameter if user came from dashboard input
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryTopic = params.get('topic');
    if (queryTopic) {
      setTopic(queryTopic);
    }
  }, [location.search]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep('1/4 Konu ve müfredat analiz ediliyor...');

    const timer1 = setTimeout(() => {
      setGenerationStep('2/4 Seviye ve öncelik sırası belirleniyor...');
    }, 600);

    const timer2 = setTimeout(() => {
      setGenerationStep('3/4 Mikro dersler ve interaktif adımlar oluşturuluyor...');
    }, 1200);

    try {
      const generatedPath = await AIService.generateLearningPath({
        topic,
        level,
        dailyMinutes,
        goal,
      });

      setGenerationStep('4/4 Yol haritası hazırlandı! Yönlendiriliyorsunuz...');
      // Save and set active
      StorageService.addPath(generatedPath);

      setTimeout(() => {
        setIsGenerating(false);
        navigate(`/path/${generatedPath.id}`);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };

  const handleSelectPath = (path: LearningPath) => {
    StorageService.setActivePathId(path.id);
    navigate(`/path/${path.id}`);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="badge badge-blue">
            <Sparkles size={12} />
            Adaptif Müfredat Tasarımı
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          Yeni Öğrenme Yolu Oluştur
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Öğrenmek istediğin konuyu ve hedefini yaz; PUSULA seviyene ve sınav takvimine uygun 7 günlük mikro ders yolunu çıkarsın.
        </p>
      </div>

      {/* Generator Form Card */}
      <div className="card" style={{ padding: '28px' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Topic Input */}
          <div>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              1. Ne öğrenmek istiyorsun? *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Örn: Python'da OOP, Yazılım Testi, Veri Yapıları, 10 gün sonra Java sınavım var..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
              required
              style={{ fontSize: 15 }}
            />
          </div>

          {/* Level Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              2. Mevcut Bilgi Seviyen
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {[
                { id: 'beginner', label: 'Başlangıç', desc: 'Konuyu ilk kez görüyorum' },
                { id: 'intermediate', label: 'Orta Seviye', desc: 'Temel kavramları biliyorum' },
                { id: 'advanced', label: 'İleri Seviye', desc: 'Sınava / Mülakata hazırım' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id as KnowledgeLevel)}
                  disabled={isGenerating}
                  className={`card ${level === lvl.id ? 'active-level-card' : ''}`}
                  style={{
                    padding: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderColor: level === lvl.id ? 'var(--primary)' : 'var(--border-subtle)',
                    backgroundColor: level === lvl.id ? 'var(--primary-subtle)' : 'var(--bg-input)',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: level === lvl.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                    {lvl.label}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Study Time & Goal Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Daily Time */}
            <div>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                3. Günlük Çalışma Bütçen
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyMinutes(mins)}
                    disabled={isGenerating}
                    className="btn btn-secondary btn-sm"
                    style={{
                      flex: 1,
                      borderColor: dailyMinutes === mins ? 'var(--primary)' : undefined,
                      color: dailyMinutes === mins ? 'var(--primary)' : undefined,
                      backgroundColor: dailyMinutes === mins ? 'var(--primary-subtle)' : undefined,
                      fontWeight: dailyMinutes === mins ? 700 : 500,
                    }}
                  >
                    {mins} dk
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                4. Temel Amacın
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'exam', label: '🎓 Üniversite Sınavı' },
                  { id: 'general', label: '💡 Genel Öğrenme' },
                  { id: 'interview', label: '💼 Mülakat / Kodlama' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    disabled={isGenerating}
                    className="btn btn-secondary btn-sm"
                    style={{
                      flex: 1,
                      borderColor: goal === g.id ? 'var(--primary)' : undefined,
                      color: goal === g.id ? 'var(--primary)' : undefined,
                      backgroundColor: goal === g.id ? 'var(--primary-subtle)' : undefined,
                      fontWeight: goal === g.id ? 700 : 500,
                      fontSize: 12,
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ marginTop: 8 }}>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', height: 48 }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{generationStep || 'Yol haritası oluşturuluyor...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Yol Haritası Oluştur ve Başla</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Paths Library */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <FolderOpen size={18} color="var(--primary)" />
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Kayıtlı Öğrenme Yollarım</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {paths.map((p) => {
            const isActive = p.id === activePathId;
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  borderColor: isActive ? 'var(--primary)' : undefined,
                  position: 'relative',
                }}
              >
                {isActive && (
                  <span
                    className="badge badge-blue"
                    style={{ position: 'absolute', top: 16, right: 16, fontSize: 10 }}
                  >
                    Aktif Yol
                  </span>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="badge badge-purple" style={{ fontSize: 10.5 }}>
                      {p.category}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      • {p.estimatedDays} Gün • {p.dailyMinutes} dk/gün
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {p.description}
                  </p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {p.completedLessons} / {p.totalLessons} Ders
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      %{p.progressPercent}
                    </span>
                  </div>
                  <ProgressBar value={p.progressPercent} height={6} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => handleSelectPath(p)}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Yola Git</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
