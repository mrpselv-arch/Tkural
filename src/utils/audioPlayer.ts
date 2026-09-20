// Audio recitation player for Thirukkural with authentic Tamil pronunciation and offline caching

import { getCachedAudio, saveAudioToCache, isAudioCached, getAllCachedIds } from './audioCache';

type PlaybackListener = (playingId: number | null) => void;
type CacheListener = () => void;

class KuralAudioPlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingId: number | null = null;
  private listeners: Set<PlaybackListener> = new Set();
  private cacheListeners: Set<CacheListener> = new Set();
  private cachedIds: Set<number> = new Set();

  constructor() {
    this.refreshCachedIds();
  }

  public async refreshCachedIds() {
    try {
      this.cachedIds = await getAllCachedIds('ta');
      this.notifyCacheChanged();
    } catch {
      // ignore
    }
  }

  public isCached(id: number): boolean {
    return this.cachedIds.has(id);
  }

  public subscribeCache(listener: CacheListener): () => void {
    this.cacheListeners.add(listener);
    return () => {
      this.cacheListeners.delete(listener);
    };
  }

  private notifyCacheChanged() {
    this.cacheListeners.forEach((l) => l());
  }

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
      // Step 1: Check offline IndexedDB cache first (Works 100% offline without internet!)
      const cachedBlob = await getCachedAudio(id, lang);
      if (cachedBlob) {
        const objectUrl = URL.createObjectURL(cachedBlob);
        const audio = new Audio(objectUrl);
        audio.playbackRate = 0.9;
        this.currentAudio = audio;

        audio.onended = () => {
          URL.revokeObjectURL(objectUrl);
          if (this.currentPlayingId === id) {
            this.currentPlayingId = null;
            this.currentAudio = null;
            this.notify();
          }
        };

        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          this.fallbackWebSpeech(id, textToSpeak, isEnglish);
        };

        await audio.play();
        return;
      }

      // Step 2: If not in cache and online, fetch from backend and cache permanently
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Device is offline and audio wasn't cached beforehand -> use local device speech
        this.fallbackWebSpeech(id, textToSpeak, isEnglish);
        return;
      }

      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${lang}`;
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`TTS server responded with ${response.status}`);
      }

      const blob = await response.blob();
      // Store in IndexedDB for future 100% offline playback
      await saveAudioToCache(id, lang, blob);
      this.cachedIds.add(id);
      this.notifyCacheChanged();

      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      audio.playbackRate = 0.9;
      this.currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        if (this.currentPlayingId === id) {
          this.currentPlayingId = null;
          this.currentAudio = null;
          this.notify();
        }
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        this.fallbackWebSpeech(id, textToSpeak, isEnglish);
      };

      await audio.play();
    } catch (err) {
      console.warn('Audio stream or cache failed, falling back to Web Speech API:', err);
      this.fallbackWebSpeech(id, textToSpeak, isEnglish);
    }
  }

  // Pre-cache couplet audio for offline use
  public async prefetchCoupletAudio(id: number, tamilLine1: string, tamilLine2: string): Promise<boolean> {
    try {
      const alreadyCached = await isAudioCached(id, 'ta');
      if (alreadyCached) {
        this.cachedIds.add(id);
        return true;
      }
      const textToSpeak = `${tamilLine1}. ${tamilLine2}.`.trim();
      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ta`;
      const res = await fetch(audioUrl);
      if (!res.ok) return false;
      const blob = await res.blob();
      await saveAudioToCache(id, 'ta', blob);
      this.cachedIds.add(id);
      this.notifyCacheChanged();
      return true;
    } catch {
      return false;
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
