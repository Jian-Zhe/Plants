import React from 'react';
import { PlantItem, ToxicityLevel } from '../types/plant';
import { Heart, Edit3, Trash2, Sprout, Ban, ShieldCheck, AlertCircle, ChevronRight, Mountain } from 'lucide-react';
import { isAnyModalActive } from '../utils/modalGuard';

interface Props {
  plants: PlantItem[];
  onSelect: (plant: PlantItem) => void;
  onEdit: (plant: PlantItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (plant: PlantItem) => void;
}

export const PlantListView: React.FC<Props> = ({
  plants,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const handleItemClick = (e: React.MouseEvent, plant: PlantItem) => {
    // Prevent accidental triggers when a modal or dropdown was recently closed
    if (isAnyModalActive()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onSelect(plant);
  };

  const renderToxicityBadge = (level: ToxicityLevel, isEdible?: boolean) => {
    if (isEdible === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 shrink-0">
          <Ban className="w-3 h-3 text-rose-400" />
          無法食用
        </span>
      );
    }
    switch (level) {
      case 'none':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            安全可食
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60 shrink-0">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            微毒/川燙
          </span>
        );
      case 'toxic_raw':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/60 shrink-0">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            生食有毒
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-700/60 shrink-0">
            <AlertCircle className="w-3 h-3 text-purple-400" />
            部位有毒
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Subtitle summary bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-stone-900/60 border border-stone-800/80 rounded-xl text-xs text-stone-400">
        <span>📋 列點模式速覽（共 {plants.length} 筆紀錄）</span>
        <span className="text-[11px] text-stone-500 hidden sm:inline">點擊任何植物條目可開啟完整檔案</span>
      </div>

      {/* List Container */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl divide-y divide-stone-800/80 shadow-lg overflow-hidden">
        {plants.map((plant, index) => {
          const coverImage = plant.images.find((img) => img.isCover)?.dataUrl || plant.images[0]?.dataUrl;

          return (
            <div
              key={plant.id}
              onClick={(e) => handleItemClick(e, plant)}
              className="group p-3 sm:px-4 sm:py-3.5 hover:bg-stone-800/80 transition-colors cursor-pointer flex items-center justify-between gap-3 text-stone-200"
            >
              {/* Left: Bullet Number + Avatar Photo + Name & Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Number / Bullet */}
                <span className="font-mono text-xs font-bold text-stone-500 w-6 text-center shrink-0">
                  {index + 1}.
                </span>

                {/* Thumbnail Avatar */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-950 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={plant.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <Sprout className="w-5 h-5 text-stone-600 group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>

                {/* Name, Scientific Name & Family */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors truncate">
                      {plant.name}
                    </h3>
                    {plant.aliases && plant.aliases.length > 0 && (
                      <span className="text-xs text-stone-400 truncate hidden xs:inline">
                        ({plant.aliases[0]})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400 truncate">
                    {plant.scientificName && (
                      <span className="italic font-serif truncate max-w-[180px] sm:max-w-[280px]">
                        {plant.scientificName}
                      </span>
                    )}
                    <span className="text-stone-500 hidden md:inline">·</span>
                    <span className="text-stone-400 text-[11px] truncate hidden md:inline">
                      {plant.family.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle: Badges (Family & Toxicity) */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-800 text-stone-300 border border-stone-700/60">
                  {plant.family.split(' ')[0]}
                </span>
                {renderToxicityBadge(plant.preparation.toxicity, plant.isEdible)}
              </div>

              {/* Right: Favorite & Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(plant);
                  }}
                  className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-amber-400 transition cursor-pointer"
                  title={plant.isFavorite ? '取消收藏' : '加入收藏'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      plant.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-stone-400'
                    }`}
                  />
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(plant);
                    }}
                    title="編輯"
                    className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-emerald-300 transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
                        e.nativeEvent.stopImmediatePropagation();
                      }
                      const plantName = plant.name || '此植物';
                      if (window.confirm(`確定要刪除「${plantName}」嗎？`)) {
                        onDelete(plant.id);
                      }
                    }}
                    title="刪除"
                    className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 transition-colors ml-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
