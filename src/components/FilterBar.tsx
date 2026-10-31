import React, { useState, useMemo } from 'react';
import {
  Search,
  Flame,
  Zap,
  Mountain,
  SlidersHorizontal,
  RotateCcw,
  X,
  Layers,
  ChevronDown,
  Check,
  ArrowUpDown,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { PlantFilterOptions, PlantItem } from '../types/plant';

interface Props {
  plants: PlantItem[];
  filters: PlantFilterOptions;
  onChange: (filters: PlantFilterOptions) => void;
  filteredCount: number;
}

export const FilterBar: React.FC<Props> = ({ plants, filters, onChange, filteredCount }) => {
  const [showAdvancedDesktop, setShowAdvancedDesktop] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique families with counts
  const familyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    plants.forEach((p) => {
      const shortName = p.family.split(' ')[0] || p.family;
      map[shortName] = (map[shortName] || 0) + 1;
    });
    return map;
  }, [plants]);

  const uniqueFamilies = Object.keys(familyCounts).sort((a, b) => familyCounts[b] - familyCounts[a]);

  // Count active non-default filters
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onClear: () => void }[] = [];

    if (filters.searchQuery.trim()) {
      list.push({
        id: 'search',
        label: `關鍵字: "${filters.searchQuery.trim()}"`,
        onClear: () => onChange({ ...filters, searchQuery: '' }),
      });
    }

    if (filters.family !== 'all') {
      list.push({
        id: 'family',
        label: `科別: ${filters.family}`,
        onClear: () => onChange({ ...filters, family: 'all' }),
      });
    }

    if (filters.minProtein > 0) {
      list.push({
        id: 'protein',
        label: `蛋白質 ≥ ${filters.minProtein}g`,
        onClear: () => onChange({ ...filters, minProtein: 0 }),
      });
    }

    if (filters.calorieRange[1] < 150 || filters.calorieRange[0] > 0) {
      list.push({
        id: 'calories',
        label: `熱量 ${filters.calorieRange[0]}~${filters.calorieRange[1]} kcal`,
        onClear: () => onChange({ ...filters, calorieRange: [0, 150] }),
      });
    }

    if (filters.minFiber > 0) {
      list.push({
        id: 'fiber',
        label: `膳食纖維 ≥ ${filters.minFiber}g`,
        onClear: () => onChange({ ...filters, minFiber: 0 }),
      });
    }

    if (filters.habitat !== 'all') {
      list.push({
        id: 'habitat',
        label: `棲地: ${filters.habitat}`,
        onClear: () => onChange({ ...filters, habitat: 'all' }),
      });
    }

    if (filters.elevation !== 'all') {
      const elevationMap: Record<string, string> = { low: '低海拔', mid: '中海拔', high: '高海拔' };
      list.push({
        id: 'elevation',
        label: `海拔: ${elevationMap[filters.elevation] || filters.elevation}`,
        onClear: () => onChange({ ...filters, elevation: 'all' }),
      });
    }

    if (filters.season !== 'all') {
      list.push({
        id: 'season',
        label: `季節: ${filters.season}`,
        onClear: () => onChange({ ...filters, season: 'all' }),
      });
    }

    if (filters.sortBy !== 'updatedAt') {
      const sortLabels: Record<string, string> = {
        protein_desc: '蛋白質高到低',
        calories_asc: '熱量低到高',
        calories_desc: '熱量高到低',
        fiber_desc: '高膳食纖維',
        name: '名稱排序',
      };
      list.push({
        id: 'sortBy',
        label: `排序: ${sortLabels[filters.sortBy] || filters.sortBy}`,
        onClear: () => onChange({ ...filters, sortBy: 'updatedAt' }),
      });
    }

    return list;
  }, [filters, onChange]);

  const hasActiveFilters = activeFilters.length > 0;

  const handleResetFilters = () => {
    onChange({
      searchQuery: '',
      family: 'all',
      category: 'all',
      calorieRange: [0, 150],
      minProtein: 0,
      minFiber: 0,
      habitat: 'all',
      elevation: 'all',
      season: 'all',
      sortBy: 'updatedAt',
    });
  };

  const sortOptions: { value: PlantFilterOptions['sortBy']; label: string; icon: string }[] = [
    { value: 'updatedAt', label: '最近記錄優先', icon: '🕒' },
    { value: 'protein_desc', label: '蛋白質高到低', icon: '💪' },
    { value: 'calories_asc', label: '熱量低到高 (清爽)', icon: '🥗' },
    { value: 'calories_desc', label: '熱量高到低 (能量)', icon: '🔥' },
    { value: 'fiber_desc', label: '膳食纖維最高', icon: '🌾' },
    { value: 'name', label: '名稱筆劃順序', icon: '🔤' },
  ];

  return (
    <div className="space-y-2.5">
      {/* 1. Main Search & Filter Trigger Bar */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="搜尋植物名稱、學名、特徵或料理..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile: Filter & Sort Drawer Button (< sm) */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className={`sm:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold shrink-0 transition active:scale-95 cursor-pointer ${
            hasActiveFilters
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950/50'
              : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>篩選</span>
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-bold flex items-center justify-center shrink-0">
              {activeFilters.length}
            </span>
          )}
        </button>

        {/* Desktop: Quick Sorting Selector (>= sm) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as PlantFilterOptions['sortBy'] })}
            aria-label="排序依據"
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>

          {/* Desktop: Toggle Advanced Filters Button (>= sm) */}
          <button
            onClick={() => setShowAdvancedDesktop(!showAdvancedDesktop)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl border transition shadow-sm cursor-pointer ${
              showAdvancedDesktop || hasActiveFilters
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>進階篩選</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedDesktop ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Fast Horizontal Quick Pills (Single Scrollable Row - Super Clean on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {/* All Plants */}
        <button
          onClick={() => onChange({ ...filters, family: 'all' })}
          className={`shrink-0 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
            filters.family === 'all' && filters.minProtein === 0 && filters.calorieRange[1] === 150
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-900/90 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <span>全部植物</span>
          <span className="text-[10px] opacity-75 font-mono">({plants.length})</span>
        </button>

        {/* Quick High Protein Filter */}
        <button
          onClick={() => onChange({ ...filters, minProtein: filters.minProtein === 2.5 ? 0 : 2.5 })}
          className={`shrink-0 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 border ${
            filters.minProtein === 2.5
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:border-blue-500/50'
          }`}
        >
          <Zap className="w-3 h-3 text-blue-400" />
          <span>高蛋白 (≥2.5g)</span>
        </button>

        {/* Quick Low Calorie Filter */}
        <button
          onClick={() =>
            onChange({
              ...filters,
              calorieRange: filters.calorieRange[1] === 25 ? [0, 150] : [0, 25],
            })
          }
          className={`shrink-0 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 border ${
            filters.calorieRange[1] === 25
              ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
              : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:border-orange-500/50'
          }`}
        >
          <Flame className="w-3 h-3 text-orange-400" />
          <span>低熱量 (&lt;25kcal)</span>
        </button>

        {/* Top Family Chips */}
        {uniqueFamilies.slice(0, 8).map((fam) => {
          const isSelected = filters.family.startsWith(fam);
          return (
            <button
              key={fam}
              onClick={() => onChange({ ...filters, family: isSelected ? 'all' : fam })}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:text-white hover:border-stone-700'
              }`}
            >
              <span>{fam}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {familyCounts[fam]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Filters Tags (一目瞭然的已套用條件標籤列) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 animate-in fade-in duration-150">
          <span className="text-[11px] text-stone-400 font-medium mr-1 flex items-center gap-1">
            已套用條件:
          </span>
          {activeFilters.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/70 border border-emerald-600/70 text-emerald-200"
            >
              <span>{tag.label}</span>
              <button
                onClick={tag.onClear}
                className="p-0.5 hover:text-white hover:bg-emerald-800/60 rounded-full transition cursor-pointer"
                aria-label={`清除 ${tag.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={handleResetFilters}
            className="text-[11px] text-stone-400 hover:text-rose-400 font-medium px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重設全部</span>
          </button>
        </div>
      )}

      {/* 4. Desktop Expandable Advanced Filter Panel (>= sm) */}
      {showAdvancedDesktop && (
        <div className="hidden sm:block p-4 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-200 text-xs text-stone-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Calories Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  熱量區間 (kcal / 100g)
                </span>
                <span className="text-orange-400 font-mono font-medium">
                  {filters.calorieRange[0]} ~ {filters.calorieRange[1]} kcal
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={filters.calorieRange[1]}
                onChange={(e) =>
                  onChange({ ...filters, calorieRange: [filters.calorieRange[0], Number(e.target.value)] })
                }
                className="w-full accent-orange-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>10 kcal</span>
                <span>80 kcal</span>
                <span>150+ kcal</span>
              </div>
            </div>

            {/* Protein Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  最低蛋白質 (g / 100g)
                </span>
                <span className="text-blue-400 font-mono font-medium">
                  ≥ {filters.minProtein} g
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={filters.minProtein}
                onChange={(e) => onChange({ ...filters, minProtein: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>0g</span>
                <span>3g (野菜平均)</span>
                <span>8g+</span>
              </div>
            </div>

            {/* Fiber Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <span className="text-emerald-400">🌾</span>
                  最低膳食纖維 (g / 100g)
                </span>
                <span className="text-emerald-400 font-mono font-medium">
                  ≥ {filters.minFiber} g
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minFiber}
                onChange={(e) => onChange({ ...filters, minFiber: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>0g</span>
                <span>2.5g</span>
                <span>5g+</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-800">
            {/* Habitat */}
            <div>
              <label className="block text-stone-400 font-medium mb-1.5 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                生長棲地分佈
              </label>
              <select
                value={filters.habitat}
                onChange={(e) => onChange({ ...filters, habitat: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">全部生態棲地</option>
                <option value="平地荒野">平地荒野 / 路旁</option>
                <option value="農田田埂">農田田埂 / 菜園</option>
                <option value="水濱濕地">水濱濕地 / 溪谷溝渠</option>
                <option value="淺山林緣">淺山林緣向陽處</option>
                <option value="中高海拔">中高海拔山區</option>
                <option value="海濱沙地">海濱沙灘海岸</option>
              </select>
            </div>

            {/* Elevation */}
            <div>
              <label className="block text-stone-400 font-medium mb-1.5 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-cyan-400" />
                海拔分級
              </label>
              <select
                value={filters.elevation}
                onChange={(e) => onChange({ ...filters, elevation: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">全部海拔</option>
                <option value="low">低海拔 (&lt;500m 平原淺山)</option>
                <option value="mid">中海拔 (500-1,500m 霧林帶)</option>
                <option value="high">高海拔 (&gt;1,500m 雲霧高山)</option>
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-stone-400 font-medium mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                適宜採集季節
              </label>
              <select
                value={filters.season}
                onChange={(e) => onChange({ ...filters, season: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">全部季節</option>
                <option value="春季">春季 (雨後嫩芽)</option>
                <option value="夏季">夏季 (陽光繁茂)</option>
                <option value="秋季">秋季 (花果結實)</option>
                <option value="冬季">冬季 (根莖肥美)</option>
                <option value="全年">全年可採</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 5. Mobile Bottom Sheet Filter Drawer (手機專屬滑出抽屜 - 一目瞭然，乾淨整齊) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 sm:hidden">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsMobileFilterOpen(false)} />

          {/* Slide-up Container */}
          <div className="bg-stone-900 border-t border-stone-700 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-900">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-base">篩選與排序</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-emerald-400 font-mono">
                  {filteredCount} 種符合
                </span>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs text-stone-300">
              {/* Section 1: 排序依據 */}
              <div>
                <h4 className="text-stone-200 font-bold text-xs mb-2.5 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>排序方式</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onChange({ ...filters, sortBy: opt.value })}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        filters.sortBy === opt.value
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <span className="truncate">
                        {opt.icon} {opt.label}
                      </span>
                      {filters.sortBy === opt.value && <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: 植物科別 */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-stone-200 font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>植物科別</span>
                  </h4>
                  {filters.family !== 'all' && (
                    <button
                      onClick={() => onChange({ ...filters, family: 'all' })}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      清除科別
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-stone-950/60 rounded-xl border border-stone-800">
                  <button
                    onClick={() => onChange({ ...filters, family: 'all' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      filters.family === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    全部科別 ({plants.length})
                  </button>
                  {uniqueFamilies.map((fam) => {
                    const isSelected = filters.family.startsWith(fam);
                    return (
                      <button
                        key={fam}
                        onClick={() => onChange({ ...filters, family: isSelected ? 'all' : fam })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        <span>{fam}</span>
                        <span className="text-[10px] opacity-75 font-mono">({familyCounts[fam]})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: 營養特徵快速標籤 */}
              <div className="space-y-4 pt-1">
                {/* Calories */}
                <div>
                  <h4 className="text-stone-200 font-bold text-xs mb-2 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>熱量區間 (kcal / 100g)</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '不限', range: [0, 150] },
                      { label: '< 25 kcal', range: [0, 25] },
                      { label: '25~45 kcal', range: [25, 45] },
                      { label: '> 45 kcal', range: [45, 150] },
                    ].map((item) => {
                      const isSelected =
                        filters.calorieRange[0] === item.range[0] && filters.calorieRange[1] === item.range[1];
                      return (
                        <button
                          key={item.label}
                          onClick={() => onChange({ ...filters, calorieRange: item.range as [number, number] })}
                          className={`py-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-orange-600 text-white border-orange-500 font-semibold'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <h4 className="text-stone-200 font-bold text-xs mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>最低蛋白質 (g / 100g)</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: '不限 (0g)', value: 0 },
                      { label: '補充 (≥2.5g)', value: 2.5 },
                      { label: '高蛋白 (≥4g)', value: 4 },
                    ].map((item) => {
                      const isSelected = filters.minProtein === item.value;
                      return (
                        <button
                          key={item.label}
                          onClick={() => onChange({ ...filters, minProtein: item.value })}
                          className={`py-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                              : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 4: 生態環境與海拔 */}
              <div className="space-y-3 pt-1 border-t border-stone-800">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1 flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                    生長棲地分佈
                  </label>
                  <select
                    value={filters.habitat}
                    onChange={(e) => onChange({ ...filters, habitat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-200 focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="all">全部生態棲地</option>
                    <option value="平地荒野">平地荒野 / 路旁</option>
                    <option value="農田田埂">農田田埂 / 菜園</option>
                    <option value="水濱濕地">水濱濕地 / 溪谷溝渠</option>
                    <option value="淺山林緣">淺山林緣向陽處</option>
                    <option value="中高海拔">中高海拔山區</option>
                    <option value="海濱沙地">海濱沙灘海岸</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1 flex items-center gap-1">
                      <Mountain className="w-3.5 h-3.5 text-cyan-400" />
                      海拔高度
                    </label>
                    <select
                      value={filters.elevation}
                      onChange={(e) => onChange({ ...filters, elevation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-200 focus:outline-none focus:border-emerald-500 text-xs"
                    >
                      <option value="all">全部海拔</option>
                      <option value="low">低海拔 (&lt;500m)</option>
                      <option value="mid">中海拔 (500-1500m)</option>
                      <option value="high">高海拔 (&gt;1500m)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      採集季節
                    </label>
                    <select
                      value={filters.season}
                      onChange={(e) => onChange({ ...filters, season: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-200 focus:outline-none focus:border-emerald-500 text-xs"
                    >
                      <option value="all">全部季節</option>
                      <option value="春季">春季 (雨後嫩芽)</option>
                      <option value="夏季">夏季 (陽光繁茂)</option>
                      <option value="秋季">秋季 (花果結實)</option>
                      <option value="冬季">冬季 (根莖肥美)</option>
                      <option value="全年">全年可採</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center gap-3 shrink-0">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重設所有</span>
              </button>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-emerald-950/50 cursor-pointer text-center"
              >
                查看 {filteredCount} 種符合植物
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
