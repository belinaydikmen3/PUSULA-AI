import { describe, expect, it } from 'vitest';
import {
  assessScore,
  calculateOverallProgress,
  calculateUpdatedKnowledgeScore,
  getStrongTopics,
  getWeakTopics,
} from '../adaptiveEngine';
import type { TopicMastery } from '../../../types';

describe('Adaptive Engine - Performance Assessment', () => {
  it('should categorize score >= 85 as mastered with continue action', () => {
    const result = assessScore(88);
    expect(result.status).toBe('mastered');
    expect(result.recommendedAction).toBe('continue');
  });

  it('should categorize score 70-84 as proficient', () => {
    const result = assessScore(75);
    expect(result.status).toBe('proficient');
    expect(result.recommendedAction).toBe('continue');
  });

  it('should categorize score 50-69 as needs_practice', () => {
    const result = assessScore(62);
    expect(result.status).toBe('needs_practice');
    expect(result.recommendedAction).toBe('practice_more');
  });

  it('should categorize score < 50 as critical with reteach action', () => {
    const result = assessScore(45);
    expect(result.status).toBe('critical');
    expect(result.recommendedAction).toBe('reteach_and_review');
  });
});

describe('Adaptive Engine - Knowledge Score Calculation', () => {
  it('should return initial score when attemptsCount is 0', () => {
    const score = calculateUpdatedKnowledgeScore(0, 90, 0);
    expect(score).toBe(90);
  });

  it('should decrease knowledge score weighted when user drops', () => {
    const updated = calculateUpdatedKnowledgeScore(80, 50, 2);
    expect(updated).toBeLessThan(80);
    expect(updated).toBeGreaterThan(50);
  });

  it('should increase knowledge score when user improves', () => {
    const updated = calculateUpdatedKnowledgeScore(50, 90, 2);
    expect(updated).toBeGreaterThan(50);
    expect(updated).toBeLessThan(90);
  });
});

describe('Adaptive Engine - Topic Categorization & Progress', () => {
  const sampleMasteries: TopicMastery[] = [
    {
      topicKey: 'encap',
      topicName: 'Encapsulation',
      category: 'OOP',
      score: 92,
      status: 'mastered',
      lastAssessed: '',
      attemptsCount: 2,
      weakConcepts: [],
      recommendedAction: '',
    },
    {
      topicKey: 'inherit',
      topicName: 'Inheritance',
      category: 'OOP',
      score: 68,
      status: 'needs_practice',
      lastAssessed: '',
      attemptsCount: 2,
      weakConcepts: [],
      recommendedAction: '',
    },
    {
      topicKey: 'poly',
      topicName: 'Polymorphism',
      category: 'OOP',
      score: 48,
      status: 'critical',
      lastAssessed: '',
      attemptsCount: 2,
      weakConcepts: [],
      recommendedAction: '',
    },
  ];

  it('should return weak topics with score < 70 sorted ascending', () => {
    const weak = getWeakTopics(sampleMasteries);
    expect(weak.length).toBe(2);
    expect(weak[0].topicKey).toBe('poly'); // lowest first (48)
    expect(weak[1].topicKey).toBe('inherit'); // 68
  });

  it('should return strong topics with score >= 80', () => {
    const strong = getStrongTopics(sampleMasteries);
    expect(strong.length).toBe(1);
    expect(strong[0].topicKey).toBe('encap');
  });

  it('should compute overall progress average accurately', () => {
    const avg = calculateOverallProgress(sampleMasteries);
    // (92 + 68 + 48) / 3 = 208 / 3 = ~69
    expect(avg).toBe(69);
  });
});
