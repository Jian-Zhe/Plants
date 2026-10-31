import React, { useState } from 'react';
import { X, Sparkles, Key, Check, AlertCircle } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../utils/gemini';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [keyInput, setKeyInput] = useState(() => getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(keyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex flex-col justify-center items-center animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] overflow-hidden my-auto relative">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-600/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">AI 智能快速填寫設定</h2>
              <p className="text-xs text-stone-400">支援輸入任意植物名稱一鍵產生特徵與營養檔案</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-300">
          <div className="p-3.5 bg-stone-800/60 rounded-xl border border-stone-700/60 leading-relaxed">
            <p className="text-stone-300">
              「植感野誌」內建雙重快速填寫機制：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-stone-400">
              <li><strong>內建百科範本</strong>：輸入或挑選 18+ 種經典台灣野生與食用植物即可<strong>離線秒填</strong>，不需要 API Key。</li>
              <li><strong>Gemini 智能生成</strong>：輸入任意罕見植物（如「水芹菜」、「假蒟」），點擊「✨ AI 智能自動補全」即可全自動填入科別、外觀特徵、卡路里、蛋白質與生態分佈！</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Gemini API Key (選填，保存在您的本機瀏覽器)</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              若部署在個人的 GitHub Pages 上，可在 Google AI Studio 免費取得 API Key 填入即可使用 AI 功能。
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>設定已成功儲存！</span>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/70 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-300 transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md transition"
          >
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
};
