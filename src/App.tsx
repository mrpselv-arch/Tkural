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
import { ReaderToolbar } from './components/ReaderToolbar';
import { notificationManager } from './utils/notificationManager';
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

  // Expose global function for Android navigation drawer bridge
  useEffect(() => {
    (window as any).openChapter = (chapId: number) => {
      if (chapId >= 1 && chapId <= 133) {
        setSelectedChapterId(chapId);
        setCurrentTab('reader');
        setReaderViewMode('chapter');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    (window as any).openTab = (tab: TabType) => {
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    (window as any).openAbout = () => {
      setCurrentTab('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    (window as any).openSettings = () => {
      setCurrentTab('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    (window as any).openSearch = () => {
      setCurrentTab('search');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }, []);

  // Fetch Thirukkural data
  useEffect(() => {
    const loadData = async () => {
      const candidates = ['./data/thirukkural.json', 'data/thirukkural.json', '/data/thirukkural.json'];
      let loadedData: ThirukkuralData | null = null;
      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            loadedData = await res.json();
            break;
          }
        } catch {
          // try next candidate
        }
      }

      if (loadedData) {
        setData(loadedData);
        setLoading(false);
      } else {
        console.error('Failed to load Thirukkural data from candidates');
        setError('Failed to load Thirukkural data. Please refresh or check the server.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Everyday Notification Scheduler for Daily Couplet
  useEffect(() => {
    if (!data?.chapters?.length) return;

    notificationManager.setOnClickCallback(() => {
      setCurrentTab('daily');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    notificationManager.startScheduler(() => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      const dailyId = (dayOfYear % 1330) + 1;
      for (const ch of data.chapters) {
        const found = ch.couplets.find((c) => c.id === dailyId);
        if (found) {
          return { couplet: found, chapter: ch };
        }
      }
      return null;
    }, languageMode);

    return () => {
      notificationManager.stopScheduler();
    };
  }, [data, languageMode]);

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
    <div className="min-h-screen flex flex-col bg-[#F2F2F7] text-[#1C1C1E] font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        savedCount={savedIds.length}
        fontSize={fontSize}
        setFontSize={setFontSize}
        languageMode={languageMode}
        setLanguageMode={setLanguageMode}
        onOpenChapterDrawer={() => setIsMobileDrawerOpen(true)}
        currentChapterNumber={currentChapter?.id}
      />

      {/* Main Content Area (pb-20 on mobile ensures bottom navigation never covers content) */}
      <main className="flex-1 flex flex-col pb-20 lg:pb-8 w-full max-w-full overflow-x-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-orange-500 border-t-transparent animate-spin mb-3" />
            <h2 className="font-tamil text-lg font-bold text-[#1C1C1E]">திருக்குறள் தரவுகள் ஏற்றப்படுகின்றன...</h2>
            <p className="text-xs text-[#8E8E93] mt-1">Loading all 133 chapters and 1330 couplets</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="w-10 h-10 text-rose-600 mb-2" />
            <h2 className="text-base font-bold text-[#1C1C1E]">{error}</h2>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-xl font-semibold text-xs hover:bg-orange-700 active:scale-95 transition-all cursor-pointer"
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
                <div className="flex-1 p-3.5 sm:p-5 lg:p-6 overflow-y-auto max-w-4xl mx-auto w-full">
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
                      <div className="mb-3.5 px-4 py-2 bg-orange-50/80 border border-orange-200/80 rounded-2xl flex items-center justify-between text-xs text-orange-950 shadow-2xs">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                          <span className={languageMode === 'en' ? 'font-sans' : 'font-tamil'}>
                            {languageMode === 'en'
                              ? 'Click any couplet or "Meaning" to expand full commentaries and translations inline.'
                              : 'குறளைத் தட்டினால் அல்லது "உரை" பொத்தானை அழுத்தினால் அனைத்து விளக்கவுரைகளும் விரிவடையும்.'}
                          </span>
                        </span>
                        <span className="text-[11px] text-orange-800 font-mono hidden sm:inline">
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
                                  className="pt-4 pb-2 border-b border-[#E5E5EA] flex items-center justify-between mt-5 first:mt-0"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 rounded-full font-mono">
                                        {languageMode === 'en' ? `Chapter ${item.chapter.id}` : `அதிகாரம் ${item.chapter.id}`}
                                      </span>
                                      <span className="text-xs text-[#8E8E93]">
                                        {languageMode === 'en'
                                          ? `${item.chapter.section.english} • ${item.chapter.iyal.english}`
                                          : `${item.chapter.section.tamil} • ${item.chapter.iyal.tamil}`}
                                      </span>
                                    </div>
                                    {languageMode === 'en' ? (
                                      <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-sans mt-1">
                                        {item.chapter.nameEnglish}
                                        <span className="text-xs font-normal text-[#8E8E93] ml-2 font-tamil">
                                          ({item.chapter.nameTamil})
                                        </span>
                                      </h3>
                                    ) : (
                                      <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-tamil mt-1">
                                        {item.chapter.nameTamil}
                                        <span className="text-xs font-normal text-[#8E8E93] ml-2 font-sans">
                                          ({item.chapter.nameEnglish})
                                        </span>
                                      </h3>
                                    )}
                                  </div>
                                  <span className="text-xs font-mono text-[#8E8E93]">
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
                        <div className="mt-6 p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E5EA] text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setDisplayedAllLimit((prev) => Math.min(filteredAllCouplets.length, prev + 100))}
                            className={`w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                            <span>{languageMode === 'en' ? 'Load 100 More (+100)' : 'மேலும் 100 குறள்கள் ஏற்றுக (+100)'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDisplayedAllLimit(filteredAllCouplets.length)}
                            className="w-full sm:w-auto px-4 py-2.5 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] rounded-xl font-semibold text-xs transition-all active:scale-95 cursor-pointer border border-[#E5E5EA]"
                          >
                            {languageMode === 'en'
                              ? `Show all ${filteredAllCouplets.length}`
                              : `அனைத்து ${filteredAllCouplets.length} குறள்களையும் காட்டு`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2: CHAPTER BY CHAPTER (Shows ONLY the 10 Couplets of the selected chapter) */}
                  {readerViewMode === 'chapter' && currentChapter && (
                    <div>
                      {/* Chapter Header Banner */}
                      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-3.5 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#1C1C1E] text-white font-mono text-xs font-bold shadow-2xs">
                                {languageMode === 'en' ? `Chapter ${currentChapter.id} / 133` : `அதிகாரம் ${currentChapter.id} / 133`}
                              </span>
                              <span className={`text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 rounded-full ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}>
                                {languageMode === 'en'
                                  ? `${currentChapter.section.english} • ${currentChapter.iyal.english}`
                                  : `${currentChapter.section.tamil} • ${currentChapter.iyal.tamil}`}
                              </span>
                            </div>
                            {languageMode === 'en' ? (
                              <>
                                <h2 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-sans">
                                  {currentChapter.nameEnglish}
                                </h2>
                                <p className="text-xs text-[#8E8E93] font-medium font-tamil mt-0.5">
                                  {currentChapter.nameTamil} • Couplets {currentChapter.startCouplet} - {currentChapter.endCouplet} (10 Couplets)
                                </p>
                              </>
                            ) : (
                              <>
                                <h2 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-tamil">
                                  {currentChapter.nameTamil}
                                </h2>
                                <p className="text-xs text-[#8E8E93] font-medium font-sans mt-0.5">
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
                      <div className="mt-6 pt-4 border-t border-[#E5E5EA] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleNavigateChapter('prev')}
                          disabled={selectedChapterId <= 1}
                          className={`flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-semibold text-[#1C1C1E] hover:bg-[#F2F2F7] disabled:opacity-30 transition-all shadow-2xs cursor-pointer active:scale-95 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>{languageMode === 'en' ? 'Previous' : 'முந்தைய அதிகாரம்'}</span>
                        </button>

                        <div className="text-center font-mono text-xs text-[#8E8E93] font-semibold">
                          {selectedChapterId} / 133
                        </div>

                        <button
                          type="button"
                          onClick={() => handleNavigateChapter('next')}
                          disabled={selectedChapterId >= 133}
                          className={`flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E5EA] rounded-xl text-xs font-semibold text-[#1C1C1E] hover:bg-[#F2F2F7] disabled:opacity-30 transition-all shadow-2xs cursor-pointer active:scale-95 ${languageMode === 'en' ? 'font-sans' : 'font-tamil'}`}
                        >
                          <span>{languageMode === 'en' ? 'Next' : 'அடுத்த அதிகாரம்'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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

            {/* TAB: About & Settings */}
            {currentTab === 'about' && (
              <AboutView
                fontSize={fontSize}
                setFontSize={setFontSize}
                languageMode={languageMode}
                setLanguageMode={setLanguageMode}
                savedCount={savedIds.length}
                onClearSaved={handleClearAllSaved}
              />
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
