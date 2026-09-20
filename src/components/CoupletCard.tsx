import React, { useState } from 'react';
import { Couplet, CommentaryType, LanguageMode } from '../types';
import { Bookmark, Copy, Check, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';

interface CoupletCardProps {
  couplet: Couplet;
  chapterNameTamil?: string;
  chapterNameEnglish?: string;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  fontSizeClass: string;
  languageMode?: LanguageMode;
}

export const CoupletCard: React.FC<CoupletCardProps> = ({
  couplet,
  chapterNameTamil,
  chapterNameEnglish,
  isSaved,
  onToggleSave,
  fontSizeClass,
  languageMode = 'ta',
}) => {
  const [selectedCommentary, setSelectedCommentary] = useState<CommentaryType>(
    languageMode === 'en' ? 'english' : 'muva'
  );
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isInlineExpanded, setIsInlineExpanded] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `திருக்குறள் ${couplet.id}:
${couplet.line1}
${couplet.line2}

மு.வ உரை:
${couplet.muva}

சாலமன் பாப்பையா உரை:
${couplet.solomon}

கலைஞர் உரை:
${couplet.kalaignar}

English Translation:
${couplet.englishLine1}
${couplet.englishLine2}

Explanation:
${couplet.explanation}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const isEnglish = languageMode === 'en';
    const textToRead = isEnglish
      ? `${couplet.englishLine1}. ${couplet.englishLine2}`
      : `${couplet.line1}. ${couplet.line2}`;
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = isEnglish ? 'en-US' : 'ta-IN';
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const matchVoice = voices.find((v) =>
        isEnglish ? v.lang.startsWith('en') : v.lang.includes('ta')
      );
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    }
    const tamilVoice = voices.find((v) => v.lang.includes('ta') || v.lang.includes('ta-IN'));
    if (tamilVoice) {
      utterance.voice = tamilVoice;
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCardClick = () => {
    setIsInlineExpanded((prev) => !prev);
  };

  const handleToggleInline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInlineExpanded(!isInlineExpanded);
  };

  return (
    <div 
      id={`couplet-card-${couplet.id}`}
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer overflow-hidden group select-none relative"
    >
      {/* Top Header Bar */}
      <div className="bg-stone-50/90 px-3.5 sm:px-4 py-2 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-2 min-w-0">
          <span className="bg-amber-100 text-amber-900 border border-amber-300/60 font-bold px-2 py-0.5 rounded-md font-mono text-xs flex-shrink-0">
            {languageMode === 'en' ? `Couplet ${couplet.id}` : `குறள் ${couplet.id}`}
          </span>
          {(chapterNameEnglish || chapterNameTamil) && (
            <span className={`text-stone-500 font-medium truncate text-xs ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? (chapterNameEnglish || chapterNameTamil) : (chapterNameTamil || chapterNameEnglish)}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Audio read button */}
          <button
            type="button"
            onClick={handleSpeech}
            className={`p-1.5 rounded-lg hover:bg-stone-200 transition-colors ${
              isPlayingAudio ? 'text-amber-600 bg-amber-100/70' : 'text-stone-500'
            }`}
            title={languageMode === 'en' ? 'Read couplet aloud' : 'குறளை ஒலி வடிவில் கேட்க'}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors"
            title={languageMode === 'en' ? 'Copy couplet & commentaries' : 'குறள் மற்றும் உரையை நகலெடுக்க'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Bookmark button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(couplet.id);
            }}
            className={`p-1.5 rounded-lg hover:bg-stone-200 transition-colors ${
              isSaved ? 'text-amber-600' : 'text-stone-400'
            }`}
            title={isSaved ? (languageMode === 'en' ? 'Remove from saved' : 'சேமிப்பிலிருந்து நீக்குக') : (languageMode === 'en' ? 'Save couplet' : 'குறளை சேமிக்க')}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
          </button>

          {/* Quick inline expand button */}
          <button
            type="button"
            onClick={handleToggleInline}
            className="px-2 py-1 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-[11px] font-semibold flex items-center gap-1 ml-1 transition-colors border border-stone-300/80 shadow-2xs"
            title={isInlineExpanded ? (languageMode === 'en' ? 'Hide meaning' : 'விளக்கத்தை மறைக்க') : (languageMode === 'en' ? 'Show meaning' : 'உரை விளக்கம் காண்க')}
          >
            <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
              {languageMode === 'en' ? (isInlineExpanded ? 'Close' : 'Meaning') : (isInlineExpanded ? 'மூடு' : 'உரை')}
            </span>
            {isInlineExpanded ? <ChevronUp className="w-3 h-3 text-stone-700" /> : <ChevronDown className="w-3 h-3 text-stone-700" />}
          </button>
        </div>
      </div>

      {/* Main Kural Content (Compact 2 Lines - Tamil, English, or Both) */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3">
        {languageMode === 'en' ? (
          /* English Couplet (2 Lines) */
          <div className="group-hover:text-amber-950 transition-colors">
            <p className={`font-serif italic font-semibold text-stone-900 leading-normal tracking-wide ${fontSizeClass}`}>
              {couplet.englishLine1}
            </p>
            <p className={`font-serif italic font-semibold text-stone-900 leading-normal tracking-wide mt-1 ${fontSizeClass}`}>
              {couplet.englishLine2}
            </p>
          </div>
        ) : languageMode === 'both' ? (
          /* Both Tamil & English Couplets */
          <div className="group-hover:text-amber-950 transition-colors space-y-2">
            <div>
              <p className={`font-tamil font-bold text-stone-900 leading-normal tracking-wide ${fontSizeClass}`}>
                {couplet.line1}
              </p>
              <p className={`font-tamil font-bold text-stone-900 leading-normal tracking-wide mt-1 ${fontSizeClass}`}>
                {couplet.line2}
              </p>
            </div>
            <div className="pt-1.5 border-t border-amber-200/50 text-stone-700 italic font-serif text-xs sm:text-sm leading-relaxed">
              <p>{couplet.englishLine1}</p>
              <p className="mt-0.5">{couplet.englishLine2}</p>
            </div>
          </div>
        ) : (
          /* Tamil Couplet (Exact 2 Lines - Default) */
          <div className="group-hover:text-amber-950 transition-colors">
            <p className={`font-tamil font-bold text-stone-900 leading-normal tracking-wide ${fontSizeClass}`}>
              {couplet.line1}
            </p>
            <p className={`font-tamil font-bold text-stone-900 leading-normal tracking-wide mt-1 ${fontSizeClass}`}>
              {couplet.line2}
            </p>
          </div>
        )}

        {/* Inline Explanations (Shown only when toggled) */}
        {isInlineExpanded && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-3 pt-2.5 border-t border-stone-200 animate-in fade-in duration-200"
          >
            {/* Commentary Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1 mb-2.5 text-xs">
              <span className={`text-stone-500 font-medium mr-1 text-[11px] ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
                {languageMode === 'en' ? 'Commentary:' : 'உரை:'}
              </span>
              {languageMode === 'en' && (
                <button
                  type="button"
                  onClick={() => setSelectedCommentary('english')}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                    selectedCommentary === 'english'
                      ? 'bg-indigo-700 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  English
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCommentary('muva')}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                  languageMode === 'en' ? 'font-sans' : 'font-tamil'
                } ${
                  selectedCommentary === 'muva'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {languageMode === 'en' ? 'Mu.Va' : 'மு.வ'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCommentary('solomon')}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                  languageMode === 'en' ? 'font-sans' : 'font-tamil'
                } ${
                  selectedCommentary === 'solomon'
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {languageMode === 'en' ? 'Solomon' : 'சாலமன் பாப்பையா'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCommentary('kalaignar')}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                  languageMode === 'en' ? 'font-sans' : 'font-tamil'
                } ${
                  selectedCommentary === 'kalaignar'
                    ? 'bg-rose-700 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {languageMode === 'en' ? 'Kalaignar' : 'கலைஞர்'}
              </button>
              {languageMode !== 'en' && (
                <button
                  type="button"
                  onClick={() => setSelectedCommentary('english')}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                    selectedCommentary === 'english'
                      ? 'bg-indigo-700 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  English
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCommentary('all')}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                  languageMode === 'en' ? 'font-sans' : 'font-tamil'
                } ${
                  selectedCommentary === 'all'
                    ? 'bg-stone-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {languageMode === 'en' ? 'All' : 'அனைத்தும்'}
              </button>
            </div>

            {/* Commentary text content */}
            <div className={`text-xs sm:text-sm text-stone-700 leading-relaxed space-y-2 bg-stone-50 p-2.5 sm:p-3 rounded-xl border border-stone-200 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {(selectedCommentary === 'english' || selectedCommentary === 'all') && (
                <div className="font-sans">
                  <span className="inline-block text-[11px] font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded mb-1">
                    English Meaning & Commentary (Rev. Dr. G.U. Pope)
                  </span>
                  <p className="italic font-serif text-xs text-stone-700 mb-1 leading-snug">
                    "{couplet.englishLine1}
                    <br />
                    {couplet.englishLine2}"
                  </p>
                  <p className="text-stone-800 leading-relaxed text-xs sm:text-sm">{couplet.explanation}</p>
                </div>
              )}

              {(selectedCommentary === 'muva' || selectedCommentary === 'all') && (
                <div className={selectedCommentary === 'all' ? 'pt-2 border-t border-stone-200' : ''}>
                  <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded mb-1 font-tamil">
                    {languageMode === 'en' ? 'Dr. Mu. Varadarajan Commentary (Tamil)' : 'டாக்டர் மு. வரதராசனார் உரை'}
                  </span>
                  <p className="text-stone-800 leading-relaxed text-xs sm:text-sm font-tamil">{couplet.muva}</p>
                </div>
              )}

              {(selectedCommentary === 'solomon' || selectedCommentary === 'all') && (
                <div className={selectedCommentary === 'all' ? 'pt-2 border-t border-stone-200' : ''}>
                  <span className="inline-block text-[11px] font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded mb-1 font-tamil">
                    {languageMode === 'en' ? 'Solomon Pappaiah Commentary (Tamil)' : 'சாலமன் பாப்பையா உரை'}
                  </span>
                  <p className="text-stone-800 leading-relaxed text-xs sm:text-sm font-tamil">{couplet.solomon}</p>
                </div>
              )}

              {(selectedCommentary === 'kalaignar' || selectedCommentary === 'all') && (
                <div className={selectedCommentary === 'all' ? 'pt-2 border-t border-stone-200' : ''}>
                  <span className="inline-block text-[11px] font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded mb-1 font-tamil">
                    {languageMode === 'en' ? 'M. Karunanidhi Commentary (Tamil)' : 'மு. கருணாநிதி (கலைஞர்) உரை'}
                  </span>
                  <p className="text-stone-800 leading-relaxed text-xs sm:text-sm font-tamil">{couplet.kalaignar}</p>
                </div>
              )}

              {/* Cir / Word Breakdown when all commentaries are viewed */}
              {selectedCommentary === 'all' && (
                <div className="pt-2 border-t border-stone-200">
                  <span className={`inline-block text-[11px] font-bold text-stone-500 mb-1 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
                    {languageMode === 'en' ? 'Metered Words (சீர்):' : 'சீர்கள் (7 சொற்கள்):'}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 font-tamil text-xs">
                    {couplet.line1.split(' ').map((word, idx) => (
                      <span key={`l1-${idx}`} className="bg-white border border-stone-200 px-2 py-0.5 rounded-md text-stone-800 shadow-2xs font-medium">
                        {word}
                      </span>
                    ))}
                    <span className="text-stone-300 font-sans mx-0.5">•</span>
                    {couplet.line2.split(' ').map((word, idx) => (
                      <span key={`l2-${idx}`} className="bg-white border border-stone-200 px-2 py-0.5 rounded-md text-stone-800 shadow-2xs font-medium">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

