import React from 'react';
import { Menu, Moon, Sun, Sparkles, User, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storage/localStorageService';
import { AIService } from '../../services/ai/AIService';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  theme,
  onToggleTheme,
}) => {
  const navigate = useNavigate();
  const profile = StorageService.getProfile();
  const aiStatus = AIService.getStatus();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onOpenMobileSidebar}
          className="btn btn-secondary btn-sm mobile-menu-btn"
          aria-label="Menüyü Aç"
          style={{ display: 'none' }}
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            {profile.university}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>•</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            3. Sınıf Güz Dönemi
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Demo mode badge button */}
        <button
          onClick={() => navigate('/settings')}
          className="badge badge-blue"
          title="AI Motoru Ayarları"
          style={{
            cursor: 'pointer',
            padding: '5px 10px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={13} />
          <span>{aiStatus.isLiveApi ? 'Canlı AI' : 'Demo Modu'}</span>
          <Info size={11} style={{ opacity: 0.7 }} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="btn btn-secondary btn-sm"
          aria-label="Temayı Değiştir"
          style={{ width: 34, height: 34, padding: 0, borderRadius: 'var(--radius-md)' }}
        >
          {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#475569" />}
        </button>

        {/* Profile Avatar button */}
        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px 4px 6px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            <User size={14} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {profile.name.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
