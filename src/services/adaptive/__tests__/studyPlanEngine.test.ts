import { describe, expect, it } from 'vitest';
import { generateExamStudyPlan } from '../studyPlanEngine';

describe('Study Plan Engine - Turkey University Exam Mode', () => {
  it('should generate an 18-day study plan with weak area remediation and final review', () => {
    const futureDate = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString();
    const result = generateExamStudyPlan({
      courseName: 'Yazılım Gerçekleme ve Test',
      courseCode: 'CENG-302',
      universityName: 'İTÜ',
      examDate: futureDate,
      examType: 'Final',
      dailyMinutes: 40,
      allTopics: [
        'Unit Testing',
        'Integration Testing',
        'Test Case Design',
        'Black Box Testing',
        'White Box Testing',
        'Code Coverage',
      ],
      weakTopics: ['Integration Testing', 'Code Coverage'],
    });

    expect(result.exam.courseName).toBe('Yazılım Gerçekleme ve Test');
    expect(result.exam.daysLeft).toBe(18);
    expect(result.plan.days.length).toBe(18);

    // Final day should be review
    const finalDay = result.plan.days[result.plan.days.length - 1];
    expect(finalDay.title).toContain('Tekrar');

    // Penultimate day should have mock exam task
    const mockDay = result.plan.days[result.plan.days.length - 2];
    const hasMock = mockDay.tasks.some((t: any) => t.type === 'mock_exam');
    expect(hasMock).toBe(true);

    // Risky topics identified
    expect(result.exam.riskyTopics).toContain('Integration Testing');
  });
});
