import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { StorageService } from '../services/storage/localStorageService';
import { calculateNextReview, getDueReviews } from '../services/adaptive/spacedRepetition';
import type { ReviewItem } from '../types';

export const ReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(StorageService.getReviews());
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'due' | 'all'>('due');

  const dueItems = getDueReviews(reviews);
  const currentList = activeTab === 'due' ? dueItems : reviews;
  const currentCard = currentList[activeCardIndex];

  const handleRateCard = (performanceScore: number) => {
    if (!currentCard) return;

    // SM-2 calculation
    const updated = calculateNextReview(currentCard, performanceScore);
    const updatedItem: ReviewItem = {
      ...currentCard,
      ...updated,
      lastScore: performanceScore,
      isDue: false,
    };

    StorageService.addReviewItem(updatedItem);
    StorageService.addXpAndProgress(25);

    // Refresh state
    const all = StorageService.getReviews();
    setReviews(all);
    setIsAnswerRevealed(false);

    if (activeCardIndex + 1 < currentList.length) {
      setActiveCardIndex(activeCardIndex + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleResetSession = () => {
    setActiveCardIndex(0);
    setIsAnswerRevealed(false);
    setSessionCompleted(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="badge badge-amber">
            <RotateCcw size={12} />
            Spaced Repetition (Aralıklı Tekrar)
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          Akıllı Tekrar & Kalıcı Hafıza
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Ebbinghaus unutma eğrisini sıfırlayan akıllı tekrar algoritması. Performansına göre sonraki tekrar tarihi otomatik ayarlanır.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => { setActiveTab('due'); handleResetSession(); }}
          className={`btn ${activeTab === 'due' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span>Bugün Tekrar Et ({dueItems.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('all'); handleResetSession(); }}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span>Tüm Tekrar Kartları ({reviews.length})</span>
        </button>
      </div>

      {/* Main Review Session Area */}
      {sessionCompleted || currentList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 24px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'var(--success-subtle)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            {activeTab === 'due' ? 'Günün Tekrarları Tamamlandı!' : 'Tüm Kartları İnceledin!'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 20px' }}>
            Zihnin bilgileri pekiştirdi. Bir sonraki tekrar zamanında bildirim alacaksın.
          </p>
          <button onClick={handleResetSession} className="btn btn-secondary btn-sm">
            <span>Tekrar Başlat</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 740, margin: '0 auto', width: '100%' }}>
          {/* Progress Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
            <span>Kart {activeCardIndex + 1} / {currentList.length}</span>
            <span>Aralık: {currentCard.intervalDays} Gün • Tekrar Sayısı: {currentCard.repetitions}</span>
          </div>

          {/* Flashcard Card */}
          <div
            className="card"
            style={{
              padding: '36px 30px',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid var(--border-active)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="badge badge-purple">{currentCard.category}</span>
                <span className="badge badge-blue">{currentCard.topicName}</span>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                SORU / KAVRAM:
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {currentCard.question}
              </h2>

              {/* Revealed Answer */}
              {isAnswerRevealed && (
                <div
                  className="animate-fade-in"
                  style={{
                    marginTop: 24,
                    padding: '18px',
                    backgroundColor: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--primary)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                    CEVAP & KİLİT NOKTA:
                  </div>
                  <p style={{ fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {currentCard.answer}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ marginTop: 28 }}>
              {!isAnswerRevealed ? (
                <button
                  onClick={() => setIsAnswerRevealed(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 46 }}
                >
                  <Eye size={16} />
                  <span>Cevabı Göster</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Bu kavramı ne kadar iyi hatırladın?
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => handleRateCard(40)}
                      className="btn btn-secondary"
                      style={{ borderColor: 'var(--danger)', color: 'var(--danger)', flexDirection: 'column', padding: '10px 6px' }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Zorlandım (Yarın Tekrar)</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>1 Gün</span>
                    </button>
                    <button
                      onClick={() => handleRateCard(75)}
                      className="btn btn-secondary"
                      style={{ borderColor: 'var(--primary)', color: 'var(--primary)', flexDirection: 'column', padding: '10px 6px' }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 13 }}>İyi Hatırladım</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>3-7 Gün</span>
                    </button>
                    <button
                      onClick={() => handleRateCard(95)}
                      className="btn btn-secondary"
                      style={{ borderColor: 'var(--success)', color: 'var(--success)', flexDirection: 'column', padding: '10px 6px' }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Çok Kolay (Uzmanım)</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>Genişletilmiş Aralık</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Schedule Table */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
          Akıllı Tekrar Takvimi
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reviews.map((r) => {
            const dateObj = new Date(r.nextReviewDate);
            const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.topicName}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>({r.category})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Aralık: {r.intervalDays} gün</span>
                  <span className={r.isDue ? 'badge badge-amber' : 'badge badge-blue'} style={{ fontSize: 11 }}>
                    {r.isDue ? 'Bugün Tekrar' : dateStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
