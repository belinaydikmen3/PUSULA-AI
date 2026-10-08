export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  supported: boolean;
}

class TTSService {
  private stateChangeListeners: ((state: TTSState) => void)[] = [];
  private isPlaying = false;
  private isPaused = false;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public subscribe(listener: (state: TTSState) => void): () => void {
    this.stateChangeListeners.push(listener);
    listener(this.getState());
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter((l) => l !== listener);
    };
  }

  public getState(): TTSState {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      supported: this.isSupported(),
    };
  }

  private notify(): void {
    const s = this.getState();
    this.stateChangeListeners.forEach((l) => l(s));
  }

  public speak(text: string, rate: number = 1.0): void {
    if (!this.isSupported()) return;

    this.stop();

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick Turkish voice if available
    const voices = window.speechSynthesis.getVoices();
    const turkishVoice = voices.find((v) => v.lang.startsWith('tr'));
    if (turkishVoice) {
      utterance.voice = turkishVoice;
    }

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.notify();
    };

    utterance.onerror = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.notify();
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause(): void {
    if (!this.isSupported() || !this.isPlaying) return;
    window.speechSynthesis.pause();
    this.isPaused = true;
    this.notify();
  }

  public resume(): void {
    if (!this.isSupported() || !this.isPaused) return;
    window.speechSynthesis.resume();
    this.isPaused = false;
    this.notify();
  }

  public stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.notify();
  }
}

export const ttsService = new TTSService();
