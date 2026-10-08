// PUSULA AI - Domain Type Definitions

export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  university: string;
  department: string;
  year: number; // e.g. 3rd year
  targetStudyMinutesPerDay: number;
  streakDays: number;
  xp: number;
  level: number;
  createdAt: string;
}

export interface LessonPracticeTask {
  task: string;
  hint: string;
  solution: string;
}

export interface CheckpointQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export interface LessonContent {
  introduction: string; // 1. Konuya giriş & Kanca
  simpleExplanation: string; // 2. Basit açıklama (Sade & Anlaşılır)
  realWorldAnalogy: string; // 3. Gerçek hayat analojisi
  codeExample?: {
    language: string;
    code: string;
    notes: string;
  }; // 4. Teknik & Kod örneği
  checkpoint: CheckpointQuestion; // 5. Mini soru / Checkpoint
  practiceTask: LessonPracticeTask; // 6. Uygulama & Görev
  teachBackPrompt: string; // 7. "Kendin anlat" (Teach-Back tetikleyici)
  takeaways: string[]; // 8. Sonuç & Akılda kalması gerekenler
  audioSummary: string; // TTS sesli dinleme özeti
}

export interface Lesson {
  id: string;
  moduleId: string;
  pathId: string;
  topicKey: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  isCompleted: boolean;
  isLocked: boolean;
  content: LessonContent;
  quizId?: string;
}

export interface Module {
  id: string;
  pathId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  level: KnowledgeLevel;
  estimatedDays: number;
  dailyMinutes: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  sourceDocumentName?: string;
  isCustom?: boolean;
  modules: Module[];
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'code-completion' | 'ordering';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string | number | boolean | string[]; // depending on type
  explanation: string;
  whyCorrect: string;
  commonPitfall: string;
  topicKey: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  lessonId: string;
  pathId: string;
  topicKey: string;
  title: string;
  questions: Question[];
}

export interface QuestionAttemptResult {
  questionId: string;
  userAnswer: string | number | boolean | string[];
  isCorrect: boolean;
  explanation: string;
  whyCorrect: string;
  commonPitfall: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  pathId: string;
  lessonId: string;
  topicKey: string;
  score: number; // 0-100
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  answers: QuestionAttemptResult[];
  adaptiveFeedback: string;
  recommendedAction: 'continue' | 'practice_more' | 'reteach_and_review';
  completedAt: string;
}

export type MasteryStatus = 'mastered' | 'proficient' | 'needs_practice' | 'critical';

export interface TopicMastery {
  topicKey: string;
  topicName: string;
  category: string;
  score: number; // 0-100
  status: MasteryStatus;
  lastAssessed: string;
  attemptsCount: number;
  weakConcepts: string[];
  recommendedAction: string;
}

export type ExamType = 'Vize' | 'Final' | 'Bütünleme' | 'Kısa Sınav';

export interface Exam {
  id: string;
  courseName: string;
  courseCode: string;
  universityName: string;
  examDate: string; // ISO date string
  daysLeft: number;
  examType: ExamType;
  targetGrade: number;
  currentReadiness: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  topics: string[];
  riskyTopics: string[];
  studyPlanId: string;
}

export interface StudyTask {
  id: string;
  description: string;
  durationMin: number;
  completed: boolean;
  type: 'learn' | 'practice' | 'quiz' | 'review' | 'mock_exam';
  topicKey?: string;
}

export interface StudyDay {
  dayNumber: number;
  dateStr: string;
  title: string;
  focusTopic: string;
  isWeakAreaFocus?: boolean;
  tasks: StudyTask[];
  isCompleted: boolean;
}

export interface StudyPlan {
  id: string;
  examId: string;
  courseName: string;
  totalDays: number;
  dailyMinutes: number;
  days: StudyDay[];
  createdAt: string;
}

export interface ResourceDocument {
  id: string;
  name: string;
  fileSize: string;
  uploadDate: string;
  extractedTopics: string[];
  summary: string;
  generatedPathId?: string;
  citationLabel: string;
  contentSnippet: string;
}

export interface TeachBackFeedback {
  topicKey: string;
  topicName: string;
  userExplanation: string;
  overallScore: number; // 0-100
  accuracyScore: number;
  clarityScore: number;
  completenessScore: number;
  missingConcepts: string[];
  misconceptions: string[];
  positiveFeedback: string;
  actionableImprovement: string;
  suggestedNextStep: string;
  evaluatedAt: string;
}

export interface ReviewItem {
  id: string;
  topicKey: string;
  topicName: string;
  category: string;
  question: string;
  answer: string;
  codeSnippet?: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string; // ISO string
  lastScore: number;
  isDue: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  xpReward: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  minutesSpent: number;
  lessonsCompleted: number;
  quizzesTaken: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  aiProvider: 'demo' | 'gemini' | 'openai';
  geminiApiKey: string;
  openaiApiKey: string;
  enableSound: boolean;
  speechRate: number; // 0.8 - 1.2
}
