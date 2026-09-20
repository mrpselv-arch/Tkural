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
    <div className="flex flex-col h-full bg-stone-900 border-r border-stone-800 text-stone-200">
      {/* Drawer Header */}
      <div className="p-3.5 sm:p-4 border-b border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-stone-100 text-base">
              {isEnglish ? 'View Layout' : 'பக்க அமைப்பு (View)'}
            </h2>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title={isEnglish ? 'Close chapter selector' : 'மூடுக'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY OPTION 1: All 1330 Couplets on One Page */}
        <button
          id="drawer-select-all-couplets"
          onClick={() => {
            onChangeViewMode?.('all');
            onCloseMobile();
          }}
          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all mb-3 border ${
            viewMode === 'all'
              ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
              : 'bg-stone-800/80 hover:bg-stone-800 text-stone-200 border-stone-700/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className={`w-4 h-4 ${viewMode === 'all' ? 'text-stone-950' : 'text-amber-400'}`} />
            <div>
              <p className={`text-sm font-bold leading-tight ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
                {isEnglish ? 'All Couplets (1330)' : 'அனைத்து குறள்கள் (1330)'}
              </p>
              <p className={`text-[11px] leading-tight font-sans ${viewMode === 'all' ? 'text-stone-900 font-medium' : 'text-stone-400'}`}>
                {isEnglish ? 'All on One Page (133 Chapters)' : 'ஒரே பக்கத்தில் (All on One Page)'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
              viewMode === 'all' ? 'bg-stone-950 text-amber-400' : 'bg-stone-700 text-stone-300'
            }`}
          >
            1330
          </span>
        </button>

        {/* PRIMARY OPTION 2: Select Chapter Section */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800 mb-2">
          <span className={`text-xs font-bold text-amber-400 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
            {isEnglish ? 'Select Chapter (133):' : 'அதிகாரம் தேர்ந்தெடுக்க (133):'}
          </span>
          <span className="text-xs text-stone-400 font-mono">
            {filteredChapters.length}
          </span>
        </div>

        {/* Search input for chapters */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 absolute left-3 top-2 text-stone-400 pointer-events-none" />
          <input
            id="chapter-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEnglish ? 'Search number or chapter name...' : 'எண் அல்லது அதிகாரம்...'}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-800/90 text-xs text-stone-200 rounded-lg border border-stone-700/80 placeholder-stone-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Section Tabs (Virtue / Wealth / Love or அறம் / பொருள் / இன்பம்) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-950 rounded-lg text-[11px]">
          <button
            onClick={() => setSectionFilter(0)}
            className={`py-1 px-1 rounded font-medium transition-all text-center ${
              sectionFilter === 0
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {isEnglish ? 'All' : 'அனைத்தும்'}
          </button>
          <button
            onClick={() => setSectionFilter(1)}
            className={`py-1 px-1 rounded font-medium transition-all text-center ${
              sectionFilter === 1
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title={isEnglish ? 'Virtue (Chapters 1 - 38)' : 'அறத்துப்பால் (1 - 38)'}
          >
            {isEnglish ? 'Virtue (38)' : 'அறம் (38)'}
          </button>
          <button
            onClick={() => setSectionFilter(2)}
            className={`py-1 px-1 rounded font-medium transition-all text-center ${
              sectionFilter === 2
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title={isEnglish ? 'Wealth (Chapters 39 - 108)' : 'பொருட்பால் (39 - 108)'}
          >
            {isEnglish ? 'Wealth (70)' : 'பொருள் (70)'}
          </button>
          <button
            onClick={() => setSectionFilter(3)}
            className={`py-1 px-1 rounded font-medium transition-all text-center ${
              sectionFilter === 3
                ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title={isEnglish ? 'Love (Chapters 109 - 133)' : 'இன்பத்துப்பால் (109 - 133)'}
          >
            {isEnglish ? 'Love (25)' : 'இன்பம் (25)'}
          </button>
        </div>
      </div>

      {/* Chapters Scroll List */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-800/60 scrollbar-thin">
        {filteredChapters.map((ch) => {
          const isSelected = viewMode === 'chapter' && ch.id === selectedChapterId;
          return (
            <button
              key={ch.id}
              id={`chapter-item-${ch.id}`}
              onClick={() => {
                onSelectChapter(ch.id);
                onChangeViewMode?.('chapter');
                onCloseMobile();
              }}
              className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors group ${
                isSelected
                  ? 'bg-amber-500/15 border-l-4 border-amber-500 text-amber-200'
                  : 'hover:bg-stone-800/50 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span
                  className={`w-6 h-6 flex-shrink-0 rounded-md text-xs flex items-center justify-center font-mono font-bold ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-400 group-hover:text-stone-200'
                  }`}
                >
                  {ch.id}
                </span>
                <div className="truncate">
                  {isEnglish ? (
                    <>
                      <p className="font-sans font-semibold text-xs sm:text-sm truncate leading-snug text-stone-100">
                        {ch.nameEnglish}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate font-sans">
                        <span className="font-tamil text-stone-500">{ch.nameTamil}</span> • Couplets {ch.startCouplet}-{ch.endCouplet}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-tamil font-semibold text-xs sm:text-sm truncate leading-snug">
                        {ch.nameTamil}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate font-sans">
                        {ch.nameEnglish} • குறள்கள் {ch.startCouplet}-{ch.endCouplet}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  isSelected ? 'text-amber-400 translate-x-0.5' : 'text-stone-600 group-hover:text-stone-400'
                }`}
              />
            </button>
          );
        })}

        {filteredChapters.length === 0 && (
          <div className="p-8 text-center text-stone-500 text-sm">
            {isEnglish ? 'No chapters found' : 'அதிகாரங்கள் எதுவும் கிடைக்கவில்லை'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-80 h-[calc(100vh-4rem)] flex-shrink-0">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-sm h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

