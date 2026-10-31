import React from 'react';
import { PlantItem, ToxicityLevel } from '../types/plant';
import { Star, Flame, Zap, Mountain, AlertCircle, ShieldCheck, Heart, Edit3, Trash2, Sprout } from 'lucide-react';

interface Props {
  plant: PlantItem;
  onSelect: (plant: PlantItem) => void;
  onEdit: (plant: PlantItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (plant: PlantItem) => void;
}

export const PlantCard: React.FC<Props> = ({
  plant,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const coverImage = plant.images.find((img) => img.isCover)?.dataUrl || plant.images[0]?.dataUrl;

  const renderToxicityBadge = (level: ToxicityLevel) => {
    switch (level) {
      case 'none':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            安全可食
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-sm backdrop-blur-md">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            微毒 / 需汆燙
          </span>
        );
      case 'toxic_raw':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-sm backdrop-blur-md">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            生食有毒 / 需熟食
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-700/60 shadow-sm backdrop-blur-md">
            <AlertCircle className="w-3 h-3 text-purple-400" />
            部位有毒警示
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onSelect(plant)}
      className="group relative flex flex-col rounded-2xl bg-stone-900 border border-stone-800/90 hover:border-emerald-600/60 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-950/20 cursor-pointer text-stone-200"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-950">
        {coverImage ? (
          <img
            src={coverImage}
            alt={plant.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-stone-600 p-4">
            <Sprout className="w-12 h-12 text-stone-700 mb-2 group-hover:text-emerald-500 transition-colors" />
            <span className="text-xs text-stone-500">尚無照片，點擊可新增</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {renderToxicityBadge(plant.preparation.toxicity)}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-900/80 text-stone-300 border border-stone-700/60 backdrop-blur-md">
              {plant.family.split(' ')[0]}
            </span>
            {plant.preparation.antinutrients && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-950/80 text-rose-300 border border-rose-800/60 backdrop-blur-md truncate max-w-[110px]" title={plant.preparation.antinutrients}>
                ⚠️ {plant.preparation.antinutrients.split(/[,，、]/)[0].trim()}
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(plant);
            }}
            aria-label={plant.isFavorite ? '取消收藏' : '加入收藏'}
            className="pointer-events-auto p-1.5 rounded-full bg-stone-950/70 hover:bg-stone-900 text-stone-300 hover:text-amber-400 border border-stone-800 backdrop-blur-md transition shadow"
          >
            <Heart
              className={`w-4 h-4 transition ${
                plant.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
              }`}
            />
          </button>
        </div>

        {/* Bottom overlay in image: plant name & scientific name */}
        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">
              {plant.name}
            </h3>
            {plant.aliases && plant.aliases.length > 0 && (
              <span className="text-xs text-emerald-400/90 font-medium truncate">
                ({plant.aliases[0]})
              </span>
            )}
          </div>
          {plant.scientificName && (
            <p className="text-[11px] text-stone-400 italic truncate font-serif">
              {plant.scientificName}
            </p>
          )}
        </div>
      </div>

      {/* Body Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        {/* Nutrition Highlights Grid */}
        <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 bg-stone-950/60 rounded-xl border border-stone-800/80 text-center">
          <div>
            <div className="text-[10px] text-stone-400 flex items-center justify-center gap-0.5">
              <Flame className="w-2.5 h-2.5 text-orange-400" />
              熱量
            </div>
            <div className="text-xs font-bold text-stone-100 mt-0.5">
              {plant.nutrition.calories} <span className="text-[9px] font-normal text-stone-500">kcal</span>
            </div>
          </div>

          <div className="border-x border-stone-800/80">
            <div className="text-[10px] text-stone-400 flex items-center justify-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-blue-400" />
              蛋白質
            </div>
            <div className="text-xs font-bold text-stone-100 mt-0.5">
              {plant.nutrition.protein} <span className="text-[9px] font-normal text-stone-500">g</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-stone-400 flex items-center justify-center gap-0.5">
              <span className="text-emerald-400 text-[10px]">🌾</span>
              纖維
            </div>
            <div className="text-xs font-bold text-stone-100 mt-0.5">
              {plant.nutrition.fiber} <span className="text-[9px] font-normal text-stone-500">g</span>
            </div>
          </div>
        </div>

        {/* Characteristics Snippet */}
        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
          {plant.characteristics.distinctiveFeatures || plant.characteristics.leaves}
        </p>

        {/* Footer: Habitat & Action Buttons */}
        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5 truncate">
            <Mountain className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-[11px] text-stone-300">
              {plant.distribution.habitat[0] || '野外分佈'} · {plant.distribution.elevation === 'low' ? '低海拔' : plant.distribution.elevation === 'mid' ? '中海拔' : '高海拔'}
            </span>
          </div>

          {/* Quick Edit / Delete (stopPropagation) */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plant);
              }}
              title="編輯記錄"
              aria-label="編輯植物記錄"
              className="p-1 text-stone-400 hover:text-emerald-300 rounded hover:bg-stone-800 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`確定要刪除「${plant.name}」的記錄嗎？`)) {
                  onDelete(plant.id);
                }
              }}
              title="刪除"
              aria-label="刪除植物記錄"
              className="p-1 text-stone-400 hover:text-rose-400 rounded hover:bg-stone-800 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
