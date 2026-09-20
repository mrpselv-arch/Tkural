import React from 'react';
import { BookOpen, Sparkles, Search, Bookmark, Info, Layers, Type, Globe } from 'lucide-react';
import { TabType, LanguageMode } from '../types';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  savedCount: number;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
  onOpenChapterDrawer?: () => void;
  currentChapterNumber?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  savedCount,
  fontSize,
  setFontSize,
  languageMode,
  setLanguageMode,
  onOpenChapterDrawer,
  currentChapterNumber,
}) => {
  const cycleFontSize = () => {
    const sequence: ('sm' | 'base' | 'lg' | 'xl')[] = ['sm', 'base', 'lg', 'xl'];
    const nextIdx = (sequence.indexOf(fontSize) + 1) % sequence.length;
    setFontSize(sequence[nextIdx]);
  };

  return (
    <>
      {/* iOS Translucent Frosted Glass Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#E5E5EA] shadow-2xs w-full max-w-full overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand with Round iOS App Icon */}
            <div
              id="brand-header"
              onClick={() => setCurrentTab('reader')}
              className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
            >
              {/* Perfectly Circular App Icon */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-black/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-2 ring-orange-500/25 bg-gradient-to-b from-orange-400 to-amber-600 flex-shrink-0 group-hover:scale-105 active:scale-95 transition-all">
                <img
                  src="/icon.svg"
                  alt="திருக்குறள்"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('/icon.svg')) {
                      target.src = '/icon.svg';
                    }
                  }}
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-[#1C1C1E] font-tamil">
                    திருக்குறள்
                  </span>
                  <span className="text-[10px] sm:text-xs bg-orange-100/90 text-orange-700 font-semibold px-2 py-0.5 rounded-full border border-orange-200/80 font-mono">
                    1330
                  </span>
                </div>
                <p className="text-[11px] text-[#8E8E93] hidden md:block font-medium">
                  உரை & விளக்கம் • 1330 Couplets with Commentary
                </p>
              </div>
            </div>

            {/* Desktop iOS Segmented Navigation Control */}
            <nav className="hidden lg:flex items-center bg-[#767680]/12 p-1 rounded-2xl">
              <button
                id="tab-reader-btn"
                type="button"
                onClick={() => setCurrentTab('reader')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'reader'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Couplets' : 'குறள்கள்'}
                </span>
              </button>

              <button
                id="tab-daily-btn"
                type="button"
                onClick={() => setCurrentTab('daily')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'daily'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Daily' : 'தினசரி'}
                </span>
              </button>

              <button
                id="tab-search-btn"
                type="button"
                onClick={() => setCurrentTab('search')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'search'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-blue-500" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Search' : 'தேடல்'}
                </span>
              </button>

              <button
                id="tab-saved-btn"
                type="button"
                onClick={() => setCurrentTab('saved')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'saved'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-orange-600" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Saved' : 'பிடித்தவை'}
                </span>
                {savedCount > 0 && (
                  <span className="ml-1 bg-orange-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold shadow-2xs">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                id="tab-about-btn"
                type="button"
                onClick={() => setCurrentTab('about')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'about'
                    ? 'bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-stone-500" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Settings' : 'அமைப்புகள்'}
                </span>
              </button>
            </nav>

            {/* Desktop Right Utilities (Language & Font) */}
            <div className="hidden lg:flex items-center gap-2">
              {/* iOS Language Pill Dropdown */}
              <div className="flex items-center bg-[#767680]/12 hover:bg-[#767680]/16 transition-colors rounded-xl px-2.5 py-1 text-xs">
                <Globe className="w-3.5 h-3.5 text-orange-600 mr-1.5" />
                <select
                  id="top-language-select-desktop"
                  value={languageMode}
                  onChange={(e) => setLanguageMode(e.target.value as LanguageMode)}
                  className="bg-transparent text-xs font-semibold text-[#1C1C1E] focus:outline-hidden cursor-pointer pr-1"
                  aria-label="Select Language"
                >
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="en">English</option>
                  <option value="both">தமிழ் & ENG</option>
                </select>
              </div>

              {/* iOS Font Size Segmented Pill */}
              <div className="flex items-center bg-[#767680]/12 p-0.5 rounded-xl text-xs">
                {(['sm', 'base', 'lg', 'xl'] as const).map((sizeKey) => {
                  const labels = { sm: 'S', base: 'M', lg: 'L', xl: 'XL' };
                  return (
                    <button
                      key={sizeKey}
                      type="button"
                      onClick={() => setFontSize(sizeKey)}
                      className={`w-6 h-6 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fontSize === sizeKey
                          ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                          : 'text-[#3C3C43]/70 hover:text-[#1C1C1E]'
                      }`}
                      title={`${labels[sizeKey]} text size`}
                    >
                      {labels[sizeKey]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Header Actions (Clean, Native iOS Touch Targets) */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Language Pill */}
              <div className="flex items-center bg-[#767680]/12 rounded-xl px-2.5 py-1 text-xs">
                <Globe className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mr-1" />
                <select
                  id="top-language-select-mobile"
                  value={languageMode}
                  onChange={(e) => setLanguageMode(e.target.value as LanguageMode)}
                  className="bg-transparent text-xs font-semibold text-[#1C1C1E] focus:outline-hidden cursor-pointer"
                  aria-label="Select Language"
                >
                  <option value="ta">தமிழ்</option>
                  <option value="en">ENG</option>
                  <option value="both">தமிழ் & ENG</option>
                </select>
              </div>

              {/* Quick Chapter Selector */}
              {currentTab === 'reader' && onOpenChapterDrawer && (
                <button
                  type="button"
                  onClick={onOpenChapterDrawer}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#767680]/12 active:bg-[#767680]/20 text-[#1C1C1E] text-xs font-semibold transition-colors cursor-pointer"
                  title="Select Chapter (அதிகாரங்கள்)"
                >
                  <Layers className="w-3.5 h-3.5 text-orange-600" />
                  <span className="font-mono text-xs">
                    {currentChapterNumber ? `#${currentChapterNumber}` : '133'}
                  </span>
                </button>
              )}

              {/* Font Size Toggle */}
              <button
                type="button"
                onClick={cycleFontSize}
                className="flex items-center gap-0.5 px-2.5 py-1 rounded-xl bg-[#767680]/12 active:bg-[#767680]/20 text-[#1C1C1E] text-xs font-semibold transition-colors cursor-pointer"
                title={`Current Font: ${fontSize.toUpperCase()}`}
              >
                <Type className="w-3.5 h-3.5 text-orange-600" />
                <span className="font-mono uppercase text-[11px]">{fontSize}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* iOS Translucent Frosted Bottom Tab Bar */}
      <nav
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-[#E5E5EA] shadow-[0_-2px_10px_rgba(0,0,0,0.03)] px-1 pt-1.5 pb-safe"
      >
        <div className="grid grid-cols-5 items-center justify-around h-13 max-w-md mx-auto">
          {/* Reader Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('reader')}
            className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-90 cursor-pointer ${
              currentTab === 'reader' ? 'text-orange-600 font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className={`text-[10px] tracking-tight ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Couplets' : 'குறள்கள்'}
            </span>
          </button>

          {/* Daily Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('daily')}
            className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-90 cursor-pointer ${
              currentTab === 'daily' ? 'text-orange-600 font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className={`text-[10px] tracking-tight ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Daily' : 'தினசரி'}
            </span>
          </button>

          {/* Search Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('search')}
            className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-90 cursor-pointer ${
              currentTab === 'search' ? 'text-orange-600 font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <Search className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className={`text-[10px] tracking-tight ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Search' : 'தேடல்'}
            </span>
          </button>

          {/* Saved Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('saved')}
            className={`relative flex flex-col items-center justify-center py-1 transition-transform active:scale-90 cursor-pointer ${
              currentTab === 'saved' ? 'text-orange-600 font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <Bookmark className={`w-5 h-5 mb-0.5 stroke-[1.8] ${currentTab === 'saved' ? 'fill-orange-600' : ''}`} />
            <span className={`text-[10px] tracking-tight ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Saved' : 'பிடித்தவை'}
            </span>
            {savedCount > 0 && (
              <span className="absolute top-1 right-3.5 bg-orange-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* Settings Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('about')}
            className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-90 cursor-pointer ${
              currentTab === 'about' ? 'text-orange-600 font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <Info className="w-5 h-5 mb-0.5 stroke-[1.8]" />
            <span className={`text-[10px] tracking-tight ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Settings' : 'அமைப்புகள்'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
