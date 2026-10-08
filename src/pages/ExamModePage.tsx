import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  CheckSquare,
  Square,
  ShieldAlert,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import { generateExamStudyPlan } from '../services/adaptive/studyPlanEngine';
import { ProgressBar } from '../components/common/ProgressBar';
import type { Exam, StudyPlan } from '../types';

export const ExamModePage: React.FC = () => {
  const [exam, setExam] = useState<Exam>(StorageService.getExam());
  const [studyPlan, setStudyPlan] = useState<StudyPlan>(StorageService.getStudyPlan());
  const [showNewExamModal, setShowNewExamModal] = useState(false);

  // Form states for new exam
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamType, setNewExamType] = useState<'Vize' | 'Final' | 'Bütünleme' | 'Kısa Sınav'>('Final');
  const [newDailyMinutes, setNewDailyMinutes] = useState(35);
  const [newTopicsText, setNewTopicsText] = useState('');

  const handleToggleTask = (dayNumber: number, taskId: string) => {
    const updatedPlan = StorageService.toggleStudyTask(dayNumber, taskId);
    setStudyPlan({ ...updatedPlan });

    // Recalculate exam readiness
    let totalTasks = 0;
    let completedTasks = 0;
    for (const d of updatedPlan.days) {
      for (const t of d.tasks) {
        totalTasks++;
        if (t.completed) completedTasks++;
      }
    }
    const readiness = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 60;
    const updatedExam = { ...exam, currentReadiness: readiness };
    StorageService.saveExam(updatedExam);
    setExam(updatedExam);
  };

  const handleCreateNewExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newExamDate) return;

    const topicsArray = newTopicsText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const generated = generateExamStudyPlan({
      courseName: newCourseName,
      courseCode: newCourseCode || 'DERS-101',
      universityName: 'Üniversite',
      examDate: newExamDate,
      examType: newExamType,
      dailyMinutes: newDailyMinutes,
      allTopics: topicsArray.length > 0 ? topicsArray : [
        'Temel İlkeler',
        'Çözüm Yöntemleri',
        'Kritik Formüller',
        'Uygulama Örnekleri',
        'Vize Konuları Tekrarı',
      ],
      weakTopics: topicsArray.slice(0, 2),
    });

    StorageService.saveExam(generated.exam);
    StorageService.saveStudyPlan(generated.plan);

    setExam(generated.exam);
    setStudyPlan(generated.plan);
    setShowNewExamModal(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="badge badge-red">
              <GraduationCap size={12} />
              Türkiye Üniversite Sınav Modu
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
            Sınava Hazırlık & Günlük Çalışma Planı
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Vize ve finallerin için ders müfredatını günlere böler, zayıf konularına öncelik verir ve süre tutmalı deneme sınavları planlar.
          </p>
        </div>

        <button
          onClick={() => setShowNewExamModal(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} />
          <span>Yeni Sınav Planı Ekle</span>
        </button>
      </div>

      {/* Active Exam Overview Card (Section 6 & 7) */}
      <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="badge badge-purple">{exam.courseCode}</span>
              <span className="badge badge-red">{exam.examType} Sınavı</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exam.universityName}</span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              {exam.courseName}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={14} color="var(--danger)" />
                <span>Kalan Süre: <strong>{exam.daysLeft} Gün</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={14} color="var(--primary)" />
                <span>Günlük: <strong>{studyPlan.dailyMinutes} dakika</strong></span>
              </div>
              <div>
                <span>Hedef Not: <strong>{exam.targetGrade} / 100</strong></span>
              </div>
            </div>
          </div>

          <div style={{ minWidth: 200, textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              Mevcut Sınav Hazırlık Seviyesi
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>
              %{exam.currentReadiness}
            </div>
            <ProgressBar value={exam.currentReadiness} height={8} />
          </div>
        </div>

        {/* Risky Topics Alert (Section 7) */}
        <div
          style={{
            marginTop: 20,
            padding: '14px 16px',
            backgroundColor: 'var(--danger-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
            <ShieldAlert size={16} />
            <span>BU SINAV İÇİN EN RİSKLİ 3 KONU (Adaptif Tespit):</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {exam.riskyTopics.map((topic, i) => (
              <span key={i} className="badge badge-red" style={{ fontSize: 12, padding: '4px 10px' }}>
                ⚠️ {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Day by Day Study Schedule (Section 6) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {exam.daysLeft} Günlük Detaylı Çalışma Takvimi
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Tamamlanan görevlerin kutucuğunu işaretle
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {studyPlan.days.map((day) => (
            <div
              key={day.dayNumber}
              className="card"
              style={{
                padding: '18px 20px',
                borderColor: day.isWeakAreaFocus ? 'rgba(239, 68, 68, 0.4)' : day.isCompleted ? 'rgba(16, 185, 129, 0.4)' : undefined,
                backgroundColor: day.isWeakAreaFocus ? 'rgba(239, 68, 68, 0.04)' : undefined,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-muted)',
                      fontSize: 12,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                    }}
                  >
                    GÜN {day.dayNumber}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{day.dateStr}</span>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {day.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {day.isWeakAreaFocus && (
                    <span className="badge badge-red" style={{ fontSize: 10 }}>
                      Zayıf Konu Telafisi
                    </span>
                  )}
                  {day.isCompleted && (
                    <span className="badge badge-green" style={{ fontSize: 10 }}>
                      <CheckCircle2 size={11} /> Tamamlandı
                    </span>
                  )}
                </div>
              </div>

              {/* Day Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {day.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(day.dayNumber, task.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {task.completed ? (
                        <CheckSquare size={17} color="var(--success)" />
                      ) : (
                        <Square size={17} color="var(--text-muted)" />
                      )}
                      <span
                        style={{
                          fontSize: 13.5,
                          color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.description}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-blue" style={{ fontSize: 10.5 }}>
                        {task.type === 'mock_exam' ? 'Deneme' : task.type === 'review' ? 'Tekrar' : task.type === 'quiz' ? 'Quiz' : 'Konu'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        ⏱ {task.durationMin} dk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Exam Modal */}
      {showNewExamModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div className="card" style={{ maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Yeni Üniversite Sınav Planı Ekle
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
              Sınav tarihini ve konularını gir; PUSULA gün gün çalışma ve deneme takvimini çıkarsın.
            </p>

            <form onSubmit={handleCreateNewExam} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  Ders Adı *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Örn: Yapay Zeka, Veritabanı Sistemleri, Algoritmalar..."
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    Ders Kodu
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Örn: BLG-312"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    Sınav Türü
                  </label>
                  <select
                    className="input-field"
                    value={newExamType}
                    onChange={(e) => setNewExamType(e.target.value as any)}
                  >
                    <option value="Vize">Vize</option>
                    <option value="Final">Final</option>
                    <option value="Bütünleme">Bütünleme</option>
                    <option value="Kısa Sınav">Kısa Sınav</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    Sınav Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    Günlük Çalışma (dk)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    className="input-field"
                    value={newDailyMinutes}
                    onChange={(e) => setNewDailyMinutes(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  Sınav Konuları (Her satıra bir konu)
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder={`Örn:\n1. Konu Başlığı\n2. Konu Başlığı\n3. Konu Başlığı`}
                  value={newTopicsText}
                  onChange={(e) => setNewTopicsText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowNewExamModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <span>Planı Oluştur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
