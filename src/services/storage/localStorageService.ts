import type {
  Achievement,
  AppSettings,
  DailyActivity,
  Exam,
  LearningPath,
  Quiz,
  QuizAttempt,
  ResourceDocument,
  ReviewItem,
  StudyDay,
  StudyPlan,
  StudyTask,
  TopicMastery,
  UserProfile,
} from '../../types';
import {
  INITIAL_ACHIEVEMENTS,
  INITIAL_DAILY_ACTIVITY,
  INITIAL_EXAM,
  INITIAL_PYTHON_OOP_PATH,
  INITIAL_QUIZZES,
  INITIAL_RESOURCES,
  INITIAL_REVIEWS,
  INITIAL_STUDY_PLAN,
  INITIAL_TOPIC_MASTERIES,
  INITIAL_USER_PROFILE,
} from './seedData';

const STORAGE_KEYS = {
  PROFILE: 'pusula_user_profile',
  PATHS: 'pusula_learning_paths',
  ACTIVE_PATH_ID: 'pusula_active_path_id',
  TOPIC_MASTERIES: 'pusula_topic_masteries',
  EXAM: 'pusula_active_exam',
  STUDY_PLAN: 'pusula_study_plan',
  REVIEWS: 'pusula_review_items',
  RESOURCES: 'pusula_resources',
  QUIZZES: 'pusula_quizzes',
  QUIZ_ATTEMPTS: 'pusula_quiz_attempts',
  ACHIEVEMENTS: 'pusula_achievements',
  DAILY_ACTIVITY: 'pusula_daily_activity',
  SETTINGS: 'pusula_app_settings',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key "${key}" from localStorage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key "${key}" to localStorage:`, err);
  }
}

export const StorageService = {
  // --- Profile ---
  getProfile(): UserProfile {
    return loadFromStorage(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE);
  },
  saveProfile(profile: UserProfile): void {
    saveToStorage(STORAGE_KEYS.PROFILE, profile);
  },
  addXpAndProgress(xpAmount: number): { profile: UserProfile; leveledUp: boolean } {
    const profile = this.getProfile();
    const oldLevel = profile.level;
    const newXp = profile.xp + xpAmount;
    const newLevel = Math.floor(newXp / 400) + 1;
    const updated: UserProfile = {
      ...profile,
      xp: newXp,
      level: newLevel,
    };
    this.saveProfile(updated);
    return { profile: updated, leveledUp: newLevel > oldLevel };
  },

  // --- Learning Paths ---
  getPaths(): LearningPath[] {
    return loadFromStorage(STORAGE_KEYS.PATHS, [INITIAL_PYTHON_OOP_PATH]);
  },
  savePaths(paths: LearningPath[]): void {
    saveToStorage(STORAGE_KEYS.PATHS, paths);
  },
  getActivePathId(): string {
    return loadFromStorage(STORAGE_KEYS.ACTIVE_PATH_ID, INITIAL_PYTHON_OOP_PATH.id);
  },
  setActivePathId(id: string): void {
    saveToStorage(STORAGE_KEYS.ACTIVE_PATH_ID, id);
  },
  getPathById(id: string): LearningPath | undefined {
    const paths = this.getPaths();
    return paths.find((p) => p.id === id);
  },
  addPath(path: LearningPath): void {
    const paths = this.getPaths();
    const existingIndex = paths.findIndex((p) => p.id === path.id);
    if (existingIndex >= 0) {
      paths[existingIndex] = path;
    } else {
      paths.unshift(path);
    }
    this.savePaths(paths);
    this.setActivePathId(path.id);
  },
  completeLesson(pathId: string, lessonId: string): void {
    const paths = this.getPaths();
    const path = paths.find((p) => p.id === pathId);
    if (!path) return;

    let found = false;
    let nextUnlocked = false;

    for (const mod of path.modules) {
      for (let i = 0; i < mod.lessons.length; i++) {
        const l = mod.lessons[i];
        if (l.id === lessonId) {
          l.isCompleted = true;
          found = true;
          // unlock next lesson if in same module
          if (i + 1 < mod.lessons.length) {
            mod.lessons[i + 1].isLocked = false;
            nextUnlocked = true;
          }
        } else if (found && !nextUnlocked && l.isLocked) {
          l.isLocked = false;
          nextUnlocked = true;
        }
      }
    }

    // calculate total completed and progress
    let total = 0;
    let completed = 0;
    for (const mod of path.modules) {
      for (const l of mod.lessons) {
        total++;
        if (l.isCompleted) completed++;
      }
    }

    path.completedLessons = completed;
    path.totalLessons = total;
    path.progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    path.updatedAt = new Date().toISOString();

    this.savePaths(paths);
  },

  // --- Topic Masteries ---
  getTopicMasteries(): TopicMastery[] {
    return loadFromStorage(STORAGE_KEYS.TOPIC_MASTERIES, INITIAL_TOPIC_MASTERIES);
  },
  saveTopicMasteries(masteries: TopicMastery[]): void {
    saveToStorage(STORAGE_KEYS.TOPIC_MASTERIES, masteries);
  },
  updateTopicMastery(
    topicKey: string,
    topicName: string,
    category: string,
    newScore: number,
    weakConceptsToAdd: string[] = []
  ): TopicMastery {
    const list = this.getTopicMasteries();
    let item = list.find((m) => m.topicKey === topicKey);

    let status: TopicMastery['status'] = 'needs_practice';
    if (newScore >= 85) status = 'mastered';
    else if (newScore >= 70) status = 'proficient';
    else if (newScore >= 50) status = 'needs_practice';
    else status = 'critical';

    if (item) {
      item.score = newScore;
      item.status = status;
      item.lastAssessed = new Date().toISOString();
      item.attemptsCount += 1;
      if (weakConceptsToAdd.length > 0) {
        item.weakConcepts = Array.from(new Set([...item.weakConcepts, ...weakConceptsToAdd]));
      }
      if (newScore >= 80) {
        item.weakConcepts = []; // cleared when mastered
      }
    } else {
      item = {
        topicKey,
        topicName,
        category,
        score: newScore,
        status,
        lastAssessed: new Date().toISOString(),
        attemptsCount: 1,
        weakConcepts: weakConceptsToAdd,
        recommendedAction: 'Düzenli tekrar ile pekiştir.',
      };
      list.push(item);
    }

    this.saveTopicMasteries(list);
    return item;
  },

  // --- Exam & Study Plan ---
  getExam(): Exam {
    return loadFromStorage(STORAGE_KEYS.EXAM, INITIAL_EXAM);
  },
  saveExam(exam: Exam): void {
    saveToStorage(STORAGE_KEYS.EXAM, exam);
  },
  getStudyPlan(): StudyPlan {
    return loadFromStorage(STORAGE_KEYS.STUDY_PLAN, INITIAL_STUDY_PLAN);
  },
  saveStudyPlan(plan: StudyPlan): void {
    saveToStorage(STORAGE_KEYS.STUDY_PLAN, plan);
  },
  toggleStudyTask(dayNumber: number, taskId: string): StudyPlan {
    const plan = this.getStudyPlan();
    const day = plan.days.find((d: StudyDay) => d.dayNumber === dayNumber);
    if (day) {
      const task = day.tasks.find((t: StudyTask) => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
      }
      day.isCompleted = day.tasks.every((t: StudyTask) => t.completed);
    }
    this.saveStudyPlan(plan);
    return plan;
  },

  // --- Reviews (Spaced Repetition) ---
  getReviews(): ReviewItem[] {
    return loadFromStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  saveReviews(reviews: ReviewItem[]): void {
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
  },
  addReviewItem(item: ReviewItem): void {
    const list = this.getReviews();
    const existing = list.findIndex((r) => r.id === item.id);
    if (existing >= 0) {
      list[existing] = item;
    } else {
      list.push(item);
    }
    this.saveReviews(list);
  },

  // --- Resources (Kaynaktan Öğren) ---
  getResources(): ResourceDocument[] {
    return loadFromStorage(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  },
  saveResources(resources: ResourceDocument[]): void {
    saveToStorage(STORAGE_KEYS.RESOURCES, resources);
  },
  addResource(resource: ResourceDocument): void {
    const list = this.getResources();
    list.unshift(resource);
    this.saveResources(list);
  },

  // --- Quizzes ---
  getQuizzes(): Record<string, Quiz> {
    return loadFromStorage(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
  },
  getQuizById(id: string): Quiz | undefined {
    const quizzes = this.getQuizzes();
    return quizzes[id];
  },
  saveQuiz(quiz: Quiz): void {
    const quizzes = this.getQuizzes();
    quizzes[quiz.id] = quiz;
    saveToStorage(STORAGE_KEYS.QUIZZES, quizzes);
  },
  getQuizAttempts(): QuizAttempt[] {
    return loadFromStorage(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
  },
  saveQuizAttempt(attempt: QuizAttempt): void {
    const attempts = this.getQuizAttempts();
    attempts.unshift(attempt);
    saveToStorage(STORAGE_KEYS.QUIZ_ATTEMPTS, attempts);
  },

  // --- Achievements & Activity ---
  getAchievements(): Achievement[] {
    return loadFromStorage(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
  },
  saveAchievements(achs: Achievement[]): void {
    saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, achs);
  },
  unlockAchievement(id: string): Achievement | null {
    const achs = this.getAchievements();
    const item = achs.find((a) => a.id === id);
    if (item && !item.unlockedAt) {
      item.unlockedAt = new Date().toISOString();
      item.progress = item.maxProgress;
      this.saveAchievements(achs);
      this.addXpAndProgress(item.xpReward);
      return item;
    }
    return null;
  },
  getDailyActivity(): DailyActivity[] {
    return loadFromStorage(STORAGE_KEYS.DAILY_ACTIVITY, INITIAL_DAILY_ACTIVITY);
  },
  saveDailyActivity(act: DailyActivity[]): void {
    saveToStorage(STORAGE_KEYS.DAILY_ACTIVITY, act);
  },

  // --- App Settings ---
  getSettings(): AppSettings {
    const defaultSettings: AppSettings = {
      theme: 'dark',
      aiProvider: 'demo',
      geminiApiKey: '',
      openaiApiKey: '',
      enableSound: true,
      speechRate: 1.0,
    };
    return loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
  },
  saveSettings(settings: AppSettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  },

  // --- Reset All Data ---
  resetToDefaults(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
