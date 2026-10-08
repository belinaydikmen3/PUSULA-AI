import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import { ttsService, type TTSState } from '../../services/audio/ttsService';

interface AudioPlayerWidgetProps {
  text: string;
  title?: string;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  text,
  title = 'Mikro Dersi Sesli Dinle',
}) => {
  const [ttsState, setTtsState] = useState<TTSState>(ttsService.getState());
  const [rate, setRate] = useState<number>(1.0);

  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state) => {
      setTtsState(state);
    });
    return () => {
      ttsService.stop();
      unsubscribe();
    };
  }, []);

  const handleTogglePlay = () => {
    if (ttsState.isPlaying) {
      if (ttsState.isPaused) {
        ttsService.resume();
      } else {
        ttsService.pause();
      }
    } else {
      ttsService.speak(text, rate);
    }
  };

  const handleStop = () => {
    ttsService.stop();
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (ttsState.isPlaying) {
      ttsService.stop();
      ttsService.speak(text, newRate);
    }
  };

  if (!ttsState.supported) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: ttsState.isPlaying ? 'var(--primary-subtle)' : 'var(--bg-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: ttsState.isPlaying ? 'var(--primary)' : 'var(--text-muted)',
          }}
        >
          {ttsState.isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {ttsState.isPlaying
              ? ttsState.isPaused
                ? 'Duraklatıldı'
                : 'Sesli Anlatım Oynatılıyor...'
              : 'Yapay zeka seslendirmesi ile öğren'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Speed toggle */}
        <div style={{ display: 'flex', gap: 4, marginRight: 6 }}>
          {[0.8, 1.0, 1.2].map((r) => (
            <button
              key={r}
              onClick={() => handleRateChange(r)}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '3px 7px',
                fontSize: 11,
                fontWeight: rate === r ? 700 : 400,
                color: rate === r ? 'var(--primary)' : 'var(--text-secondary)',
                borderColor: rate === r ? 'var(--primary)' : undefined,
              }}
            >
              {r}x
            </button>
          ))}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="btn btn-primary btn-sm"
          style={{ gap: 6 }}
        >
          {ttsState.isPlaying && !ttsState.isPaused ? (
            <>
              <Pause size={14} />
              <span>Duraklat</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>{ttsState.isPaused ? 'Devam Et' : 'Dinle'}</span>
            </>
          )}
        </button>

        {ttsState.isPlaying && (
          <button
            onClick={handleStop}
            className="btn btn-secondary btn-sm"
            title="Durdur"
            style={{ padding: '6px' }}
          >
            <Square size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
