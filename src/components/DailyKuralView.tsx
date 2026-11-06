import React, { useState, useMemo, useEffect } from 'react';
import { Chapter, LanguageMode } from '../types';
import { Sparkles, RefreshCw, Bookmark, Copy, Check, Volume2, VolumeX, BookOpen, Bell, BellRing, Clock, Info, AlertTriangle, CheckCircle2, Send, Smartphone } from 'lucide-react';
import { kuralAudio } from '../utils/audioPlayer';
import { notificationManager, NotificationSettings } from '../utils/notificationManager';

interface DailyKuralViewProps {
  chapters: Chapter[];
  isSaved: (id: number) => boolean;
  onToggleSave: (id: number) => void;
  onGoToChapter: (chapterId: number) => void;
  fontSizeClass: string;
  languageMode?: LanguageMode;
}

export const DailyKuralView: React.FC<DailyKuralViewProps> = ({
  chapters,
  isSaved,
  onToggleSave,
  onGoToChapter,
  fontSizeClass,
  languageMode = 'ta',
}) => {
  const isEnglish = languageMode === 'en';

  const defaultDailyId = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return (dayOfYear % 1330) + 1;
  }, []);

  const [currentKuralId, setCurrentKuralId] = useState<number>(defaultDailyId);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioCached, setIsAudioCached] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    notificationManager.getSettings()
  );
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() =>
    notificationManager.getPermission()
  );
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [showPermissionDeniedNotice, setShowPermissionDeniedNotice] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const isDeliveredToday = notificationSettings.lastNotifiedDate === todayDateStr;

  const currentCoupletData = useMemo(() => {
    for (const ch of chapters) {
      const found = ch.couplets.find((c) => c.id === currentKuralId);
      if (found) {
        return { couplet: found, chapter: ch };
      }
    }
    return null;
  }, [chapters, currentKuralId]);

  useEffect(() => {
    if (!currentCoupletData) return;
    setIsAudioCached(kuralAudio.isCached(currentCoupletData.couplet.id));
    const unsubAudio = kuralAudio.subscribe((playingId) => {
      setIsPlayingAudio(playingId === currentCoupletData.couplet.id);
    });
    const unsubCache = kuralAudio.subscribeCache(() => {
      setIsAudioCached(kuralAudio.isCached(currentCoupletData.couplet.id));
    });
    return () => {
      unsubAudio();
      unsubCache();
    };
  }, [currentCoupletData]);

  const handleRandomKural = () => {
    const randId = Math.floor(Math.random() * 1330) + 1;
    setCurrentKuralId(randId);
    kuralAudio.stop();
  };

  const handleToggleNotifications = async () => {
    const newEnabled = !notificationSettings.enabled;
    if (newEnabled) {
      const perm = await notificationManager.requestPermission();
      setPermissionStatus(perm);
      if (perm !== 'granted') {
        setShowPermissionDeniedNotice(true);
        return;
      }
      setShowPermissionDeniedNotice(false);
    }
    notificationManager.saveSettings({ enabled: newEnabled });
    setNotificationSettings(notificationManager.getSettings());
  };

  const handleTimeChange = (newTime: string) => {
    notificationManager.saveSettings({ time: newTime });
    setNotificationSettings(notificationManager.getSettings());
  };

  const handleSendTestNotification = async () => {
    if (!currentCoupletData) return;
    let perm = notificationManager.getPermission();
    if (perm !== 'granted') {
      perm = await notificationManager.requestPermission();
      setPermissionStatus(perm);
    }
    if (perm !== 'granted') {
      setShowPermissionDeniedNotice(true);
      return;
    }
    setShowPermissionDeniedNotice(false);
    const mode: LanguageMode = (languageMode as LanguageMode) || 'ta';
    const success = await notificationManager.testNotification(
      currentCoupletData.couplet,
      currentCoupletData.chapter,
      mode
    );
    setPermissionStatus(notificationManager.getPermission());
    if (success) {
      setTestNotificationSent(true);
      setPushStatusMessage(isEnglish ? 'Test notification sent to device!' : 'சோதனை அறிவிப்பு சாதனத்திற்கு அனுப்பப்பட்டது!');
      setTimeout(() => {
        setTestNotificationSent(false);
        setPushStatusMessage(null);
      }, 4000);
    }
  };

  const handlePushTodayKuralNow = async () => {
    if (!currentCoupletData) return;
    let perm = notificationManager.getPermission();
    if (perm !== 'granted') {
      perm = await notificationManager.requestPermission();
      setPermissionStatus(perm);
    }
    if (perm !== 'granted') {
      setShowPermissionDeniedNotice(true);
      return;
    }
    setShowPermissionDeniedNotice(false);
    const mode: LanguageMode = (languageMode as LanguageMode) || 'ta';
    const success = await notificationManager.showNotification(
      currentCoupletData.couplet,
      currentCoupletData.chapter,
      mode
    );
    if (success) {
      notificationManager.saveSettings({ lastNotifiedDate: todayDateStr, enabled: true });
      setNotificationSettings(notificationManager.getSettings());
      setTestNotificationSent(true);
      setPushStatusMessage(isEnglish ? "Today's Couplet delivered to device!" : "இன்றைய குறள் சாதனத்திற்கு அனுப்பப்பட்டது!");
      setTimeout(() => {
        setTestNotificationSent(false);
        setPushStatusMessage(null);
      }, 4000);
    }
  };

  const handleResetTodayNotification = () => {
    notificationManager.saveSettings({ lastNotifiedDate: '' });
    setNotificationSettings(notificationManager.getSettings());
    setPushStatusMessage(isEnglish ? 'Scheduled to re-send at morning time' : 'காலை நேரத்தில் மீண்டும் அனுப்ப திட்டமிடப்பட்டது');
    setTimeout(() => setPushStatusMessage(null), 3000);
  };

  const handleSpeech = () => {
    if (!currentCoupletData) return;
    const { couplet } = currentCoupletData;
    kuralAudio.playCouplet({
      id: couplet.id,
      tamilLine1: couplet.line1,
      tamilLine2: couplet.line2,
      englishLine1: couplet.englishLine1,
      englishLine2: couplet.englishLine2,
      isEnglish,
    });
  };

  const handleCopy = () => {
    if (!currentCoupletData) return;
    const { couplet, chapter } = currentCoupletData;
    const text = isEnglish
      ? `Thirukkural Couplet #${couplet.id}
Chapter ${chapter.id}: ${chapter.nameEnglish} (${chapter.nameTamil})
Section: ${chapter.section.english}

English Translation:
${couplet.englishLine1}
${couplet.englishLine2}

Explanation:
${couplet.explanation}

Original Tamil:
${couplet.line1}
${couplet.line2}`
      : `இன்றைய திருக்குறள் (எண்: ${couplet.id})
அதிகாரம்: ${chapter.nameTamil} (${chapter.nameEnglish})
பால்: ${chapter.section.tamil}

${couplet.line1}
${couplet.line2}

மு.வ உரை:
${couplet.muva}

English Translation:
${couplet.englishLine1}
${couplet.englishLine2}

Explanation:
${couplet.explanation}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentCoupletData) {
    return (
      <div className="p-12 text-center text-[#8E8E93]">
        {isEnglish ? 'Loading couplet...' : 'குறள் தகவல்கள் ஏற்றப்படுகின்றன...'}
      </div>
    );
  }

  const { couplet, chapter } = currentCoupletData;
  const saved = isSaved(couplet.id);

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* iOS Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5E5EA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold text-[#1C1C1E] ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish ? 'Daily Couplet' : 'இன்றைய குறள்'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8E8E93]">
            {isEnglish ? 'Daily reflection and wisdom from Thirukkural' : 'சிந்தனைக்கும் நல்வழிக்குமான இன்றைய திருக்குறள்'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Daily Notification Button */}
          <button
            id="daily-notification-btn"
            type="button"
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-2xs cursor-pointer active:scale-95 ${
              notificationSettings.enabled
                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                : 'bg-white hover:bg-[#F2F2F7] text-[#1C1C1E] border-[#E5E5EA]'
            }`}
            title={isEnglish ? 'Daily Notification Settings' : 'தினசரி அறிவிப்பு அமைப்புகள்'}
          >
            {notificationSettings.enabled ? (
              <BellRing className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-[#8E8E93]" />
            )}
            <span className={isEnglish ? 'font-sans' : 'font-tamil'}>
              {isEnglish
                ? (notificationSettings.enabled ? `Notification (${notificationSettings.time})` : 'Daily Notification')
                : (notificationSettings.enabled ? `அறிவிப்பு (${notificationSettings.time})` : 'தினசரி அறிவிப்பு')}
            </span>
          </button>

          <button
            id="random-kural-btn"
            type="button"
            onClick={handleRandomKural}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F2F2F7] text-[#1C1C1E] rounded-xl text-xs font-semibold transition-all border border-[#E5E5EA] shadow-2xs cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            <span className={isEnglish ? 'font-sans' : 'font-tamil'}>
              {isEnglish ? 'Random' : 'வேறு குறள்'}
            </span>
          </button>
        </div>
      </div>

      {/* Daily Notification Configuration Card (Collapsible) */}
      {showNotificationSettings && (
        <div className="mb-5 p-4 sm:p-5 bg-white rounded-2xl border border-orange-200/90 shadow-[0_2px_12px_rgba(234,88,12,0.08)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-bold text-[#1C1C1E] ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
                  {isEnglish ? 'Daily Morning Thirukkural Notification' : 'தினசரி காலை திருக்குறள் அறிவிப்பு'}
                </h3>
                <p className="text-xs text-[#8E8E93]">
                  {isEnglish
                    ? 'Get a peaceful daily couplet pushed to your notification tray every morning'
                    : 'தினமும் காலையில் அமைதியான சிந்தனைக்கு இன்றைய திருக்குறள் அறிவிப்பைப் பெறுங்கள்'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNotificationSettings(false)}
              className="p-1 text-[#8E8E93] hover:text-[#1C1C1E] rounded-lg hover:bg-[#F2F2F7] cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Browser Permission Denied Warning */}
          {(showPermissionDeniedNotice || permissionStatus === 'denied') && (
            <div className="mb-3.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">
                  {isEnglish ? 'Notifications Blocked by Browser' : 'உலாவியில் அறிவிப்புகள் தடுக்கப்பட்டுள்ளன'}
                </strong>
                <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                  {isEnglish
                    ? 'To enable morning notifications: Tap the 🔒 lock icon in your browser address bar -> Permissions / Site Settings -> set Notifications to "Allow", then toggle below again.'
                    : 'காலை அறிவிப்புகளைப் பெற: உலாவி முகவரிப் பட்டியில் உள்ள 🔒 பூட்டு குறியீட்டைத் தட்டி -> Site Settings -> Notifications என்பதை "Allow" என மாற்றி, பின்னர் கீழே மீண்டும் இயக்கவும்.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-[#F2F2F7]">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#F8F8FA] rounded-xl border border-[#E5E5EA]">
              <div>
                <span className={`text-xs font-semibold text-[#1C1C1E] block ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
                  {isEnglish ? 'Enable Morning Notification' : 'காலை அறிவிப்பை இயக்கு'}
                </span>
                <span className="text-[11px] text-[#8E8E93]">
                  {notificationSettings.enabled
                    ? (isEnglish ? 'Active with morning auto-delivery' : 'காலை நேர தானியங்கி முறையில் இயங்குகிறது')
                    : (isEnglish ? 'Turn on to receive morning alerts' : 'காலை நினைவூட்டல் பெற இயக்கவும்')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleNotifications}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  notificationSettings.enabled ? 'bg-orange-600 justify-end' : 'bg-[#D1D1D6] justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" />
              </button>
            </div>

            {/* Notification Morning Time Selector */}
            <div className="flex items-center justify-between p-3 bg-[#F8F8FA] rounded-xl border border-[#E5E5EA]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <div>
                  <span className={`text-xs font-semibold text-[#1C1C1E] block ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
                    {isEnglish ? 'Morning Time:' : 'காலை நேரம்:'}
                  </span>
                  <span className="text-[10px] text-[#8E8E93]">
                    {isEnglish ? 'Choose your wake-up hour' : 'உங்கள் விடியல் நேரம்'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={notificationSettings.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={!notificationSettings.enabled}
                  className="text-xs font-semibold bg-white border border-[#E5E5EA] rounded-lg px-2 py-1 text-[#1C1C1E] focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer disabled:opacity-50"
                >
                  <option value="05:00">05:00 AM (Early)</option>
                  <option value="05:30">05:30 AM</option>
                  <option value="06:00">06:00 AM (Dawn)</option>
                  <option value="06:30">06:30 AM</option>
                  <option value="07:00">07:00 AM</option>
                  <option value="07:30">07:30 AM</option>
                  <option value="08:00">08:00 AM (Morning)</option>
                  <option value="08:30">08:30 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="18:00">06:00 PM (Evening)</option>
                  <option value="20:00">08:00 PM (Night)</option>
                </select>
                <input
                  type="time"
                  value={notificationSettings.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={!notificationSettings.enabled}
                  className="w-8 h-7 text-xs bg-white border border-[#E5E5EA] rounded-lg p-0 text-center cursor-pointer disabled:opacity-50"
                  title={isEnglish ? 'Set custom exact minute' : 'துல்லியமான நிமிடத்தை அமைக்கவும்'}
                />
              </div>
            </div>
          </div>

          {/* Status & Catch-up Guidance Banner */}
          <div className="mt-3 p-2.5 bg-[#F2F2F7]/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {isDeliveredToday ? (
                <div className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {isEnglish
                      ? `Delivered for today (${notificationSettings.time})`
                      : `இன்றைய குறள் அனுப்பப்பட்டது (${notificationSettings.time})`}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 text-[#3C3C43]">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>
                    {isEnglish
                      ? `Scheduled for morning at ${notificationSettings.time}`
                      : `காலை ${notificationSettings.time} மணிக்கு வர திட்டமிடப்பட்டுள்ளது`}
                  </span>
                </div>
              )}
            </div>

            {pushStatusMessage && (
              <span className="text-orange-700 font-medium text-[11px] animate-fade-in">
                {pushStatusMessage}
              </span>
            )}

            {isDeliveredToday && (
              <button
                type="button"
                onClick={handleResetTodayNotification}
                className="text-[11px] text-stone-600 hover:text-stone-900 underline cursor-pointer"
              >
                {isEnglish ? 'Reset & deliver again' : 'மீண்டும் அனுப்ப திட்டமிடு'}
              </button>
            )}
          </div>

          {/* Action Buttons: Push Now & Test Notification */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2F2F7]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93]">
              <Smartphone className="w-3.5 h-3.5 text-orange-600" />
              <span>
                {isEnglish
                  ? 'Wake-up Catch-up active: Even if asleep overnight, morning couplet delivers on wake'
                  : 'விடியல் நினைவூட்டல்: இரவு அணைக்கப்பட்டிருந்தாலும் விழித்ததும் அறிவிப்பு வரும்'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePushTodayKuralNow}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title={isEnglish ? "Deliver today's couplet to device notification tray now" : 'இன்றைய குறள் அறிவிப்பை இப்போதே சாதனத்திற்கு அனுப்பு'}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isEnglish ? "Push Today's Kural Now" : 'இன்றைய குறளை அனுப்பு'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestNotification}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                  testNotificationSent
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] border-[#E5E5EA]'
                }`}
              >
                {testNotificationSent ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEnglish ? 'Sent!' : 'அனுப்பப்பட்டது!'}</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-orange-600" />
                    <span>{isEnglish ? 'Quick Test' : 'சோதனை'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Widget Card Container */}
      <div className="relative pt-3.5">
        {/* Couplet Number Legend sitting on top border */}
        <div className="absolute top-0 left-4 -translate-y-1/2 z-10 flex items-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-orange-600 text-white font-mono font-bold text-xs sm:text-sm rounded-full shadow-[0_2px_8px_rgba(234,88,12,0.25)] ring-3 ring-[#F2F2F7] select-none">
            {isEnglish ? `Couplet #${couplet.id}` : `குறள் #${couplet.id}`}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* iOS Header Row: Cleanly left-aligned */}
          <div className="bg-[#F2F2F7]/80 px-4 sm:px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5EA]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="bg-white text-[#1C1C1E] px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#E5E5EA] shadow-2xs">
                  {isEnglish ? chapter.section.english : chapter.section.tamil}
                </span>
                <span className="bg-white text-[#8E8E93] px-2.5 py-0.5 rounded-full text-xs border border-[#E5E5EA]">
                  {isEnglish ? chapter.iyal.english : chapter.iyal.tamil}
                </span>
              </div>
            {isEnglish ? (
              <>
                <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-sans">
                  Chapter {chapter.id}: {chapter.nameEnglish}
                </h3>
                <p className="text-xs text-[#8E8E93] font-tamil">{chapter.nameTamil}</p>
              </>
            ) : (
              <>
                <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-tamil">
                  அதிகாரம் {chapter.id}: {chapter.nameTamil}
                </h3>
                <p className="text-xs text-[#8E8E93] font-sans">{chapter.nameEnglish}</p>
              </>
            )}
          </div>

          {/* iOS Circular Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSpeech}
              className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isPlayingAudio ? 'bg-orange-500 text-white shadow-xs' : 'bg-white border border-[#E5E5EA] text-[#3C3C43] hover:bg-[#F2F2F7]'
              }`}
              title={
                isEnglish
                  ? isPlayingAudio
                    ? 'Stop recitation'
                    : isAudioCached
                    ? 'Listen (Saved for Offline)'
                    : 'Listen'
                  : isPlayingAudio
                  ? 'ஒலியை நிறுத்து'
                  : isAudioCached
                  ? 'கேட்க (ஆஃப்லைனில் சேமிக்கப்பட்டுள்ளது)'
                  : 'கேட்க'
              }
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4 text-orange-600" />}
              {isAudioCached && !isPlayingAudio && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white"
                  title={isEnglish ? 'Saved for offline' : 'ஆஃப்லைனில் தயார்'}
                />
              )}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="w-8 h-8 rounded-full bg-white border border-[#E5E5EA] text-[#3C3C43] hover:bg-[#F2F2F7] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              title={isEnglish ? 'Copy' : 'நகலெடுக்க'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onToggleSave(couplet.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                saved ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-white border border-[#E5E5EA] text-[#8E8E93] hover:bg-[#F2F2F7]'
              }`}
              title={isEnglish ? 'Save' : 'சேமிக்க'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-orange-600 text-orange-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onGoToChapter(chapter.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-semibold transition-all cursor-pointer ml-1 shadow-2xs"
              title={isEnglish ? 'View all 10 couplets' : 'அதிகாரத்தின் 10 குறள்கள்'}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className={isEnglish ? 'font-sans' : 'font-tamil'}>
                {isEnglish ? 'Chapter' : 'அதிகாரம்'}
              </span>
            </button>
          </div>
        </div>

        {/* Couplet Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* iOS Card Callout for Verse */}
          <div className="bg-[#F2F2F7] p-5 sm:p-6 rounded-2xl border border-[#E5E5EA] text-center">
            {isEnglish ? (
              <>
                <span className="text-[11px] font-mono uppercase tracking-wider text-orange-700 font-bold block mb-2">
                  English Verse
                </span>
                <p className={`italic font-serif font-bold text-[#1C1C1E] leading-relaxed tracking-wide mb-1.5 ${fontSizeClass}`}>
                  "{couplet.englishLine1}
                </p>
                <p className={`italic font-serif font-bold text-[#1C1C1E] leading-relaxed tracking-wide ${fontSizeClass}`}>
                  {couplet.englishLine2}"
                </p>
              </>
            ) : (
              <>
                <p className={`font-tamil font-bold text-[#1C1C1E] leading-relaxed tracking-wide mb-1.5 ${fontSizeClass}`}>
                  {couplet.line1}
                </p>
                <p className={`font-tamil font-bold text-[#1C1C1E] leading-relaxed tracking-wide ${fontSizeClass}`}>
                  {couplet.line2}
                </p>
              </>
            )}
          </div>

          {/* Secondary Verse representation */}
          <div className="text-center py-2">
            {isEnglish ? (
              <p className="font-tamil font-semibold text-[#3C3C43] text-sm sm:text-base leading-relaxed">
                {couplet.line1}
                <br />
                {couplet.line2}
              </p>
            ) : (
              <p className="italic font-serif text-[#3C3C43] text-xs sm:text-sm leading-relaxed">
                "{couplet.englishLine1}
                <br />
                {couplet.englishLine2}"
              </p>
            )}
          </div>

          {/* Commentaries Grouped Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Pope English Explanation */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-2xs font-sans">
              <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full mb-1.5">
                Rev. Dr. G.U. Pope
              </span>
              <p className="text-[#3C3C43] text-xs sm:text-sm leading-relaxed">{couplet.explanation}</p>
            </div>

            {/* Mu. Va */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-2xs font-tamil">
              <span className="inline-block text-[11px] font-bold text-orange-800 bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 rounded-full mb-1.5 font-tamil">
                மு. வரதராசனார் உரை
              </span>
              <p className="text-[#3C3C43] text-xs sm:text-sm leading-relaxed">{couplet.muva}</p>
            </div>

            {/* Solomon Pappaiah */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-2xs font-tamil">
              <span className="inline-block text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full mb-1.5 font-tamil">
                சாலமன் பாப்பையா உரை
              </span>
              <p className="text-[#3C3C43] text-xs sm:text-sm leading-relaxed">{couplet.solomon}</p>
            </div>

            {/* Kalaignar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-2xs font-tamil">
              <span className="inline-block text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full mb-1.5 font-tamil">
                கலைஞர் உரை
              </span>
              <p className="text-[#3C3C43] text-xs sm:text-sm leading-relaxed">{couplet.kalaignar}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
