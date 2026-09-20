import React from 'react';
import { Chapter, LanguageMode } from '../types';
import { ChevronLeft, ChevronRight, ChevronDown, Layers, BookOpen } from 'lucide-react';

interface ReaderToolbarProps {
  currentSectionId: number;
  currentChapter: Chapter | null;
  chaptersInCurrentSection: Chapter[];
  iyalsInCurrentSection: { tamil: string; english: string }[];
  selectedChapterId: number;
  readerViewMode: 'all' | 'chapter';
  sectionFilter?: 'all' | 'aram' | 'porul' | 'inbam';
  languageMode: LanguageMode;
  jumpInput: string;
  onSelectSection: (sectionId: number) => void;
  onSelectSectionFilter?: (filter: 'all' | 'aram' | 'porul' | 'inbam') => void;
  onSelectIyal: (iyalTamil: string) => void;
  onSelectChapter: (chapterId: number) => void;
  onNavigateChapter: (direction: 'prev' | 'next') => void;
  onJumpToCouplet: (e?: React.FormEvent) => void;
  onChangeJumpInput: (value: string) => void;
  onChangeViewMode: (mode: 'all' | 'chapter') => void;
  onOpenDrawer: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  currentSectionId,
  currentChapter,
  chaptersInCurrentSection,
  iyalsInCurrentSection,
  selectedChapterId,
  readerViewMode,
  sectionFilter = 'all',
  languageMode,
  jumpInput,
  onSelectSection,
  onSelectSectionFilter,
  onSelectIyal,
  onSelectChapter,
  onNavigateChapter,
  onJumpToCouplet,
  onChangeJumpInput,
  onChangeViewMode,
  onOpenDrawer,
}) => {
  const isEn = languageMode === 'en';

  // Section Color Styling
  const getSectionActiveColor = (sectionId: number) => {
    switch (sectionId) {
      case 1:
        return 'bg-amber-700 text-white shadow-2xs font-semibold';
      case 2:
        return 'bg-emerald-700 text-white shadow-2xs font-semibold';
      case 3:
        return 'bg-rose-700 text-white shadow-2xs font-semibold';
      default:
        return 'bg-stone-900 text-white';
    }
  };

  return (
    <div
      id="reader-compact-toolbar"
      className="bg-white rounded-2xl border border-stone-200/90 p-2 sm:p-2.5 shadow-2xs mb-3.5 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-2.5">
        {/* Row 1 / Left Block: Section Pills + Iyal & Chapter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
          {/* 1. பால் (Section) - Ultra-compact Segment Pills */}
          {readerViewMode === 'chapter' ? (
            <div
              id="section-segment-control"
              className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200/90 text-xs w-full sm:w-auto"
            >
              <button
                type="button"
                id="segment-aram-btn"
                onClick={() => onSelectSection(1)}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  currentSectionId === 1
                    ? getSectionActiveColor(1)
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium'
                }`}
                title="அறத்துப்பால்: 1 - 38 அதிகாரங்கள் (1 - 380 குறள்கள்)"
              >
                <span className={isEn ? 'font-sans' : 'font-tamil'}>
                  {isEn ? 'Virtue (1-38)' : 'அறம் (1-38)'}
                </span>
              </button>

              <button
                type="button"
                id="segment-porul-btn"
                onClick={() => onSelectSection(2)}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  currentSectionId === 2
                    ? getSectionActiveColor(2)
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium'
                }`}
                title="பொருட்பால்: 39 - 108 அதிகாரங்கள் (381 - 1080 குறள்கள்)"
              >
                <span className={isEn ? 'font-sans' : 'font-tamil'}>
                  {isEn ? 'Wealth (39-108)' : 'பொருள் (39-108)'}
                </span>
              </button>

              <button
                type="button"
                id="segment-inbam-btn"
                onClick={() => onSelectSection(3)}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  currentSectionId === 3
                    ? getSectionActiveColor(3)
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium'
                }`}
                title="இன்பத்துப்பால்: 109 - 133 அதிகாரங்கள் (1081 - 1330 குறள்கள்)"
              >
                <span className={isEn ? 'font-sans' : 'font-tamil'}>
                  {isEn ? 'Love (109-133)' : 'இன்பம் (109-133)'}
                </span>
              </button>
            </div>
          ) : (
            /* In All Mode: Quick Filter Segment */
            <div
              id="all-mode-filter-segment"
              className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200/90 text-xs w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() => onSelectSectionFilter && onSelectSectionFilter('all')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  sectionFilter === 'all'
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium'
                }`}
              >
                {isEn ? 'All (1330)' : 'அனைத்தும் (1330)'}
              </button>
              <button
                type="button"
                onClick={() => onSelectSectionFilter && onSelectSectionFilter('aram')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  sectionFilter === 'aram'
                    ? getSectionActiveColor(1)
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium'
                }`}
              >
                {isEn ? 'Virtue (1-380)' : 'அறம் (1-380)'}
              </button>
              <button
                type="button"
                onClick={() => onSelectSectionFilter && onSelectSectionFilter('porul')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  sectionFilter === 'porul'
                    ? getSectionActiveColor(2)
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium'
                }`}
              >
                {isEn ? 'Wealth (381-1080)' : 'பொருள் (381-1080)'}
              </button>
              <button
                type="button"
                onClick={() => onSelectSectionFilter && onSelectSectionFilter('inbam')}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  sectionFilter === 'inbam'
                    ? getSectionActiveColor(3)
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 font-medium'
                }`}
              >
                {isEn ? 'Love (1081-1330)' : 'இன்பம் (1081-1330)'}
              </button>
            </div>
          )}

          <span className="hidden xl:inline text-stone-300 select-none">|</span>

          {/* 2. இயல் (Iyal) - Streamlined Dropdown Pill */}
          <div className="relative flex items-center flex-1 sm:flex-initial min-w-[110px]">
            <select
              id="select-iyal-compact"
              value={currentChapter?.iyal.tamil || ''}
              onChange={(e) => onSelectIyal(e.target.value)}
              className={`w-full sm:w-auto h-8 pl-2.5 pr-6 text-xs font-semibold bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer appearance-none transition-colors max-w-[155px] truncate ${
                isEn ? 'font-sans' : 'font-tamil'
              }`}
              title={isEn ? 'Select Iyal' : 'இயல் தேர்வு'}
              aria-label={isEn ? 'Select Iyal' : 'இயல் தேர்வு'}
            >
              {iyalsInCurrentSection.map((iyal) => (
                <option key={iyal.tamil} value={iyal.tamil}>
                  {isEn ? iyal.english : iyal.tamil}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 pointer-events-none" />
          </div>

          {/* 3. அதிகாரம் (Chapter) - Unified Selector with Stepper Buttons (Prev / Next) */}
          <div
            id="chapter-stepper-group"
            className="flex items-center h-8 bg-stone-50 border border-stone-300 rounded-xl overflow-hidden shadow-2xs flex-1 sm:flex-initial"
          >
            <button
              type="button"
              id="btn-prev-chapter-compact"
              onClick={() => onNavigateChapter('prev')}
              disabled={selectedChapterId <= 1}
              className="h-full px-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer border-r border-stone-200 flex items-center justify-center"
              title={isEn ? 'Previous Chapter' : 'முந்தைய அதிகாரம்'}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="relative flex items-center flex-1 sm:flex-initial">
              <select
                id="select-chapter-compact"
                value={selectedChapterId}
                onChange={(e) => onSelectChapter(parseInt(e.target.value, 10))}
                className={`w-full sm:w-auto h-full pl-2 sm:pl-2.5 pr-6 text-xs font-semibold bg-transparent text-stone-900 focus:outline-hidden cursor-pointer appearance-none max-w-[155px] sm:max-w-[190px] truncate ${
                  isEn ? 'font-sans' : 'font-tamil'
                }`}
                title={isEn ? 'Select Chapter' : 'அதிகாரம் தேர்வு'}
                aria-label={isEn ? 'Select Chapter' : 'அதிகாரம் தேர்வு'}
              >
                {iyalsInCurrentSection.map((iyal) => (
                  <optgroup
                    key={iyal.tamil}
                    label={isEn ? `— ${iyal.english} —` : `— ${iyal.tamil} —`}
                  >
                    {chaptersInCurrentSection
                      .filter((ch) => ch.iyal.tamil === iyal.tamil)
                      .map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.id}. {isEn ? ch.nameEnglish : ch.nameTamil}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 pointer-events-none" />
            </div>

            <button
              type="button"
              id="btn-next-chapter-compact"
              onClick={() => onNavigateChapter('next')}
              disabled={selectedChapterId >= 133}
              className="h-full px-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer border-l border-stone-200 flex items-center justify-center"
              title={isEn ? 'Next Chapter' : 'அடுத்த அதிகாரம்'}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Chapter Drawer Browse Button */}
          <button
            type="button"
            id="btn-open-drawer-compact"
            onClick={onOpenDrawer}
            className="h-8 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 border border-stone-200 cursor-pointer"
            title={isEn ? 'Browse all 133 chapters in sidebar' : 'அனைத்து 133 அதிகாரங்களையும் காண்க'}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-mono text-[11px] hidden sm:inline">133</span>
          </button>
        </div>

        {/* Row 2 / Right Block: Quick Jump & Mode Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-1.5 lg:pt-0 border-t lg:border-t-0 border-stone-100 justify-end">
          {/* Quick Jump Input */}
          <form onSubmit={onJumpToCouplet} className="flex items-center gap-1">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-mono">
                #
              </span>
              <input
                type="number"
                min="1"
                max="1330"
                placeholder="1-1330"
                value={jumpInput}
                onChange={(e) => onChangeJumpInput(e.target.value)}
                className="w-18 sm:w-20 h-8 pl-5 pr-1 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono text-stone-900"
                title={isEn ? 'Jump to Couplet (1-1330)' : 'குறள் எண் (1-1330)'}
              />
            </div>
            <button
              type="submit"
              className={`h-8 px-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isEn ? 'font-sans' : 'font-tamil'
              }`}
            >
              {isEn ? 'Go' : 'செல்'}
            </button>
          </form>

          {/* Reader Mode: 10 Couplets vs 1330 All */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs h-8">
            <button
              type="button"
              id="mode-by-chapter"
              onClick={() => onChangeViewMode('chapter')}
              className={`h-full px-2 sm:px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                readerViewMode === 'chapter'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title={isEn ? '10 Couplets of Chapter' : 'அதிகாரத்தின் 10 குறள்கள்'}
            >
              <BookOpen className="w-3 h-3" />
              <span>{isEn ? '10' : '10 குறள்'}</span>
            </button>
            <button
              type="button"
              id="mode-all-couplets"
              onClick={() => onChangeViewMode('all')}
              className={`h-full px-2 sm:px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                readerViewMode === 'all'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title={isEn ? 'All 1330 Couplets' : 'அனைத்து 1330 குறள்கள்'}
            >
              <span>{isEn ? '1330' : '1330'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
