import React, { useState, useMemo } from 'react';
import { Chapter, Couplet, LanguageMode } from '../types';
import { CoupletCard } from './CoupletCard';
import { Search, Filter, BookOpen } from 'lucide-react';

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

    // 1. Direct number check (e.g. "1" or "105")
    const num = parseInt(q, 10);
    if (!isNaN(num) && num >= 1 && num <= 1330 && !isNaN(Number(q))) {
      // Find couplet by exact ID
      const exactCouplet = allCoupletEntries.find((e) => e.couplet.id === num);
      // Also if num <= 133, find chapter
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
      // Section check
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
    }).slice(0, 100); // limit to top 100 for fast rendering
  }, [searchTerm, searchTarget, sectionFilter, allCoupletEntries]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold text-stone-900 mb-1 flex items-center gap-2 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
          <Search className="w-6 h-6 text-amber-600" />
          {isEnglish ? 'Search Couplets & Chapters' : 'குறள் & அதிகாரம் தேடல் (Search)'}
        </h2>
        <p className="text-sm text-stone-600">
          {isEnglish
            ? 'Search by Couplet No (1-1330), Chapter No (1-133), English keywords, or Tamil terms'
            : 'Search by Couplet No (1-1330), Chapter No (1-133), Tamil text, or English words'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs mb-6 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
          <input
            id="main-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isEnglish
                ? 'e.g. 1, 133, virtue, love, truth, friendship, learning...'
                : 'எ.கா: 1, 133, அகர முதல, அன்பு, கல்வி, friendship, virtue...'
            }
            className={`w-full pl-11 pr-4 py-3 bg-stone-50 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-base ${isEnglish ? 'font-sans' : 'font-tamil'}`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 px-2 py-1 rounded"
            >
              {isEnglish ? 'Clear' : 'அழிக்க'}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          {/* Target filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-stone-500 font-medium">{isEnglish ? 'Target:' : 'வகை:'}</span>
            <button
              onClick={() => setSearchTarget('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                searchTarget === 'all'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isEnglish ? 'All Fields' : 'அனைத்தும்'}
            </button>
            <button
              onClick={() => setSearchTarget('tamil')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                searchTarget === 'tamil'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isEnglish ? 'Tamil Lines' : 'குறள் வரிகள்'}
            </button>
            <button
              onClick={() => setSearchTarget('commentary')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                searchTarget === 'commentary'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isEnglish ? 'Commentaries' : 'உரைகள்'}
            </button>
            <button
              onClick={() => setSearchTarget('english')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                searchTarget === 'english'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              English
            </button>
          </div>

          {/* Section filter */}
          <div className="flex items-center gap-1.5">
            <span className={`text-stone-500 font-medium ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish ? 'Section:' : 'பால்:'}
            </span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(Number(e.target.value))}
              className={`bg-stone-100 border border-stone-200 text-stone-700 rounded-md px-2 py-1 focus:outline-none focus:border-amber-500 ${isEnglish ? 'font-sans' : 'font-tamil'}`}
            >
              <option value={0}>{isEnglish ? 'All Sections' : 'அனைத்து பால்கள்'}</option>
              <option value={1}>{isEnglish ? 'Virtue (Aram)' : 'அறத்துப்பால்'}</option>
              <option value={2}>{isEnglish ? 'Wealth (Porul)' : 'பொருட்பால்'}</option>
              <option value={3}>{isEnglish ? 'Love (Inbam)' : 'இன்பத்துப்பால்'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      {searchTerm.trim() && (
        <div className="mb-4 flex items-center justify-between text-sm text-stone-600">
          <p>
            <strong className="text-stone-900">{searchResults.length}</strong>{' '}
            {isEnglish ? 'couplets found' : 'குறள்கள் கண்டறியப்பட்டன'}
          </p>
          {searchResults.length >= 100 && (
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {isEnglish ? 'Showing top 100 results' : 'முதல் 100 முடிவுகள் காட்டப்படுகின்றன'}
            </span>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
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
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-8">
            <p className={`text-stone-500 text-base mb-2 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish
                ? `No couplets found matching "${searchTerm}"`
                : `"${searchTerm}" என்ற சொல்லுக்குரிய குறள்கள் கிடைக்கவில்லை`}
            </p>
            <p className="text-xs text-stone-400">
              {isEnglish
                ? 'Try searching by couplet number (1-1330) or chapter title/number.'
                : 'குறள் எண் (1 - 1330) அல்லது அதிகாரம் பெயர் / எண் கொண்டு தேடிப்பார்க்கவும்.'}
            </p>
          </div>
        )}

        {!searchTerm.trim() && (
          <div className="text-center py-16 bg-stone-50 rounded-xl border border-dashed border-stone-200 p-8 text-stone-500">
            <BookOpen className="w-10 h-10 mx-auto text-stone-400 mb-3" />
            <p className={`text-base font-semibold text-stone-700 mb-1 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish
                ? 'Type a keyword or number to search'
                : 'தேட வேண்டிய சொல்லை அல்லது எண்ணைத் தட்டச்சு செய்யவும்'}
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {isEnglish ? (
                <>
                  For example: <span className="font-mono text-amber-700 font-bold">1</span> (first couplet),{' '}
                  <span className="font-mono text-amber-700 font-bold">virtue</span>,{' '}
                  <span className="font-mono text-amber-700 font-bold">truth</span>, or{' '}
                  <span className="font-mono text-amber-700 font-bold">கல்வி</span>.
                </>
              ) : (
                <>
                  எடுத்துக்காட்டாக: <span className="font-mono text-amber-700 font-bold">1</span> (முதல் குறள்),{' '}
                  <span className="font-mono text-amber-700 font-bold">அன்பு</span>,{' '}
                  <span className="font-mono text-amber-700 font-bold">கல்வி</span>, அல்லது{' '}
                  <span className="font-mono text-amber-700 font-bold">Truth</span> எனத் தேடலாம்.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
