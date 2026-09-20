import React, { useState, useMemo, useEffect } from 'react';
import { Chapter, LanguageMode } from '../types';
import { Sparkles, RefreshCw, Bookmark, Copy, Check, Volume2, VolumeX, BookOpen, Bell, BellRing, Clock, Info } from 'lucide-react';
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
        return;
      }
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
    const mode: LanguageMode = (languageMode as LanguageMode) || 'ta';
    const success = await notificationManager.testNotification(
      currentCoupletData.couplet,
      currentCoupletData.chapter,
      mode
    );
    setPermissionStatus(notificationManager.getPermission());
    if (success) {
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    }
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
        <div className="mb-5 p-4 sm:p-5 bg-white rounded-2xl border border-orange-200/80 shadow-[0_2px_10px_rgba(234,88,12,0.06)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold text-[#1C1C1E] ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
                  {isEnglish ? 'Everyday Couplet Notification' : 'தினசரி திருக்குறள் அறிவிப்பு'}
                </h3>
                <p className="text-xs text-[#8E8E93]">
                  {isEnglish
                    ? 'Receive a peaceful daily Thirukkural couplet at your chosen time'
                    : 'தினமும் உங்கள் விருப்ப நேரத்திற்கு இன்றைய திருக்குறள் அறிவிப்பைப் பெறுங்கள்'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#F2F2F7]">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#F8F8FA] rounded-xl border border-[#E5E5EA]">
              <div>
                <span className={`text-xs font-semibold text-[#1C1C1E] block ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
                  {isEnglish ? 'Enable Notifications' : 'அறிவிப்பை இயக்கு'}
                </span>
                <span className="text-[11px] text-[#8E8E93]">
                  {notificationSettings.enabled
                    ? (isEnglish ? 'Active on this browser' : 'இந்த உலாவியில் இயக்கத்தில் உள்ளது')
                    : (isEnglish ? 'Turn on to receive daily reminders' : 'தினசரி நினைவூட்டல் பெற இயக்கவும்')}
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

            {/* Notification Time Selector */}
            <div className="flex items-center justify-between p-3 bg-[#F8F8FA] rounded-xl border border-[#E5E5EA]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span className={`text-xs font-semibold text-[#1C1C1E] ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
                  {isEnglish ? 'Notification Time:' : 'அறிவிப்பு நேரம்:'}
                </span>
              </div>
              <select
                value={notificationSettings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={!notificationSettings.enabled}
                className="text-xs font-semibold bg-white border border-[#E5E5EA] rounded-lg px-2.5 py-1 text-[#1C1C1E] focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer disabled:opacity-50"
              >
                <option value="06:00">06:00 AM</option>
                <option value="07:00">07:00 AM</option>
                <option value="08:00">08:00 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="18:00">06:00 PM</option>
                <option value="20:00">08:00 PM</option>
                <option value="21:00">09:00 PM</option>
              </select>
            </div>
          </div>

          {/* Test Trigger Button & Permission Status */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93]">
              <Info className="w-3 h-3 text-orange-600" />
              <span>
                {permissionStatus === 'granted'
                  ? (isEnglish ? 'Browser permission: Allowed' : 'உலாவி அனுமதி: வழங்கப்பட்டுள்ளது')
                  : permissionStatus === 'denied'
                  ? (isEnglish ? 'Permission blocked in browser settings' : 'உலாவியில் அனுமதி மறுக்கப்பட்டுள்ளது')
                  : (isEnglish ? 'Permission prompt will appear on enable' : 'இயக்கும் போது அனுமதி கேட்கப்படும்')}
              </span>
            </div>

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
                  <span>{isEnglish ? 'Test Notification Sent!' : 'சோதனை அறிவிப்பு அனுப்பப்பட்டது!'}</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-orange-600" />
                  <span>{isEnglish ? 'Send Test Notification' : 'சோதனை அறிவிப்பு அனுப்புக'}</span>
                </>
              )}
            </button>
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
