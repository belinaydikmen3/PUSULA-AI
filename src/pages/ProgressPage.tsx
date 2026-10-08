import React from 'react';
import {
  BarChart3,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import {
  calculateOverallProgress,
  getStrongTopics,
  getWeakTopics,
} from '../services/adaptive/adaptiveEngine';
import { KnowledgeScoreBadge } from '../components/common/KnowledgeScoreBadge';

export const ProgressPage: React.FC = () => {
  const profile = StorageService.getProfile();
  const masteries = StorageService.getTopicMasteries();
  const strongTopics = getStrongTopics(masteries, 3);
  const weakTopics = getWeakTopics(masteries, 3);
  const overallMastery = calculateOverallProgress(masteries);
  const dailyActivities = StorageService.getDailyActivity();
  const achievements = StorageService.getAchievements();
  const paths = StorageService.getPaths();

  let totalCompletedLessons = 0;
  for (const p of paths) {
    totalCompletedLessons += p.completedLessons;
  }

  // Calculate 7-day study minutes
  const totalMinutes = dailyActivities.reduce((acc, cur) => acc + cur.minutesSpent, 0);

  // Find max minutes for responsive SVG / CSS chart scaling
  const maxMins = Math.max(...dailyActivities.map((d) => d.minutesSpent), 45);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="badge badge-blue">
            <BarChart3 size={12} />
            Öğrenme Analitiği & İçgörüler
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          Gelişimim & Başarı Raporum
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Kişiselleştirilmiş öğrenme hızın, adaptif güçlü/zayıf konu haritan ve sınav hazırbulunuşluk analizin.
        </p>
      </div>

      {/* Top 4 Quick Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Metric 1: Total Study Time */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>TOPLAM ÇALIŞMA</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              {Math.round(totalMinutes / 60)}s {totalMinutes % 60}d
            </div>
          </div>
        </div>

        {/* Metric 2: Completed Lessons */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-subtle)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>BİTEN DERSLER</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalCompletedLessons} Mikro Ders
            </div>
          </div>
        </div>

        {/* Metric 3: Quiz Accuracy */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-purple-subtle)',
              color: 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>GENEL KAVRAYIŞ</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              %{overallMastery}
            </div>
          </div>
        </div>

        {/* Metric 4: Streak & Level */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              color: 'var(--streak-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>SERİ & SEVİYE</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              {profile.streakDays} Gün • Seviye {profile.level}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Activity Chart + Exam Readiness Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* 7-Day Activity Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Son 7 Gün Çalışma Aktivitesi
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Günlük Ortalama: ~{Math.round(totalMinutes / 7)} dk
            </span>
          </div>

          {/* SVG / CSS Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingBottom: 24, gap: 10 }}>
            {dailyActivities.map((day) => {
              const heightPercent = Math.round((day.minutesSpent / maxMins) * 100);
              const dateLabel = new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' });

              return (
                <div
                  key={day.date}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>
                    {day.minutesSpent}m
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      height: `${heightPercent}%`,
                      backgroundColor: 'var(--primary)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 2px 8px var(--primary-glow)',
                      transition: 'height 500ms ease',
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strong vs Weak Topics Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            Konu Bazlı Başarı & Teşhis Matrisi
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Strong Topics */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>
                <CheckCircle2 size={14} />
                <span>En Güçlü Olduğun Konular (Mastered)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {strongTopics.map((t) => (
                  <div key={t.topicKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{t.topicName}</span>
                    <KnowledgeScoreBadge score={t.score} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Topics */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>
                <AlertTriangle size={14} />
                <span>Geliştirilmesi Gereken Konular (Riskli)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {weakTopics.map((t) => (
                  <div key={t.topicKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{t.topicName}</span>
                    <KnowledgeScoreBadge score={t.score} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification & Achievements Grid (Section 19) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="var(--warning)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Başarılar & Rozetler (Gamification)
            </h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Öğrenme disiplinini ödüllendirir
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {achievements.map((ach) => {
            const isUnlocked = Boolean(ach.unlockedAt);
            return (
              <div
                key={ach.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid',
                  borderColor: isUnlocked ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)',
                  opacity: isUnlocked ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: isUnlocked ? 'var(--warning-subtle)' : 'var(--bg-muted)',
                      color: isUnlocked ? 'var(--warning)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    🏆
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ach.title}
                  </div>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
                  {ach.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: 'var(--warning)', fontWeight: 600 }}>+{ach.xpReward} XP</span>
                  <span style={{ color: isUnlocked ? 'var(--success)' : 'var(--text-muted)' }}>
                    {isUnlocked ? '✓ Kazanıldı' : `${ach.progress}/${ach.maxProgress}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
