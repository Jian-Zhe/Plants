import React, { useState } from 'react';
import { PlantItem, ToxicityLevel } from '../types/plant';
import {
  X,
  Heart,
  Edit3,
  Trash2,
  Flame,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Mountain,
  Calendar,
  Utensils,
  BookOpen,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Share2,
  Ban,
} from 'lucide-react';

interface Props {
  plant: PlantItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (plant: PlantItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (plant: PlantItem) => void;
}

export const PlantDetailModal: React.FC<Props> = ({
  plant,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !plant) return null;

  const currentImage = plant.images[activeImageIndex] || plant.images[0];

  const handleShare = () => {
    const text = `🌿【${plant.name}】(${plant.family})\n熱量: ${plant.nutrition.calories} kcal/100g | 蛋白質: ${plant.nutrition.protein}g/100g\n辨識要點: ${plant.characteristics.distinctiveFeatures}\n處理方式: ${plant.preparation.prepMethod}`;
    if (navigator.share) {
      navigator.share({
        title: `植感野誌 - ${plant.name}`,
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const renderToxicityNotice = (level: ToxicityLevel, notes: string) => {
    switch (level) {
      case 'none':
        return (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-300 text-sm">全株安全無毒</div>
              <p className="text-xs text-emerald-200/90 mt-0.5">{notes || '無已知天然毒性，一般民眾均可安心適量食用。'}</p>
            </div>
          </div>
        );
      case 'caution':
        return (
          <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-600/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-300 text-sm">注意處理（微毒 / 草酸需川燙）</div>
              <p className="text-xs text-amber-200/90 mt-0.5">{notes || '含微量草酸或微毒成分，烹調前務必先以沸水徹底汆燙去水。'}</p>
            </div>
          </div>
        );
      case 'toxic_raw':
        return (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/70 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-300 text-sm">生食有毒，嚴禁未煮熟食用！</div>
              <p className="text-xs text-rose-200/90 mt-0.5">{notes}</p>
            </div>
          </div>
        );
      case 'warning':
        return (
          <div className="p-3.5 rounded-xl bg-purple-950/70 border border-purple-600/70 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-purple-200 text-sm">特定部位或未熟果實有毒！</div>
              <p className="text-xs text-purple-200/90 mt-0.5">{notes}</p>
            </div>
          </div>
        );
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-stone-900 border border-stone-700/80 shadow-2xl text-stone-100 overflow-hidden my-auto"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-900/95 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {plant.isEdible === false ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-600 flex items-center gap-1 shadow-sm">
                <Ban className="w-3.5 h-3.5 text-rose-400" />
                無法食用
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1 shadow-sm">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                可食用
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
              {plant.family}
            </span>
            <span className="text-xs text-stone-400 hidden sm:inline">
              · {plant.category === 'wild' ? '野生採集' : plant.category === 'cultivated' ? '園藝栽培' : plant.category === 'herb' ? '芳香香草' : plant.category === 'medicinal' ? '草本藥用' : '澱粉根莖'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(plant)}
              aria-label={plant.isFavorite ? '取消收藏' : '加入收藏'}
              className="p-2 text-stone-300 hover:text-amber-400 rounded-xl hover:bg-stone-800 transition"
              title="收藏"
            >
              <Heart
                className={`w-5 h-5 ${plant.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-stone-300 hover:text-emerald-400 rounded-xl hover:bg-stone-800 transition relative"
              title="分享植物資料"
            >
              <Share2 className="w-5 h-5" />
              {copiedShare && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                  已複製！
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onEdit(plant);
                onClose();
              }}
              className="p-2 text-stone-300 hover:text-blue-400 rounded-xl hover:bg-stone-800 transition"
              title="編輯"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`確定要刪除「${plant.name}」嗎？`)) {
                  onDelete(plant.id);
                  onClose();
                }
              }}
              className="p-2 text-stone-300 hover:text-rose-400 rounded-xl hover:bg-stone-800 transition"
              title="刪除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="w-px h-5 bg-stone-800 mx-1" />
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition"
              aria-label="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-7 text-stone-200">
          {/* Top Hero: Images + Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Gallery */}
            <div className="space-y-2">
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-800">
                {currentImage ? (
                  <img
                    src={currentImage.dataUrl}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600 text-sm">
                    尚無照片
                  </div>
                )}

                {/* Multiple Images Navigation Controls */}
                {plant.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex(
                          (prev) => (prev - 1 + plant.images.length) % plant.images.length
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                      aria-label="上一張照片"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev + 1) % plant.images.length)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                      aria-label="下一張照片"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] text-white">
                      {activeImageIndex + 1} / {plant.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {plant.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {plant.images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                        activeImageIndex === idx
                          ? 'border-emerald-500 scale-95'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {currentImage?.caption && (
                <p className="text-xs text-stone-400 italic text-center">
                  {currentImage.caption}
                </p>
              )}
            </div>

            {/* Title & Core Overview */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {plant.name}
                </h1>
                {plant.scientificName && (
                  <p className="text-sm text-emerald-400 font-serif italic mt-0.5">
                    {plant.scientificName}
                  </p>
                )}
                {plant.aliases && plant.aliases.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-xs text-stone-400">別名：</span>
                    {plant.aliases.map((alias) => (
                      <span
                        key={alias}
                        className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-xs"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Edible Parts vs Inedible Alert */}
              {plant.isEdible === false ? (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/70 text-rose-200 text-xs flex items-start gap-2.5 shadow-sm">
                  <Ban className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-rose-300">無法食用植物警示：</strong>
                    <p className="mt-0.5 text-stone-200 leading-relaxed">
                      此植物為非食用或具毒性植物，僅供野外外觀形態辨識與防誤採觀察，請勿採食！
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-semibold text-stone-400 block mb-1">
                    可食用部位：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {plant.edibleParts && plant.edibleParts.length > 0 ? (
                      plant.edibleParts.map((part) => (
                        <span
                          key={part}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                        >
                          🌱 {part}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-500">無特別記載</span>
                    )}
                  </div>
                </div>
              )}

              {/* Toxicity Alert */}
              {renderToxicityNotice(plant.preparation.toxicity, plant.preparation.toxicityNotes)}

              {/* Taste / Flavor Profile (Only for edible plants) */}
              {plant.isEdible !== false && plant.preparation.flavorProfile && (
                <div className="p-3 bg-stone-800/40 rounded-xl border border-stone-800 text-xs text-stone-300">
                  <strong className="text-stone-200">風味口感：</strong> {plant.preparation.flavorProfile}
                </div>
              )}
            </div>
          </div>

          {/* 1. 營養指標儀表板 (Only for edible plants) */}
          {plant.isEdible !== false && (
            <div className="space-y-3 p-5 rounded-2xl bg-stone-950 border border-stone-800">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  營養成分數值 (每 100g 鮮重)
                </h2>
                <span className="text-xs text-stone-400">衛福部/植物營養學參考值</span>
              </div>

            {/* Core Macro Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  熱量能量
                </span>
                <div className="text-lg font-extrabold text-orange-400 mt-1">
                  {plant.nutrition.calories} <span className="text-xs font-normal text-stone-400">kcal</span>
                </div>
                <div className="w-full bg-stone-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (plant.nutrition.calories / 150) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  粗蛋白質
                </span>
                <div className="text-lg font-extrabold text-blue-400 mt-1">
                  {plant.nutrition.protein} <span className="text-xs font-normal text-stone-400">g</span>
                </div>
                <div className="w-full bg-stone-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (plant.nutrition.protein / 8) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                <span className="text-[11px] text-stone-400">🌾 膳食纖維</span>
                <div className="text-lg font-extrabold text-emerald-400 mt-1">
                  {plant.nutrition.fiber} <span className="text-xs font-normal text-stone-400">g</span>
                </div>
                <div className="w-full bg-stone-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (plant.nutrition.fiber / 5) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                <span className="text-[11px] text-stone-400">🍞 碳水化合物</span>
                <div className="text-lg font-extrabold text-stone-200 mt-1">
                  {plant.nutrition.carbohydrates} <span className="text-xs font-normal text-stone-400">g</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] text-stone-400">🥑 粗脂肪</span>
                <div className="text-lg font-extrabold text-stone-200 mt-1">
                  {plant.nutrition.fat} <span className="text-xs font-normal text-stone-400">g</span>
                </div>
              </div>
            </div>

            {/* Micronutrients Pill Badges */}
            {plant.nutrition.micronutrients && (
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                {plant.nutrition.micronutrients.calciumMg && (
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-300">
                    🥛 鈣質: <strong className="text-white">{plant.nutrition.micronutrients.calciumMg} mg</strong>
                  </span>
                )}
                {plant.nutrition.micronutrients.ironMg && (
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-300">
                    🩸 鐵質: <strong className="text-white">{plant.nutrition.micronutrients.ironMg} mg</strong>
                  </span>
                )}
                {plant.nutrition.micronutrients.vitaminCMg && (
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-300">
                    🍊 維生素 C: <strong className="text-white">{plant.nutrition.micronutrients.vitaminCMg} mg</strong>
                  </span>
                )}
                {plant.nutrition.micronutrients.potassiumMg && (
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-300">
                    ⚡ 鉀離子: <strong className="text-white">{plant.nutrition.micronutrients.potassiumMg} mg</strong>
                  </span>
                )}
              </div>
            )}

            {/* Highlights */}
            {plant.nutrition.nutritionHighlights && plant.nutrition.nutritionHighlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {plant.nutrition.nutritionHighlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/50 border border-amber-700/50 px-2 py-0.5 rounded-full"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. 植物形態與鑑別特徵 (Botanical Characteristics) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            植物外觀與辨識特徵
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-1">
              <span className="font-semibold text-emerald-400 text-xs">🍃 葉部形態：</span>
              <p className="text-stone-300 leading-relaxed">{plant.characteristics.leaves}</p>
            </div>

            <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-1">
              <span className="font-semibold text-emerald-400 text-xs">🎋 莖與根特徵：</span>
              <p className="text-stone-300 leading-relaxed">{plant.characteristics.stemAndRoots}</p>
            </div>

            <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-1">
              <span className="font-semibold text-emerald-400 text-xs">🌸 花部特徵：</span>
              <p className="text-stone-300 leading-relaxed">{plant.characteristics.flowers}</p>
            </div>

            <div className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-1">
              <span className="font-semibold text-emerald-400 text-xs">🍒 果實與種子：</span>
              <p className="text-stone-300 leading-relaxed">{plant.characteristics.fruitsAndSeeds || '暫無記載'}</p>
            </div>
          </div>

          {/* Distinctive Features / Anti-poisoning ID Tips */}
          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1.5">
            <div className="font-semibold text-stone-100 text-sm flex items-center gap-1.5">
              <span className="text-emerald-400">🔍</span>
              關鍵辨識要點與防混淆：
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {plant.characteristics.distinctiveFeatures}
            </p>
          </div>
        </div>

        {/* 3. 處理方式與料理手法 (Preparation & Survival Bushcraft - only for edible plants) */}
        {plant.isEdible !== false && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
              <Flame className="w-5 h-5 text-amber-400" />
              野外求生前置脫毒與料理手法
            </h2>

            {/* Antinutrient & Removal Box if present */}
            {(plant.preparation.antinutrients || plant.preparation.antinutrientRemoval) && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 via-stone-900 to-amber-950/30 border border-rose-900/50 space-y-3">
                {plant.preparation.antinutrients && (
                  <div>
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      🧪 含有之抗營養物質 (Anti-nutritional Factors)：
                    </span>
                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                      {plant.preparation.antinutrients}
                    </p>
                  </div>
                )}

                {plant.preparation.antinutrientRemoval && (
                  <div className="pt-2 border-t border-stone-800/80">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                      <Flame className="w-4 h-4 text-amber-400" />
                      🛠️ 求生中和脫除處理 (Neutralization & Leaching)：
                    </span>
                    <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                      {plant.preparation.antinutrientRemoval}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800 space-y-2">
              <div className="font-semibold text-stone-200 text-xs sm:text-sm">
                🥣 野外前置處理步驟：
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {plant.preparation.prepMethod}
              </p>
            </div>

            {/* Cooking suggestions - Survival Bushcraft style */}
            <div>
              <span className="text-xs font-semibold text-amber-300 block mb-2">
                🔥 野外求生加工與料理手法：
              </span>
              <div className="flex flex-wrap gap-2">
                {plant.preparation.cookingMethods.map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 rounded-xl bg-amber-950/70 text-amber-200 text-xs font-medium border border-amber-800/60 shadow-sm"
                  >
                    🔥 {method}
                  </span>
                ))}
              </div>
            </div>

            {plant.preparation.storageMethod && (
              <div className="text-xs text-stone-400">
                <strong className="text-stone-300">野外保存建議：</strong> {plant.preparation.storageMethod}
              </div>
            )}
          </div>
        )}

          {/* 4. 生態分佈與棲地 (Ecology & Distribution) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
              <Mountain className="w-5 h-5 text-emerald-400" />
              生態分佈與適宜季節
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                <span className="text-stone-400 font-semibold block">生長棲地環境</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {plant.distribution.habitat.map((h) => (
                    <span key={h} className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                <span className="text-stone-400 font-semibold block">海拔與地勢</span>
                <p className="text-stone-200">{plant.distribution.elevationDesc || (plant.distribution.elevation === 'low' ? '低海拔平原淺山' : plant.distribution.elevation === 'mid' ? '中海拔' : '高海拔')}</p>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                <span className="text-stone-400 font-semibold block">採集季節</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {plant.distribution.season.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                      <Calendar className="w-2.5 h-2.5 inline mr-1" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {plant.distribution.regions && plant.distribution.regions.length > 0 && (
              <div className="text-xs text-stone-400">
                <strong className="text-stone-300">分佈區域：</strong> {plant.distribution.regions.join('、')}
              </div>
            )}
          </div>

          {/* 5. 個人採集筆記 (User Field Notes) */}
          {(plant.userNotes || plant.foragingLocations) && (
            <div className="space-y-3 p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs sm:text-sm">
              <h3 className="font-bold text-stone-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                我的野外採集筆記與心得
              </h3>
              {plant.foragingLocations && (
                <div className="text-stone-300">
                  <strong className="text-stone-400">發現地點：</strong> {plant.foragingLocations}
                </div>
              )}
              {plant.userNotes && (
                <p className="text-stone-300 whitespace-pre-line leading-relaxed">
                  {plant.userNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/80 flex justify-between items-center text-xs text-stone-500">
          <span>最後更新：{new Date(plant.updatedAt || plant.createdAt).toLocaleDateString()}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition"
          >
            返回圖鑑
          </button>
        </div>
      </div>
    </div>
  );
};
