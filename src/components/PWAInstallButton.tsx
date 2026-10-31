import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed and running standalone, hide or show small badge
  if (isInstalled) {
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-full shrink-0">
        <CheckCircle className="w-3.5 h-3.5" />
        已安裝
      </span>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  return (
    <>
      {/* Chromium / Android / Desktop flow */}
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="whitespace-nowrap shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-md shadow-emerald-900/30 transition-all cursor-pointer border border-emerald-400/30"
          title="將此應用安裝到您的手機或電腦桌面"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
          <span className="hidden sm:inline">下載到手機</span>
          <span className="sm:hidden">安裝</span>
        </button>
      )}

      {/* iOS Safari flow (beforeinstallprompt is not supported on WebKit) */}
      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="whitespace-nowrap shrink-0 flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-300 bg-emerald-900/70 hover:bg-emerald-800/80 rounded-xl border border-emerald-700/60 transition-all cursor-pointer"
          title="iPhone/iPad 安裝說明"
        >
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">加到手機主畫面</span>
          <span className="sm:hidden">安裝</span>
        </button>
      )}

      {/* Fallback button for devices if neither fired but user wants install instructions */}
      {!isInstallable && !isIOS && !isInstalled && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="whitespace-nowrap shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 rounded-xl border border-stone-700 transition-all cursor-pointer"
          title="查看如何安裝此 App 到手機"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">下載到手機</span>
          <span className="sm:hidden">安裝</span>
        </button>
      )}

      {/* Portaled full-screen modal (escapes header containing block caused by backdrop-blur) */}
      {showIOSGuide &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex flex-col justify-center items-center animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] overflow-hidden my-auto relative">
              {/* Pinned Top Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/95 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-800/50 border border-emerald-600/50 flex items-center justify-center text-emerald-300 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">安裝到手機主畫面</h3>
                    <p className="text-[11px] text-stone-400">支援離線野外查閱與拍照儲存</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
                  aria-label="關閉"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs sm:text-sm text-stone-300">
                <div className="flex items-start gap-3 p-3 bg-stone-800/60 rounded-xl border border-stone-700/60">
                  <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-200">步驟 1：點選分享按鈕</div>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                      在 Safari 瀏覽器底部（或 Chrome 網址列選單）點擊「分享」圖示。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-stone-800/60 rounded-xl border border-stone-700/60">
                  <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-200">步驟 2：加入主畫面</div>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                      在選單中向下滑動，找到並點擊<strong>「加入主畫面」 (Add to Home Screen)</strong>。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-stone-800/60 rounded-xl border border-stone-700/60">
                  <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-200">步驟 3：享受原生效能</div>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                      桌面上會出現「植感野誌」獨立 App 圖示，全螢幕無瀏覽器網址列，離線也能秒開！
                    </p>
                  </div>
                </div>
              </div>

              {/* Pinned Bottom Button */}
              <div className="p-4 border-t border-stone-800 bg-stone-950/80 shrink-0">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs sm:text-sm text-white transition active:scale-98 shadow-md"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
