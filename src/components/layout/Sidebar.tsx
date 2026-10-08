import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Map,
  RotateCcw,
  GraduationCap,
  MessageSquareShare,
  FileText,
  BarChart3,
  User,
  Settings,
  Flame,
  Zap,
} from 'lucide-react';
import { StorageService } from '../../services/storage/localStorageService';
import { AIService } from '../../services/ai/AIService';
import { getDueReviews } from '../../services/adaptive/spacedRepetition';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const location = useLocation();
  const profile = StorageService.getProfile();
  const reviews = StorageService.getReviews();
  const exam = StorageService.getExam();
  const activePathId = StorageService.getActivePathId();
  const aiStatus = AIService.getStatus();

  const dueReviews = getDueReviews(reviews);

  const navItems = [
    { to: '/', label: 'Ana Sayfa', icon: Compass },
    { to: '/learn', label: 'Yeni Yol Oluştur', icon: Sparkles },
    { to: `/path/${activePathId}`, label: 'Yol Haritam', icon: Map },
    {
      to: '/review',
      label: 'Akıllı Tekrar',
      icon: RotateCcw,
      badge: dueReviews.length > 0 ? `${dueReviews.length}` : undefined,
      badgeColor: 'badge-amber',
    },
    {
      to: '/exam-mode',
      label: 'Sınav Modu',
      icon: GraduationCap,
      badge: `${exam.daysLeft}g`,
      badgeColor: 'badge-red',
    },
    { to: '/teach-back', label: 'Öğreterek Öğren', icon: MessageSquareShare },
    { to: '/resources', label: 'Kaynaktan Öğren', icon: FileText },
    { to: '/progress', label: 'İlerlemem & Analiz', icon: BarChart3 },
    { to: '/profile', label: 'Profilim', icon: User },
    { to: '/settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: isOpenMobile ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
        }}
        className={isOpenMobile ? 'sidebar-mobile-open' : ''}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--primary-glow)',
            }}
          >
            <Compass size={22} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              PUSULA <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>AI</span>
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
              Adaptif Öğrenme Platformu
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav
          style={{
            flex: 1,
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
                className="sidebar-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`badge ${item.badgeColor}`} style={{ fontSize: 11, padding: '2px 7px' }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Mini Stat Card */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--streak-color)', fontSize: 12.5, fontWeight: 700 }}>
              <Flame size={16} />
              <span>{profile.streakDays} Gün Seri</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--warning)', fontSize: 12.5, fontWeight: 700 }}>
              <Zap size={14} />
              <span>{profile.xp} XP</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--text-muted)',
              padding: '6px 8px',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span>Motor:</span>
            <span style={{ fontWeight: 600, color: aiStatus.isLiveApi ? 'var(--success)' : 'var(--primary)' }}>
              {aiStatus.isLiveApi ? '● Canlı API' : '● Demo Modu'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
