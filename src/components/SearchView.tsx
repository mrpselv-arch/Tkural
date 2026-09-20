import React, { useState, useMemo } from 'react';
import { Chapter, Couplet, LanguageMode } from '../types';
import { CoupletCard } from './CoupletCard';
import { Search, BookOpen, X } from 'lucide-react';

interface SearchViewProps {
  chapters: Chapter[];
  isSaved: (id: number) => boolean;
  onToggleSave: (id: number) => void;
  fontSizeClass: string;
  languageMode?: LanguageMode;
}

export const SearchView: React.FC<SearchViewProps> = ({
  chapters,
  isSaved,
  onToggleSave,
  fontSizeClass,
  languageMode = 'ta',
}) => {
  const isEnglish = languageMode === 'en';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTarget, setSearchTarget] = useState<'all' | 'tamil' | 'english' | 'commentary'>('all');
  const [sectionFilter, setSectionFilter] = useState<number>(0);

  // Flatten all 1330 couplets with chapter references
  const allCoupletEntries = useMemo(() => {
    const list: { couplet: Couplet; chapter: Chapter }[] = [];
    for (const ch of chapters) {
      for (const c of ch.couplets) {
        list.push({ couplet: c, chapter: ch });
      }
    }
    return list;
  }, [chapters]);

  // Filtered results
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];

    // Direct number check (e.g. "1" or "105")
    const num = parseInt(q, 10);
    if (!isNaN(num) && num >= 1 && num <= 1330 && !isNaN(Number(q))) {
      const exactCouplet = allCoupletEntries.find((e) => e.couplet.id === num);
      let results = exactCouplet ? [exactCouplet] : [];
      if (num <= 133) {
        const chapterCouplets = allCoupletEntries.filter(
          (e) => e.chapter.id === num && e.couplet.id !== num
        );
        results = [...results, ...chapterCouplets];
      }
      return results;
    }

    return allCoupletEntries.filter(({ couplet, chapter }) => {
      if (sectionFilter > 0 && chapter.section.id !== sectionFilter) {
        return false;
      }

      const matchTamil =
        couplet.line1.toLowerCase().includes(q) ||
        couplet.line2.toLowerCase().includes(q) ||
        chapter.nameTamil.toLowerCase().includes(q);

      const matchEnglish =
        couplet.englishLine1.toLowerCase().includes(q) ||
        couplet.englishLine2.toLowerCase().includes(q) ||
        couplet.explanation.toLowerCase().includes(q) ||
        chapter.nameEnglish.toLowerCase().includes(q);

      const matchCommentary =
        couplet.muva.toLowerCase().includes(q) ||
        couplet.solomon.toLowerCase().includes(q) ||
        couplet.kalaignar.toLowerCase().includes(q);

      if (searchTarget === 'tamil') return matchTamil;
      if (searchTarget === 'english') return matchEnglish;
      if (searchTarget === 'commentary') return matchCommentary;
      return matchTamil || matchEnglish || matchCommentary;
    }).slice(0, 100);
  }, [searchTerm, searchTarget, sectionFilter, allCoupletEntries]);

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* Search Header */}
      <div className="mb-4">
        <h2 className={`text-xl sm:text-2xl font-bold text-[#1C1C1E] mb-1 flex items-center gap-2 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
          <Search className="w-5 h-5 text-orange-600" />
          {isEnglish ? 'Search Couplets & Chapters' : 'குறள் & அதிகாரம் தேடல்'}
        </h2>
        <p className="text-xs sm:text-sm text-[#8E8E93]">
          {isEnglish
            ? 'Search by Couplet No (1-1330), Chapter No (1-133), English keywords, or Tamil terms'
            : 'குறள் எண் (1-1330), அதிகாரம் (1-133), தமிழ் அல்லது ஆங்கிலச் சொற்கள் மூலம் தேடலாம்'}
        </p>
      </div>

      {/* iOS Search Bar Card */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E5EA] shadow-[0_1px_4px_rgba(0,0,0,0.03)] mb-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8E93] pointer-events-none" />
          <input
            id="main-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isEnglish
                ? 'e.g. 1, 133, virtue, love, truth, friendship, learning...'
                : 'எ.கா: 1, 133, அகர முதல, அன்பு, கல்வி, truth, virtue...'
            }
            className={`w-full pl-10 pr-10 py-2.5 bg-[#767680]/12 rounded-xl text-[#1C1C1E] placeholder-[#8E8E93] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-sm transition-all ${isEnglish ? 'font-sans' : 'font-tamil'}`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 w-5 h-5 rounded-full bg-[#8E8E93] text-white flex items-center justify-center hover:bg-[#636366] transition-colors cursor-pointer"
              title={isEnglish ? 'Clear' : 'அழிக்க'}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
          {/* Target filter Segment */}
          <div className="flex items-center gap-1 bg-[#767680]/12 p-0.5 rounded-xl flex-wrap">
            <button
              type="button"
              onClick={() => setSearchTarget('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchTarget === 'all'
                  ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
              }`}
            >
              {isEnglish ? 'All' : 'அனைத்தும்'}
            </button>
            <button
              type="button"
              onClick={() => setSearchTarget('tamil')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchTarget === 'tamil'
                  ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
              }`}
            >
              {isEnglish ? 'Tamil Lines' : 'வரிகள்'}
            </button>
            <button
              type="button"
              onClick={() => setSearchTarget('commentary')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchTarget === 'commentary'
                  ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
              }`}
            >
              {isEnglish ? 'Commentary' : 'உரைகள்'}
            </button>
            <button
              type="button"
              onClick={() => setSearchTarget('english')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchTarget === 'english'
                  ? 'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
              }`}
            >
              English
            </button>
          </div>

          {/* Section filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(Number(e.target.value))}
              className={`bg-[#F2F2F7] border border-[#E5E5EA] text-[#1C1C1E] rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-hidden cursor-pointer ${isEnglish ? 'font-sans' : 'font-tamil'}`}
            >
              <option value={0}>{isEnglish ? 'All Sections' : 'அனைத்து பால்கள்'}</option>
              <option value={1}>{isEnglish ? 'Virtue (Aram)' : 'அறத்துப்பால்'}</option>
              <option value={2}>{isEnglish ? 'Wealth (Porul)' : 'பொருட்பால்'}</option>
              <option value={3}>{isEnglish ? 'Love (Inbam)' : 'இன்பத்துப்பால்'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      {searchTerm.trim() && (
        <div className="mb-3 flex items-center justify-between text-xs sm:text-sm text-[#8E8E93] px-1">
          <p>
            <strong className="text-[#1C1C1E]">{searchResults.length}</strong>{' '}
            {isEnglish ? 'couplets found' : 'குறள்கள் கிடைத்தன'}
          </p>
          {searchResults.length >= 100 && (
            <span className="text-[11px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              {isEnglish ? 'Showing top 100' : 'முதல் 100 முடிவுகள்'}
            </span>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {searchResults.map(({ couplet, chapter }) => (
          <CoupletCard
            key={couplet.id}
            couplet={couplet}
            chapterNameTamil={`அதிகாரம் ${chapter.id}: ${chapter.nameTamil}`}
            chapterNameEnglish={`Chapter ${chapter.id}: ${chapter.nameEnglish}`}
            isSaved={isSaved(couplet.id)}
            onToggleSave={onToggleSave}
            fontSizeClass={fontSizeClass}
            languageMode={languageMode}
          />
        ))}

        {searchTerm.trim() && searchResults.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E5EA] p-8">
            <p className={`text-[#8E8E93] text-sm sm:text-base mb-1 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish
                ? `No couplets found matching "${searchTerm}"`
                : `"${searchTerm}" என்ற சொல்லுக்குரிய குறள்கள் கிடைக்கவில்லை`}
            </p>
            <p className="text-xs text-[#C7C7CC]">
              {isEnglish
                ? 'Try searching by couplet number (1-1330) or chapter title/number.'
                : 'குறள் எண் (1 - 1330) அல்லது அதிகாரம் பெயர் கொண்டு தேடிப்பார்க்கவும்.'}
            </p>
          </div>
        )}

        {!searchTerm.trim() && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E5EA] p-8 text-[#8E8E93]">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className={`text-sm sm:text-base font-semibold text-[#1C1C1E] mb-1 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish
                ? 'Type a keyword or number to search'
                : 'தேட வேண்டிய சொல்லை அல்லது எண்ணைத் தட்டச்சு செய்யவும்'}
            </p>
            <p className="text-xs text-[#8E8E93] max-w-md mx-auto">
              {isEnglish ? (
                <>
                  Example: <span className="font-mono text-orange-600 font-bold">1</span> (first couplet),{' '}
                  <span className="font-mono text-orange-600 font-bold">virtue</span>,{' '}
                  <span className="font-mono text-orange-600 font-bold">truth</span>, or{' '}
                  <span className="font-mono text-orange-600 font-bold">கல்வி</span>.
                </>
              ) : (
                <>
                  எடுத்துக்காட்டாக: <span className="font-mono text-orange-600 font-bold">1</span> (முதல் குறள்),{' '}
                  <span className="font-mono text-orange-600 font-bold">அன்பு</span>,{' '}
                  <span className="font-mono text-orange-600 font-bold">கல்வி</span>, அல்லது{' '}
                  <span className="font-mono text-orange-600 font-bold">Truth</span> எனத் தேடலாம்.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
