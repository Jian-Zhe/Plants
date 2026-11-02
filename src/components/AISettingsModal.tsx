import React, { useState } from 'react';
import { X, Sparkles, Key, Check, Cpu, Zap, ShieldCheck, Info } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, getStoredModel, setStoredModel, AVAILABLE_MODELS } from '../utils/gemini';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [keyInput, setKeyInput] = useState(() => getStoredApiKey());
  const [modelInput, setModelInput] = useState(() => getStoredModel());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(keyInput);
    setStoredModel(modelInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex flex-col justify-center items-center animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] overflow-hidden my-auto relative">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-600/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">AI 智能填寫與模型設定</h2>
              <p className="text-xs text-stone-400">自訂 Gemini 模型與 API Key，避免額度過快耗盡</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-stone-300">
          {/* Why Quota Depletes Explanation Box */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-600/60 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs sm:text-sm">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>為什麼高階模型額度會太快耗盡？</span>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              Google Gemini 免費層（Free Tier）針對高階模型（如 <strong>Gemini 3.8 Flash</strong>）設有嚴格的每分鐘請求次數 (RPM) 與每日上限 (RPD)，連續幾次查詢就容易觸發 <code className="text-rose-300 bg-stone-900 px-1 rounded font-mono">429 資源耗盡 (RESOURCE_EXHAUSTED)</code>。
            </p>
            <p className="text-emerald-300 text-xs leading-relaxed font-medium">
              💡 <strong>推薦方案</strong>：選擇下方「<strong>Gemini 3.1 Flash Lite</strong>」，它是官方專為高頻率查詢設計的輕量模型，配額限制最寬鬆、速度最快且最不易耗盡！
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-stone-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>選擇使用的 Gemini 模型</span>
            </label>

            <div className="space-y-2">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = modelInput === m.id;
                return (
                  <label
                    key={m.id}
                    onClick={() => setModelInput(m.id)}
                    className={`block p-3 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500 shadow-md'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gemini_model"
                          checked={isSelected}
                          onChange={() => setModelInput(m.id)}
                          className="text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                        />
                        <span className="font-bold text-xs sm:text-sm text-white">{m.name}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          m.isRecommended
                            ? 'bg-emerald-900 border-emerald-500 text-emerald-300'
                            : 'bg-stone-800 border-stone-700 text-stone-400'
                        }`}
                      >
                        {m.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 pl-5.5 leading-relaxed">
                      {m.desc}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div className="pt-2 border-t border-stone-800">
            <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Gemini API Key (保存在您的本機瀏覽器)</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              可在 Google AI Studio 免費取得 API Key 填入即可使用。
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>設定已成功儲存！下次 AI 查詢將優先使用您所選取的模型。</span>
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
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md transition cursor-pointer"
          >
            儲存模型與設定
          </button>
        </div>
      </div>
    </div>
  );
};
