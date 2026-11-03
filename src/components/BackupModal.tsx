import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Upload, Trash2, CheckCircle, AlertTriangle, FileText, Sparkles, Wand2, RotateCw } from 'lucide-react';
import {
  exportPlantsJSON,
  importPlantsJSON,
  deduplicateAllPlants,
  deletePresetPlantsOnly,
  getAllPlants,
  purgeLocalCacheAndResyncCloud,
} from '../utils/db';
import { PlantItem } from '../types/plant';
import { notifyModalClosed, registerModalOpen } from '../utils/modalGuard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: (plants: PlantItem[]) => void;
  totalPlants: number;
  userUid?: string | null;
}

export const BackupModal: React.FC<Props> = ({ isOpen, onClose, onDataChanged, totalPlants, userUid }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unregisterModal = registerModalOpen();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      unregisterModal();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const json = await exportPlantsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `botanicalog-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: '備份檔已成功匯出至您的裝置！' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: '匯出備份失敗：' + String(err) });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          const res = await importPlantsJSON(text, userUid);
          setStatusMessage({
            type: 'success',
            text: `匯入成功！新增 ${res.added} 筆，智慧合併更新 ${res.updated} 筆，目前共 ${res.total} 筆植物。已自動去重！`,
          });
          const updated = await getAllPlants();
          onDataChanged(updated);
        } catch (importErr) {
          setStatusMessage({ type: 'error', text: String(importErr) });
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setStatusMessage({ type: 'error', text: '讀取檔案失敗：' + String(err) });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeduplicate = async () => {
    setIsProcessing(true);
    try {
      const removed = await deduplicateAllPlants(userUid);
      const updated = await getAllPlants();
      onDataChanged(updated);
      if (removed > 0) {
        setStatusMessage({ type: 'success', text: `智慧清理完成！已自動合併並移除 ${removed} 筆重複植物。` });
      } else {
        setStatusMessage({ type: 'success', text: '圖鑑非常乾淨，未發現重複名稱的植物！' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: '清理失敗：' + String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePresets = async () => {
    if (!window.confirm('確定要刪除所有預設的植物範本嗎？')) return;
    setIsProcessing(true);
    try {
      const remaining = await deletePresetPlantsOnly(userUid);
      onDataChanged(remaining);
      setStatusMessage({ type: 'success', text: '已清除所有預設植物！' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: '清除失敗：' + String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceResync = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const freshPlants = await purgeLocalCacheAndResyncCloud(userUid);
      onDataChanged(freshPlants);
      setStatusMessage({
        type: 'success',
        text: userUid
          ? `清理完成！已抹除本機殘留快取，並從雲端資料庫重新同步 ${freshPlants.length} 筆最新植物。`
          : '本機快取已清空重整！',
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: '重新整理快取失敗：' + String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          notifyModalClosed();
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] overflow-hidden my-auto"
      >
        {/* Header (pinned to top) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">資料管理與備份</h2>
              <p className="text-xs text-stone-400">目前記錄植物共 {totalPlants} 筆</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-700 text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Export JSON */}
            <button
              onClick={handleExport}
              className="flex flex-col items-center justify-center p-5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 hover:border-emerald-500/60 transition group text-center cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition">
                <Download className="w-5 h-5" />
              </div>
              <span className="font-semibold text-stone-200">匯出完整備份 (JSON)</span>
              <span className="text-xs text-stone-400 mt-1">包含所有特徵、營養、照片與筆記</span>
            </button>

            {/* Import JSON */}
            <label className="flex flex-col items-center justify-center p-5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 hover:border-blue-500/60 transition group text-center cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-11 h-11 rounded-full bg-blue-950/80 border border-blue-600/40 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-semibold text-stone-200">匯入還原備份</span>
              <span className="text-xs text-stone-400 mt-1">智慧比對更新，防同名重複</span>
            </label>
          </div>

          {/* Quick Actions */}
          <div className="pt-3 border-t border-stone-800 space-y-3">
            {/* Deduplicate Button */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-stone-300">智慧清理重複植物</div>
                <p className="text-[11px] text-stone-500">掃描並自動合併同名或重複植物，保留最新照片與備註</p>
              </div>
              <button
                onClick={handleDeduplicate}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-300 hover:text-white bg-blue-950/50 hover:bg-blue-900/60 border border-blue-700/60 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>清理重複項</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-stone-300">刪除預設植物</div>
                <p className="text-[11px] text-stone-500">刪除系統自帶的範本植物，保留您自訂新增的植物</p>
              </div>
              <button
                onClick={handleDeletePresets}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清除預設植物</span>
              </button>
            </div>

            {/* Force Resync / Purge Cache */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
              <div>
                <div className="text-xs font-semibold text-emerald-300">重整快取並以雲端為準</div>
                <p className="text-[11px] text-stone-500">清除本機殘留快取或已刪除舊資料，強制重新拉取雲端</p>
              </div>
              <button
                onClick={handleForceResync}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/70 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>重整雲端同步</span>
              </button>
            </div>

          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-300 transition cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
