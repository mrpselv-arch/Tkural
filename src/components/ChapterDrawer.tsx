import React, { useState, useMemo } from 'react';
import { Chapter, LanguageMode } from '../types';
import { Search, ChevronRight, Layers, X, BookOpen } from 'lucide-react';

interface ChapterDrawerProps {
  chapters: Chapter[];
  selectedChapterId: number;
  onSelectChapter: (chapterId: number) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  viewMode?: 'all' | 'chapter';
  onChangeViewMode?: (mode: 'all' | 'chapter') => void;
  languageMode?: LanguageMode;
}

export const ChapterDrawer: React.FC<ChapterDrawerProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  isOpenMobile,
  onCloseMobile,
  viewMode = 'all',
  onChangeViewMode,
  languageMode = 'ta',
}) => {
  const isEnglish = languageMode === 'en';
  const [sectionFilter, setSectionFilter] = useState<number>(0); // 0 = all, 1 = Aram, 2 = Porul, 3 = Inbam
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChapters = useMemo(() => {
    return chapters.filter((ch) => {
      if (sectionFilter > 0 && ch.section.id !== sectionFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        ch.id.toString() === q ||
        ch.nameTamil.toLowerCase().includes(q) ||
        ch.nameEnglish.toLowerCase().includes(q) ||
        ch.iyal.tamil.toLowerCase().includes(q) ||
        ch.iyal.english.toLowerCase().includes(q)
      );
    });
  }, [chapters, sectionFilter, searchQuery]);

  const content = (
    <div className="flex flex-col h-full bg-[#F2F2F7] border-r border-[#E5E5EA] text-[#1C1C1E]">
      {/* iOS Modal Drag Handle (Mobile) */}
      <div className="lg:hidden pt-3 pb-1 flex justify-center">
        <div className="w-9 h-1 bg-[#C7C7CC] rounded-full" />
      </div>

      {/* Drawer Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#E5E5EA] bg-white/70 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-[#1C1C1E] text-sm sm:text-base">
              {isEnglish ? 'View & Chapters' : 'பக்க அமைப்பு & அதிகாரங்கள்'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden w-7 h-7 rounded-full bg-[#E5E5EA] text-[#3C3C43] hover:bg-[#D1D1D6] flex items-center justify-center transition-colors cursor-pointer"
            title={isEnglish ? 'Close' : 'மூடுக'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY OPTION 1: All 1330 Couplets on One Page */}
        <button
          id="drawer-select-all-couplets"
          type="button"
          onClick={() => {
            onChangeViewMode?.('all');
            onCloseMobile();
          }}
          className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-all mb-3 border cursor-pointer ${
            viewMode === 'all'
              ? 'bg-orange-50 text-orange-950 font-bold border-orange-300 shadow-[0_2px_8px_rgba(234,88,12,0.12)]'
              : 'bg-white hover:bg-[#F2F2F7] text-[#1C1C1E] border-[#E5E5EA] shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${viewMode === 'all' ? 'bg-orange-500 text-white' : 'bg-[#F2F2F7] text-orange-600'}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-xs sm:text-sm font-bold leading-tight ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
                {isEnglish ? 'All Couplets (1330)' : 'அனைத்து குறள்கள் (1330)'}
              </p>
              <p className="text-[11px] text-[#8E8E93] leading-tight font-sans">
                {isEnglish ? 'Continuous Single Stream' : 'ஒரே பக்கத்தில் அனைத்து குறள்கள்'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
              viewMode === 'all' ? 'bg-orange-600 text-white' : 'bg-[#E5E5EA] text-[#3C3C43]'
            }`}
          >
            1330
          </span>
        </button>

        {/* Search Input for Chapters */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8E8E93] pointer-events-none" />
          <input
            id="chapter-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEnglish ? 'Search chapter name or number...' : 'எண் அல்லது அதிகாரம்...'}
            className="w-full pl-9 pr-3 py-2 bg-[#767680]/12 text-xs text-[#1C1C1E] rounded-xl border border-transparent placeholder-[#8E8E93] focus:outline-hidden focus:bg-white focus:border-[#E5E5EA] transition-all"
          />
        </div>

        {/* Section Segmented Control */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#767680]/12 rounded-xl text-[11px]">
          <button
            type="button"
            onClick={() => setSectionFilter(0)}
            className={`py-1 rounded-lg font-semibold transition-all text-center cursor-pointer ${
              sectionFilter === 0
                ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
            }`}
          >
            {isEnglish ? 'All' : 'அனைத்தும்'}
          </button>
          <button
            type="button"
            onClick={() => setSectionFilter(1)}
            className={`py-1 rounded-lg font-semibold transition-all text-center cursor-pointer ${
              sectionFilter === 1
                ? 'bg-white text-orange-700 shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
            }`}
            title={isEnglish ? 'Virtue (1-38)' : 'அறத்துப்பால் (1-38)'}
          >
            {isEnglish ? 'Virtue' : 'அறம்'}
          </button>
          <button
            type="button"
            onClick={() => setSectionFilter(2)}
            className={`py-1 rounded-lg font-semibold transition-all text-center cursor-pointer ${
              sectionFilter === 2
                ? 'bg-white text-teal-700 shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
            }`}
            title={isEnglish ? 'Wealth (39-108)' : 'பொருட்பால் (39-108)'}
          >
            {isEnglish ? 'Wealth' : 'பொருள்'}
          </button>
          <button
            type="button"
            onClick={() => setSectionFilter(3)}
            className={`py-1 rounded-lg font-semibold transition-all text-center cursor-pointer ${
              sectionFilter === 3
                ? 'bg-white text-rose-700 shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
            }`}
            title={isEnglish ? 'Love (109-133)' : 'இன்பத்துப்பால் (109-133)'}
          >
            {isEnglish ? 'Love' : 'இன்பம்'}
          </button>
        </div>
      </div>

      {/* Chapters Grouped Scroll List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
        {filteredChapters.map((ch) => {
          const isSelected = viewMode === 'chapter' && ch.id === selectedChapterId;
          return (
            <button
              key={ch.id}
              id={`chapter-item-${ch.id}`}
              type="button"
              onClick={() => {
                onSelectChapter(ch.id);
                onChangeViewMode?.('chapter');
                onCloseMobile();
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer border ${
                isSelected
                  ? 'bg-orange-50 border-orange-300 text-orange-950 shadow-2xs'
                  : 'bg-white hover:bg-[#F9F9FB] border-[#E5E5EA] text-[#1C1C1E]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span
                  className={`w-7 h-7 flex-shrink-0 rounded-full text-xs flex items-center justify-center font-mono font-bold ${
                    isSelected
                      ? 'bg-orange-600 text-white'
                      : 'bg-[#F2F2F7] text-[#3C3C43] group-hover:bg-[#E5E5EA]'
                  }`}
                >
                  {ch.id}
                </span>
                <div className="truncate">
                  {isEnglish ? (
                    <>
                      <p className="font-sans font-semibold text-xs sm:text-sm truncate leading-snug text-[#1C1C1E]">
                        {ch.nameEnglish}
                      </p>
                      <p className="text-[11px] text-[#8E8E93] truncate font-sans">
                        <span className="font-tamil text-[#3C3C43]">{ch.nameTamil}</span> • {ch.startCouplet}-{ch.endCouplet}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-tamil font-semibold text-xs sm:text-sm truncate leading-snug">
                        {ch.nameTamil}
                      </p>
                      <p className="text-[11px] text-[#8E8E93] truncate font-sans">
                        {ch.nameEnglish} • {ch.startCouplet}-{ch.endCouplet}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  isSelected ? 'text-orange-600 translate-x-0.5' : 'text-[#C7C7CC] group-hover:text-[#8E8E93]'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-80 xl:w-88 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 shadow-2xs">
        {content}
      </aside>

      {/* Mobile Slide-in Drawer with Backdrop */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Frosted Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div className="relative w-5/6 max-w-sm h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
