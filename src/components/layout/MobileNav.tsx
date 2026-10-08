import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Sparkles, Map, RotateCcw, GraduationCap } from 'lucide-react';
import { StorageService } from '../../services/storage/localStorageService';
import { getDueReviews } from '../../services/adaptive/spacedRepetition';

export const MobileNav: React.FC = () => {
  const activePathId = StorageService.getActivePathId();
  const reviews = StorageService.getReviews();
  const dueReviews = getDueReviews(reviews);

  const tabs = [
    { to: '/', label: 'Ana Sayfa', icon: Compass },
    { to: '/learn', label: 'Yeni Yol', icon: Sparkles },
    { to: `/path/${activePathId}`, label: 'Yol Haritam', icon: Map },
    {
      to: '/review',
      label: 'Tekrar',
      icon: RotateCcw,
      badge: dueReviews.length > 0 ? dueReviews.length : undefined,
    },
    { to: '/exam-mode', label: 'Sınav', icon: GraduationCap },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 62,
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 40,
        backdropFilter: 'blur(8px)',
      }}
      className="mobile-bottom-nav"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: 11,
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              position: 'relative',
              padding: '6px 12px',
            })}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {tab.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    background: 'var(--warning)',
                    color: '#000',
                    fontSize: 9,
                    fontWeight: 800,
                    borderRadius: '50%',
                    width: 15,
                    height: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
