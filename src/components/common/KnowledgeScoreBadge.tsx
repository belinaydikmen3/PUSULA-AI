import React from 'react';

interface KnowledgeScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const KnowledgeScoreBadge: React.FC<KnowledgeScoreBadgeProps> = ({ score, size = 'md' }) => {
  let badgeClass = 'badge-red';
  let label = 'Kritik';

  if (score >= 85) {
    badgeClass = 'badge-green';
    label = 'Uzman';
  } else if (score >= 70) {
    badgeClass = 'badge-blue';
    label = 'Yeterli';
  } else if (score >= 50) {
    badgeClass = 'badge-amber';
    label = 'Geliştirilmeli';
  }

  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{ fontSize, fontWeight: 700, gap: 4 }}
      title={`Kavrayış Skoru: ${score}/100 (${label})`}
    >
      <span>%{score}</span>
      <span style={{ opacity: 0.85, fontWeight: 500, fontSize: fontSize - 1 }}>• {label}</span>
    </span>
  );
};
