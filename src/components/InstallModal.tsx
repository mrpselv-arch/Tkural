import React, { useState } from 'react';
import { QrCode, Smartphone, X, Copy, Check, ExternalLink, Share2, Download, ArrowRight, Laptop, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'share' | 'chrome' | 'apk'>('scan');
  const [urlType, setUrlType] = useState<'dev' | 'share'>('share');
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();

  if (!isOpen) return null;

  const devUrl = 'https://ais-dev-5ckrqgc6nluyuptv4dhsdd-297839385489.asia-southeast1.run.app';
  const sharedUrl = 'https://ais-pre-5ckrqgc6nluyuptv4dhsdd-297839385489.asia-southeast1.run.app';

  // The active URL based on toggle
  const appUrl = urlType === 'dev' ? devUrl : sharedUrl;

  // High quality QR code generator via standard URL service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=15&format=png&data=${encodeURIComponent(appUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        id="install-modal-container"
        className="relative w-full max-w-xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/40 shadow-sm bg-stone-900 flex-shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="திருவள்ளுவர்"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                Install on Phone
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                  Android 12+
                </span>
              </h2>
              <p className="text-xs text-stone-400">From your laptop to your phone in seconds</p>
            </div>
          </div>
          <button
            id="close-install-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/50 px-6 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'scan'
                ? 'border-amber-500 text-amber-400 bg-stone-900/50 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Scan QR Code
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'share'
                ? 'border-amber-500 text-amber-400 bg-stone-900/50 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Copy & Send Link
          </button>

          <button
            onClick={() => setActiveTab('chrome')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'chrome'
                ? 'border-amber-500 text-amber-400 bg-stone-900/50 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Send from Chrome
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-amber-500 text-amber-400 bg-stone-900/50 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Native APK
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* In-app one-click install button if browser prompted */}
          {isInstalled ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>App Installed:</strong> You are running Thirukkural in full standalone app mode!
              </span>
            </div>
          ) : isInstallable ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Ready to Install
                </h4>
                <p className="text-xs text-stone-300">Tap below to install directly to your device without opening browser menus.</p>
              </div>
              <button
                type="button"
                onClick={triggerInstall}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg active:scale-95 transition-all flex-shrink-0"
              >
                Install App Now
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-stone-300 space-y-1">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" /> True App Installation (Not just a browser shortcut):
              </div>
              <p className="text-stone-300 leading-relaxed text-[11px]">
                We have enabled full Progressive Web App (PWA) support with a registered <strong>Service Worker</strong> and <strong>native PNG icons (192px/512px)</strong>. In Chrome on your phone, tap the <strong>3 dots (⋮)</strong> and select <strong className="text-amber-200">"Install app"</strong>. Android will mint a standalone application that launches in its own window without browser address bars!
              </p>
            </div>
          )}

          {/* URL Mode Switcher */}
          <div className="flex items-center justify-between bg-stone-950 p-2 rounded-xl border border-stone-800 text-xs">
            <span className="text-stone-400 pl-2 font-medium">Link type:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setUrlType('share')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  urlType === 'share'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Shared Public URL (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setUrlType('dev')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  urlType === 'dev'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Dev URL
              </button>
            </div>
          </div>

          {activeTab === 'scan' && (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* QR Code container */}
              <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-500/20 flex-shrink-0 flex flex-col items-center">
                <img
                  src={qrCodeUrl}
                  alt="Scan QR code to install Thirukkural on phone"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  loading="eager"
                />
                <span className="text-[11px] text-stone-600 font-semibold mt-1">Scan with Phone Camera</span>
              </div>

              {/* Steps */}
              <div className="space-y-3.5 text-left w-full">
                <h3 className="font-semibold text-amber-300 text-sm">3 Quick Steps on your Phone:</h3>
                
                <ol className="space-y-3 text-sm text-stone-300">
                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>Open the <strong>Camera</strong> or <strong>Google Lens</strong> on your Android phone and point it at the QR code.</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>Tap the yellow popup link to open the app in <strong>Google Chrome</strong>.</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <div>
                      Tap the <strong>three dots (⋮)</strong> at top-right in Chrome, then tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </div>
                  </li>
                </ol>

                <div className="pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-800/80 border border-stone-700 text-xs text-stone-300">
                    <span className="truncate flex-1 font-mono">{appUrl}</span>
                    <button
                      id="copy-qr-url-btn"
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-4">
              <p className="text-sm text-stone-300">
                Send this link to your phone using WhatsApp Web, Telegram, or by emailing it to yourself:
              </p>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-950 border border-stone-800">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="bg-transparent border-none text-amber-300 font-mono text-xs w-full focus:outline-none select-all"
                />
                <button
                  id="copy-share-url-btn"
                  onClick={handleCopy}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Thirukkural App: ' + appUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/40 text-emerald-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Send via WhatsApp Web</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={`mailto:?subject=Thirukkural%20App%20Link&body=Here%20is%20the%20link%20to%20install%20the%20Thirukkural%20app%20on%20your%20phone:%0A%0A${encodeURIComponent(appUrl)}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-stone-800/80 border border-stone-700 hover:bg-stone-800 text-stone-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-medium">Email to Yourself</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
                <strong>Once you open the link on your phone:</strong> tap the 3 dots in Chrome and pick <strong>"Add to Home screen"</strong>. It runs in full-screen standalone mode without URL bars.
              </div>
            </div>
          )}

          {activeTab === 'chrome' && (
            <div className="space-y-3.5 text-sm text-stone-300">
              <p className="leading-relaxed">
                If you are signed into Chrome on both your laptop and your phone with the same Google Account, you can send the page directly:
              </p>

              <ol className="space-y-3 pt-1">
                <li className="flex items-start gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    1
                  </span>
                  <div>
                    In the Chrome URL bar at the top of your laptop screen, click the <strong>Share</strong> icon (or right-click anywhere on the page).
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    2
                  </span>
                  <div>
                    Click <strong>"Send to your devices"</strong> and choose your Android 12 phone.
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    3
                  </span>
                  <div>
                    A notification appears immediately on your phone. Tap it, then tap <strong>⋮ &gt; Install app</strong>.
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-3 text-sm text-stone-300">
              <p className="leading-relaxed">
                Choose either automated Cloud build (no Android Studio required) or local Android Studio compile:
              </p>

              <div className="space-y-2 bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  Option A: Automated Cloud Build (GitHub Actions)
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-stone-300">
                  <li>Click top-right Menu (⚙️) &gt; <strong>Export to GitHub</strong>.</li>
                  <li>Open the repo on GitHub and click the <strong>Actions</strong> tab.</li>
                  <li>Click the <strong>Build Android APK</strong> workflow.</li>
                  <li>Under <strong>Artifacts</strong>, click to download <code className="text-emerald-300 bg-stone-800 px-1 py-0.5 rounded">thirukkural-app-debug-apk</code>.</li>
                </ol>
              </div>

              <div className="space-y-2 bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  Option B: Local Compile via Android Studio
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-stone-300">
                  <li>Click top-right Menu (⚙️) &gt; <strong>Export to ZIP</strong>.</li>
                  <li>Open the extracted <code className="text-amber-300 bg-stone-800 px-1 py-0.5 rounded">android/</code> folder in Android Studio.</li>
                  <li>Colors and dimens (<code className="text-stone-300">@color/colorPrimary</code>, etc.) are already defined.</li>
                  <li>Click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
                  <li>Locate <code className="text-amber-300 bg-stone-800 px-1 py-0.5 rounded">app-debug.apk</code> and install on phone.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between text-xs text-stone-400">
          <span>Works on Android 12, 13, 14, iOS & Tablets</span>
          <button
            id="dismiss-install-modal-btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
