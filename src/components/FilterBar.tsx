import React, { useState } from 'react';
import { Search, Filter, Flame, Zap, Mountain, SlidersHorizontal, RotateCcw, X, Layers, ChevronDown } from 'lucide-react';
import { PlantFilterOptions, PlantItem } from '../types/plant';

interface Props {
  plants: PlantItem[];
  filters: PlantFilterOptions;
  onChange: (filters: PlantFilterOptions) => void;
  filteredCount: number;
}

export const FilterBar: React.FC<Props> = ({ plants, filters, onChange, filteredCount }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extract unique families with counts
  const familyCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    plants.forEach((p) => {
      // simplify family display name (e.g. "茄科 (Solanaceae)" -> "茄科")
      const shortName = p.family.split(' ')[0] || p.family;
      map[shortName] = (map[shortName] || 0) + 1;
    });
    return map;
  }, [plants]);

  const uniqueFamilies = Object.keys(familyCounts).sort((a, b) => familyCounts[b] - familyCounts[a]);

  // Habitat options
  const habitats = ['全部生境', '平地荒野', '農田田埂', '水濱濕地', '淺山林緣', '中高海拔', '海濱沙地'];

  // Check if any filter is active
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.family !== 'all' ||
    filters.category !== 'all' ||
    filters.calorieRange[1] < 150 ||
    filters.minProtein > 0 ||
    filters.minFiber > 0 ||
    filters.habitat !== 'all' ||
    filters.elevation !== 'all' ||
    filters.season !== 'all' ||
    filters.sortBy !== 'updatedAt';

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

  return (
    <div className="space-y-3.5">
      {/* Top Search & Primary Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋植物名稱、學名、別名、鑑別特徵或料理手法..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 bg-stone-900 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Sorting Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as PlantFilterOptions['sortBy'] })}
            aria-label="排序依據"
            className="bg-stone-900 border border-stone-700/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
          >
            <option value="updatedAt">最近記錄優先</option>
            <option value="protein_desc">💪 蛋白質高到低</option>
            <option value="calories_asc">🥗 熱量低到高 (清爽低卡)</option>
            <option value="calories_desc">🔥 熱量高到低 (能量主食)</option>
            <option value="fiber_desc">🌾 膳食纖維最高</option>
            <option value="name">🔤 名稱筆劃順序</option>
          </select>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl border transition shadow-sm cursor-pointer ${
              showAdvanced || hasActiveFilters
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-stone-900 border-stone-700/80 text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>精準篩選</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. 科別快速水平滾動標籤 (By Family) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-stone-800">
        <span className="text-xs text-stone-400 shrink-0 flex items-center gap-1 mr-1 font-medium">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          科別:
        </span>
        <button
          onClick={() => onChange({ ...filters, family: 'all' })}
          className={`shrink-0 px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
            filters.family === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
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
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700/80 border border-stone-700/50'
              }`}
            >
              <span>{fam}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-900/80 text-stone-400'
                }`}
              >
                {familyCounts[fam]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. 熱量與蛋白質快速標籤 (Quick Nutrition Shortcuts) */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
        <span className="text-stone-400 flex items-center gap-1 mr-0.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          熱量:
        </span>
        <button
          onClick={() => onChange({ ...filters, calorieRange: [0, 150] })}
          className={`px-2 py-0.5 rounded-md border cursor-pointer transition ${
            filters.calorieRange[1] >= 150 && filters.calorieRange[0] === 0
              ? 'bg-stone-800 text-stone-100 border-stone-600 font-medium'
              : 'text-stone-400 border-transparent hover:text-stone-200'
          }`}
        >
          不限
        </button>
        <button
          onClick={() => onChange({ ...filters, calorieRange: [0, 25] })}
          className={`px-2 py-0.5 rounded-md border cursor-pointer transition ${
            filters.calorieRange[1] === 25
              ? 'bg-orange-950/80 border-orange-600 text-orange-300 font-medium'
              : 'text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
        >
          極低卡 (&lt;25 kcal)
        </button>
        <button
          onClick={() => onChange({ ...filters, calorieRange: [25, 45] })}
          className={`px-2 py-0.5 rounded-md border cursor-pointer transition ${
            filters.calorieRange[0] === 25 && filters.calorieRange[1] === 45
              ? 'bg-orange-950/80 border-orange-600 text-orange-300 font-medium'
              : 'text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
        >
          適中能量 (25-45 kcal)
        </button>
        <button
          onClick={() => onChange({ ...filters, calorieRange: [45, 150] })}
          className={`px-2 py-0.5 rounded-md border cursor-pointer transition ${
            filters.calorieRange[0] === 45
              ? 'bg-orange-950/80 border-orange-600 text-orange-300 font-medium'
              : 'text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
        >
          高澱粉主食 (&gt;45 kcal)
        </button>

        <span className="text-stone-500 mx-1">|</span>

        <span className="text-stone-400 flex items-center gap-1 mr-0.5 font-medium">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          蛋白質:
        </span>
        <button
          onClick={() => onChange({ ...filters, minProtein: 0 })}
          className={`px-2 py-0.5 rounded-md border cursor-pointer transition ${
            filters.minProtein === 0
              ? 'bg-stone-800 text-stone-100 border-stone-600 font-medium'
              : 'text-stone-400 border-transparent hover:text-stone-200'
          }`}
        >
          不限
        </button>
        <button
          onClick={() => onChange({ ...filters, minProtein: 2.5 })}
          className={`px-2 py-0.5 rounded-md border cursor-pointer transition ${
            filters.minProtein === 2.5
              ? 'bg-blue-950/80 border-blue-600 text-blue-300 font-medium'
              : 'text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
        >
          補充蛋白 (≥2.5g)
        </button>
        <button
          onClick={() => onChange({ ...filters, minProtein: 4.0 })}
          className={`px-2 py-0.5 rounded-md border cursor-pointer transition ${
            filters.minProtein === 4.0
              ? 'bg-blue-950/80 border-blue-600 text-blue-300 font-medium'
              : 'text-stone-400 border-stone-800 hover:text-stone-200'
          }`}
        >
          高蛋白野菜 (≥4g)
        </button>
      </div>

      {/* 3. 進階精準面板 (展開時：包含熱量滑桿、蛋白質滑桿、生境、海拔、季節等) */}
      {showAdvanced && (
        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-200 text-xs text-stone-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 熱量上限控制 (Calories slider) */}
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
                <span>10 kcal (超低卡)</span>
                <span>80 kcal</span>
                <span>150+ kcal (澱粉能量)</span>
              </div>
            </div>

            {/* 蛋白質下限控制 (Protein slider) */}
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
                <span>0g (不限)</span>
                <span>3g (常見野菜)</span>
                <span>8g (極高蛋白植物)</span>
              </div>
            </div>

            {/* 膳食纖維下限控制 (Fiber slider) */}
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
            {/* 生境分佈 (Habitat) */}
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

            {/* 海拔等級 (Elevation) */}
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

            {/* 採集季節 (Season) */}
            <div>
              <label className="block text-stone-400 font-medium mb-1.5 flex items-center gap-1">
                <span className="text-amber-400">☀️</span>
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

      {/* Filter summary & quick reset indicator */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-1">
        <span>
          符合條件植物：<strong className="text-emerald-400 font-semibold">{filteredCount}</strong> 筆（共 {plants.length} 筆）
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>清除所有篩選</span>
          </button>
        )}
      </div>
    </div>
  );
};
