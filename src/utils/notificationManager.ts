// Everyday notification manager for Thirukkural daily couplet with Service Worker & Catch-up delivery

import { Couplet, Chapter, LanguageMode } from '../types';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" 24hr format, e.g. "08:00"
  lastNotifiedDate: string; // "YYYY-MM-DD"
}

const STORAGE_KEY = 'kural_daily_notification_settings';

export class NotificationManager {
  private settings: NotificationSettings = {
    enabled: false,
    time: '08:00',
    lastNotifiedDate: '',
  };

  private intervalId: number | null = null;
  private onNotificationClickCallback: (() => void) | null = null;
  private visibilityListenerAttached = false;
  private currentCoupletGetter: (() => { couplet: Couplet; chapter: Chapter } | null) | null = null;
  private currentLanguageMode: LanguageMode = 'ta';

  constructor() {
    this.loadSettings();
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      ('Notification' in window || ('serviceWorker' in navigator && 'ServiceWorkerRegistration' in window))
    );
  }

  public getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.registerPeriodicSync();
      }
      return permission;
    } catch {
      return 'denied';
    }
  }

  public async registerPeriodicSync() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        // Periodic Background Sync is supported on Chromium/Android PWAs
        if ('periodicSync' in reg) {
          // @ts-ignore
          const tags = await reg.periodicSync.getTags();
          if (!tags.includes('daily-kural-sync')) {
            // @ts-ignore
            await reg.periodicSync.register('daily-kural-sync', {
              minInterval: 12 * 60 * 60 * 1000, // 12 hours
            });
          }
        }
      } catch (err) {
        // Periodic sync may require installed PWA or may be denied by OS battery saver
        console.debug('Periodic sync registration note:', err);
      }
    }
  }

  public saveSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch (e) {
        console.error('Failed to save notification settings:', e);
      }
    }
    if (this.settings.enabled && this.getPermission() === 'granted') {
      this.registerPeriodicSync();
      // Check immediately if we need to deliver today's morning couplet
      if (this.currentCoupletGetter) {
        this.checkAndTriggerDailyNotification();
      }
    }
  }

  private loadSettings() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.settings = {
            enabled: Boolean(parsed.enabled),
            time: parsed.time || '08:00',
            lastNotifiedDate: parsed.lastNotifiedDate || '',
          };
        }
      } catch {
        // use defaults
      }
    }
  }

  public setOnClickCallback(cb: () => void) {
    this.onNotificationClickCallback = cb;
  }

  public startScheduler(
    getCurrentDailyCouplet: () => { couplet: Couplet; chapter: Chapter } | null,
    languageMode: LanguageMode = 'ta'
  ) {
    this.currentCoupletGetter = getCurrentDailyCouplet;
    this.currentLanguageMode = languageMode;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Check once per minute while page is active
    this.intervalId = window.setInterval(() => {
      this.checkAndTriggerDailyNotification();
    }, 60000);

    // Attach visibility & focus listeners once so whenever the user unlocks their phone or
    // opens/resumes the app in the morning, we immediately catch up and push if not yet delivered
    if (!this.visibilityListenerAttached && typeof window !== 'undefined') {
      const handleWakeOrFocus = () => {
        if (document.visibilityState === 'visible') {
          this.checkAndTriggerDailyNotification();
        }
      };
      window.addEventListener('visibilitychange', handleWakeOrFocus);
      window.addEventListener('focus', handleWakeOrFocus);
      this.visibilityListenerAttached = true;
    }

    // Check immediately on startup/mount
    this.checkAndTriggerDailyNotification();
  }

  public stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Evaluates if today's morning notification should be pushed.
   * FIX: Uses minutes-since-midnight comparison rather than strict string equality (currentTime === scheduledTime).
   * This guarantees that even if the tab was suspended, screen was off at 8:00 AM, or the user opens their phone
   * at 8:15 AM, today's notification will never be skipped!
   */
  public async checkAndTriggerDailyNotification(): Promise<boolean> {
    if (!this.settings.enabled) return false;
    if (this.getPermission() !== 'granted') return false;
    if (!this.currentCoupletGetter) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [schedHours, schedMinutes] = (this.settings.time || '08:00').split(':').map(Number);
    const scheduledMinutes = (isNaN(schedHours) ? 8 : schedHours) * 60 + (isNaN(schedMinutes) ? 0 : schedMinutes);

    // Format local date YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDateStr = `${year}-${month}-${day}`;

    // Has the scheduled time arrived (or passed) today, and haven't we notified yet today?
    if (currentMinutes >= scheduledMinutes && this.settings.lastNotifiedDate !== todayDateStr) {
      const data = this.currentCoupletGetter();
      if (data) {
        const success = await this.showNotification(data.couplet, data.chapter, this.currentLanguageMode);
        if (success) {
          this.saveSettings({ lastNotifiedDate: todayDateStr });
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Reliable Notification delivery:
   * Uses ServiceWorkerRegistration.showNotification first (Android & modern PWA compliant, prevents Illegal Constructor error),
   * with fallback to window.Notification on desktop browsers.
   */
  public async showNotification(couplet: Couplet, chapter: Chapter, languageMode: LanguageMode = 'ta'): Promise<boolean> {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return false;
    }

    const isEnglish = languageMode === 'en';
    const title = isEnglish
      ? `Thirukkural #${couplet.id} • ${chapter.nameEnglish}`
      : `இன்றைய திருக்குறள் #${couplet.id} • ${chapter.nameTamil}`;

    const body = isEnglish
      ? `${couplet.englishLine1}\n${couplet.englishLine2}`
      : `${couplet.line1}\n${couplet.line2}`;

    const options: NotificationOptions & Record<string, unknown> = {
      body,
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      tag: `daily-kural-${couplet.id}`,
      renotify: true,
      data: {
        url: '/?tab=daily',
        coupletId: couplet.id,
      },
      vibrate: [200, 100, 200],
    };

    // 1. Try Service Worker showNotification (Mandatory on Android Chrome, best for PWAs)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, options);
          return true;
        }
      } catch (swErr) {
        console.warn('Service worker showNotification note:', swErr);
      }
    }

    // 2. Fallback to standard window Notification (Desktop Safari/Firefox/Chrome)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const notification = new Notification(title, options);
        notification.onclick = () => {
          window.focus();
          if (this.onNotificationClickCallback) {
            this.onNotificationClickCallback();
          }
          notification.close();
        };
        return true;
      } catch (windowErr) {
        console.warn('Window Notification constructor fallback note:', windowErr);
      }
    }

    return false;
  }

  public async testNotification(couplet: Couplet, chapter: Chapter, languageMode: LanguageMode = 'ta'): Promise<boolean> {
    if (!this.isSupported()) return false;
    let perm = this.getPermission();
    if (perm !== 'granted') {
      perm = await this.requestPermission();
    }
    if (perm === 'granted') {
      return this.showNotification(couplet, chapter, languageMode);
    }
    return false;
  }
}

export const notificationManager = new NotificationManager();
