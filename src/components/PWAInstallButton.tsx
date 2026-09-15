import React, { useState } from 'react';
import { Download, Share, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'banner' | 'compact' | 'button' }> = ({
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // Banner variant on mobile top/bottom
  if (variant === 'banner' && (isInstallable || isIOS)) {
    return (
      <>
        <div className="bg-neutral-900 border-b border-[#c69214]/30 px-4 py-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#c69214]/50 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/icon.svg" alt="VJ Salon" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Install VJ Salon App</p>
              <p className="text-[11px] text-neutral-400">Add to home screen for faster bookings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isInstallable ? (
              <button
                id="btn-pwa-install-banner"
                onClick={install}
                className="gold-button px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            ) : isIOS ? (
              <button
                id="btn-pwa-install-ios-banner"
                onClick={() => setShowIOSGuide(true)}
                className="bg-neutral-800 hover:bg-neutral-700 text-[#f3cc51] border border-[#c69214]/40 px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1"
              >
                <Share className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : null}

            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-neutral-400 hover:text-neutral-200"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iOS installation instructions modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-[#c69214]/40 p-6 shadow-2xl text-white animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#f3cc51]" />
                  <h3 className="text-base font-bold">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-neutral-300">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#c69214]/20 text-[#f3cc51] flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <p>Open this website in <strong>Safari</strong> browser.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#c69214]/20 text-[#f3cc51] flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <p>Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 text-[#f3cc51]" /> at the bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#c69214]/20 text-[#f3cc51] flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <p>Scroll down and select <strong>"Add to Home Screen"</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full gold-button py-2.5 rounded-xl text-xs font-bold text-black"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Standalone button
  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install-app"
        onClick={install}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#c69214]/15 border border-[#c69214]/40 text-[#f3cc51] hover:bg-[#c69214]/25 transition"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios-nav"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#c69214]/15 border border-[#c69214]/40 text-[#f3cc51] hover:bg-[#c69214]/25 transition"
        >
          <Share className="w-3.5 h-3.5" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-[#c69214]/40 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#f3cc51]" />
                  <h3 className="text-base font-bold">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-neutral-300">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#c69214]/20 text-[#f3cc51] flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <p>Tap the <strong>Share</strong> button <Share className="inline w-3.5 h-3.5 text-[#f3cc51]" /> in Safari.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#c69214]/20 text-[#f3cc51] flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <p>Tap <strong>"Add to Home Screen"</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full gold-button py-2.5 rounded-xl text-xs font-bold text-black"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
