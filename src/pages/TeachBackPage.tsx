import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquareShare,
  Sparkles,
  AlertTriangle,
  Brain,
  ArrowRight,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { AIService } from '../services/ai/AIService';
import { StorageService } from '../services/storage/localStorageService';
import { ProgressBar } from '../components/common/ProgressBar';
import { fireConfetti } from '../components/common/Confetti';
import type { TeachBackFeedback } from '../types';

export const TeachBackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTopicKey = queryParams.get('topic') || 'polymorphism';

  const masteries = StorageService.getTopicMasteries();
  const currentTopic = masteries.find((m) => m.topicKey === initialTopicKey) || masteries[0];

  const [selectedTopicKey, setSelectedTopicKey] = useState<string>(currentTopic?.topicKey || 'polymorphism');
  const [userText, setUserText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<TeachBackFeedback | null>(null);

  // When selected topic changes, reset text & feedback
  const activeMastery = masteries.find((m) => m.topicKey === selectedTopicKey) || masteries[0];

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userText.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await AIService.evaluateTeachBack({
        topicKey: activeMastery.topicKey,
        topicName: activeMastery.topicName,
        userExplanation: userText,
        expectedKeyConcepts: ['Metot ezme (Overriding)', 'Duck Typing', 'Ortak arayüz'],
      });

      setFeedback(result);

      // Update topic mastery score
      const newScore = Math.round((activeMastery.score * 0.4) + (result.overallScore * 0.6));
      StorageService.updateTopicMastery(
        activeMastery.topicKey,
        activeMastery.topicName,
        activeMastery.category,
        newScore,
        result.missingConcepts
      );

      // Award XP
      StorageService.addXpAndProgress(result.overallScore >= 70 ? 120 : 50);

      // Unlock Feynman achievement if score >= 80
      if (result.overallScore >= 80) {
        StorageService.unlockAchievement('ach-3');
        fireConfetti();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleUseSampleText = () => {
    if (selectedTopicKey === 'polymorphism') {
      setUserText(
        'Polymorphism yani çok biçimlilik, farklı nesnelerin aynı isimli metodu çağırabilmesidir. Örneğin Kedi ve Kopek sınıflarının ikisinde de ses() metodu vardır. Ancak Duck Typing konusunu ve üst sınıf ilişkisini henüz tam bağlayamadım.'
      );
    } else {
      setUserText(
        'Bu kavram sistemin parçalarını birbirinden soyutlamak ve tekrar kullanılabilirliği artırmak için uygulanır.'
      );
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="badge badge-purple">
            <MessageSquareShare size={12} />
            Feynman Tekniği / Teach-Back
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          Öğreterek Öğren (Teach-Back Koçu)
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          "Bir şeyi basitçe anlatamıyorsan, onu yeterince iyi anlamamışsındır." Konuyu kendi cümlelerinle AI koçuna anlat; kavram yanılgılarını ve eksik parçalarını anında bulsun.
        </p>
      </div>

      {/* Topic Selector Cards */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>
          ANLATMAK İSTEDİĞİN KONUYU SEÇ:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {masteries.map((m) => {
            const isSelected = m.topicKey === selectedTopicKey;
            return (
              <button
                key={m.topicKey}
                type="button"
                onClick={() => { setSelectedTopicKey(m.topicKey); setFeedback(null); }}
                className={`card ${isSelected ? 'active-level-card' : ''}`}
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--accent-purple)' : 'var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--accent-purple-subtle)' : 'var(--bg-input)',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 700, color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                  {m.topicName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.category}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: m.score < 70 ? 'var(--danger)' : 'var(--success)' }}>
                    %{m.score}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Area Card */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-purple)', fontWeight: 700, fontSize: 14 }}>
            <Brain size={18} />
            <span>AI Koçunun Sorusu: "{activeMastery.topicName} kavramını bana kendi cümlelerinle anlatır mısın?"</span>
          </div>
          <button
            onClick={handleUseSampleText}
            className="btn btn-outline btn-sm"
            style={{ fontSize: 11 }}
          >
            Örnek Taslak Doldur
          </button>
        </div>

        <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <textarea
            className="input-field"
            rows={6}
            placeholder={`Bu konuyu hiç yazılım bilmeyen bir arkadaşına anlatır gibi açıkla. Ne işe yarar? Gerçek hayatta neye benzer? Neden kullanılır?`}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            disabled={isEvaluating}
            style={{ fontSize: 14.5, lineHeight: 1.6 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {userText.trim().split(/\s+/).filter(Boolean).length} Kelime
            </span>

            <button
              type="submit"
              disabled={isEvaluating || !userText.trim()}
              className="btn btn-primary btn-lg"
              style={{ backgroundColor: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>AI Koçu Analiz Ediyor...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Anlatımımı Değerlendir</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Evaluation Feedback Results (Section 9) */}
      {feedback && (
        <div className="animate-fade-in card" style={{ padding: '28px', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: 6 }}>
                Feynman Değerlendirme Raporu
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeMastery.topicName} Analizi
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Feynman Puanı</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-purple)' }}>
                %{feedback.overallScore}
              </div>
            </div>
          </div>

          {/* Metric Bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                <span>Doğruluk (Accuracy)</span>
                <strong>%{feedback.accuracyScore}</strong>
              </div>
              <ProgressBar value={feedback.accuracyScore} color="var(--primary)" height={6} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                <span>Açıklık (Clarity)</span>
                <strong>%{feedback.clarityScore}</strong>
              </div>
              <ProgressBar value={feedback.clarityScore} color="var(--success)" height={6} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                <span>Kapsam (Completeness)</span>
                <strong>%{feedback.completenessScore}</strong>
              </div>
              <ProgressBar value={feedback.completenessScore} color="var(--warning)" height={6} />
            </div>
          </div>

          {/* Missing Concepts Alert (Critical spec: "Bu konuda şu 2 kavramı eksik anlattın") */}
          {feedback.missingConcepts.length > 0 && (
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: 'var(--danger-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                <AlertTriangle size={16} />
                <span>Eksik Kalan Kavramlar ({feedback.missingConcepts.length} kavram eksik):</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {feedback.missingConcepts.map((item, i) => (
                  <span key={i} className="badge badge-red" style={{ fontSize: 12 }}>
                    ⚠️ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Misconceptions if any */}
          {feedback.misconceptions.length > 0 && (
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: 'var(--warning-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <Lightbulb size={16} />
                <span>Kavram Yanılgısı Tespit Edildi:</span>
              </div>
              <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-primary)' }}>
                {feedback.misconceptions.map((mc, i) => (
                  <li key={i}>{mc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Coach Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 20 }}>
            <div>
              <strong style={{ color: 'var(--success)' }}>Güçlü Yönün:</strong> {feedback.positiveFeedback}
            </div>
            <div>
              <strong style={{ color: 'var(--accent-purple)' }}>Eyleme Dönük Tavsiye:</strong> {feedback.actionableImprovement}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => navigate(`/review`)}
              className="btn btn-secondary btn-sm"
            >
              <span>Tekrar Kartlarına Git</span>
            </button>
            <button
              onClick={() => navigate(`/`)}
              className="btn btn-primary btn-sm"
            >
              <span>Dashboard’a Dön</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
