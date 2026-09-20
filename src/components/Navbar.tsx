import React from 'react';
import { BookOpen, Sparkles, Search, Bookmark, Info, Code2, Smartphone, Layers, Type, Globe } from 'lucide-react';
import { TabType, LanguageMode } from '../types';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  savedCount: number;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
  onOpenInstallModal: () => void;
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
  onOpenInstallModal,
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
      {/* Top Header Bar (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo & Title */}
            <div
              id="brand-header"
              onClick={() => setCurrentTab('reader')}
              className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-amber-500/40 shadow-sm group-hover:scale-105 transition-transform bg-stone-900 flex-shrink-0">
                <img
                  src="/pwa-192x192.png"
                  alt="திருவள்ளுவர் - Thiruvalluvar"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-amber-100 font-tamil">
                    திருக்குறள்
                  </span>
                  <span className="text-[10px] sm:text-xs bg-amber-950/90 text-amber-400 border border-amber-800/80 px-1.5 py-0.2 rounded font-mono font-medium">
                    1330
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 hidden md:block">
                  Thirukkural with Commentary & Android Source
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Hidden on Mobile) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              <button
                id="tab-reader-btn"
                onClick={() => setCurrentTab('reader')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'reader'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Couplets' : 'குறள்கள்'}
                </span>
              </button>

              <button
                id="tab-daily-btn"
                onClick={() => setCurrentTab('daily')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'daily'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Daily Kural' : 'இன்றைய குறள்'}
                </span>
              </button>

              <button
                id="tab-search-btn"
                onClick={() => setCurrentTab('search')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'search'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Search className="w-4 h-4" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Search' : 'தேடல்'}
                </span>
              </button>

              <button
                id="tab-saved-btn"
                onClick={() => setCurrentTab('saved')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'saved'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'Saved' : 'சேமித்தவை'}
                </span>
                {savedCount > 0 && (
                  <span className="ml-1 bg-amber-400 text-stone-950 text-xs px-1.5 py-0.2 rounded-full font-bold">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                id="tab-about-btn"
                onClick={() => setCurrentTab('about')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'about'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Info className="w-4 h-4" />
                <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                  {languageMode === 'en' ? 'About' : 'வரலாறு'}
                </span>
              </button>

              <button
                id="tab-android-btn"
                onClick={() => setCurrentTab('android-editor')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  currentTab === 'android-editor'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-sm'
                    : 'text-emerald-400 border-emerald-800/80 hover:bg-emerald-950/40 hover:text-emerald-300'
                }`}
                title="Edit original Android repository files"
              >
                <Code2 className="w-4 h-4" />
                <span className="font-sans">Android Code</span>
              </button>

              {/* Desktop Language Selector Dropdown */}
              <div 
                id="desktop-lang-dropdown"
                className="flex items-center ml-2 pl-2 border-l border-stone-800"
              >
                <div className="flex items-center gap-1.5 bg-stone-950/90 border border-stone-800 rounded-lg px-2.5 py-1 text-xs">
                  <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <select
                    id="top-language-select-desktop"
                    value={languageMode}
                    onChange={(e) => setLanguageMode(e.target.value as LanguageMode)}
                    className="bg-transparent text-xs font-semibold text-amber-300 focus:outline-hidden cursor-pointer pr-1"
                    aria-label="Select Language"
                  >
                    <option value="ta" className="bg-stone-900 text-stone-100 font-tamil">தமிழ் (Tamil)</option>
                    <option value="en" className="bg-stone-900 text-stone-100 font-sans">English</option>
                    <option value="both" className="bg-stone-900 text-stone-100 font-sans">தமிழ் & ENG</option>
                  </select>
                </div>
              </div>

              {/* Desktop Font Size Selector */}
              <div className="flex items-center ml-2 pl-2 border-l border-stone-800 gap-1">
                <span className="text-xs text-stone-400 px-1 font-tamil">அ</span>
                <button
                  onClick={() => setFontSize('sm')}
                  className={`w-6 h-6 text-xs rounded flex items-center justify-center transition-colors ${
                    fontSize === 'sm' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:bg-stone-800'
                  }`}
                  title="Small text"
                >
                  S
                </button>
                <button
                  onClick={() => setFontSize('base')}
                  className={`w-6 h-6 text-xs rounded flex items-center justify-center transition-colors ${
                    fontSize === 'base' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:bg-stone-800'
                  }`}
                  title="Medium text"
                >
                  M
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`w-6 h-6 text-xs rounded flex items-center justify-center transition-colors ${
                    fontSize === 'lg' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:bg-stone-800'
                  }`}
                  title="Large text"
                >
                  L
                </button>
                <button
                  onClick={() => setFontSize('xl')}
                  className={`w-6 h-6 text-xs rounded flex items-center justify-center transition-colors ${
                    fontSize === 'xl' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:bg-stone-800'
                  }`}
                  title="Extra Large text"
                >
                  XL
                </button>
              </div>

              {/* Desktop Install on Phone Button */}
              <button
                id="install-phone-nav-btn"
                onClick={onOpenInstallModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md active:scale-95 ml-2"
                title="Scan QR Code or send link to install on Android phone"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install on Phone</span>
              </button>
            </nav>

            {/* Mobile Header Actions (Compact, Fits perfectly on small phone screens) */}
            <div className="flex lg:hidden items-center gap-1.5">
              {/* Language Dropdown on Mobile */}
              <div className="flex items-center bg-stone-800 border border-stone-700/80 rounded-lg px-2 py-1 text-xs">
                <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mr-1" />
                <select
                  id="top-language-select-mobile"
                  value={languageMode}
                  onChange={(e) => setLanguageMode(e.target.value as LanguageMode)}
                  className="bg-transparent text-xs font-semibold text-amber-300 focus:outline-hidden cursor-pointer font-mono"
                  aria-label="Select Language"
                >
                  <option value="ta" className="bg-stone-900 text-stone-100 font-tamil">தமிழ்</option>
                  <option value="en" className="bg-stone-900 text-stone-100 font-sans">ENG</option>
                  <option value="both" className="bg-stone-900 text-stone-100 font-sans">தமிழ் & ENG</option>
                </select>
              </div>

              {/* Quick Chapter Selector on Reader tab */}
              {currentTab === 'reader' && onOpenChapterDrawer && (
                <button
                  onClick={onOpenChapterDrawer}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/80 text-xs font-medium transition-colors"
                  title="Select Chapter (அதிகாரங்கள்)"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-amber-300">
                    {currentChapterNumber ? `#${currentChapterNumber}` : '133'}
                  </span>
                </button>
              )}

              {/* Font Size Quick Toggle */}
              <button
                onClick={cycleFontSize}
                className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/80 text-xs font-semibold transition-colors"
                title={`Current Font: ${fontSize.toUpperCase()} (tap to toggle)`}
              >
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-[11px] uppercase text-amber-300">{fontSize}</span>
              </button>

              {/* Install App Button */}
              <button
                onClick={onOpenInstallModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-xs active:scale-95"
                title="Install Thirukkural on Phone"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Install</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for single-page ergonomic phone access) */}
      <nav
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800/90 shadow-2xl px-1 pt-1 pb-safe"
      >
        <div className="grid grid-cols-5 items-center justify-around h-14 max-w-md mx-auto">
          {/* Reader Tab */}
          <button
            onClick={() => setCurrentTab('reader')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentTab === 'reader'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentTab === 'reader' ? 'bg-amber-500/20' : ''}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Couplets' : 'குறள்கள்'}
            </span>
          </button>

          {/* Daily Tab */}
          <button
            onClick={() => setCurrentTab('daily')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentTab === 'daily'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentTab === 'daily' ? 'bg-amber-500/20' : ''}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Daily' : 'தினசரி'}
            </span>
          </button>

          {/* Search Tab */}
          <button
            onClick={() => setCurrentTab('search')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentTab === 'search'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentTab === 'search' ? 'bg-amber-500/20' : ''}`}>
              <Search className="w-4 h-4" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Search' : 'தேடல்'}
            </span>
          </button>

          {/* Saved Tab */}
          <button
            onClick={() => setCurrentTab('saved')}
            className={`relative flex flex-col items-center justify-center py-1 transition-all ${
              currentTab === 'saved'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentTab === 'saved' ? 'bg-amber-500/20' : ''}`}>
              <Bookmark className="w-4 h-4" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'Saved' : 'பிடித்தவை'}
            </span>
            {savedCount > 0 && (
              <span className="absolute top-1 right-3.5 bg-amber-500 text-stone-950 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-stone-950">
                {savedCount}
              </span>
            )}
          </button>

          {/* More / About Tab */}
          <button
            onClick={() => setCurrentTab('about')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              currentTab === 'about' || currentTab === 'android-editor'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                currentTab === 'about' || currentTab === 'android-editor' ? 'bg-amber-500/20' : ''
              }`}
            >
              <Info className="w-4 h-4" />
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
              {languageMode === 'en' ? 'About' : 'விவரம்'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
