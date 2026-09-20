// Everyday notification manager for Thirukkural daily couplet

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

  constructor() {
    this.loadSettings();
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
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

  public startScheduler(getCurrentDailyCouplet: () => { couplet: Couplet; chapter: Chapter } | null, languageMode: LanguageMode = 'ta') {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Check once per minute
    this.intervalId = window.setInterval(() => {
      this.checkAndTriggerDailyNotification(getCurrentDailyCouplet, languageMode);
    }, 60000);

    // Also check once immediately on start
    this.checkAndTriggerDailyNotification(getCurrentDailyCouplet, languageMode);
  }

  public stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private checkAndTriggerDailyNotification(
    getCurrentDailyCouplet: () => { couplet: Couplet; chapter: Chapter } | null,
    languageMode: LanguageMode
  ) {
    if (!this.settings.enabled) return;
    if (this.getPermission() !== 'granted') return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const todayDateStr = now.toISOString().split('T')[0];

    // Check if scheduled time has arrived and we haven't notified today
    if (currentTimeStr === this.settings.time && this.settings.lastNotifiedDate !== todayDateStr) {
      const data = getCurrentDailyCouplet();
      if (data) {
        this.showNotification(data.couplet, data.chapter, languageMode);
        this.saveSettings({ lastNotifiedDate: todayDateStr });
      }
    }
  }

  public showNotification(couplet: Couplet, chapter: Chapter, languageMode: LanguageMode = 'ta'): boolean {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return false;
    }

    try {
      const isEnglish = languageMode === 'en';
      const title = isEnglish
        ? `Thirukkural #${couplet.id} • ${chapter.nameEnglish}`
        : `இன்றைய குறள் #${couplet.id} • ${chapter.nameTamil}`;

      const body = isEnglish
        ? `${couplet.englishLine1}\n${couplet.englishLine2}`
        : `${couplet.line1}\n${couplet.line2}`;

      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `daily-kural-${couplet.id}`,
      });

      notification.onclick = () => {
        window.focus();
        if (this.onNotificationClickCallback) {
          this.onNotificationClickCallback();
        }
        notification.close();
      };

      return true;
    } catch (err) {
      console.error('Failed to show notification:', err);
      return false;
    }
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
