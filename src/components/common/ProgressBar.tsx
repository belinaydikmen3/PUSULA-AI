import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'var(--primary)',
  height = 8,
  showLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--text-secondary)' }}>
          <span>İlerleme</span>
          <span style={{ fontWeight: 600 }}>%{clamped}</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 400ms ease',
          }}
        />
      </div>
    </div>
  );
};
