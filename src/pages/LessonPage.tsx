import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Code,
  HelpCircle,
  Laptop,
  MessageSquareShare,
  FileCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import { AudioPlayerWidget } from '../components/common/AudioPlayerWidget';
import type { Lesson } from '../types';

export const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const paths = StorageService.getPaths();
  let foundLesson: Lesson | undefined;
  let foundPathId = '';

  for (const p of paths) {
    for (const m of p.modules) {
      const l = m.lessons.find((item: Lesson) => item.id === id);
      if (l) {
        foundLesson = l;
        foundPathId = p.id;
        break;
      }
    }
    if (foundLesson) break;
  }

  // Fallback to first lesson of active path if not found
  if (!foundLesson && paths.length > 0) {
    foundLesson = paths[0].modules[0]?.lessons[0];
    foundPathId = paths[0].id;
  }

  // Interactive Checkpoint State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedCheckpoint, setHasSubmittedCheckpoint] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Interactive Practice State
  const [showSolution, setShowSolution] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!foundLesson) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Ders Bulunamadı</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: 16 }}>
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const { content } = foundLesson;

  const handleCopyCode = () => {
    if (content.codeExample?.code) {
      navigator.clipboard.writeText(content.codeExample.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCompleteAndQuiz = () => {
    // Mark completed in storage
    StorageService.completeLesson(foundPathId, foundLesson!.id);
    StorageService.addXpAndProgress(50);

    // Navigate to quiz if exists, otherwise to path detail
    const quizId = foundLesson!.quizId || `quiz-${foundLesson!.id}`;
    navigate(`/quiz/${quizId}?pathId=${foundPathId}&lessonId=${foundLesson!.id}&topicKey=${foundLesson!.topicKey}`);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Back button & Lesson meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={() => navigate(`/path/${foundPathId}`)}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={15} />
          <span>Yol Haritasına Dön</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-blue">
            ⏱ ~{foundLesson.estimatedMinutes} Dakika Mikro Ders
          </span>
          {foundLesson.isCompleted && (
            <span className="badge badge-green">
              <CheckCircle2 size={12} /> Tamamlandı
            </span>
          )}
        </div>
      </div>

      {/* Lesson Title Header */}
      <div>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          {foundLesson.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Aktif Öğrenme Metodu: Oku • Dinle • Kodla • Mini Soru • Kendin Anlat
        </p>
      </div>

      {/* Audio Player Widget (TTS) */}
      <AudioPlayerWidget
        text={content.audioSummary || content.simpleExplanation}
        title={`${foundLesson.title} — Sesli Özet`}
      />

      {/* 8-Part Micro Lesson Sections */}

      {/* 1. Konuya Giriş & Kanca */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
          <Sparkles size={16} />
          <span>01. Konuya Giriş & Neden Önemli?</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)' }}>
          {content.introduction}
        </p>
      </div>

      {/* 2. Basit Açıklama */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-secondary)', fontWeight: 700, fontSize: 13 }}>
          <BookOpen size={16} />
          <span>02. Sade Açıklama (Akademik Olmayan Dille)</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)' }}>
          {content.simpleExplanation}
        </p>
      </div>

      {/* 3. Gerçek Hayat Analojisi */}
      <div className="card" style={{ backgroundColor: 'var(--bg-input)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--warning)', fontWeight: 700, fontSize: 13 }}>
          <span>💡</span>
          <span>03. Gerçek Hayat Benzetmesi (Analoji)</span>
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          "{content.realWorldAnalogy}"
        </p>
      </div>

      {/* 4. Teknik & Kod Örneği */}
      {content.codeExample && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Code size={15} color="var(--primary)" />
              <span>04. Teknik / Kod İncelemesi ({content.codeExample.language})</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: 11 }}
            >
              {copiedCode ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
              <span>{copiedCode ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              padding: '18px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: 13.5,
              lineHeight: 1.6,
              color: '#93c5fd',
              backgroundColor: '#090d16',
              overflowX: 'auto',
            }}
          >
            <code>{content.codeExample.code}</code>
          </pre>
          {content.codeExample.notes && (
            <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
              ℹ️ Not: {content.codeExample.notes}
            </div>
          )}
        </div>
      )}

      {/* 5. Mini Checkpoint Soru */}
      <div className="card" style={{ borderColor: 'var(--border-active)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
            <HelpCircle size={16} />
            <span>05. Anlık Checkpoint (Mini Kontrol)</span>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '3px 8px' }}
          >
            {showHint ? 'İpucunu Gizle' : '💡 İpucu Al'}
          </button>
        </div>

        {showHint && (
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--warning-subtle)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--warning)', marginBottom: 12 }}>
            İpucu: {content.checkpoint.hint}
          </div>
        )}

        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
          {content.checkpoint.question}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {content.checkpoint.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === content.checkpoint.correctIndex;

            let optBg = 'var(--bg-input)';
            let optBorder = 'var(--border-subtle)';

            if (hasSubmittedCheckpoint) {
              if (isCorrect) {
                optBg = 'var(--success-subtle)';
                optBorder = 'var(--success)';
              } else if (isSelected) {
                optBg = 'var(--danger-subtle)';
                optBorder = 'var(--danger)';
              }
            } else if (isSelected) {
              optBg = 'var(--primary-subtle)';
              optBorder = 'var(--primary)';
            }

            return (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: optBg,
                  border: `1px solid ${optBorder}`,
                  cursor: hasSubmittedCheckpoint ? 'default' : 'pointer',
                  fontSize: 13.5,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <input
                  type="radio"
                  name="checkpoint"
                  checked={isSelected}
                  onChange={() => !hasSubmittedCheckpoint && setSelectedOption(idx)}
                  disabled={hasSubmittedCheckpoint}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        {!hasSubmittedCheckpoint ? (
          <button
            onClick={() => selectedOption !== null && setHasSubmittedCheckpoint(true)}
            disabled={selectedOption === null}
            className="btn btn-primary btn-sm"
          >
            Cevabı Doğrula
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: selectedOption === content.checkpoint.correctIndex ? 'var(--success)' : 'var(--danger)' }}>
            {selectedOption === content.checkpoint.correctIndex ? (
              <>
                <CheckCircle2 size={16} />
                <span>Harika! Doğru cevap verdin.</span>
              </>
            ) : (
              <span>Yanlış seçenek. Doğru cevap vurgulandı, ders notunu tekrar inceleyebilirsin.</span>
            )}
          </div>
        )}
      </div>

      {/* 6. Uygulama & Pratik Görev */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontWeight: 700, fontSize: 13 }}>
            <Laptop size={16} />
            <span>06. Uygulama & Hands-on Pratik Görev</span>
          </div>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: 11, padding: '3px 8px' }}
          >
            {showSolution ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showSolution ? 'Çözümü Gizle' : 'Örnek Çözümü Gör'}</span>
          </button>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8 }}>
          <strong>Görev:</strong> {content.practiceTask.task}
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          💡 İpucu: {content.practiceTask.hint}
        </p>

        {showSolution && (
          <div style={{ marginTop: 12, padding: '12px 14px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
              Referans Çözüm:
            </div>
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#a7f3d0' }}>
              <code>{content.practiceTask.solution}</code>
            </pre>
          </div>
        )}
      </div>

      {/* 7. Kendin Anlat (Teach-Back Trigger) */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-purple)', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              <MessageSquareShare size={16} />
              <span>07. Kendin Anlat (Teach-Back / Feynman Modu)</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', maxWidth: 640 }}>
              "{content.teachBackPrompt}"
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              AI koçuna kendi cümlelerinle anlat; eksik kavramlarını ve yanlış anlaşılmalarını analiz etsin.
            </p>
          </div>

          <button
            onClick={() => navigate(`/teach-back?topic=${encodeURIComponent(foundLesson!.topicKey)}`)}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--accent-purple)', borderColor: 'rgba(139, 92, 246, 0.4)' }}
          >
            <span>Öğreterek Anlat</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 8. Sonuç & Akılda Kalması Gerekenler */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--success)', fontWeight: 700, fontSize: 13 }}>
          <FileCheck size={16} />
          <span>08. Sonuç & Akılda Kalması Gerekenler</span>
        </div>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, color: 'var(--text-primary)' }}>
          {content.takeaways.map((takeaway, idx) => (
            <li key={idx}>{takeaway}</li>
          ))}
        </ul>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '18px 24px',
          position: 'sticky',
          bottom: 20,
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-active)',
          zIndex: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Dersi Bitirmeye Hazır Mısın?
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            +50 XP kazanacaksın ve anında adaptif quiz başlayacak.
          </div>
        </div>

        <button
          onClick={handleCompleteAndQuiz}
          className="btn btn-primary btn-lg"
          style={{ gap: 8 }}
        >
          <span>Dersi Tamamla ve Quize Geç</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
