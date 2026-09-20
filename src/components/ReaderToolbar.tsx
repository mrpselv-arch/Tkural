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

  return (
    <div
      id="reader-compact-toolbar"
      className="bg-white rounded-2xl border border-[#E5E5EA] p-2.5 sm:p-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)] mb-4 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Row 1 / Left Block: iOS Segmented Control for Sections + Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Section Segmented Control */}
          {readerViewMode === 'chapter' ? (
            <div
              id="section-segment-control"
              className="flex items-center bg-[#767680]/12 p-0.5 rounded-xl text-xs w-full sm:w-auto"
            >
              <button
                type="button"
                id="segment-aram-btn"
                onClick={() => onSelectSection(1)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  currentSectionId === 1
                    ? 'bg-white text-orange-700 shadow-[0_1px_3px_rgba(0,0,0,0.12)] font-bold'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E] font-medium'
                }`}
                title="அறத்துப்பால்: 1 - 38 அதிகாரங்கள்"
              >
                <span className={isEn ? 'font-sans' : 'font-tamil'}>
                  {isEn ? 'Virtue (1-38)' : 'அறம் (1-38)'}
                </span>
              </button>

              <button
                type="button"
                id="segment-porul-btn"
                onClick={() => onSelectSection(2)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  currentSectionId === 2
                    ? 'bg-white text-teal-700 shadow-[0_1px_3px_rgba(0,0,0,0.12)] font-bold'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E] font-medium'
                }`}
                title="பொருட்பால்: 39 - 108 அதிகாரங்கள்"
              >
                <span className={isEn ? 'font-sans' : 'font-tamil'}>
                  {isEn ? 'Wealth (39-108)' : 'பொருள் (39-108)'}
                </span>
              </button>

              <button
                type="button"
                id="segment-inbam-btn"
                onClick={() => onSelectSection(3)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-center ${
                  currentSectionId === 3
                    ? 'bg-white text-rose-700 shadow-[0_1px_3px_rgba(0,0,0,0.12)] font-bold'
                    : 'text-[#3C3C43]/75 hover:text-[#1C1C1E] font-medium'
                }`}
                title="இன்பத்துப்பால்: 109 - 133 அதிகாரங்கள்"
              >
                <span className={isEn ? 'font-sans' : 'font-tamil'}>
                  {isEn ? 'Love (109-133)' : 'இன்பம் (109-133)'}
                </span>
              </button>
            </div>
          ) : (
            /* All Mode Filter Segment */
            <div
              id="all-mode-filter-segment"
              className="flex items-center bg-[#767680]/12 p-0.5 rounded-xl text-xs w-full sm:w-auto"
            >
              {(
                [
                  { id: 'all', labelEn: 'All (1330)', labelTa: 'அனைத்தும் (1330)' },
                  { id: 'aram', labelEn: 'Virtue (1-380)', labelTa: 'அறம் (1-380)' },
                  { id: 'porul', labelEn: 'Wealth (381-1080)', labelTa: 'பொருள் (381-1080)' },
                  { id: 'inbam', labelEn: 'Love (1081-1330)', labelTa: 'இன்பம் (1081-1330)' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSelectSectionFilter && onSelectSectionFilter(f.id)}
                  className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-center ${
                    sectionFilter === f.id
                      ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.12)] font-bold'
                      : 'text-[#3C3C43]/75 hover:text-[#1C1C1E] font-medium'
                  }`}
                >
                  {isEn ? f.labelEn : f.labelTa}
                </button>
              ))}
            </div>
          )}

          {/* Iyal Selector Pill */}
          <div className="relative flex items-center flex-1 sm:flex-initial min-w-[110px]">
            <select
              id="select-iyal-compact"
              value={currentChapter?.iyal.tamil || ''}
              onChange={(e) => onSelectIyal(e.target.value)}
              className={`w-full sm:w-auto h-8 pl-3 pr-7 text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] border border-[#E5E5EA] rounded-xl text-[#1C1C1E] focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 cursor-pointer appearance-none transition-colors max-w-[155px] truncate ${
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
            <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93] absolute right-2 pointer-events-none" />
          </div>

          {/* Chapter Selector with Stepper Buttons */}
          <div
            id="chapter-stepper-group"
            className="flex items-center h-8 bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl overflow-hidden shadow-2xs flex-1 sm:flex-initial"
          >
            <button
              type="button"
              id="btn-prev-chapter-compact"
              onClick={() => onNavigateChapter('prev')}
              disabled={selectedChapterId <= 1}
              className="h-full px-2 text-[#3C3C43] hover:text-[#1C1C1E] hover:bg-[#E5E5EA] disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer border-r border-[#E5E5EA] flex items-center justify-center active:scale-95"
              title={isEn ? 'Previous Chapter' : 'முந்தைய அதிகாரம்'}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="relative flex items-center flex-1 sm:flex-initial">
              <select
                id="select-chapter-compact"
                value={selectedChapterId}
                onChange={(e) => onSelectChapter(parseInt(e.target.value, 10))}
                className={`w-full sm:w-auto h-full pl-2.5 pr-7 text-xs font-semibold bg-transparent text-[#1C1C1E] focus:outline-hidden cursor-pointer appearance-none max-w-[160px] sm:max-w-[200px] truncate ${
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
              <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93] absolute right-2 pointer-events-none" />
            </div>

            <button
              type="button"
              id="btn-next-chapter-compact"
              onClick={() => onNavigateChapter('next')}
              disabled={selectedChapterId >= 133}
              className="h-full px-2 text-[#3C3C43] hover:text-[#1C1C1E] hover:bg-[#E5E5EA] disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer border-l border-[#E5E5EA] flex items-center justify-center active:scale-95"
              title={isEn ? 'Next Chapter' : 'அடுத்த அதிகாரம்'}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Chapter Drawer Button */}
          <button
            type="button"
            id="btn-open-drawer-compact"
            onClick={onOpenDrawer}
            className="h-8 px-2.5 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 border border-[#E5E5EA] cursor-pointer active:scale-95"
            title={isEn ? 'Browse all chapters' : 'அதிகாரங்கள் பட்டியல்'}
          >
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            <span className="font-mono text-[11px] hidden sm:inline">133</span>
          </button>
        </div>

        {/* Row 2 / Right Block: Quick Jump & Mode Switcher */}
        <div className="flex items-center gap-2 pt-1 lg:pt-0 border-t lg:border-t-0 border-[#E5E5EA] justify-end">
          {/* Quick Jump Input */}
          <form onSubmit={onJumpToCouplet} className="flex items-center gap-1">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] text-xs font-mono">
                #
              </span>
              <input
                type="number"
                min="1"
                max="1330"
                placeholder="1-1330"
                value={jumpInput}
                onChange={(e) => onChangeJumpInput(e.target.value)}
                className="w-20 h-8 pl-6 pr-2 text-xs bg-[#F2F2F7] border border-[#E5E5EA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 font-mono text-[#1C1C1E]"
                title={isEn ? 'Couplet number (1-1330)' : 'குறள் எண் (1-1330)'}
              />
            </div>
            <button
              type="submit"
              className={`h-8 px-3 bg-[#1C1C1E] hover:bg-black active:scale-95 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isEn ? 'font-sans' : 'font-tamil'
              }`}
            >
              {isEn ? 'Go' : 'செல்'}
            </button>
          </form>

          {/* Reader Mode (10 vs 1330) */}
          <div className="flex items-center bg-[#767680]/12 p-0.5 rounded-xl text-xs h-8">
            <button
              type="button"
              id="mode-by-chapter"
              onClick={() => onChangeViewMode('chapter')}
              className={`h-full px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                readerViewMode === 'chapter'
                  ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
              }`}
              title={isEn ? '10 Couplets of Chapter' : 'அதிகாரத்தின் 10 குறள்கள்'}
            >
              <BookOpen className="w-3 h-3 text-orange-600" />
              <span>{isEn ? '10' : '10'}</span>
            </button>
            <button
              type="button"
              id="mode-all-couplets"
              onClick={() => onChangeViewMode('all')}
              className={`h-full px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                readerViewMode === 'all'
                  ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
              }`}
              title={isEn ? 'All 1330 Couplets' : 'அனைத்து 1330 குறள்கள்'}
            >
              <span>1330</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
