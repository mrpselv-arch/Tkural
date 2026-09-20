/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Chapter, Couplet, TabType, ThirukkuralData, LanguageMode } from './types';
import { Navbar } from './components/Navbar';
import { ChapterDrawer } from './components/ChapterDrawer';
import { CoupletCard } from './components/CoupletCard';
import { DailyKuralView } from './components/DailyKuralView';
import { SearchView } from './components/SearchView';
import { SavedView } from './components/SavedView';
import { AboutView } from './components/AboutView';
import { AndroidEditor } from './components/AndroidEditor';
import { InstallModal } from './components/InstallModal';
import { ReaderToolbar } from './components/ReaderToolbar';
import { Layers, ChevronLeft, ChevronRight, BookOpen, AlertCircle, Sparkles, Hash, ArrowRight, ArrowDown, Globe } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<ThirukkuralData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState<TabType>('reader');
  const [readerViewMode, setReaderViewMode] = useState<'all' | 'chapter'>('chapter');
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('sm');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Couplet Display Language Mode: 'ta' (Tamil), 'en' (English), 'both' (Both)
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem('thirukkural_language_mode');
      if (saved === 'ta' || saved === 'en' || saved === 'both') return saved;
    } catch {
      // ignore
    }
    return 'ta';
  });

  useEffect(() => {
    try {
      localStorage.setItem('thirukkural_language_mode', languageMode);
    } catch {
      // ignore
    }
  }, [languageMode]);

  // All couplets mode states
  const [sectionFilter, setSectionFilter] = useState<'all' | 'aram' | 'porul' | 'inbam'>('all');
  const [jumpInput, setJumpInput] = useState<string>('');
  const [displayedAllLimit, setDisplayedAllLimit] = useState<number>(150);

  // Saved / Bookmarked couplets from localStorage
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('thirukkural_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('thirukkural_bookmarks', JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  // Fetch Thirukkural data
  useEffect(() => {
    fetch('/data/thirukkural.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((jsonData: ThirukkuralData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Thirukkural data:', err);
        setError('Failed to load Thirukkural data. Please refresh or check the server.');
        setLoading(false);
      });
  }, []);

  // Precompute flattened couplets list with chapter info
  const allCoupletsWithChapter = useMemo(() => {
    if (!data) return [];
    const list: { couplet: Couplet; chapter: Chapter }[] = [];
    for (const chapter of data.chapters) {
      for (const couplet of chapter.couplets) {
        list.push({ couplet, chapter });
      }
    }
    return list;
  }, [data]);

  // Filtered couplets based on section filter
  const filteredAllCouplets = useMemo(() => {
    if (sectionFilter === 'all') return allCoupletsWithChapter;
    if (sectionFilter === 'aram') {
      return allCoupletsWithChapter.filter((item) => item.chapter.id <= 38);
    }
    if (sectionFilter === 'porul') {
      return allCoupletsWithChapter.filter((item) => item.chapter.id >= 39 && item.chapter.id <= 108);
    }
    if (sectionFilter === 'inbam') {
      return allCoupletsWithChapter.filter((item) => item.chapter.id >= 109);
    }
    return allCoupletsWithChapter;
  }, [allCoupletsWithChapter, sectionFilter]);

  // Current active Chapter
  const currentChapter = useMemo(() => {
    if (!data?.chapters?.length) return null;
    return data.chapters.find((ch) => ch.id === selectedChapterId) || data.chapters[0];
  }, [data, selectedChapterId]);

  // Current active Section (பால்) ID: 1 = Aram, 2 = Porul, 3 = Inbam
  const currentSectionId = currentChapter?.section?.id || 1;

  // Chapters belonging to the current Section (பால்)
  const chaptersInCurrentSection = useMemo(() => {
    if (!data?.chapters) return [];
    return data.chapters.filter((ch) => ch.section.id === currentSectionId);
  }, [data, currentSectionId]);

  // Distinct Iyals (இயல்) in the current Section (பால்)
  const iyalsInCurrentSection = useMemo(() => {
    const list: { tamil: string; english: string }[] = [];
    const seen = new Set<string>();
    for (const ch of chaptersInCurrentSection) {
      if (!seen.has(ch.iyal.tamil)) {
        seen.add(ch.iyal.tamil);
        list.push(ch.iyal);
      }
    }
    return list;
  }, [chaptersInCurrentSection]);

  // Chapters belonging to the current Iyal (இயல்)
  const chaptersInCurrentIyal = useMemo(() => {
    if (!currentChapter) return [];
    return chaptersInCurrentSection.filter((ch) => ch.iyal.tamil === currentChapter.iyal.tamil);
  }, [chaptersInCurrentSection, currentChapter]);

  // Handler: Selecting a Section (பால்)
  // Requirement 1: Upon selecting section, first chapter of the section becomes default in dropdown
  // Requirement 2: Shows 10 couplets from database without scrolling down through 1330 couplets
  const handleSelectSection = (newSectionId: number) => {
    if (!data?.chapters) return;
    const firstCh = data.chapters.find((ch) => ch.section.id === newSectionId);
    if (firstCh) {
      setSelectedChapterId(firstCh.id);
      setReaderViewMode('chapter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handler: Selecting an Iyal (இயல்)
  const handleSelectIyal = (newIyalTamil: string) => {
    if (!data?.chapters) return;
    const firstChOfIyal = chaptersInCurrentSection.find((ch) => ch.iyal.tamil === newIyalTamil);
    if (firstChOfIyal) {
      setSelectedChapterId(firstChOfIyal.id);
      setReaderViewMode('chapter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handler: Selecting an Adhigaram / Chapter (அதிகாரம்)
  const handleSelectChapter = (chId: number) => {
    setSelectedChapterId(chId);
    setReaderViewMode('chapter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Stepping Prev / Next Chapter
  const handleNavigateChapter = (direction: 'prev' | 'next') => {
    const newId = direction === 'prev' ? Math.max(1, selectedChapterId - 1) : Math.min(133, selectedChapterId + 1);
    setSelectedChapterId(newId);
    setReaderViewMode('chapter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Quick Jump to Couplet (1 - 1330)
  const handleJumpToCouplet = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(jumpInput.trim(), 10);
    if (isNaN(num) || num < 1 || num > 1330 || !data) return;

    const chapterId = Math.ceil(num / 10);
    setSelectedChapterId(chapterId);
    setReaderViewMode('chapter');
    setJumpInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = (coupletId: number) => {
    setSavedIds((prev) =>
      prev.includes(coupletId)
        ? prev.filter((id) => id !== coupletId)
        : [...prev, coupletId]
    );
  };

  const handleClearAllSaved = () => {
    setSavedIds([]);
  };

  const fontSizeClasses = {
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        savedCount={savedIds.length}
        fontSize={fontSize}
        setFontSize={setFontSize}
        languageMode={languageMode}
        setLanguageMode={setLanguageMode}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenChapterDrawer={() => setIsMobileDrawerOpen(true)}
        currentChapterNumber={currentChapter?.id}
      />

      {/* Main Content Area (pb-20 on mobile ensures bottom navigation never covers content) */}
      <main className="flex-1 flex flex-col pb-20 lg:pb-8 w-full max-w-full overflow-x-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mb-4" />
            <h2 className="font-tamil text-xl font-bold text-stone-800">திருக்குறள் தரவுகள் ஏற்றப்படுகின்றன...</h2>
            <p className="text-xs text-stone-500 mt-1">Loading all 133 chapters and 1330 couplets</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-600 mb-3" />
            <h2 className="text-lg font-bold text-stone-800">{error}</h2>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700"
            >
              மீண்டும் முயற்சி செய்க (Retry)
            </button>
          </div>
        ) : data ? (
          <>
            {/* TAB: Reader (Main 133 Chapters & Couplets View) */}
            {currentTab === 'reader' && (
              <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
                {/* Left Drawer (Desktop & Mobile) */}
                <ChapterDrawer
                  chapters={data.chapters}
                  selectedChapterId={selectedChapterId}
                  viewMode={readerViewMode}
                  onChangeViewMode={(mode) => setReaderViewMode(mode)}
                  onSelectChapter={(id) => {
                    handleSelectChapter(id);
                  }}
                  isOpenMobile={isMobileDrawerOpen}
                  onCloseMobile={() => setIsMobileDrawerOpen(false)}
                />

                {/* Right Area: Couplets View */}
                <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-4xl mx-auto w-full">
                  {/* Primary Inline Navigation Bar (Redesigned Compact Breadcrumb & Hierarchy Suite) */}
                  <ReaderToolbar
                    currentSectionId={currentSectionId}
                    currentChapter={currentChapter}
                    chaptersInCurrentSection={chaptersInCurrentSection}
                    iyalsInCurrentSection={iyalsInCurrentSection}
                    selectedChapterId={selectedChapterId}
                    readerViewMode={readerViewMode}
                    sectionFilter={sectionFilter}
                    languageMode={languageMode}
                    jumpInput={jumpInput}
                    onSelectSection={handleSelectSection}
                    onSelectSectionFilter={(filter) => setSectionFilter(filter)}
                    onSelectIyal={handleSelectIyal}
                    onSelectChapter={handleSelectChapter}
                    onNavigateChapter={handleNavigateChapter}
                    onJumpToCouplet={handleJumpToCouplet}
                    onChangeJumpInput={(val) => setJumpInput(val)}
                    onChangeViewMode={(mode) => setReaderViewMode(mode)}
                    onOpenDrawer={() => setIsMobileDrawerOpen(true)}
                  />

                  {/* Mode 1: ALL COUPLETS ON ONE PAGE (Without Explanation) */}
                  {readerViewMode === 'all' && (
                    <div>
                      {/* Hint Banner */}
                      <div className="mb-4 px-4 py-2.5 bg-amber-500/10 border border-amber-300/50 rounded-xl flex items-center justify-between text-xs text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                            {languageMode === 'en'
                              ? 'Click any couplet or "Meaning" to expand full commentaries and translations inline.'
                              : 'குறளைத் தட்டினால் அல்லது "உரை" பொத்தானை அழுத்தினால் அனைத்து விளக்கவுரைகளும் விரிவடையும்.'}
                          </span>
                        </span>
                        <span className="text-[11px] text-amber-800 font-mono hidden sm:inline">
                          {languageMode === 'en'
                            ? `Showing: ${Math.min(displayedAllLimit, filteredAllCouplets.length)} / ${filteredAllCouplets.length}`
                            : `காட்டப்படுபவை: ${Math.min(displayedAllLimit, filteredAllCouplets.length)} / ${filteredAllCouplets.length}`}
                        </span>
                      </div>

                      {/* Couplets List */}
                      <div className="space-y-2.5 sm:space-y-3">
                        {filteredAllCouplets.slice(0, displayedAllLimit).map((item, index) => {
                          const isFirstOfChapter = item.couplet.id % 10 === 1;
                          return (
                            <React.Fragment key={item.couplet.id}>
                              {/* Chapter Header Anchor before first couplet of chapter */}
                              {isFirstOfChapter && (
                                <div
                                  id={`chapter-anchor-${item.chapter.id}`}
                                  className="pt-4 pb-2 border-b border-stone-200/90 flex items-center justify-between mt-6 first:mt-0"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-mono">
                                        {languageMode === 'en' ? `Chapter ${item.chapter.id}` : `அதிகாரம் ${item.chapter.id}`}
                                      </span>
                                      <span className="text-xs text-stone-500">
                                        {languageMode === 'en'
                                          ? `${item.chapter.section.english} • ${item.chapter.iyal.english}`
                                          : `${item.chapter.section.tamil} • ${item.chapter.iyal.tamil}`}
                                      </span>
                                    </div>
                                    {languageMode === 'en' ? (
                                      <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-sans mt-1">
                                        {item.chapter.nameEnglish}
                                        <span className="text-xs font-normal text-stone-500 ml-2 font-tamil">
                                          ({item.chapter.nameTamil})
                                        </span>
                                      </h3>
                                    ) : (
                                      <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-tamil mt-1">
                                        {item.chapter.nameTamil}
                                        <span className="text-xs font-normal text-stone-500 ml-2 font-sans">
                                          ({item.chapter.nameEnglish})
                                        </span>
                                      </h3>
                                    )}
                                  </div>
                                  <span className="text-xs font-mono text-stone-400">
                                    {languageMode === 'en'
                                      ? `Couplets ${item.chapter.startCouplet} - ${item.chapter.endCouplet}`
                                      : `குறள் ${item.chapter.startCouplet} - ${item.chapter.endCouplet}`}
                                  </span>
                                </div>
                              )}

                              {/* Couplet Card */}
                              <CoupletCard
                                couplet={item.couplet}
                                chapterNameTamil={`அதிகாரம் ${item.chapter.id}: ${item.chapter.nameTamil}`}
                                chapterNameEnglish={`Chapter ${item.chapter.id}: ${item.chapter.nameEnglish}`}
                                isSaved={savedIds.includes(item.couplet.id)}
                                onToggleSave={handleToggleSave}
                                fontSizeClass={fontSizeClasses[fontSize]}
                                languageMode={languageMode}
                              />
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Load More Pagination Bar */}
                      {displayedAllLimit < filteredAllCouplets.length && (
                        <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200 text-center shadow-xs flex flex-col sm:flex-row items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setDisplayedAllLimit((prev) => Math.min(filteredAllCouplets.length, prev + 100))}
                            className={`w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}
                          >
                            <ArrowDown className="w-4 h-4" />
                            <span>{languageMode === 'en' ? 'Load 100 More Couplets (+100)' : 'மேலும் 100 குறள்கள் ஏற்றுக (+100)'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDisplayedAllLimit(filteredAllCouplets.length)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs transition-colors"
                          >
                            {languageMode === 'en'
                              ? `Show all ${filteredAllCouplets.length} couplets now`
                              : `அனைத்து ${filteredAllCouplets.length} குறள்களையும் உடனே காட்டு`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2: CHAPTER BY CHAPTER (Shows ONLY the 10 Couplets of the selected chapter) */}
                  {readerViewMode === 'chapter' && currentChapter && (
                    <div>
                      {/* Chapter Header Banner */}
                      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 shadow-2xs mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white font-mono text-xs font-bold">
                                {languageMode === 'en' ? `Chapter ${currentChapter.id} / 133` : `அதிகாரம் ${currentChapter.id} / 133`}
                              </span>
                              <span className={`text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
                                {languageMode === 'en'
                                  ? `${currentChapter.section.english} • ${currentChapter.iyal.english}`
                                  : `${currentChapter.section.tamil} • ${currentChapter.iyal.tamil}`}
                              </span>
                            </div>
                            {languageMode === 'en' ? (
                              <>
                                <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-sans">
                                  {currentChapter.nameEnglish}
                                </h2>
                                <p className="text-xs text-stone-600 font-medium font-tamil mt-0.5">
                                  {currentChapter.nameTamil} • Couplets {currentChapter.startCouplet} - {currentChapter.endCouplet} (10 Couplets)
                                </p>
                              </>
                            ) : (
                              <>
                                <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-tamil">
                                  {currentChapter.nameTamil}
                                </h2>
                                <p className="text-xs text-stone-600 font-medium font-sans mt-0.5">
                                  {currentChapter.nameEnglish} • குறள்கள் {currentChapter.startCouplet} - {currentChapter.endCouplet} (10 குறள்கள்)
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 10 Couplet Cards */}
                      <div className="space-y-2.5 sm:space-y-3">
                        {currentChapter.couplets.map((couplet) => (
                          <CoupletCard
                            key={couplet.id}
                            couplet={couplet}
                            chapterNameTamil={`அதிகாரம் ${currentChapter.id}: ${currentChapter.nameTamil}`}
                            chapterNameEnglish={`Chapter ${currentChapter.id}: ${currentChapter.nameEnglish}`}
                            isSaved={savedIds.includes(couplet.id)}
                            onToggleSave={handleToggleSave}
                            fontSizeClass={fontSizeClasses[fontSize]}
                            languageMode={languageMode}
                          />
                        ))}
                      </div>

                      {/* Chapter Bottom Navigation Footer */}
                      <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
                        <button
                          onClick={() => handleNavigateChapter('prev')}
                          disabled={selectedChapterId <= 1}
                          className={`flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-30 transition-colors shadow-2xs cursor-pointer ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>{languageMode === 'en' ? 'Previous Chapter' : 'முந்தைய அதிகாரம்'}</span>
                        </button>

                        <div className="text-center font-mono text-xs text-stone-500">
                          {languageMode === 'en' ? `Chapter ${selectedChapterId} / 133` : `அதிகாரம் ${selectedChapterId} / 133`}
                        </div>

                        <button
                          onClick={() => handleNavigateChapter('next')}
                          disabled={selectedChapterId >= 133}
                          className={`flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-30 transition-colors shadow-2xs cursor-pointer ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}
                        >
                          <span>{languageMode === 'en' ? 'Next Chapter' : 'அடுத்த அதிகாரம்'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Daily Kural */}
            {currentTab === 'daily' && (
              <DailyKuralView
                chapters={data.chapters}
                isSaved={(id) => savedIds.includes(id)}
                onToggleSave={handleToggleSave}
                onGoToChapter={(chapterId) => {
                  setSelectedChapterId(chapterId);
                  setCurrentTab('reader');
                }}
                fontSizeClass={fontSizeClasses[fontSize]}
                languageMode={languageMode}
              />
            )}

            {/* TAB: Search */}
            {currentTab === 'search' && (
              <SearchView
                chapters={data.chapters}
                isSaved={(id) => savedIds.includes(id)}
                onToggleSave={handleToggleSave}
                fontSizeClass={fontSizeClasses[fontSize]}
                languageMode={languageMode}
              />
            )}

            {/* TAB: Saved Couplets */}
            {currentTab === 'saved' && (
              <SavedView
                chapters={data.chapters}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                onClearAll={handleClearAllSaved}
                fontSizeClass={fontSizeClasses[fontSize]}
                languageMode={languageMode}
              />
            )}

            {/* TAB: About */}
            {currentTab === 'about' && (
              <AboutView
                onOpenAndroidEditor={() => setCurrentTab('android-editor')}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
              />
            )}

            {/* TAB: Android Source Code Editor */}
            {currentTab === 'android-editor' && (
              <AndroidEditor onBack={() => setCurrentTab('reader')} />
            )}
          </>
        ) : null}
      </main>

      {/* Install on Phone / QR Code Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
