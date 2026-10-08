import type { MasteryStatus, TopicMastery } from '../../types';

export interface ScoreAssessment {
  status: MasteryStatus;
  feedbackText: string;
  recommendedAction: 'continue' | 'practice_more' | 'reteach_and_review';
  colorTag: string;
}

/**
 * Assesses performance based on quiz/test score (0-100)
 */
export function assessScore(score: number): ScoreAssessment {
  if (score >= 85) {
    return {
      status: 'mastered',
      feedbackText: 'Tebrikler! Konuya tam anlamıyla hakimsin. Sonraki aşamaya geçmeye hazırsın.',
      recommendedAction: 'continue',
      colorTag: '#10B981', // green
    };
  }

  if (score >= 70) {
    return {
      status: 'proficient',
      feedbackText: 'Konuyu yeterli düzeyde kavradın. Birkaç ince detayı pekiştirerek ilerleyebilirsin.',
      recommendedAction: 'continue',
      colorTag: '#3B82F6', // blue
    };
  }

  if (score >= 50) {
    return {
      status: 'needs_practice',
      feedbackText: 'Temel mantığı anladın ancak bazı kavramlarda tereddüt var. Ek pratik öneriliyor.',
      recommendedAction: 'practice_more',
      colorTag: '#F59E0B', // amber
    };
  }

  return {
    status: 'critical',
    feedbackText: 'Bu konuda kritik eksikler tespit edildi. Kavramı yeniden öğrenmen ve örnekleri incelemen tavsiye edilir.',
    recommendedAction: 'reteach_and_review',
    colorTag: '#EF4444', // red
  };
}

/**
 * Calculates updated knowledge score using an exponential moving average
 * with weight on recent performance
 */
export function calculateUpdatedKnowledgeScore(
  currentScore: number,
  newScore: number,
  attemptsCount: number
): number {
  if (attemptsCount === 0) {
    return Math.round(newScore);
  }
  // Weight recent attempt 65% if it was low, 55% if high
  const weight = newScore < currentScore ? 0.65 : 0.55;
  const blended = (currentScore * (1 - weight)) + (newScore * weight);
  return Math.min(100, Math.max(0, Math.round(blended)));
}

/**
 * Identifies weak topics that need urgent intervention
 */
export function getWeakTopics(masteries: TopicMastery[], maxCount: number = 3): TopicMastery[] {
  return [...masteries]
    .filter((m) => m.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, maxCount);
}

/**
 * Identifies strong mastered topics
 */
export function getStrongTopics(masteries: TopicMastery[], maxCount: number = 3): TopicMastery[] {
  return [...masteries]
    .filter((m) => m.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount);
}

/**
 * Calculates overall user mastery percentage across all topics
 */
export function calculateOverallProgress(masteries: TopicMastery[]): number {
  if (!masteries.length) return 0;
  const total = masteries.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / masteries.length);
}
