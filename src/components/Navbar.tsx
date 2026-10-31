import React, { useState, useRef, useEffect } from 'react';
import {
  Sprout,
  Plus,
  Globe,
  Database,
  Sparkles,
  Heart,
  MoreVertical,
  Cloud,
  CloudCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  onAddClick: () => void;
  onOpenGithubGuide: () => void;
  onOpenBackup: () => void;
  onOpenAiSettings: () => void;
  isOnlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  favoritesCount: number;
  user: User | null;
  isSyncing: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({
  onAddClick,
  onOpenGithubGuide,
  onOpenBackup,
  onOpenAiSettings,
  isOnlyFavorites,
  onToggleOnlyFavorites,
  favoritesCount,
  user,
  isSyncing,
  onLogin,
  onLogout,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when tapping outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showMobileMenu || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu, showUserMenu]);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 border border-emerald-400/40 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0">
            <Sprout className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm sm:text-lg tracking-tight text-white whitespace-nowrap">
                植感野誌
              </h1>
              {user ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 whitespace-nowrap">
                  <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isSyncing ? 'animate-ping' : ''}`} />
                  <span>{isSyncing ? '雲端同步中...' : '已連線 Firebase'}</span>
                </span>
              ) : (
                <span className="hidden lg:inline-block text-[11px] font-mono text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-full border border-stone-700 whitespace-nowrap">
                  本機離線模式
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-stone-400 truncate hidden md:block">
              特徵 · 營養 · 處理 · 生態分佈百科
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Cloud Sync / User Button */}
          {user ? (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-emerald-600/50 text-stone-200 transition cursor-pointer text-xs"
                title={`${user.displayName || user.email} (Firebase 雲端已同步)`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-emerald-400/60 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-medium max-w-[80px] truncate text-emerald-300">
                  {user.displayName?.split(' ')[0] || '我的雲端'}
                </span>
                <span className={`w-2 h-2 rounded-full bg-emerald-400 shrink-0 ${isSyncing ? 'animate-ping' : ''}`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-2.5 z-50 text-xs text-stone-200 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1.5 border-b border-stone-800 pb-2 mb-1.5">
                    <p className="font-semibold text-white truncate">{user.displayName || '植物紀錄家'}</p>
                    <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Firebase 雲端即時同步中</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenBackup();
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-stone-800 rounded-lg flex items-center gap-2 text-stone-300 transition"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>備份與還原 (JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-rose-950/50 rounded-lg flex items-center gap-2 text-rose-300 transition mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>登出 Google 帳號</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-800 active:scale-95 border border-emerald-500/80 text-white transition cursor-pointer shrink-0 shadow-sm"
              title="登入 Google 帳號，跨手機與電腦同步植物圖鑑"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="font-medium text-xs whitespace-nowrap">雲端登入</span>
            </button>
          )}

          {/* Favorites Toggle */}
          <button
            onClick={onToggleOnlyFavorites}
            className={`whitespace-nowrap shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              isOnlyFavorites
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:text-white'
            }`}
            title="只顯示我收藏的植物"
          >
            <Heart
              className={`w-3.5 h-3.5 ${isOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`}
            />
            <span className="hidden sm:inline">收藏</span>
            {favoritesCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900 text-stone-300 font-mono">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Desktop-only action buttons */}
          <button
            onClick={onOpenGithubGuide}
            className="hidden md:flex whitespace-nowrap shrink-0 items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            title="GitHub Pages 免費靜態部署步驟教學"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">GitHub Pages 部署</span>
            <span className="lg:hidden">GH Pages</span>
          </button>

          <button
            onClick={onOpenBackup}
            className="hidden sm:flex whitespace-nowrap shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            title="資料備份 (JSON 匯出/匯入)"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>備份還原</span>
          </button>

          <button
            onClick={onOpenAiSettings}
            className="hidden sm:flex whitespace-nowrap shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            title="AI 智能填寫設定"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI 設定</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Primary Add Plant Button */}
          <button
            onClick={onAddClick}
            className="whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-950/40 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap hidden xs:inline sm:hidden">新增</span>
            <span className="whitespace-nowrap hidden sm:inline">新增植物</span>
            <span className="whitespace-nowrap xs:hidden">新增</span>
          </button>

          {/* Mobile More Options Dropdown Menu (< sm screens) */}
          <div className="relative sm:hidden" ref={menuRef}>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="whitespace-nowrap shrink-0 p-1.5 text-stone-300 hover:text-white rounded-xl bg-stone-800/80 border border-stone-700 transition"
              aria-label="更多選項"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMobileMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl py-1.5 z-50 text-xs text-stone-200 animate-in fade-in slide-in-from-top-2 duration-150">
                {!user ? (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onLogin();
                    }}
                    className="w-full text-left px-3.5 py-3 hover:bg-emerald-950/70 bg-emerald-950/30 flex items-center gap-2.5 text-emerald-300 transition border-b border-stone-800"
                  >
                    <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Google 雲端登入</div>
                      <div className="text-[10px] text-emerald-400/90 font-normal">開啟手機跨裝置同步</div>
                    </div>
                  </button>
                ) : (
                  <div className="px-3.5 py-2 border-b border-stone-800 text-[11px]">
                    <div className="text-emerald-300 font-medium truncate">{user.displayName || user.email}</div>
                    <div className="text-stone-400 text-[10px]">☁️ Firebase 雲端同步中</div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenGithubGuide();
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-stone-800 flex items-center gap-2.5 transition"
                >
                  <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>GitHub Pages 部署</span>
                </button>

                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenBackup();
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-stone-800 flex items-center gap-2.5 transition"
                >
                  <Database className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>備份與還原資料</span>
                </button>

                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenAiSettings();
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-stone-800 flex items-center gap-2.5 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>AI 智能填寫設定</span>
                </button>

                {user && (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-rose-950/50 flex items-center gap-2.5 text-rose-300 transition border-t border-stone-800"
                  >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>登出 Google 帳號</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
