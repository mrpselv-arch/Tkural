import React, { useState, useEffect } from 'react';
import { Couplet, CommentaryType, LanguageMode } from '../types';
import { Bookmark, Copy, Check, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { kuralAudio } from '../utils/audioPlayer';

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
  const [isCached, setIsCached] = useState(() => kuralAudio.isCached(couplet.id));

  useEffect(() => {
    return kuralAudio.subscribe((playingId) => {
      setIsPlayingAudio(playingId === couplet.id);
    });
  }, [couplet.id]);

  useEffect(() => {
    return kuralAudio.subscribeCache(() => {
      setIsCached(kuralAudio.isCached(couplet.id));
    });
  }, [couplet.id]);

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
    kuralAudio.playCouplet({
      id: couplet.id,
      tamilLine1: couplet.line1,
      tamilLine2: couplet.line2,
      englishLine1: couplet.englishLine1,
      englishLine2: couplet.englishLine2,
      isEnglish: languageMode === 'en',
    });
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
      className="relative pt-3.5 group mb-4"
    >
      {/* Couplet Number Legend sitting on the card's top border */}
      <div className="absolute top-0 left-4 -translate-y-1/2 z-10 flex items-center pointer-events-none">
        <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-orange-600 text-white font-mono font-bold text-xs rounded-full shadow-[0_2px_6px_rgba(234,88,12,0.25)] ring-2 ring-[#F2F2F7] select-none">
          {languageMode === 'en' ? `Couplet #${couplet.id}` : `குறள் #${couplet.id}`}
        </span>
      </div>

      <div 
        onClick={handleCardClick}
        className="bg-white rounded-2xl border border-[#E5E5EA] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] active:scale-[0.998] transition-all cursor-pointer overflow-hidden select-none"
      >
        {/* iOS Card Header Bar: Chapter cleanly Left-Aligned, Action buttons on Right */}
        <div className="bg-[#F2F2F7]/80 px-3.5 sm:px-4 pt-3.5 pb-2.5 border-b border-[#E5E5EA] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 text-xs">
          {/* Chapter Details: 100% Left-Aligned, Fully Visible without clipping */}
          <div className="flex items-center min-w-0 flex-1">
            {(chapterNameEnglish || chapterNameTamil) && (
              <span 
                className={`font-bold text-[#1C1C1E] text-xs sm:text-[13px] leading-snug break-words ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}
              >
                {languageMode === 'en' ? (chapterNameEnglish || chapterNameTamil) : (chapterNameTamil || chapterNameEnglish)}
              </span>
            )}
          </div>

          {/* Circular iOS Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
            {/* Audio Button (Accurate Native Tamil Recitation + Offline Storage) */}
            <button
              type="button"
              onClick={handleSpeech}
              className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isPlayingAudio ? 'bg-orange-500 text-white shadow-xs' : 'bg-[#E5E5EA]/70 hover:bg-[#E5E5EA] text-[#3C3C43]'
              }`}
              title={
                languageMode === 'en'
                  ? isPlayingAudio
                    ? 'Stop recitation'
                    : isCached
                    ? 'Listen (Saved for 100% Offline Playback)'
                    : 'Listen with authentic pronunciation'
                  : isPlayingAudio
                  ? 'ஒலியை நிறுத்து'
                  : isCached
                  ? 'கேட்க (ஆஃப்லைனில் சேமிக்கப்பட்டுள்ளது - இணையம் தேவையில்லை)'
                  : 'தூய தமிழ் உச்சரிப்பில் குறளைக் கேட்க'
              }
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isCached && !isPlayingAudio && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white"
                  title={languageMode === 'en' ? 'Saved for offline playback' : 'ஆஃப்லைனில் கிடைக்கும்'}
                />
              )}
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-7 h-7 rounded-full bg-[#E5E5EA]/70 hover:bg-[#E5E5EA] text-[#3C3C43] active:scale-90 flex items-center justify-center transition-all cursor-pointer"
              title={languageMode === 'en' ? 'Copy text' : 'நகலெடுக்க'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Favorites (Bookmark) Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(couplet.id);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                isSaved ? 'bg-orange-100 text-orange-600' : 'bg-[#E5E5EA]/70 hover:bg-[#E5E5EA] text-[#8E8E93]'
              }`}
              title={isSaved ? (languageMode === 'en' ? 'Saved' : 'சேமிக்கப்பட்டது') : (languageMode === 'en' ? 'Save' : 'சேமிக்க')}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-600 text-orange-600' : ''}`} />
            </button>

            {/* iOS Meaning Pill Button */}
            <button
              type="button"
              onClick={handleToggleInline}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isInlineExpanded 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'bg-[#E5E5EA]/80 hover:bg-[#E5E5EA] text-[#1C1C1E]'
              }`}
              title={isInlineExpanded ? 'Collapse' : 'Expand'}
            >
              <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                {languageMode === 'en' ? (isInlineExpanded ? 'Close' : 'Meaning') : (isInlineExpanded ? 'மூடு' : 'உரை')}
              </span>
              {isInlineExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>


      {/* Main Kural Couplet Body */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5">
        {languageMode === 'en' ? (
          /* English Couplet (2 Lines) */
          <div>
            <p className={`font-serif italic font-semibold text-[#1C1C1E] leading-relaxed tracking-wide ${fontSizeClass}`}>
              {couplet.englishLine1}
            </p>
            <p className={`font-serif italic font-semibold text-[#1C1C1E] leading-relaxed tracking-wide mt-1.5 ${fontSizeClass}`}>
              {couplet.englishLine2}
            </p>
          </div>
        ) : languageMode === 'both' ? (
          /* Both Tamil & English Couplets */
          <div className="space-y-2.5">
            <div>
              <p className={`font-tamil font-bold text-[#1C1C1E] leading-relaxed tracking-wide ${fontSizeClass}`}>
                {couplet.line1}
              </p>
              <p className={`font-tamil font-bold text-[#1C1C1E] leading-relaxed tracking-wide mt-1.5 ${fontSizeClass}`}>
                {couplet.line2}
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E5EA] text-[#636366] italic font-serif text-xs sm:text-sm leading-relaxed">
              <p>{couplet.englishLine1}</p>
              <p className="mt-0.5">{couplet.englishLine2}</p>
            </div>
          </div>
        ) : (
          /* Tamil Couplet (2 Lines - Default) */
          <div>
            <p className={`font-tamil font-bold text-[#1C1C1E] leading-relaxed tracking-wide ${fontSizeClass}`}>
              {couplet.line1}
            </p>
            <p className={`font-tamil font-bold text-[#1C1C1E] leading-relaxed tracking-wide mt-1.5 ${fontSizeClass}`}>
              {couplet.line2}
            </p>
          </div>
        )}

        {/* Inline Commentary Section */}
        {isInlineExpanded && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-3.5 pt-3 border-t border-[#E5E5EA] animate-in fade-in duration-150"
          >
            {/* iOS Segmented Control for Commentaries */}
            <div className="flex flex-wrap items-center bg-[#767680]/12 p-0.5 rounded-xl mb-3 text-xs">
              {languageMode === 'en' && (
                <button
                  type="button"
                  onClick={() => setSelectedCommentary('english')}
                  className={`flex-1 min-w-[70px] py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                    selectedCommentary === 'english'
                      ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                      : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                  }`}
                >
                  English
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCommentary('muva')}
                className={`flex-1 min-w-[70px] py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  languageMode === 'en' ? 'font-sans' : 'font-tamil'
                } ${
                  selectedCommentary === 'muva'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                {languageMode === 'en' ? 'Mu.Va' : 'மு.வ'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCommentary('solomon')}
                className={`flex-1 min-w-[70px] py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  languageMode === 'en' ? 'font-sans' : 'font-tamil'
                } ${
                  selectedCommentary === 'solomon'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                {languageMode === 'en' ? 'Solomon' : 'சாலமன் பாப்பையா'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCommentary('kalaignar')}
                className={`flex-1 min-w-[70px] py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  languageMode === 'en' ? 'font-sans' : 'font-tamil'
                } ${
                  selectedCommentary === 'kalaignar'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                {languageMode === 'en' ? 'Kalaignar' : 'கலைஞர்'}
              </button>
              {languageMode !== 'en' && (
                <button
                  type="button"
                  onClick={() => setSelectedCommentary('english')}
                  className={`flex-1 min-w-[70px] py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                    selectedCommentary === 'english'
                      ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                      : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                  }`}
                >
                  English
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCommentary('all')}
                className={`flex-1 min-w-[70px] py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  languageMode === 'en' ? 'font-sans' : 'font-tamil'
                } ${
                  selectedCommentary === 'all'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                {languageMode === 'en' ? 'All' : 'அனைத்தும்'}
              </button>
            </div>

            {/* Commentary Display Card */}
            <div className={`text-xs sm:text-sm text-[#3C3C43] leading-relaxed space-y-2.5 bg-[#F2F2F7]/70 p-3.5 rounded-xl border border-[#E5E5EA] ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {(selectedCommentary === 'english' || selectedCommentary === 'all') && (
                <div className="font-sans">
                  <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md mb-1">
                    English Meaning (Rev. Dr. G.U. Pope)
                  </span>
                  <p className="italic font-serif text-xs text-[#1C1C1E] mb-1">
                    "{couplet.englishLine1}
                    <br />
                    {couplet.englishLine2}"
                  </p>
                  <p className="text-[#3C3C43] leading-relaxed text-xs sm:text-sm">{couplet.explanation}</p>
                </div>
              )}

              {(selectedCommentary === 'muva' || selectedCommentary === 'all') && (
                <div className={selectedCommentary === 'all' ? 'pt-2.5 border-t border-[#E5E5EA]' : ''}>
                  <span className="inline-block text-[11px] font-bold text-orange-800 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-md mb-1 font-tamil">
                    {languageMode === 'en' ? 'Dr. Mu. Varadarajan Commentary' : 'டாக்டர் மு. வரதராசனார் உரை'}
                  </span>
                  <p className="text-[#1C1C1E] leading-relaxed text-xs sm:text-sm font-tamil">{couplet.muva}</p>
                </div>
              )}

              {(selectedCommentary === 'solomon' || selectedCommentary === 'all') && (
                <div className={selectedCommentary === 'all' ? 'pt-2.5 border-t border-[#E5E5EA]' : ''}>
                  <span className="inline-block text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md mb-1 font-tamil">
                    {languageMode === 'en' ? 'Solomon Pappaiah Commentary' : 'சாலமன் பாப்பையா உரை'}
                  </span>
                  <p className="text-[#1C1C1E] leading-relaxed text-xs sm:text-sm font-tamil">{couplet.solomon}</p>
                </div>
              )}

              {(selectedCommentary === 'kalaignar' || selectedCommentary === 'all') && (
                <div className={selectedCommentary === 'all' ? 'pt-2.5 border-t border-[#E5E5EA]' : ''}>
                  <span className="inline-block text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md mb-1 font-tamil">
                    {languageMode === 'en' ? 'M. Karunanidhi Commentary' : 'மு. கருணாநிதி (கலைஞர்) உரை'}
                  </span>
                  <p className="text-[#1C1C1E] leading-relaxed text-xs sm:text-sm font-tamil">{couplet.kalaignar}</p>
                </div>
              )}

              {/* Word breakdown for 'all' */}
              {selectedCommentary === 'all' && (
                <div className="pt-2.5 border-t border-[#E5E5EA]">
                  <span className={`inline-block text-[11px] font-bold text-[#8E8E93] mb-1.5 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
                    {languageMode === 'en' ? 'Metered Words (7 Cir):' : 'சீர்கள் (7 சொற்கள்):'}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 font-tamil text-xs">
                    {couplet.line1.split(' ').map((word, idx) => (
                      <span key={`l1-${idx}`} className="bg-white border border-[#E5E5EA] px-2 py-0.5 rounded-lg text-[#1C1C1E] shadow-2xs font-medium">
                        {word}
                      </span>
                    ))}
                    <span className="text-[#C7C7CC] mx-0.5">•</span>
                    {couplet.line2.split(' ').map((word, idx) => (
                      <span key={`l2-${idx}`} className="bg-white border border-[#E5E5EA] px-2 py-0.5 rounded-lg text-[#1C1C1E] shadow-2xs font-medium">
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
  </div>
  );
};
