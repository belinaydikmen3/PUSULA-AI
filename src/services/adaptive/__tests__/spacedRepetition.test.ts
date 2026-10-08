import { describe, expect, it } from 'vitest';
import { calculateNextReview, getDueReviews, isReviewDue } from '../spacedRepetition';
import type { ReviewItem } from '../../../types';

describe('Spaced Repetition Engine', () => {
  it('should reset interval to 1 day and reduce ease factor when score is low (<60)', () => {
    const item = { intervalDays: 7, easeFactor: 2.5, repetitions: 3 };
    const result = calculateNextReview(item, 40);

    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(0);
    expect(result.easeFactor).toBeLessThan(2.5);
  });

  it('should expand interval on successful recall', () => {
    const item0 = { intervalDays: 1, easeFactor: 2.5, repetitions: 0 };
    const res1 = calculateNextReview(item0, 95);
    expect(res1.intervalDays).toBe(1);
    expect(res1.repetitions).toBe(1);

    const res2 = calculateNextReview({ intervalDays: 1, easeFactor: 2.5, repetitions: 1 }, 95);
    expect(res2.intervalDays).toBe(3);
    expect(res2.repetitions).toBe(2);

    const res3 = calculateNextReview({ intervalDays: 3, easeFactor: 2.5, repetitions: 2 }, 95);
    expect(res3.intervalDays).toBe(7);
  });

  it('should correctly determine due review dates', () => {
    const past = new Date(Date.now() - 3600000).toISOString();
    const future = new Date(Date.now() + 86400000).toISOString();

    expect(isReviewDue(past)).toBe(true);
    expect(isReviewDue(future)).toBe(false);
  });

  it('should filter due items correctly', () => {
    const items: ReviewItem[] = [
      {
        id: '1',
        topicKey: 'a',
        topicName: 'A',
        category: 'cat',
        question: 'q',
        answer: 'a',
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReviewDate: new Date(Date.now() - 5000).toISOString(),
        lastScore: 60,
        isDue: true,
      },
      {
        id: '2',
        topicKey: 'b',
        topicName: 'B',
        category: 'cat',
        question: 'q',
        answer: 'a',
        intervalDays: 5,
        easeFactor: 2.5,
        repetitions: 2,
        nextReviewDate: new Date(Date.now() + 500000).toISOString(),
        lastScore: 90,
        isDue: false,
      },
    ];

    const due = getDueReviews(items);
    expect(due.length).toBe(1);
    expect(due[0].id).toBe('1');
  });
});
