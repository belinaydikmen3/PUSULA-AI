import React, { useState } from 'react';
import {
  Sparkles,
  Moon,
  Sun,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import { AIService } from '../services/ai/AIService';
import type { AppSettings } from '../types';

interface SettingsPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onToggleTheme }) => {
  const [settings] = useState<AppSettings>(StorageService.getSettings());
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [selectedProvider, setSelectedProvider] = useState<'demo' | 'gemini' | 'openai'>(settings.aiProvider);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  const aiStatus = AIService.getStatus();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      aiProvider: selectedProvider,
      geminiApiKey: geminiKey,
      openaiApiKey: openaiKey,
    };

    StorageService.saveSettings(updated);
    AIService.setProvider(selectedProvider);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFactoryReset = () => {
    StorageService.resetToDefaults();
    window.location.reload();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840, margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="badge badge-blue">
            <Sparkles size={12} />
            Aktif Motor: {aiStatus.activeProviderName}
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          Ayarlar & AI Konfigürasyonu
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          AI motorunu özelleştir, API anahtarlarını güvenle gir veya demo modunu kullan.
        </p>
      </div>

      {savedSuccess && (
        <div
          className="badge badge-green"
          style={{ padding: '10px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Check size={16} />
          <span>Ayarlar başarıyla kaydedildi ve AI motoru güncellendi.</span>
        </div>
      )}

      {/* AI Provider Selector Card (Section 13, 21, 22) */}
      <div className="card" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={18} color="var(--primary)" />
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            AI Motoru & Provider Seçimi
          </h2>
        </div>

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Radio Providers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {/* Demo Provider */}
            <div
              onClick={() => setSelectedProvider('demo')}
              className={`card ${selectedProvider === 'demo' ? 'active-level-card' : ''}`}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderColor: selectedProvider === 'demo' ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: selectedProvider === 'demo' ? 'var(--primary-subtle)' : 'var(--bg-input)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Demo / Çevrimdışı Mod
                </span>
                <span className="badge badge-green" style={{ fontSize: 10 }}>Önerilen</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                API anahtarı gerektirmez. Jüri, hoca ve offline sunumlar için anında, hatasız ve hızlı çalışır.
              </p>
            </div>

            {/* Gemini Provider */}
            <div
              onClick={() => setSelectedProvider('gemini')}
              className={`card ${selectedProvider === 'gemini' ? 'active-level-card' : ''}`}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderColor: selectedProvider === 'gemini' ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: selectedProvider === 'gemini' ? 'var(--primary-subtle)' : 'var(--bg-input)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Google Gemini
                </span>
                <span className="badge badge-blue" style={{ fontSize: 10 }}>Canlı API</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Gemini 1.5 Flash ile gerçek zamanlı dinamik içerik üretimi.
              </p>
            </div>

            {/* OpenAI Provider */}
            <div
              onClick={() => setSelectedProvider('openai')}
              className={`card ${selectedProvider === 'openai' ? 'active-level-card' : ''}`}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderColor: selectedProvider === 'openai' ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: selectedProvider === 'openai' ? 'var(--primary-subtle)' : 'var(--bg-input)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  OpenAI GPT-4o
                </span>
                <span className="badge badge-purple" style={{ fontSize: 10 }}>Canlı API</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                GPT-4o Mini ile yüksek doğruluklu konu çıkarımı ve quiz üretimi.
              </p>
            </div>
          </div>

          {/* Conditional API Keys */}
          {selectedProvider === 'gemini' && (
            <div className="animate-fade-in">
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Google Gemini API Anahtarı (VITE_GEMINI_API_KEY veya Yerel Depolama)
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                🔒 Anahtarınız yalnızca tarayıcınızın yerel hafızasında saklanır, asla sunucuya aktarılmaz.
              </span>
            </div>
          )}

          {selectedProvider === 'openai' && (
            <div className="animate-fade-in">
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                OpenAI API Anahtarı (VITE_OPENAI_API_KEY veya Yerel Depolama)
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                🔒 Anahtarınız yalnızca tarayıcınızın yerel hafızasında saklanır.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={14} />
              <span>AI Tercihlerini Kaydet</span>
            </button>
          </div>
        </form>
      </div>

      {/* Theme & Display Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
          Arayüz & Tema
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Açık / Koyu Tema (Dark / Light Mode)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Gece ders çalışmaları için yüksek kontrastlı koyu tema önerilir.
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="btn btn-secondary"
            style={{ gap: 8 }}
          >
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#475569" />}
            <span>{theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}</span>
          </button>
        </div>
      </div>

      {/* Local-First & Privacy (Section 21) */}
      <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          Gizlilik & Yerel Veri Yönetimi
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          PUSULA "Local-First" mimarisiyle çalışır. Tüm ders notların, sınav tarihlerin, quiz sonuçların ve kişisel verilerin cihazında güvenle saklanır.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Öğrenme verilerini ve ilerleme geçmişini sıfırlayarak ilk demo haline döndürebilirsin.
          </div>

          <button
            onClick={() => setResetModal(true)}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={14} />
            <span>Fabrika Ayarlarına Dön</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {resetModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '28px' }}>
            <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              Tüm Veriler Sıfırlansın mı?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Bu işlem kayıtlı tüm öğrenme yollarını ve quiz sonuçlarını sıfırlayıp ilk demo durumuna döndürecektir.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={() => setResetModal(false)} className="btn btn-secondary btn-sm">
                Vazgeç
              </button>
              <button onClick={handleFactoryReset} className="btn btn-danger btn-sm">
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
