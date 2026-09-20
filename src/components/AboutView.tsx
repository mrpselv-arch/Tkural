import React, { useState } from 'react';
import { Info, BookOpen, User, Award, Globe2, Code2, Smartphone, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onOpenAndroidEditor?: () => void;
  onOpenInstallModal?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onOpenAndroidEditor,
  onOpenInstallModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'thirukkural' | 'valluvar'>('thirukkural');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 font-tamil mb-1 flex items-center gap-2">
          <Info className="w-6 h-6 text-amber-600" />
          வரலாறு & அமைப்புகள் (About & Settings)
        </h2>
        <p className="text-sm text-stone-600">History, structure, and significance of Thirukkural and Thiruvalluvar</p>
      </div>

      {/* Quick Access Utility Banners (Especially great for mobile single-page users) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {onOpenInstallModal && (
          <div
            onClick={onOpenInstallModal}
            className="cursor-pointer p-4 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-300 hover:border-amber-400 transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1 font-tamil">
                  செயலியை நிறுவுக (Install App)
                </h4>
                <p className="text-xs text-stone-600">Install standalone PWA on Android or iOS</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        {onOpenAndroidEditor && (
          <div
            onClick={onOpenAndroidEditor}
            className="cursor-pointer p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-300 hover:border-emerald-400 transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1">
                  Android Code Editor
                </h4>
                <p className="text-xs text-stone-600">View and edit Kotlin & XML source files</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSubTab('thirukkural')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === 'thirukkural'
              ? 'bg-amber-600 text-white font-semibold shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="font-tamil">திருக்குறள் பற்றி</span>
        </button>

        <button
          onClick={() => setActiveSubTab('valluvar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === 'valluvar'
              ? 'bg-amber-600 text-white font-semibold shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="font-tamil">திருவள்ளுவர் வரலாறு</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-center">
          <p className="text-xs text-stone-500 font-medium">மொத்த அதிகாரங்கள்</p>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">133</p>
          <p className="text-[11px] text-stone-400">Chapters</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-center">
          <p className="text-xs text-stone-500 font-medium">மொத்த குறள்கள்</p>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">1,330</p>
          <p className="text-[11px] text-stone-400">Couplets</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-center">
          <p className="text-xs text-stone-500 font-medium">முப்பால் (3 பால்கள்)</p>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">3</p>
          <p className="text-[11px] text-stone-400">Aram, Porul, Inbam</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-center">
          <p className="text-xs text-stone-500 font-medium">சிறப்பு உரைகள்</p>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">4</p>
          <p className="text-[11px] text-stone-400">Scholarly Commentaries</p>
        </div>
      </div>

      {/* Content Section */}
      {activeSubTab === 'thirukkural' ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-tamil mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              திருக்குறள் – உலகப் பொதுமறை
            </h3>
            <div className="font-tamil text-stone-800 leading-relaxed text-base space-y-4">
              <p>
                திருக்குறள் உலகப் புகழ் பெற்ற ஓர் தமிழ் இலக்கியம். இந்நூல் ஏறக்குறைய 2000 ஆண்டுகளுக்கு முற்பட்டதாகக் கருதப்பட்டாலும், இயற்றப்பட்ட காலம் இன்னும் மிகத் தொன்மையானதாகப் போற்றப்படுகிறது.
              </p>
              <p>
                திருக்குறளுக்கு <strong>உலகப் பொது மறை, முப்பால், ஈரடி நூல், உத்தரவேதம், தெய்வநூல், பொதுமறை, பொய்யாமொழி, வாயுறை வாழ்த்து, தமிழ் மறை, திருவள்ளுவம்</strong> என்று வேறு பல பெயர்களும் உண்டு. இரண்டே அடிகளில் உலகத் தத்துவங்களைச் சொன்னதால் இதற்கு <em>ஈரடி நூல்</em> என்றும், அறம், பொருள், காமம் என்னும் முப்பெரும் பால்களைக் கொண்டதால் <em>முப்பால்</em> என்றும் அழைக்கப்படுகிறது.
              </p>
            </div>
          </div>

          <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200/80">
            <h4 className="font-bold text-amber-950 font-tamil text-base mb-3">
              முப்பால் அமைப்பு முறை:
            </h4>
            <ul className="font-tamil text-stone-800 text-sm space-y-3 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded font-bold mt-0.5">1</span>
                <div>
                  <strong>அறத்துப்பால் (38 அதிகாரங்கள்):</strong> மனசாட்சி மற்றும் மரியாதை, நல்ல நடத்தை போன்றவற்றை பாயிரவியல், இல்லறவியல், துறவறவியல், ஊழியல் என்ற இயல்களில் தெளிவாக எடுத்துரைக்கிறது.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-teal-700 text-white text-xs px-2 py-0.5 rounded font-bold mt-0.5">2</span>
                <div>
                  <strong>பொருட்பால் (70 அதிகாரங்கள்):</strong> உலக விவகாரங்களில் எவ்வாறு சரியான முறையில் நடந்து கொள்வது என்பதை அரசியல், அமைச்சியல், அங்கவியல், ஒழிபியல் போன்ற இயல்களில் விளக்கியுள்ளார்.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-rose-700 text-white text-xs px-2 py-0.5 rounded font-bold mt-0.5">3</span>
                <div>
                  <strong>இன்பத்துப்பால் / காமத்துப்பால் (25 அதிகாரங்கள்):</strong> காதல் மற்றும் இல்லற இன்பத்தைத் தெளிவாக களவியல், கற்பியல் என்ற தலைப்புகளில் எடுத்துரைக்கிறது.
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-1.5 font-sans">
              <Globe2 className="w-4 h-4 text-stone-500" />
              English Overview & Global Legacy
            </h4>
            <div className="text-stone-700 text-sm leading-relaxed space-y-3">
              <p>
                Thirukkural is one of the most revered ancient works in Tamil literature. It is universally considered a "common creed", providing a practical guide for human morals, ethics, and virtue in everyday life.
              </p>
              <p>
                The word <em>Thirukkuṟaḷ</em> is a compound formed by joining <strong>Thiru</strong> (meaning sacred, revered) and <strong>Kural</strong> (a short poetic meter in Tamil). It has been translated into over 40 global languages, including Latin by Constanzo Beschi in 1730 and English by Rev. Dr. G.U. Pope.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-44 sm:w-40 sm:h-56 rounded-xl overflow-hidden border border-amber-300 shadow-md bg-stone-100 flex-shrink-0 mx-auto md:mx-0">
              <img
                src="/thiruvalluvar.jpg"
                alt="தெய்வப்புலவர் திருவள்ளுவர்"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-stone-900 font-tamil mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                தெய்வப்புலவர் திருவள்ளுவர்
              </h3>
              <div className="font-tamil text-stone-800 leading-relaxed text-base space-y-4">
                <p>
                  திருவள்ளுவர் திருக்குறளை இயற்றிய பெரும் புலவர் மற்றும் தத்துவஞானி. உலக மக்களால் அவர் <strong>தெய்வப்புலவர், பொய்யில் புலவர், நாயனார், தேவர், செந்நாப்போதர், பெருநாவலர், பொய்யாமொழிப் புலவர்</strong> என்றெல்லாம் பல சிறப்புப் பெயர்களில் போற்றப்படுகிறார்.
                </p>
                <p>
                  அவர் மதுரையில் தமிழ்ச் சங்கத்தில் திருக்குறளை அரங்கேற்றியதாகவும், சென்னையில் உள்ள மயிலாப்பூரில் வாழ்ந்ததாகவும் வரலாற்று மரபுரைகள் கூறுகின்றன. எக்காலத்திற்கும் எம்மொழிக்கும் பொருந்தும் உன்னத வாழ்வியல் நெறிகளைத் தந்த பெருமை இவருக்கே உரியது.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-sm font-bold text-stone-900 mb-2 font-sans">
              Life & Legacy of Thiruvalluvar
            </h4>
            <div className="text-stone-700 text-sm leading-relaxed space-y-3">
              <p>
                Thiruvalluvar was a celebrated Tamil poet-philosopher whose timeless contribution to ethical thought transcends religious and regional boundaries. His verses remain as pertinent to modern civic life, statesmanship, and personal virtue as they were when composed over two millennia ago.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
