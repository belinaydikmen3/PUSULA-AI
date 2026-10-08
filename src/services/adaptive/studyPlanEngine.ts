import type { Exam, StudyDay, StudyPlan, StudyTask } from '../../types';

export interface PlanGenerationInput {
  courseName: string;
  courseCode: string;
  universityName: string;
  examDate: string; // ISO date
  examType: 'Vize' | 'Final' | 'Bütünleme' | 'Kısa Sınav';
  dailyMinutes: number;
  allTopics: string[];
  weakTopics: string[];
}

export function generateExamStudyPlan(input: PlanGenerationInput): { exam: Exam; plan: StudyPlan } {
  const now = new Date();
  const targetDate = new Date(input.examDate);
  const diffTime = targetDate.getTime() - now.getTime();
  const daysLeft = Math.max(3, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const examId = `exam-${Date.now()}`;
  const planId = `plan-${Date.now()}`;

  // Prioritize risky/weak topics
  const riskyTopics = input.weakTopics.length > 0
    ? input.weakTopics.slice(0, 3)
    : input.allTopics.slice(0, 3);

  const days: StudyDay[] = [];
  const totalTopics = input.allTopics.length;

  for (let i = 1; i <= daysLeft; i++) {
    const dayDate = new Date(now.getTime() + (i - 1) * 24 * 60 * 60 * 1000);
    const dateStr = dayDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

    let title = '';
    let focusTopic = '';
    let isWeak = false;
    const tasks: StudyTask[] = [];

    if (i === daysLeft) {
      // Final day
      title = 'Sınav Öncesi Hızlı Tekrar & Kilit Formüller';
      focusTopic = 'Final Özeti ve Kilit Kavramlar';
      tasks.push(
        {
          id: `task-${i}-1`,
          description: 'Hap bilgi ve kavram kartlarının gözden geçirilmesi',
          durationMin: Math.round(input.dailyMinutes * 0.4),
          completed: false,
          type: 'review',
        },
        {
          id: `task-${i}-2`,
          description: 'Zayıf konu özetlerinin son kez taranması',
          durationMin: Math.round(input.dailyMinutes * 0.4),
          completed: false,
          type: 'review',
        },
        {
          id: `task-${i}-3`,
          description: 'Zihinsel dinlenme ve sınav stratejisi belirleme',
          durationMin: Math.round(input.dailyMinutes * 0.2),
          completed: false,
          type: 'review',
        }
      );
    } else if (i === daysLeft - 1) {
      // Penultimate day: Mock Exam
      title = 'Deneme Sınavı & Yanlış Analizi';
      focusTopic = 'Tam Kapsamlı Deneme Sınavı';
      tasks.push(
        {
          id: `task-${i}-1`,
          description: 'Zaman sınırlı tam kapsamlı deneme sınavı çözümü',
          durationMin: Math.round(input.dailyMinutes * 0.6),
          completed: false,
          type: 'mock_exam',
        },
        {
          id: `task-${i}-2`,
          description: 'Yanlış yapılan soruların analiz edilmesi ve tekrarı',
          durationMin: Math.round(input.dailyMinutes * 0.4),
          completed: false,
          type: 'practice',
        }
      );
    } else if (i === daysLeft - 2 && daysLeft >= 5) {
      // Remediation day for weak areas
      title = 'Zayıf Konu Telafi & Derinlemesine Soru Çözümü';
      focusTopic = riskyTopics[0] || 'Eksik Konular';
      isWeak = true;
      tasks.push(
        {
          id: `task-${i}-1`,
          description: `${focusTopic} konusunda Teach-Back (kendin anlat) uygulaması`,
          durationMin: Math.round(input.dailyMinutes * 0.5),
          completed: false,
          type: 'learn',
        },
        {
          id: `task-${i}-2`,
          description: 'Çıkmış soru tipi ve pekiştirme testleri',
          durationMin: Math.round(input.dailyMinutes * 0.5),
          completed: false,
          type: 'quiz',
        }
      );
    } else {
      // Regular topic learning days
      const topicIndex = (i - 1) % totalTopics;
      const topic = input.allTopics[topicIndex] || `Konu ${i}`;
      focusTopic = topic;
      isWeak = riskyTopics.includes(topic);
      title = `${topic} Konu Çalışması & Alıştırma`;

      tasks.push(
        {
          id: `task-${i}-1`,
          description: `${topic} mikro ders anlatımı ve kavramsal kavrayış`,
          durationMin: Math.round(input.dailyMinutes * 0.5),
          completed: false,
          type: 'learn',
          topicKey: topic,
        },
        {
          id: `task-${i}-2`,
          description: `${topic} pratik uygulama ve soru çözümü`,
          durationMin: Math.round(input.dailyMinutes * 0.3),
          completed: false,
          type: 'practice',
          topicKey: topic,
        },
        {
          id: `task-${i}-3`,
          description: 'Günün checkpoint mini değerlendirmesi',
          durationMin: Math.round(input.dailyMinutes * 0.2),
          completed: false,
          type: 'quiz',
          topicKey: topic,
        }
      );
    }

    days.push({
      dayNumber: i,
      dateStr,
      title,
      focusTopic,
      isWeakAreaFocus: isWeak,
      tasks,
      isCompleted: false,
    });
  }

  const exam: Exam = {
    id: examId,
    courseName: input.courseName,
    courseCode: input.courseCode || 'CENG-301',
    universityName: input.universityName || 'Üniversite',
    examDate: input.examDate,
    daysLeft,
    examType: input.examType,
    targetGrade: 85,
    currentReadiness: 61,
    priority: daysLeft <= 14 ? 'high' : 'medium',
    topics: input.allTopics,
    riskyTopics,
    studyPlanId: planId,
  };

  const plan: StudyPlan = {
    id: planId,
    examId,
    courseName: input.courseName,
    totalDays: daysLeft,
    dailyMinutes: input.dailyMinutes,
    days,
    createdAt: new Date().toISOString(),
  };

  return { exam, plan };
}
