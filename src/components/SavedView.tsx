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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-6 h-6 text-amber-600 fill-amber-500" />
            <h2 className={`text-2xl font-bold text-stone-900 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
              {isEnglish ? `Saved Couplets (${savedIds.length})` : `சேமிக்கப்பட்ட குறள்கள் (${savedIds.length})`}
            </h2>
          </div>
          <p className="text-sm text-stone-600">
            {isEnglish
              ? 'Your bookmarked verses for reflection and quick study'
              : 'Your bookmarked verses for easy access'}
          </p>
        </div>

        {savedIds.length > 0 && (
          <button
            onClick={onClearAll}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors ${isEnglish ? 'font-sans' : 'font-tamil'}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Clear All' : 'அனைத்தையும் நீக்கு'}</span>
          </button>
        )}
      </div>

      {/* List */}
      {savedCoupletsWithChapter.length > 0 ? (
        <div className="space-y-4">
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
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
          <Bookmark className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <h3 className={`text-lg font-bold text-stone-700 mb-1 ${isEnglish ? 'font-sans' : 'font-tamil'}`}>
            {isEnglish ? 'No Bookmarked Couplets Yet' : 'சேமிக்கப்பட்ட குறள்கள் எதுவும் இல்லை'}
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            {isEnglish ? (
              <>
                Click the bookmark (<Bookmark className="w-3.5 h-3.5 inline text-stone-400" />) icon on any couplet to save it here for offline contemplation.
              </>
            ) : (
              <>
                குறள் அட்டையிலுள்ள புக்மார்க் (<Bookmark className="w-3.5 h-3.5 inline text-stone-400" />) குறியீட்டை அழுத்தி நீங்கள் விரும்பிய குறள்களை இங்கே சேமித்துக் கொள்ளலாம்.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
