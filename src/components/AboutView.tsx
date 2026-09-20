import React, { useState } from 'react';
import {
  Info,
  BookOpen,
  User,
  Award,
  Globe2,
  Sliders,
  CheckCircle2,
  Bookmark,
  Volume2,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { LanguageMode } from '../types';

interface AboutViewProps {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
  savedCount: number;
  onClearSaved: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  fontSize,
  setFontSize,
  languageMode,
  setLanguageMode,
  savedCount,
  onClearSaved,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'thirukkural' | 'valluvar' | 'settings'>('thirukkural');
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
      {/* iOS Header */}
      <div className="mb-4 pb-3 border-b border-[#E5E5EA]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1C1E] font-tamil">
            வரலாறு & அமைப்புகள்
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#8E8E93]">
          நூல் வரலாறு, திருவள்ளுவர் குறிப்பு மற்றும் செயலி விருப்பங்கள்
        </p>
      </div>

      {/* iOS Segmented Navigation Pill */}
      <div className="flex bg-[#767680]/12 p-1 rounded-2xl mb-4 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('thirukkural')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'thirukkural'
              ? 'bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
              : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-orange-600" />
          <span className="font-tamil truncate">திருக்குறள்</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('valluvar')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'valluvar'
              ? 'bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
              : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
          }`}
        >
          <User className="w-3.5 h-3.5 text-orange-600" />
          <span className="font-tamil truncate">திருவள்ளுவர்</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'settings'
              ? 'bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
              : 'text-[#3C3C43]/75 hover:text-[#1C1C1E]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-orange-600" />
          <span className="font-tamil truncate">அமைப்புகள்</span>
        </button>
      </div>

      {/* Overview Grouped Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5EA] shadow-2xs text-center">
          <p className="text-[11px] text-[#8E8E93] font-medium">அதிகாரங்கள்</p>
          <p className="text-xl font-black text-orange-600 font-mono mt-0.5">133</p>
          <p className="text-[10px] text-[#8E8E93]">Chapters</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5EA] shadow-2xs text-center">
          <p className="text-[11px] text-[#8E8E93] font-medium">குறள்கள்</p>
          <p className="text-xl font-black text-orange-600 font-mono mt-0.5">1,330</p>
          <p className="text-[10px] text-[#8E8E93]">Couplets</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5EA] shadow-2xs text-center">
          <p className="text-[11px] text-[#8E8E93] font-medium">முப்பால்</p>
          <p className="text-xl font-black text-teal-600 font-mono mt-0.5">3</p>
          <p className="text-[10px] text-[#8E8E93]">Sections</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5EA] shadow-2xs text-center">
          <p className="text-[11px] text-[#8E8E93] font-medium">சிறப்பு உரைகள்</p>
          <p className="text-xl font-black text-rose-600 font-mono mt-0.5">4</p>
          <p className="text-[10px] text-[#8E8E93]">Commentaries</p>
        </div>
      </div>

      {/* Content Section 1: Thirukkural History */}
      {activeSubTab === 'thirukkural' && (
        <div className="bg-white rounded-3xl border border-[#E5E5EA] p-5 sm:p-7 space-y-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div>
            <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/80">
              தமிழ் இலக்கிய உன்னதம்
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#1C1C1E] font-tamil mt-2 mb-3">
              உலகப் பொதுமறை திருக்குறள்
            </h3>
            <div className="font-tamil text-[#3C3C43] leading-relaxed text-sm sm:text-base space-y-3">
              <p>
                திருக்குறள் தமிழ் இலக்கியத்தின் தலைசிறந்த வாழ்வியல் நீதி நூலாகும். சங்க இலக்கியப் பின்புலத்தில் தோன்றிய பதினெண்கீழ்க்கணக்கு நூல்களுள் முதன்மையானதாகத் திகழ்கிறது.
              </p>
              <p>
                மதம், மொழி, இனம், நாடு கடந்த உலகளாவிய வாழ்வியல் உண்மைகளை எளிய இரண்டடி வெண்பாக்களில் எடுத்துரைப்பதால் இது <strong>‘உலகப் பொதுமறை’</strong> என்றும் <strong>‘பொய்யாமொழி’</strong>, <strong>‘தெய்வநூல்’</strong>, <strong>‘முப்பால்’</strong> என்றும் போற்றப்படுகிறது.
              </p>
              <p>
                திருக்குறள் <strong>அறத்துப்பால்</strong> (38 அதிகாரங்கள்), <strong>பொருட்பால்</strong> (70 அதிகாரங்கள்), <strong>இன்பத்துப்பால்</strong> (25 அதிகாரங்கள்) என முப்பிரிவுகளையும், மொத்தம் 133 அதிகாரங்களையும், 1330 குறட்பாக்களையும் தன்னகத்தே கொண்டுள்ளது.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5EA]">
            <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E] mb-2 font-sans">
              Universal Relevance & Global Translations
            </h4>
            <div className="text-[#3C3C43] text-xs sm:text-sm leading-relaxed space-y-2">
              <p>
                Thirukkural is celebrated universally as one of the earliest secular philosophical treatises in human history. Composed in concise couplet form with exact metrical rhythm, it has been translated into over 80 world languages including English, French, German, Latin, Russian, Chinese, and Arabic.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Section 2: Valluvar History */}
      {activeSubTab === 'valluvar' && (
        <div className="bg-white rounded-3xl border border-[#E5E5EA] p-5 sm:p-7 space-y-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Round Thiruvalluvar Emblem */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-orange-500/30 ring-4 ring-orange-100 shadow-md flex-shrink-0 bg-stone-900">
              <img
                src="/thiruvalluvar.jpg"
                alt="திருவள்ளுவர்"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = '/icon.svg';
                }}
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/80">
                மகா கவிஞர் & தத்துவஞானி
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1C1C1E] font-tamil mt-1 mb-2">
                தெய்வப்புலவர் திருவள்ளுவர்
              </h3>
              <p className="font-tamil text-[#3C3C43] leading-relaxed text-xs sm:text-sm">
                உலகத் தமிழர்களால் <strong>தெய்வப்புலவர், பொய்யில் புலவர், நாயனார், தேவர், செந்நாப்போதர், பெருநாவலர்</strong> எனப் போற்றிப் புகழப்படுகிறார்.
              </p>
            </div>
          </div>

          <div className="font-tamil text-[#3C3C43] leading-relaxed text-xs sm:text-sm space-y-3 pt-2">
            <p>
              திருவள்ளுவரின் வாழ்க்கைக் காலம் கி.மு. முதலாம் நூற்றாண்டு என அறிஞர்கள் பலரால் ஏற்கப்பட்டு, தமிழக அரசால் தை மாதம் இரண்டாம் நாள் ‘திருவள்ளுவர் திருநாள்’ எனக் கொண்டாடப்படுகிறது.
            </p>
            <p>
              கன்னியாகுமரியில் முக்கடலும் கூடும் இடத்தில் திருவள்ளுவருக்கு 133 அடி உயர பிரம்மாண்ட சிலை எழுப்பப்பட்டுள்ளது.
            </p>
          </div>
        </div>
      )}

      {/* Content Section 3: User Settings & Preferences */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-[#E5E5EA] p-5 sm:p-7 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-tamil mb-0.5 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-600" />
              வாசிப்பு அமைப்புகள் (Reader Preferences)
            </h3>
            <p className="text-xs text-[#8E8E93]">
              தங்களின் விருப்பத்திற்கேற்ப எழுத்து அளவு, மொழி மற்றும் சேமித்த குறள்களை நிர்வகிக்கலாம்.
            </p>
          </div>

          {/* Setting 1: Font Size */}
          <div className="space-y-2.5 pb-5 border-b border-[#E5E5EA]">
            <label className="block text-xs sm:text-sm font-bold text-[#1C1C1E] font-tamil">
              எழுத்து அளவு (Font Size):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'sm', labelTamil: 'சிறியது (S)', labelEn: 'Small' },
                { id: 'base', labelTamil: 'இயல்பு (M)', labelEn: 'Medium' },
                { id: 'lg', labelTamil: 'பெரியது (L)', labelEn: 'Large' },
                { id: 'xl', labelTamil: 'மிகப் பெரியது (XL)', labelEn: 'Extra Large' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontSize(opt.id as any)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    fontSize === opt.id
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-bold shadow-2xs'
                      : 'border-[#E5E5EA] bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#3C3C43]'
                  }`}
                >
                  <p className="font-tamil text-xs font-semibold">{opt.labelTamil}</p>
                  <p className="text-[10px] text-[#8E8E93]">{opt.labelEn}</p>
                </button>
              ))}
            </div>

            {/* Preview Box */}
            <div className="mt-2 p-3 bg-[#F2F2F7] rounded-xl border border-[#E5E5EA]">
              <span className="text-[10px] font-mono text-[#8E8E93] block mb-1">மாதிரி (Preview):</span>
              <p
                className={`font-tamil font-bold text-[#1C1C1E] transition-all ${
                  fontSize === 'sm'
                    ? 'text-xs'
                    : fontSize === 'base'
                    ? 'text-sm'
                    : fontSize === 'lg'
                    ? 'text-base'
                    : 'text-lg'
                }`}
              >
                அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.
              </p>
            </div>
          </div>

          {/* Setting 2: Language Preference */}
          <div className="space-y-2.5 pb-5 border-b border-[#E5E5EA]">
            <label className="block text-xs sm:text-sm font-bold text-[#1C1C1E] font-tamil">
              மொழி விருப்பம் (Language Mode):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'ta',
                  title: 'தமிழ் மட்டும் (Tamil Only)',
                  desc: 'குறள் மற்றும் மூவர் உரைகள் மட்டுமே',
                },
                {
                  id: 'en',
                  title: 'English Only',
                  desc: 'English transliteration & G.U. Pope translation',
                },
                {
                  id: 'both',
                  title: 'தமிழ் & English (Bilingual)',
                  desc: 'முழுமையான தமிழ் மற்றும் ஆங்கில உரை விளக்கம்',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLanguageMode(opt.id as LanguageMode)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    languageMode === opt.id
                      ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-bold shadow-2xs'
                      : 'border-[#E5E5EA] bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#3C3C43]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">{opt.title}</p>
                    {languageMode === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                  </div>
                  <p className="text-[11px] text-[#8E8E93] font-normal mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Setting 3: Audio Recitation Info */}
          <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[#1C1C1E] text-xs font-tamil">
                குறள் ஒலி உச்சரிப்பு (Audio Recitation)
              </h4>
              <p className="text-xs text-[#3C3C43] mt-0.5 leading-relaxed">
                ஒவ்வொரு குறள் அட்டையிலும் உள்ள ஒலிபெருக்கி பொத்தானை அழுத்தி, தமிழ் உச்சரிப்பில் குறளை செவிமடுக்கலாம்.
              </p>
            </div>
          </div>

          {/* Setting 4: Bookmarks / Saved Kurals Management */}
          <div className="space-y-2.5 pb-4 border-b border-[#E5E5EA]">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1C1C1E] font-tamil">
                  பிடித்த குறள்கள் (Saved Couplets):
                </label>
                <p className="text-xs text-[#8E8E93]">
                  {savedCount} குறள்கள் உங்கள் சாதனத்தில் பாதுகாப்பாக உள்ளன.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                <Bookmark className="w-3.5 h-3.5 fill-orange-600" />
                <span>{savedCount}</span>
              </div>
            </div>

            {savedCount > 0 && (
              <div>
                {confirmClear ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
                    <p className="text-xs text-rose-800 font-medium font-tamil">
                      அனைத்து சேமித்த குறள்களையும் நீக்க விரும்புகிறீர்களா?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClearSaved();
                          setConfirmClear(false);
                        }}
                        className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 cursor-pointer"
                      >
                        ஆம், நீக்கு
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClear(false)}
                        className="px-3 py-1 bg-[#E5E5EA] text-[#3C3C43] text-xs font-semibold rounded-xl hover:bg-[#D1D1D6] cursor-pointer"
                      >
                        வேண்டாம்
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors font-semibold cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="font-tamil">சேமித்த குறள்களை அழிக்க (Clear)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Privacy & Production Guarantee */}
          <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#8E8E93]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>100% ஆஃப்லைன் பயன்பாடு • விளம்பரங்கள் அற்றது (No Ads)</span>
            </div>
            <span className="font-mono text-[#8E8E93]">v2.1 iOS Modern</span>
          </div>
        </div>
      )}
    </div>
  );
};
