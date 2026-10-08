import type { AIProvider } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { LearningPathGenerator } from './LearningPathGenerator';
import { MockAIProvider } from './MockAIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { QuizGenerator } from './QuizGenerator';
import { SourceAnalyzer } from './SourceAnalyzer';
import { TeachBackEvaluator } from './TeachBackEvaluator';
import type {
  AIServiceStatus,
  AnalyzeSourceInput,
  EvaluateTeachBackInput,
  GeneratePathInput,
  GenerateQuizInput,
  SourceAnalysisResult,
} from './types';
import type { LearningPath, Quiz, TeachBackFeedback } from '../../types';

class AIServiceFacade {
  private activeProvider: AIProvider;
  private readonly providers: Record<string, AIProvider>;

  private pathGenerator: LearningPathGenerator;
  private quizGenerator: QuizGenerator;
  private teachBackEvaluator: TeachBackEvaluator;
  private sourceAnalyzer: SourceAnalyzer;

  constructor() {
    const mock = new MockAIProvider();
    const gemini = new GeminiProvider();
    const openai = new OpenAIProvider();

    this.providers = {
      demo: mock,
      gemini,
      openai,
    };

    // Check stored setting or env
    let initialKey = 'demo';
    try {
      const stored = localStorage.getItem('pusula_app_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.aiProvider && this.providers[parsed.aiProvider]) {
          initialKey = parsed.aiProvider;
        }
      }
    } catch {
      // ignore
    }

    this.activeProvider = this.providers[initialKey] || mock;

    this.pathGenerator = new LearningPathGenerator(this.activeProvider);
    this.quizGenerator = new QuizGenerator(this.activeProvider);
    this.teachBackEvaluator = new TeachBackEvaluator(this.activeProvider);
    this.sourceAnalyzer = new SourceAnalyzer(this.activeProvider);
  }

  public setProvider(providerId: 'demo' | 'gemini' | 'openai'): void {
    if (this.providers[providerId]) {
      this.activeProvider = this.providers[providerId];
      this.reinitGenerators();
    }
  }

  private reinitGenerators(): void {
    this.pathGenerator = new LearningPathGenerator(this.activeProvider);
    this.quizGenerator = new QuizGenerator(this.activeProvider);
    this.teachBackEvaluator = new TeachBackEvaluator(this.activeProvider);
    this.sourceAnalyzer = new SourceAnalyzer(this.activeProvider);
  }

  public getStatus(): AIServiceStatus {
    const isLive = this.activeProvider.isConfigured() && this.activeProvider.id !== 'demo';
    return {
      activeProviderName: this.activeProvider.name,
      isLiveApi: isLive,
      model: this.activeProvider.id === 'gemini' ? 'Gemini 1.5 Flash' : this.activeProvider.id === 'openai' ? 'GPT-4o Mini' : 'PUSULA Yerel Motor',
    };
  }

  public async generateLearningPath(input: GeneratePathInput): Promise<LearningPath> {
    return this.pathGenerator.generate(input);
  }

  public async generateQuiz(input: GenerateQuizInput, lessonId: string, pathId: string): Promise<Quiz> {
    return this.quizGenerator.generate(input, lessonId, pathId);
  }

  public async evaluateTeachBack(input: EvaluateTeachBackInput): Promise<TeachBackFeedback> {
    return this.teachBackEvaluator.evaluate(input);
  }

  public async analyzeSource(input: AnalyzeSourceInput): Promise<SourceAnalysisResult> {
    return this.sourceAnalyzer.analyze(input);
  }

  public getSourceAnalyzer(): SourceAnalyzer {
    return this.sourceAnalyzer;
  }
}

export const AIService = new AIServiceFacade();
