import React, { useState, useEffect, useMemo } from 'react';
import { Chapter, Couplet, LanguageMode } from '../types';
import { Sparkles, RefreshCw, Bookmark, Copy, Check, Volume2, VolumeX, BookOpen } from 'lucide-react';

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
  // Deterministic daily kural based on day of year
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

  // Find the couplet and its chapter
  const currentCoupletData = useMemo(() => {
    for (const ch of chapters) {
      const found = ch.couplets.find((c) => c.id === currentKuralId);
      if (found) {
        return { couplet: found, chapter: ch };
      }
    }
    return null;
  }, [chapters, currentKuralId]);

  const handleRandomKural = () => {
    const randId = Math.floor(Math.random() * 1330) + 1;
    setCurrentKuralId(randId);
  };

  const handleSpeech = () => {
    if (!currentCoupletData || !('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const { couplet } = currentCoupletData;

    const textToRead = isEnglish
      ? `${couplet.englishLine1}. ${couplet.englishLine2}. Explanation: ${couplet.explanation}`
      : `${couplet.line1}. ${couplet.line2}. மு.வ உரை: ${couplet.muva}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = isEnglish ? 'en-US' : 'ta-IN';
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    if (isEnglish) {
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    } else {
      const tamilVoice = voices.find((v) => v.lang.includes('ta') || v.lang.includes('ta-IN'));
      if (tamilVoice) utterance.voice = tamilVoice;
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
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
      <div className="p-12 text-center text-stone-500">
        {isEnglish ? 'Loading couplet details...' : 'குறள் தகவல்கள் ஏற்றப்படுகின்றன...'}
      </div>
    );
  }

  const { couplet, chapter } = currentCoupletData;
  const saved = isSaved(couplet.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className={`text-2xl font-bold text-stone-900 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish ? 'Daily Couplet' : 'இன்றைய குறள்'}
            </h2>
          </div>
          <p className="text-sm text-stone-600">
            {isEnglish ? 'Daily Thirukkural for reflection and wisdom' : 'சிந்தனைக்கும் வாழ்வியல் வழிகாட்டலுக்குமான இன்றைய திருக்குறள்'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="random-kural-btn"
            onClick={handleRandomKural}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 text-stone-100 hover:bg-stone-800 rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className={isEnglish ? 'font-sans' : 'font-tamil'}>
              {isEnglish ? 'Random Couplet' : 'வேறு குறள் (Random)'}
            </span>
          </button>
        </div>
      </div>

      {/* Daily Card */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-stone-100 p-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-700">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-amber-500 text-stone-950 font-bold px-2.5 py-0.5 rounded text-sm font-mono">
                {isEnglish ? `Couplet #${couplet.id}` : `குறள் #${couplet.id}`}
              </span>
              <span className="bg-stone-800 text-amber-300 px-2 py-0.5 rounded text-xs border border-stone-700">
                {isEnglish ? `${chapter.section.english} (${chapter.section.tamil})` : `${chapter.section.tamil} (${chapter.section.english})`}
              </span>
              <span className="bg-stone-800 text-stone-300 px-2 py-0.5 rounded text-xs border border-stone-700">
                {isEnglish ? chapter.iyal.english : chapter.iyal.tamil}
              </span>
            </div>
            {isEnglish ? (
              <>
                <h3 className="text-lg font-bold text-amber-100 font-sans">
                  Chapter {chapter.id}: {chapter.nameEnglish}
                </h3>
                <p className="text-xs text-stone-400 font-tamil">{chapter.nameTamil}</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-amber-100 font-tamil">
                  அதிகாரம் {chapter.id}: {chapter.nameTamil}
                </h3>
                <p className="text-xs text-stone-400 font-sans">{chapter.nameEnglish}</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeech}
              className={`p-2.5 rounded-lg border border-stone-700 hover:bg-stone-800 transition-colors ${
                isPlayingAudio ? 'bg-amber-600 text-white' : 'text-stone-300'
              }`}
              title={isEnglish ? 'Listen aloud' : 'ஒலி வடிவில் கேட்க'}
            >
              {isPlayingAudio ? <VolumeX className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
              title={isEnglish ? 'Copy' : 'நகலெடுக்க'}
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={() => onToggleSave(couplet.id)}
              className="p-2.5 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
              title={isEnglish ? 'Bookmark' : 'சேமிக்க'}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => onGoToChapter(chapter.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 text-xs font-semibold transition-colors ml-1"
              title={isEnglish ? 'View all 10 couplets of this chapter' : 'இந்த அதிகாரத்தின் அனைத்து 10 குறள்கள்'}
            >
              <BookOpen className="w-4 h-4" />
              <span className={isEnglish ? 'font-sans' : 'font-tamil'}>
                {isEnglish ? 'View Chapter' : 'முழு அதிகாரம்'}
              </span>
            </button>
          </div>
        </div>

        {/* Couplet Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {isEnglish ? (
            /* English mode: English prominent first */
            <>
              <div className="bg-amber-50/70 p-6 rounded-xl border border-amber-200 text-center">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold block mb-2">
                  English Translation
                </span>
                <p className={`italic font-serif font-extrabold text-stone-950 leading-relaxed tracking-wider mb-2 ${fontSizeClass}`}>
                  "{couplet.englishLine1}
                </p>
                <p className={`italic font-serif font-extrabold text-stone-950 leading-relaxed tracking-wider ${fontSizeClass}`}>
                  {couplet.englishLine2}"
                </p>
              </div>

              <div className="text-center py-2 border-y border-stone-100">
                <span className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-1 block">
                  Original Tamil Verse (மூலக் குறள்)
                </span>
                <p className="font-tamil font-bold text-stone-800 text-base sm:text-lg leading-relaxed">
                  {couplet.line1}
                  <br />
                  {couplet.line2}
                </p>
              </div>
            </>
          ) : (
            /* Tamil mode: Tamil verse first */
            <>
              <div className="bg-amber-50/70 p-6 rounded-xl border border-amber-200 text-center">
                <p className={`font-tamil font-extrabold text-stone-950 leading-relaxed tracking-wider mb-2 ${fontSizeClass}`}>
                  {couplet.line1}
                </p>
                <p className={`font-tamil font-extrabold text-stone-950 leading-relaxed tracking-wider ${fontSizeClass}`}>
                  {couplet.line2}
                </p>
              </div>

              <div className="text-center py-2 border-y border-stone-100">
                <p className="italic font-serif text-stone-700 text-base sm:text-lg leading-relaxed">
                  "{couplet.englishLine1}
                  <br />
                  {couplet.englishLine2}"
                </p>
              </div>
            </>
          )}

          {/* All Commentaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Pope English Explanation */}
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 font-sans">
              <span className="inline-block text-xs font-bold text-indigo-900 bg-indigo-100/90 px-2.5 py-0.5 rounded-md mb-2">
                {isEnglish ? 'English Meaning (Rev. Dr. G.U. Pope)' : 'English Meaning & Explanation'}
              </span>
              <p className="text-stone-800 text-sm leading-relaxed">{couplet.explanation}</p>
            </div>

            {/* Mu. Va */}
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
              <span className="inline-block text-xs font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-md mb-2">
                {isEnglish ? 'Dr. Mu. Varadarajan Commentary' : 'மு. வரதராசனார் உரை'}
              </span>
              <p className="font-tamil text-stone-800 text-sm leading-relaxed">{couplet.muva}</p>
            </div>

            {/* Solomon Pappaiah */}
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
              <span className="inline-block text-xs font-bold text-teal-900 bg-teal-100/90 px-2.5 py-0.5 rounded-md mb-2">
                {isEnglish ? 'Solomon Pappaiah Commentary' : 'சாலமன் பாப்பையா உரை'}
              </span>
              <p className="font-tamil text-stone-800 text-sm leading-relaxed">{couplet.solomon}</p>
            </div>

            {/* Kalaignar */}
            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
              <span className="inline-block text-xs font-bold text-rose-900 bg-rose-100/90 px-2.5 py-0.5 rounded-md mb-2">
                {isEnglish ? 'M. Karunanidhi (Kalaignar) Commentary' : 'கலைஞர் மு. கருணாநிதி உரை'}
              </span>
              <p className="font-tamil text-stone-800 text-sm leading-relaxed">{couplet.kalaignar}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
