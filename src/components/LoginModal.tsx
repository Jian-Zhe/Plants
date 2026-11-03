import React, { useState, useEffect } from 'react';
import { X, Cloud, Sparkles, ShieldCheck, Smartphone, Monitor, Copy, Check, ExternalLink, AlertTriangle, RotateCw } from 'lucide-react';
import { loginWithGoogle, subscribeToAuth, isMobileOrPWA, refreshCurrentAuth, auth } from '../firebase';

import { User } from 'firebase/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: User | null) => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSync, setIsCheckingSync] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ code?: string; message: string; domain?: string } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const isMobile = isMobileOrPWA();
  const isStandalone = typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true);

  // Actively listen to auth state changes and app resume (when returning from external Google OAuth)
  useEffect(() => {
    if (!isOpen) return;

    // Check immediately if already logged in
    if (auth.currentUser) {
      onSuccess(auth.currentUser);
      onClose();
      return;
    }

    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        setIsLoading(false);
        onSuccess(user);
        onClose();
      }
    });

    // Check when user resumes or switches back to this app
    const handleModalResume = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const user = await refreshCurrentAuth();
          if (user) {
            onSuccess(user);
            onClose();
          }
        } catch (err) {
          console.warn('Modal resume auth check notice:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleModalResume);
    window.addEventListener('focus', handleModalResume);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleModalResume);
      window.removeEventListener('focus', handleModalResume);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onSuccess]);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleSignIn = async (forceRedirect: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithGoogle(forceRedirect);
      const loggedUser = user || auth.currentUser;
      if (loggedUser) {
        onSuccess(loggedUser);
        onClose();
      }
      // If user is null and not logged in, page is redirecting to accounts.google.com
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      console.error('Sign-in failed:', err);

      // Check again if user actually succeeded despite error
      if (auth.currentUser) {
        onSuccess(auth.currentUser);
        onClose();
        return;
      }

      if (errorObj?.code === 'auth/unauthorized-domain') {
        setErrorMessage({
          code: 'auth/unauthorized-domain',
          message: '此網址尚未在 Firebase 授權網域清單中。',
          domain: currentHost,
        });
      } else if (errorObj?.code === 'auth/popup-blocked') {
        setErrorMessage({
          code: 'auth/popup-blocked',
          message: '瀏覽器安全機制阻擋了彈出視窗，請點選下方的「頁面跳轉登入」。',
        });
      } else if (errorObj?.code === 'auth/popup-closed-by-user') {
        if (!auth.currentUser) {
          setErrorMessage({
            code: 'auth/popup-closed-by-user',
            message: '登入視窗已關閉。若在手機上選擇帳號後未同步，請使用下方「頁面跳轉登入」或點選「立即同步狀態」。',
          });
        }
      } else {
        setErrorMessage({
          code: errorObj?.code || 'auth/unknown',
          message: errorObj?.message || '登入失敗，請重試或改用「頁面跳轉登入」。',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCheck = async () => {
    setIsCheckingSync(true);
    setErrorMessage(null);
    try {
      const user = await refreshCurrentAuth();
      if (user) {
        onSuccess(user);
        onClose();
        return;
      }
      setErrorMessage({
        message: '尚未偵測到已登入的 Google 帳號。若您剛剛在瀏覽器分頁登入，請確認是否已授權完成，或直接點選上方「Google 一鍵登入」。',
      });
    } catch (err) {
      console.warn('Manual check error:', err);
      if (auth.currentUser) {
        onSuccess(auth.currentUser);
        onClose();
      }
    } finally {
      setIsCheckingSync(false);
    }
  };

  const handleCopyHost = () => {
    if (currentHost) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-3 sm:p-4 flex flex-col justify-center items-center animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] overflow-hidden my-auto relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-900/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Google 帳號雲端同步</h2>
              <p className="text-[11px] text-stone-400">登入後跨手機與電腦即時同步植物資料</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Error Banner if domain not authorized or popup blocked */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/80 text-rose-200 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="font-semibold text-xs sm:text-sm">{errorMessage.message}</div>
              </div>

              {errorMessage.code === 'auth/unauthorized-domain' && (
                <div className="space-y-2 pt-1 text-[11px] text-stone-300">
                  <p className="text-rose-200 font-medium">
                    Google 為了保護專案安全，需將您的網址加入已授權清單（僅需設定一次）：
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950 border border-stone-800 font-mono text-emerald-300">
                    <span className="truncate">{errorMessage.domain}</span>
                    <button
                      onClick={handleCopyHost}
                      className="ml-2 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1 shrink-0 text-[10px]"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? '已複製' : '複製網址'}</span>
                    </button>
                  </div>
                  <div className="space-y-1 text-stone-400 text-[11px] pl-1">
                    <p>1. 開啟 <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">Firebase 控制台 <ExternalLink className="w-3 h-3" /></a></p>
                    <p>2. 選擇專案 → 點選左側 <strong>Authentication</strong> → 頁籤 <strong>Settings</strong></p>
                    <p>3. 在 <strong>Authorized domains（已授權網域）</strong> 點選新增網域，貼上剛才複製的網址。</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Features Highlights */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-stone-300 text-xs">
            <div className="flex items-center gap-2 text-stone-200">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>自動同步您在野外採集新增的植物與照片</span>
            </div>
            <div className="flex items-center gap-2 text-stone-200">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>零信任個人加密隔離，僅您本人帳號可存取</span>
            </div>
            <div className="flex items-center gap-2 text-stone-200">
              <Smartphone className="w-4 h-4 text-purple-400 shrink-0" />
              <span>未登入或離線時，本機 IndexedDB 依舊完全可用</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* Primary Action: Popup Sign In (Default & Best for both PWA standalone and Desktop) */}
            <button
              onClick={() => handleSignIn(false)}
              disabled={isLoading || isCheckingSync}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-sm transition shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{isLoading ? '登入驗證中...' : '使用 Google 一鍵登入 (APP免跳出 · 推薦)'}</span>
            </button>

            {/* Manual Check / Sync Button (Essential for recovering from external redirect jump-back) */}
            <button
              onClick={handleManualCheck}
              disabled={isLoading || isCheckingSync}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 active:scale-98 border border-amber-600/50 text-amber-200 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-amber-400 ${isCheckingSync ? 'animate-spin' : ''}`} />
              <span>{isCheckingSync ? '正在檢查雲端登入狀態...' : '剛從外開瀏覽器跳轉返回？點此檢查同步'}</span>
            </button>

            {/* Secondary Action: Fallback Redirect */}
            <button
              onClick={() => handleSignIn(true)}
              disabled={isLoading || isCheckingSync}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-98 border border-stone-700 text-stone-300 text-xs transition cursor-pointer disabled:opacity-50"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              <span>改用頁面直接跳轉登入 (若彈出視窗受阻)</span>
            </button>

            <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 space-y-1">
              <p className="text-stone-300 font-medium">📱 下載安裝為 APP (PWA) 使用須知：</p>
              <p className="leading-relaxed">
                • 建議優先使用 <strong className="text-emerald-300">「Google 一鍵登入」</strong>，可直接在 APP 內完成驗證，免跳轉離開。<br />
                • 若曾跳轉至 Chrome / Safari 登入，返回本 APP 時系統會自動偵測；若未自動切換，請點選上方 <strong className="text-amber-300">「剛從外開瀏覽器跳轉返回？點此檢查同步」</strong> 即可立即載入。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">目前網域：{currentHost}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
