import React, { useState, useRef, useEffect } from 'react';
import { Sprout, Plus, Globe, Database, Sparkles, Heart, MoreVertical, X } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  onAddClick: () => void;
  onOpenGithubGuide: () => void;
  onOpenBackup: () => void;
  onOpenAiSettings: () => void;
  isOnlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<Props> = ({
  onAddClick,
  onOpenGithubGuide,
  onOpenBackup,
  onOpenAiSettings,
  isOnlyFavorites,
  onToggleOnlyFavorites,
  favoritesCount,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown when tapping outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }
    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

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
              <span className="hidden lg:inline-block text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 whitespace-nowrap">
                PWA / GH-Pages Ready
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-stone-400 truncate hidden md:block">
              特徵 · 營養 · 處理 · 生態分佈百科
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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

          {/* Primary Add Plant Button (Guaranteed single line on all screen sizes) */}
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
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl py-1.5 z-50 text-xs text-stone-200 animate-in fade-in slide-in-from-top-2 duration-150">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
