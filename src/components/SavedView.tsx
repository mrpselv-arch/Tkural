import React, { useMemo } from 'react';
import { Chapter, Couplet, LanguageMode } from '../types';
import { CoupletCard } from './CoupletCard';
import { Bookmark, Trash2 } from 'lucide-react';

interface SavedViewProps {
  chapters: Chapter[];
  savedIds: number[];
  onToggleSave: (id: number) => void;
  onClearAll: () => void;
  fontSizeClass: string;
  languageMode?: LanguageMode;
}

export const SavedView: React.FC<SavedViewProps> = ({
  chapters,
  savedIds,
  onToggleSave,
  onClearAll,
  fontSizeClass,
  languageMode = 'ta',
}) => {
  const isEnglish = languageMode === 'en';
  const savedCoupletsWithChapter = useMemo(() => {
    const list: { couplet: Couplet; chapter: Chapter }[] = [];
    const idSet = new Set(savedIds);

    for (const ch of chapters) {
      for (const c of ch.couplets) {
        if (idSet.has(c.id)) {
          list.push({ couplet: c, chapter: ch });
        }
      }
    }
    return list;
  }, [chapters, savedIds]);

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* iOS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5E5EA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-orange-600" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold text-[#1C1C1E] ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish ? `Saved Couplets (${savedIds.length})` : `சேமிக்கப்பட்ட குறள்கள் (${savedIds.length})`}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8E8E93]">
            {isEnglish
              ? 'Your bookmarked verses for easy access and reflection'
              : 'விரும்பிச் சேமித்த குறள்கள்'}
          </p>
        </div>

        {savedIds.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200/80 rounded-xl transition-all cursor-pointer active:scale-95 self-start sm:self-auto font-semibold ${isEnglish ? 'font-sans' : 'font-tamil'}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Clear All' : 'அனைத்தும் நீக்கு'}</span>
          </button>
        )}
      </div>

      {/* Couplet List */}
      {savedCoupletsWithChapter.length > 0 ? (
        <div className="space-y-3">
          {savedCoupletsWithChapter.map(({ couplet, chapter }) => (
            <CoupletCard
              key={couplet.id}
              couplet={couplet}
              chapterNameTamil={`அதிகாரம் ${chapter.id}: ${chapter.nameTamil}`}
              chapterNameEnglish={`Chapter ${chapter.id}: ${chapter.nameEnglish}`}
              isSaved={true}
              onToggleSave={onToggleSave}
              fontSizeClass={fontSizeClass}
              languageMode={languageMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E5E5EA] p-8 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#F2F2F7] text-[#8E8E93] flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className={`text-base font-bold text-[#1C1C1E] mb-1 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
            {isEnglish ? 'No Bookmarked Couplets Yet' : 'சேமிக்கப்பட்ட குறள்கள் எதுவும் இல்லை'}
          </h3>
          <p className="text-xs text-[#8E8E93] max-w-sm mx-auto leading-relaxed">
            {isEnglish
              ? 'Tap the bookmark button on any couplet to keep it here for quick contemplation.'
              : 'குறள் அட்டையிலுள்ள புக்மார்க் குறியீட்டை அழுத்தி நீங்கள் விரும்பிய குறள்களை இங்கே சேமித்துக் கொள்ளலாம்.'}
          </p>
        </div>
      )}
    </div>
  );
};
