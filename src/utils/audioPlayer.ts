// Audio recitation player for Thirukkural with authentic Tamil pronunciation

type PlaybackListener = (playingId: number | null) => void;

class KuralAudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingId: number | null = null;
  private listeners: Set<PlaybackListener> = new Set();

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.currentPlayingId);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentPlayingId));
  }

  public getPlayingId(): number | null {
    return this.currentPlayingId;
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.removeAttribute('src');
      this.currentAudio.load();
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentPlayingId = null;
    this.notify();
  }

  public async playCouplet(params: {
    id: number;
    tamilLine1: string;
    tamilLine2: string;
    englishLine1?: string;
    englishLine2?: string;
    isEnglish: boolean;
  }): Promise<void> {
    const { id, tamilLine1, tamilLine2, englishLine1, englishLine2, isEnglish } = params;

    // If already playing this couplet, stop it (toggle behavior)
    if (this.currentPlayingId === id) {
      this.stop();
      return;
    }

    // Stop any previously playing audio
    this.stop();

    this.currentPlayingId = id;
    this.notify();

    // Prepare authentic recitation text
    // A small pause between lines gives sacred poetic meter to the recitation
    const textToSpeak = isEnglish
      ? `${englishLine1 || ''}. ${englishLine2 || ''}.`.trim()
      : `${tamilLine1}. ${tamilLine2}.`.trim();

    const lang = isEnglish ? 'en' : 'ta';

    try {
      // 1. Primary: Use high-fidelity native pronunciation stream
      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${lang}`;
      const audio = new Audio(audioUrl);
      // Pacing at 0.9 preserves clear articulation of Tamil mei, uyir, and uyirmei syllables
      audio.playbackRate = 0.9;
      this.currentAudio = audio;

      audio.onended = () => {
        if (this.currentPlayingId === id) {
          this.currentPlayingId = null;
          this.currentAudio = null;
          this.notify();
        }
      };

      audio.onerror = () => {
        console.warn('TTS streaming failed, falling back to Web Speech API');
        this.fallbackWebSpeech(id, textToSpeak, isEnglish);
      };

      await audio.play();
    } catch (err) {
      console.warn('Audio play failed, falling back to Web Speech API:', err);
      this.fallbackWebSpeech(id, textToSpeak, isEnglish);
    }
  }

  private fallbackWebSpeech(id: number, text: string, isEnglish: boolean) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.stop();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isEnglish ? 'en-US' : 'ta-IN';
      utterance.rate = 0.85;

      const voices = window.speechSynthesis.getVoices();
      if (isEnglish) {
        const enVoice = voices.find((v) => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      } else {
        const tamilVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('ta') ||
            v.lang.toLowerCase().replace('_', '-').includes('ta-in') ||
            v.name.toLowerCase().includes('tamil')
        );
        if (tamilVoice) utterance.voice = tamilVoice;
      }

      utterance.onend = () => {
        if (this.currentPlayingId === id) {
          this.currentPlayingId = null;
          this.notify();
        }
      };

      utterance.onerror = () => {
        if (this.currentPlayingId === id) {
          this.currentPlayingId = null;
          this.notify();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.stop();
    }
  }
}

export const kuralAudio = new KuralAudioPlayer();
