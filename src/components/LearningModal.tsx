import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Brain,
  RotateCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  Award,
  Layers,
  ChevronRight,
  ChevronLeft,
  Eye,
  Utensils,
  ArrowLeft,
} from 'lucide-react';
import { PlantItem } from '../types/plant';
import { notifyModalClosed, registerModalOpen } from '../utils/modalGuard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plants: PlantItem[];
}

type ModeType = 'flashcard' | 'leaf_quiz' | 'cooking_quiz';

export const LearningModal: React.FC<Props> = ({ isOpen, onClose, plants }) => {
  const [selectedMode, setSelectedMode] = useState<ModeType | null>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [needsReviewIds, setNeedsReviewIds] = useState<Set<string>>(new Set());

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Filter valid plants that have photos / descriptions
  const validPlants = useMemo(() => {
    return plants.filter((p) => p && p.name && p.name.trim());
  }, [plants]);

  // Shuffled plant deck
  const [deck, setDeck] = useState<PlantItem[]>([]);

  // Initialize or reshuffle deck
  const shuffleDeck = () => {
    if (validPlants.length === 0) return;
    const shuffled = [...validPlants].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCardIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setNeedsReviewIds(new Set());

    setQuizIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setQuizFinished(false);
  };

  const handleStartMode = (mode: ModeType) => {
    setSelectedMode(mode);
    shuffleDeck();
  };

  useEffect(() => {
    if (isOpen) {
      // Reset mode selection landing on modal open
      setSelectedMode(null);
    }
  }, [isOpen]);

  // Close on Escape
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

  const currentPlant = deck[cardIndex] || deck[0];

  // Prepare Quiz Questions
  // Mode 2 (leaf_quiz): Question = Leaf Feature description -> Answer = Plant Name
  // Mode 3 (cooking_quiz): Question = Plant Name -> Answer = Bushcraft Processing/Cooking method
  const currentQuizItem = useMemo(() => {
    if (!selectedMode || selectedMode === 'flashcard' || deck.length < 2 || quizIndex >= deck.length) return null;
    const target = deck[quizIndex];
    if (!target) return null;

    if (selectedMode === 'leaf_quiz') {
      const leafText = target.characteristics.leaves?.trim() || '葉部形態特徵記錄於植物百科中';

      // Pick 3 wrong options
      const otherPlants = validPlants.filter((p) => p.id !== target.id);
      const shuffledOthers = [...otherPlants].sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [target.name, ...shuffledOthers.map((p) => p.name)].sort(() => Math.random() - 0.5);

      return {
        target,
        question: `【葉子特徵猜植物】根據以下「葉部形態特徵」，請問這是哪一種植物？`,
        prompt: leafText,
        correctAnswer: target.name,
        options,
        explanation: `葉部形態特徵：${leafText}`,
      };
    } else if (selectedMode === 'cooking_quiz') {
      // Plant Name -> Bushcraft Cooking Method
      const primaryMethod =
        target.preparation.cookingMethods && target.preparation.cookingMethods.length > 0
          ? target.preparation.cookingMethods.join('、')
          : target.isEdible === false
          ? '此植物非食用植物 / 具毒性或未明，嚴禁食用'
          : target.preparation.prepMethod || '野外水洗及煮沸脫苦';

      // Create distractors from other plants
      const otherMethods = validPlants
        .filter((p) => p.id !== target.id)
        .map((p) => {
          if (p.isEdible === false) return '非食用植物，嚴禁煮食';
          return p.preparation.cookingMethods && p.preparation.cookingMethods.length > 0
            ? p.preparation.cookingMethods.join('、')
            : p.preparation.prepMethod || '水洗汆燙脫澀';
        })
        .filter((m) => m !== primaryMethod);

      const uniqueOthers = Array.from(new Set(otherMethods)).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [primaryMethod, ...uniqueOthers].sort(() => Math.random() - 0.5);

      return {
        target,
        question: `【求生加工與料理】「${target.name}」在野外最正確的處理與求生烹煮手法為？`,
        prompt: `（拉丁學名：${target.scientificName || '未標註'}，科別：${target.family}）`,
        correctAnswer: primaryMethod,
        options,
        explanation: `求生處理要點：${target.preparation.prepMethod || primaryMethod}`,
      };
    }

    return null;
  }, [deck, quizIndex, selectedMode, validPlants]);

  if (!isOpen) return null;

  const handleNextCard = (mastered: boolean) => {
    if (!currentPlant) return;
    if (mastered) {
      setMasteredIds((prev) => new Set(prev).add(currentPlant.id));
    } else {
      setNeedsReviewIds((prev) => new Set(prev).add(currentPlant.id));
    }

    setIsFlipped(false);
    setTimeout(() => {
      if (cardIndex + 1 < deck.length) {
        setCardIndex((prev) => prev + 1);
      } else {
        setQuizFinished(true);
      }
    }, 150);
  };

  const handleSelectQuizOption = (opt: string) => {
    if (isSubmitted || !currentQuizItem) return;
    setSelectedOption(opt);
    setIsSubmitted(true);

    if (opt === currentQuizItem.correctAnswer) {
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex + 1 < deck.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          notifyModalClosed();
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-2xl rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-900/95 shrink-0">
          <div className="flex items-center gap-3">
            {selectedMode ? (
              <button
                onClick={() => setSelectedMode(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-medium"
                title="返回選擇模式"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden xs:inline">重選模式</span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-600/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                <Brain className="w-5 h-5" />
              </div>
            )}

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>
                  {selectedMode === 'flashcard'
                    ? '圖片記憶字卡特訓'
                    : selectedMode === 'leaf_quiz'
                    ? '葉子特徵猜植物'
                    : selectedMode === 'cooking_quiz'
                    ? '求生加工與料理問答'
                    : '野外圖鑑學習特訓'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-900/80 border border-amber-600/60 text-amber-300 font-normal">
                  共 {validPlants.length} 種植物
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                {selectedMode === 'flashcard'
                  ? '點擊卡片雙面翻牌，對照照片與詳細特徵'
                  : selectedMode === 'leaf_quiz'
                  ? '根據葉部形態特徵，選出正確植物名稱'
                  : selectedMode === 'cooking_quiz'
                  ? '根據植物名稱，選出野外最正確的求生處理與料理手法'
                  : '請選擇您要進行的野外圖鑑特訓模式'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {validPlants.length < 2 ? (
            <div className="p-8 text-center space-y-3 bg-stone-950/60 border border-stone-800 rounded-2xl text-stone-400">
              <Brain className="w-12 h-12 text-stone-600 mx-auto" />
              <div className="font-semibold text-stone-200 text-base">圖鑑紀錄資料不足</div>
              <p className="text-xs leading-relaxed max-w-sm mx-auto">
                學習特訓需要至少 2 種以上的植物資料才能生成考題與選項。請點選主畫面右上角「＋新增」或「AI 智能填寫」收集更多植物吧！
              </p>
            </div>
          ) : selectedMode === null ? (
            /* MODE SELECTION LANDING SCREEN (外部選擇三種訓練模式) */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-xs text-stone-400 font-medium px-1">
                選擇特訓模式即可開始複習：
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {/* Mode Option 1: Flashcards */}
                <div
                  onClick={() => handleStartMode('flashcard')}
                  className="group p-4 sm:p-5 rounded-2xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/80 transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-600/60 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                          1. 圖片對應名稱 (字卡記憶)
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-700 font-medium">
                          雙面翻牌
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        正面展示清晰植物照片，點擊翻面查看正確名稱、學名、科別、葉部特徵與求生料理。
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0" />
                </div>

                {/* Mode Option 2: Leaf Quiz */}
                <div
                  onClick={() => handleStartMode('leaf_quiz')}
                  className="group p-4 sm:p-5 rounded-2xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-500/80 transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                          2. 葉子特徵對應名稱 (選擇題)
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700 font-medium">
                          單選測驗
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        根據「葉部形態特徵」關鍵描述出題，由您選出對應的正確植物名稱，考驗葉形鑑別力！
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition shrink-0" />
                </div>

                {/* Mode Option 3: Cooking Quiz */}
                <div
                  onClick={() => handleStartMode('cooking_quiz')}
                  className="group p-4 sm:p-5 rounded-2xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-purple-500/80 transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-600/60 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                          3. 名稱對應加工或料理手法 (選擇題)
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-700 font-medium">
                          求生技能
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        根據植物名稱與種類，選出野外求生中最正確的脫毒、發酵、低溫熬煮或葉蛋白萃取手法。
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-purple-400 group-hover:translate-x-1 transition shrink-0" />
                </div>
              </div>
            </div>
          ) : quizFinished ? (
            /* Round Finished Summary */
            <div className="p-6 bg-stone-950/80 border border-stone-800 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-950/90 border border-amber-500/60 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">特訓挑戰完成！</h3>
                <p className="text-xs text-stone-400 mt-1">
                  您已完成本輪 {deck.length} 題野外植物圖鑑測驗
                </p>
              </div>

              {selectedMode === 'flashcard' ? (
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs">
                  <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-300">
                    <div className="text-lg font-extrabold">{masteredIds.size}</div>
                    <div>已精準熟記</div>
                  </div>
                  <div className="p-3 bg-amber-950/60 border border-amber-700/60 rounded-xl text-amber-300">
                    <div className="text-lg font-extrabold">{needsReviewIds.size}</div>
                    <div>尚需複習強化</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/50 border border-emerald-600/60 rounded-2xl max-w-xs mx-auto space-y-1">
                  <span className="text-xs text-emerald-300 font-medium">總獲得測驗積分</span>
                  <div className="text-3xl font-black text-white">{score} <span className="text-xs font-normal text-emerald-400">分</span></div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer"
                >
                  ← 選擇其他模式
                </button>
                <button
                  onClick={shuffleDeck}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>重新出題</span>
                </button>
              </div>
            </div>
          ) : selectedMode === 'flashcard' ? (
            /* WORKSPACE 1: Flashcards (Clean & Focused) */
            <div className="space-y-4">
              {/* Progress & Flip Control */}
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>卡片進度：{cardIndex + 1} / {deck.length}</span>
                <button
                  type="button"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-600/50 text-amber-300 hover:bg-amber-900 transition cursor-pointer text-xs font-semibold"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFlipped ? '翻回正面 (照片)' : '翻面看解答 (名稱與特徵)'}</span>
                </button>
              </div>

              {/* Flashcard Container */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="relative w-full min-h-[350px] sm:min-h-[390px] rounded-2xl cursor-pointer select-none group"
              >
                {!isFlipped ? (
                  /* FRONT: Photo + Family + Guess prompt */
                  <div className="w-full h-[350px] sm:h-[390px] rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 shadow-xl overflow-hidden flex flex-col transition-all duration-200">
                    {currentPlant?.images && currentPlant.images.length > 0 ? (
                      <div className="relative flex-1 w-full overflow-hidden bg-stone-900">
                        <img
                          src={currentPlant.images[0].dataUrl}
                          alt={currentPlant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/60 backdrop-blur-md">
                            {currentPlant.family}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-center">
                          <div className="inline-flex items-center gap-2 text-stone-200 text-xs font-semibold bg-stone-900/90 px-4 py-2 rounded-xl backdrop-blur-md border border-amber-500/50 shadow-lg">
                            <RotateCw className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                            <span>猜猜這是哪種植物？點擊卡片翻看特徵解答</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-stone-900/80">
                        <Layers className="w-12 h-12 text-stone-600 mb-2" />
                        <span className="text-sm font-semibold text-stone-300">{currentPlant?.family}</span>
                        <span className="text-xs text-stone-500 mt-1">無照片 · 點擊卡片翻面看特徵與答案</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* BACK: Complete Botanical Answer & Characteristics */
                  <div className="w-full h-[350px] sm:h-[390px] rounded-2xl bg-stone-900 border border-emerald-500/80 p-5 shadow-2xl overflow-y-auto flex flex-col justify-between text-left transition-all duration-200 animate-in fade-in zoom-in-95">
                    <div className="space-y-3">
                      {/* Name & Taxonomy */}
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                        <div>
                          <div className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">植物特徵解答</div>
                          <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                            <span>{currentPlant?.name}</span>
                            {currentPlant?.isEdible === false ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600">
                                🚫 不可食用
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                                🌿 可食用
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-stone-400 italic">{currentPlant?.scientificName}</p>
                        </div>
                        <span className="text-xs text-emerald-400 font-semibold px-2.5 py-1 bg-emerald-950/80 rounded-lg border border-emerald-800">
                          {currentPlant?.family}
                        </span>
                      </div>

                      {/* Leaf Characteristics */}
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-amber-300 flex items-center gap-1">
                          <span>🍃 葉部形態特徵：</span>
                        </div>
                        <p className="text-stone-200 text-xs leading-relaxed bg-stone-950/90 p-2.5 rounded-xl border border-stone-800">
                          {currentPlant?.characteristics?.leaves || '葉部形態特徵載於完整圖鑑'}
                        </p>
                      </div>

                      {/* Bushcraft / Cooking Methods */}
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-purple-300 flex items-center gap-1">
                          <span>🍳 野外求生加工與料理手法：</span>
                        </div>
                        <p className="text-stone-200 text-xs leading-relaxed bg-stone-950/90 p-2.5 rounded-xl border border-stone-800">
                          {currentPlant?.preparation?.cookingMethods?.length
                            ? currentPlant.preparation.cookingMethods.join('、')
                            : currentPlant?.preparation?.prepMethod || '無特殊加工'}
                        </p>
                      </div>

                      {/* Toxicity & Antinutrients */}
                      {currentPlant?.preparation?.toxicityNotes && (
                        <div className="space-y-1 text-xs">
                          <div className="font-semibold text-rose-300">⚠️ 安全與毒性提示：</div>
                          <p className="text-stone-300 text-[11px] leading-relaxed bg-stone-950/90 p-2.5 rounded-xl border border-stone-800">
                            {currentPlant.preparation.toxicityNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 text-center text-[11px] text-amber-400/90 font-medium">
                      ↩️ 點擊卡片翻回正面照片
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleNextCard(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-98 border border-stone-700 text-amber-300 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-4 h-4 text-amber-400" />
                  <span>尚需複習</span>
                </button>

                <button
                  onClick={() => handleNextCard(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold transition cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>已精準熟記</span>
                </button>
              </div>
            </div>
          ) : (
            /* WORKSPACE 2 & 3: Multiple Choice Quizzes (Clean & Focused) */
            currentQuizItem && (
              <div className="space-y-4">
                {/* Header score & streak */}
                <div className="flex items-center justify-between px-1 text-xs text-stone-400">
                  <span>題目 {quizIndex + 1} / {deck.length}</span>
                  <div className="flex items-center gap-3 font-semibold">
                    {streak > 1 && (
                      <span className="text-amber-400 animate-pulse flex items-center gap-1">
                        <Flame className="w-4 h-4 fill-amber-500" /> 連勝 {streak} 題
                      </span>
                    )}
                    <span className="text-emerald-400">目前分數：{score} 分</span>
                  </div>
                </div>

                {/* Question Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{currentQuizItem.question}</span>
                  </div>
                  <div className="text-sm font-medium text-stone-100 leading-relaxed bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                    {currentQuizItem.prompt}
                  </div>
                </div>

                {/* Choices */}
                <div className="space-y-2.5">
                  {currentQuizItem.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === currentQuizItem.correctAnswer;

                    let btnClass =
                      'bg-stone-800/90 hover:bg-stone-800 border-stone-700 text-stone-200';
                    if (isSubmitted) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-950 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 font-bold';
                      } else if (isSelected) {
                        btnClass = 'bg-rose-950 border-rose-600 text-rose-200';
                      } else {
                        btnClass = 'bg-stone-950 border-stone-850 text-stone-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isSubmitted}
                        onClick={() => handleSelectQuizOption(opt)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition cursor-pointer flex items-center justify-between ${btnClass}`}
                      >
                        <span className="font-medium">{opt}</span>
                        {isSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation / Next Question */}
                {isSubmitted && (
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2 animate-in fade-in">
                    {selectedMode !== 'leaf_quiz' && currentQuizItem.explanation && (
                      <p className="text-xs text-stone-300 leading-relaxed">
                        💡 <strong>解析提示：</strong>{currentQuizItem.explanation}
                      </p>
                    )}
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>下一題</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
