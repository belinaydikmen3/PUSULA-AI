import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  MessageSquareShare,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import { AIService } from '../services/ai/AIService';
import { assessScore, calculateUpdatedKnowledgeScore } from '../services/adaptive/adaptiveEngine';
import { fireConfetti } from '../components/common/Confetti';
import { ProgressBar } from '../components/common/ProgressBar';
import type { QuestionAttemptResult, Quiz, QuizAttempt } from '../types';

export const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const pathId = queryParams.get('pathId') || 'path-python-oop';
  const lessonId = queryParams.get('lessonId') || 'les-5';
  const topicKey = queryParams.get('topicKey') || 'polymorphism';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [results, setResults] = useState<QuestionAttemptResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      setIsLoading(true);
      // Try from local storage first
      const storedQuiz = StorageService.getQuizById(id || 'quiz-5');
      if (storedQuiz) {
        setQuiz(storedQuiz);
        setIsLoading(false);
        return;
      }

      // Generate dynamically via AIService if not found
      try {
        const generated = await AIService.generateQuiz(
          {
            topicKey,
            topicName: topicKey,
            lessonTitle: 'Adaptif Değerlendirme',
            questionCount: 4,
          },
          lessonId,
          pathId
        );
        StorageService.saveQuiz(generated);
        setQuiz(generated);
      } catch (err) {
        console.error('Quiz yüklenemedi:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuiz();
  }, [id, lessonId, pathId, topicKey]);

  if (isLoading || !quiz) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <Sparkles size={28} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 12px' }} />
        <h3>Adaptif Quiz Hazırlanıyor...</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Performans seviyene uygun sorular derleniyor.
        </p>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const currentAnswer = selectedAnswers[currentIndex];

  const handleSelectOption = (val: any) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: val });
  };

  const handleConfirmAnswer = () => {
    if (currentAnswer === undefined || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = Number(currentAnswer) === Number(currentQ.correctAnswer);
    const attemptResult: QuestionAttemptResult = {
      questionId: currentQ.id,
      userAnswer: currentAnswer,
      isCorrect,
      explanation: currentQ.explanation,
      whyCorrect: currentQ.whyCorrect,
      commonPitfall: currentQ.commonPitfall,
    };

    setResults([...results, attemptResult]);
  };

  const handleNextQuestion = () => {
    setIsAnswerSubmitted(false);
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);

    // Calculate score
    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    const assessment = assessScore(score);

    // Update Knowledge score for topic
    const currentMasteries = StorageService.getTopicMasteries();
    const existing = currentMasteries.find((m) => m.topicKey === topicKey);
    const oldScore = existing?.score ?? 60;
    const newKnowledgeScore = calculateUpdatedKnowledgeScore(oldScore, score, existing?.attemptsCount || 0);

    StorageService.updateTopicMastery(
      topicKey,
      existing?.topicName || topicKey,
      existing?.category || 'Genel Konu',
      newKnowledgeScore
    );

    // Save attempt log
    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      pathId,
      lessonId,
      topicKey,
      score,
      totalQuestions,
      correctCount,
      timeSpentSeconds: 65,
      answers: results,
      adaptiveFeedback: assessment.feedbackText,
      recommendedAction: assessment.recommendedAction,
      completedAt: new Date().toISOString(),
    };
    StorageService.saveQuizAttempt(attempt);

    // Add XP & Celebration
    StorageService.addXpAndProgress(score >= 70 ? 100 : 40);
    if (score >= 70) {
      fireConfetti();
    }

    // If score is low (<70), add or schedule review item automatically
    if (score < 70) {
      StorageService.addReviewItem({
        id: `rev-${topicKey}-${Date.now()}`,
        topicKey,
        topicName: existing?.topicName || topicKey,
        category: existing?.category || 'OOP',
        question: currentQ.prompt,
        answer: currentQ.explanation,
        intervalDays: 1,
        easeFactor: 1.8,
        repetitions: 0,
        nextReviewDate: new Date().toISOString(),
        lastScore: score,
        isDue: true,
      });
    }
  };

  // --- RESULT VIEW ---
  if (isFinished) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const assessment = assessScore(score);

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: score >= 70 ? 'var(--success-subtle)' : 'var(--danger-subtle)',
              color: score >= 70 ? 'var(--success)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {score >= 70 ? <Award size={38} /> : <AlertTriangle size={38} />}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            {score >= 85 ? 'Kusursuz Başarı!' : score >= 70 ? 'Tebrikler, Başarılı!' : 'Ek Alıştırma Öneriliyor'}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '14px 0' }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: assessment.colorTag }}>
              %{score}
            </div>
            <div style={{ textAlign: 'left', fontSize: 13, color: 'var(--text-secondary)' }}>
              <div>{totalQuestions} Sorudan <strong>{correctCount} Doğru</strong></div>
              <div>Kavrayış Düzeyi: <strong style={{ color: assessment.colorTag }}>{assessment.status.toUpperCase()}</strong></div>
            </div>
          </div>

          <p style={{ fontSize: 14.5, color: 'var(--text-primary)', maxWidth: 560, margin: '0 auto 20px', lineHeight: 1.5 }}>
            {assessment.feedbackText}
          </p>

          <div style={{ display: 'inline-flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {assessment.recommendedAction === 'reteach_and_review' && (
              <button
                onClick={() => navigate(`/teach-back?topic=${encodeURIComponent(topicKey)}`)}
                className="btn btn-primary"
              >
                <MessageSquareShare size={15} />
                <span>Teach-Back ile Konuyu Anlat</span>
              </button>
            )}

            <button
              onClick={() => navigate(`/review`)}
              className="btn btn-secondary"
            >
              <RotateCcw size={15} />
              <span>Tekrar Kartlarına Git</span>
            </button>

            <button
              onClick={() => navigate(`/path/${pathId}`)}
              className="btn btn-outline"
            >
              <span>Yol Haritasına Dön</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Question by question feedback breakdown (Section 17) */}
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
            Soru Çözüm Analizi & Nedenleri
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {quiz.questions.map((q, idx) => {
              const res = results[idx];
              const isCorrect = res?.isCorrect;

              return (
                <div
                  key={q.id}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                      Soru {idx + 1} ({q.type})
                    </span>
                    <span className={isCorrect ? 'badge badge-green' : 'badge badge-red'}>
                      {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {isCorrect ? 'Doğru' : 'Yanlış'}
                    </span>
                  </div>

                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {q.prompt}
                  </div>

                  {q.codeSnippet && (
                    <pre style={{ padding: '10px 14px', backgroundColor: '#090d16', borderRadius: 'var(--radius-sm)', color: '#93c5fd', fontFamily: 'var(--font-mono)', fontSize: 12.5, margin: '8px 0' }}>
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  {/* Why Correct & Common Pitfall */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, fontSize: 13 }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--primary)' }}>Açıklama:</strong> {q.explanation}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--success)' }}>Neden Doğru?</strong> {q.whyCorrect}
                    </div>
                    {!isCorrect && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--danger)' }}>Sık Yapılan Hata:</strong> {q.commonPitfall}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE QUESTION VIEW ---
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780, margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(`/lesson/${lessonId}`)}
          className="btn btn-secondary btn-sm"
        >
          <span>Ders Notuna Dön</span>
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          Soru {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      <ProgressBar value={((currentIndex + 1) / totalQuestions) * 100} height={6} />

      {/* Question Card */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
            {currentQ.type.replace('-', ' ')}
          </span>
          <span className="badge badge-blue">
            Zorluk: {currentQ.difficulty}
          </span>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
          {currentQ.prompt}
        </h2>

        {/* Code Snippet if applicable */}
        {currentQ.codeSnippet && (
          <pre
            style={{
              padding: '14px 18px',
              backgroundColor: '#090d16',
              borderRadius: 'var(--radius-md)',
              color: '#93c5fd',
              fontFamily: 'var(--font-mono)',
              fontSize: 13.5,
              lineHeight: 1.5,
              marginBottom: 16,
              overflowX: 'auto',
            }}
          >
            <code>{currentQ.codeSnippet}</code>
          </pre>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {(currentQ.options || []).map((opt, oIdx) => {
            const isSelected = currentAnswer === oIdx;
            const isCorrect = oIdx === Number(currentQ.correctAnswer);

            let bg = 'var(--bg-input)';
            let border = 'var(--border-subtle)';

            if (isAnswerSubmitted) {
              if (isCorrect) {
                bg = 'var(--success-subtle)';
                border = 'var(--success)';
              } else if (isSelected) {
                bg = 'var(--danger-subtle)';
                border = 'var(--danger)';
              }
            } else if (isSelected) {
              bg = 'var(--primary-subtle)';
              border = 'var(--primary)';
            }

            return (
              <button
                key={oIdx}
                type="button"
                onClick={() => handleSelectOption(oIdx)}
                disabled={isAnswerSubmitted}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  textAlign: 'left',
                  cursor: isAnswerSubmitted ? 'default' : 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-muted)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {String.fromCharCode(65 + oIdx)}
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback on submission */}
        {isAnswerSubmitted && (
          <div
            style={{
              marginTop: 20,
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: Number(currentAnswer) === Number(currentQ.correctAnswer) ? 'var(--success-subtle)' : 'var(--danger-subtle)',
              border: `1px solid ${Number(currentAnswer) === Number(currentQ.correctAnswer) ? 'var(--success)' : 'var(--danger)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 6, color: Number(currentAnswer) === Number(currentQ.correctAnswer) ? 'var(--success)' : 'var(--danger)' }}>
              {Number(currentAnswer) === Number(currentQ.correctAnswer) ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Doğru Cevap! Harika çıkarım.</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>Yanlış Cevap.</span>
                </>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          {!isAnswerSubmitted ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={currentAnswer === undefined}
              className="btn btn-primary"
            >
              <span>Cevabı Gönder</span>
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
            >
              <span>{currentIndex + 1 < totalQuestions ? 'Sonraki Soru' : 'Sonucu Gör'}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
