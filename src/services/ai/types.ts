import type { KnowledgeLevel, LearningPath } from '../../types';

export interface GeneratePathInput {
  topic: string;
  level: KnowledgeLevel;
  goal?: string; // e.g. "10 gün sonra sınav", "mülakat hazırlığı", "genel öğrenme"
  dailyMinutes?: number;
  sourceDocumentName?: string;
}

export interface GenerateLessonInput {
  pathTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  topicKey: string;
  level: KnowledgeLevel;
}

export interface GenerateQuizInput {
  topicKey: string;
  topicName: string;
  lessonTitle: string;
  questionCount?: number;
}

export interface EvaluateTeachBackInput {
  topicKey: string;
  topicName: string;
  userExplanation: string;
  expectedKeyConcepts?: string[];
}

export interface AnalyzeSourceInput {
  fileName: string;
  textSnippet: string;
  academicLevel?: string;
}

export interface SourceAnalysisResult {
  fileName: string;
  summary: string;
  extractedTopics: string[];
  keyDefinitions: { term: string; definition: string }[];
  suggestedLearningPath: Partial<LearningPath>;
}

export interface AIServiceStatus {
  activeProviderName: string;
  isLiveApi: boolean;
  model: string;
}
