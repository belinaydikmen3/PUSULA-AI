import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import { ProgressBar } from '../components/common/ProgressBar';
import type { Lesson, Module } from '../types';

export const PathDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const paths = StorageService.getPaths();
  const path = paths.find((p) => p.id === id) || paths[0];

  if (!path) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Öğrenme Yolu Bulunamadı</h2>
        <button onClick={() => navigate('/learn')} className="btn btn-primary" style={{ marginTop: 16 }}>
          Yeni Yol Oluştur
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Path Header Card */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-purple">{path.category}</span>
              <span className="badge badge-blue">
                <Clock size={12} /> {path.estimatedDays} Gün • Günlük {path.dailyMinutes} dk
              </span>
              <span className="badge badge-green">Seviye: {path.level}</span>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              {path.title}
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 780, lineHeight: 1.5 }}>
              {path.description}
            </p>
          </div>

          <button
            onClick={() => navigate('/exam-mode')}
            className="btn btn-secondary btn-sm"
          >
            <GraduationCap size={15} />
            <span>Sınav Planına Bağla</span>
          </button>
        </div>

        {/* Source citation banner if generated from file */}
        {path.sourceDocumentName && (
          <div
            style={{
              marginTop: 14,
              padding: '8px 12px',
              backgroundColor: 'var(--primary-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FileText size={14} />
            <span>Bu açıklama ve öğrenme planı, <strong>{path.sourceDocumentName}</strong> içeriğine göre oluşturuldu.</span>
          </div>
        )}

        {/* Path Progress Indicator */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {path.completedLessons} / {path.totalLessons} Ders Tamamlandı
            </span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
              %{path.progressPercent}
            </span>
          </div>
          <ProgressBar value={path.progressPercent} height={10} />
        </div>
      </div>

      {/* Visual Timeline / Journey (Section 16) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {path.modules.map((module: Module, mIdx: number) => (
          <div key={module.id} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {mIdx + 1}
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {module.title}
                </h2>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  {module.lessons.length} Mikro Ders
                </div>
              </div>
            </div>

            {/* Timeline List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
              {module.lessons.map((lesson: Lesson) => {
                const isCompleted = lesson.isCompleted;
                const isLocked = lesson.isLocked;
                const isCurrent = !isCompleted && !isLocked;

                return (
                  <div
                    key={lesson.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isCurrent ? 'var(--bg-card-hover)' : 'var(--bg-input)',
                      border: '1px solid',
                      borderColor: isCurrent ? 'var(--primary)' : 'var(--border-subtle)',
                      boxShadow: isCurrent ? '0 0 15px var(--primary-glow)' : 'none',
                      opacity: isLocked ? 0.6 : 1,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {/* Status Symbol + Lesson Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 800,
                          backgroundColor: isCompleted
                            ? 'var(--success-subtle)'
                            : isCurrent
                            ? 'var(--primary)'
                            : 'var(--bg-muted)',
                          color: isCompleted
                            ? 'var(--success)'
                            : isCurrent
                            ? '#ffffff'
                            : 'var(--text-muted)',
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} />
                        ) : isCurrent ? (
                          <span>→</span>
                        ) : (
                          <Lock size={15} />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14.5, fontWeight: 700, color: isCurrent ? 'var(--primary)' : 'var(--text-primary)' }}>
                            {lesson.title}
                          </span>
                          {isCurrent && (
                            <span className="badge badge-blue" style={{ fontSize: 10, padding: '2px 6px' }}>
                              Şu an buradasın
                            </span>
                          )}
                          {isCompleted && (
                            <span className="badge badge-green" style={{ fontSize: 10, padding: '2px 6px' }}>
                              Tamamlandı
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                          ⏱ ~{lesson.estimatedMinutes} dakika • 8 Aşamalı Mikro Ders & Checkpoint
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isLocked ? (
                        <button
                          disabled
                          className="btn btn-secondary btn-sm"
                          style={{ opacity: 0.6 }}
                        >
                          <Lock size={13} />
                          <span>Kilitli</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/lesson/${lesson.id}`)}
                          className={isCurrent ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                        >
                          <span>{isCompleted ? 'Dersi İncele' : 'Derse Başla'}</span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
