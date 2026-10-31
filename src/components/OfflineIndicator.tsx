import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 text-stone-900 px-3.5 py-2 text-xs font-semibold shadow-2xl backdrop-blur-sm border border-amber-400 animate-in slide-in-from-bottom-3 duration-300">
      <WifiOff className="w-4 h-4 text-stone-950 animate-pulse" />
      <span>離線模式中 — 目前使用本機快取與資料庫，野外無網路亦可正常查詢與紀錄！</span>
    </div>
  );
};
