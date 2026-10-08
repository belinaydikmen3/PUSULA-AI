import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Edit2,
  Check,
  Layers,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import type { UserProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university);
  const [department, setDepartment] = useState(profile.department);
  const [year, setYear] = useState(profile.year);
  const [dailyMinutes, setDailyMinutes] = useState(profile.targetStudyMinutesPerDay);

  const paths = StorageService.getPaths();
  const exam = StorageService.getExam();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      university,
      department,
      year: Number(year),
      targetStudyMinutesPerDay: Number(dailyMinutes),
    };
    StorageService.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 880, margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="badge badge-blue">
            <User size={12} />
            Öğrenci Profili
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          Akademik Profilim
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Üniversite bilgilerin ve öğrenme tercihlerin PUSULA adaptif motoru tarafından çalışma planlarını optimize etmek için kullanılır.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800,
                boxShadow: '0 0 20px var(--primary-glow)',
              }}
            >
              {profile.name.charAt(0)}
            </div>

            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                {profile.name}
              </h2>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                {profile.title}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-blue">{profile.university}</span>
                <span className="badge badge-purple">{profile.department}</span>
                <span className="badge badge-green">{profile.year}. Sınıf</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={14} />
            <span>{isEditing ? 'Vazgeç' : 'Profili Düzenle'}</span>
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ad Soyad</label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Üniversite</label>
                <input type="text" className="input-field" value={university} onChange={(e) => setUniversity(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Bölüm</label>
                <input type="text" className="input-field" value={department} onChange={(e) => setDepartment(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Sınıf</label>
                <input type="number" min="1" max="6" className="input-field" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Hedef Günlük Çalışma Süresi (Dakika)</label>
              <input type="number" min="10" max="180" className="input-field" value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <Check size={14} />
                <span>Değişiklikleri Kaydet</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Enrolled Courses & Active Exams */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Active Learning Paths */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Layers size={18} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Kayıtlı Öğrenme Yollarım ({paths.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {paths.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {p.category} • %{p.progressPercent} Tamamlandı
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Active University Exam */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <GraduationCap size={18} color="var(--danger)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Aktif Sınav Takibi
            </h3>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--danger)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-red">{exam.examType}</span>
              <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
                {exam.daysLeft} Gün Kaldı
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>
              {exam.courseName} ({exam.courseCode})
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Hazırlık Seviyesi: %{exam.currentReadiness} • Hedef: {exam.targetGrade}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
