import type { ReviewItem } from '../../types';

export interface SpacedRepetitionResult {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string;
}

/**
 * Calculates next review parameters based on performance score (0-100)
 */
export function calculateNextReview(
  item: Pick<ReviewItem, 'intervalDays' | 'easeFactor' | 'repetitions'>,
  performanceScore: number,
  baseDate: Date = new Date()
): SpacedRepetitionResult {
  let { intervalDays, easeFactor, repetitions } = item;

  // Grade from 0 to 5 based on 0-100 score
  const grade = Math.min(5, Math.max(0, Math.round(performanceScore / 20)));

  if (grade < 3) {
    // Failed / Struggled (< 60-70%)
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Passed
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 3;
    } else if (repetitions === 2) {
      intervalDays = 7;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
    // SM-2 ease factor formula: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  }

  const nextDate = new Date(baseDate.getTime());
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
    nextReviewDate: nextDate.toISOString(),
  };
}

/**
 * Checks if a review item is due for review today or overdue
 */
export function isReviewDue(nextReviewDateStr: string, currentDate: Date = new Date()): boolean {
  const nextDate = new Date(nextReviewDateStr);
  return nextDate.getTime() <= currentDate.getTime();
}

/**
 * Returns all due review items sorted by urgency
 */
export function getDueReviews(items: ReviewItem[], currentDate: Date = new Date()): ReviewItem[] {
  return items
    .filter((item) => isReviewDue(item.nextReviewDate, currentDate))
    .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
}
