export type ToxicityLevel = 'none' | 'caution' | 'toxic_raw' | 'warning';

export type PlantCategory = 'wild' | 'cultivated' | 'herb' | 'medicinal' | 'starch' | 'fruit';

export type ElevationCategory = 'low' | 'mid' | 'high' | 'all';

export type AbundanceLevel = 'abundant' | 'common' | 'occasional' | 'rare';

export interface PlantImage {
  id: string;
  dataUrl: string; // Base64 data URL or external URL
  caption?: string;
  isCover?: boolean;
}

export interface PlantMicronutrients {
  calciumMg?: number; // 鈣 mg
  ironMg?: number; // 鐵 mg
  vitaminCMg?: number; // 維生素 C mg
  potassiumMg?: number; // 鉀 mg
  caroteneMcg?: number; // 胡蘿蔔素 / 維生素 A mcg
}

export interface PlantNutrition {
  calories: number; // 熱量 kcal / 100g
  protein: number; // 蛋白質 g / 100g
  carbohydrates: number; // 碳水化合物 g / 100g
  fat: number; // 脂肪 g / 100g
  fiber: number; // 膳食纖維 g / 100g
  micronutrients?: PlantMicronutrients;
  nutritionHighlights?: string[]; // e.g. ["高鈣高鐵", "優質粗蛋白", "極低卡", "富含維生素C"]
}

export interface PlantCharacteristics {
  leaves: string; // 葉部特徵 (葉形、葉緣、互生/對生、質地)
  stemAndRoots: string; // 莖與根特徵 (直立/匍匐、稜角、刺毛、塊莖)
  flowers: string; // 花部特徵 (花期、花型、花色)
  fruitsAndSeeds?: string; // 果實與種子
  distinctiveFeatures: string; // 關鍵辨識要點 (容易混淆辨別、氣味、乳汁等)
}

export interface PlantPreparation {
  prepMethod: string; // 處理方式 (前置脫毒、去草酸、川燙去苦、泡冷水等)
  cookingMethods: string[]; // 求生料理與加工手法 (e.g. 葉蛋白萃取、乳酸自然發酵、草木灰水鹼浸、流水浸洗脫苦、石板烙炙、炭焙煨熟)
  toxicity: ToxicityLevel; // 毒性等級
  toxicityNotes: string; // 毒性與安全警語 (e.g. 生食劇毒需久煮、草酸鈣需川燙)
  antinutrients?: string; // 抗營養物質種類 (e.g. 草酸、植酸、單寧、生物鹼、皂苷、氰苷、蛋白酶抑制劑)
  antinutrientRemoval?: string; // 抗營養物質消除/降解手法 (e.g. 草木灰浸煮、流水浸洗數日、發酵脫酸、葉蛋白沉澱)
  flavorProfile?: string; // 口感風味 (e.g. 微苦回甘、滑嫩爽脆)
  storageMethod?: string; // 採集保存
}

export interface PlantDistribution {
  habitat: string[]; // 生態棲地 (平地荒野、農田邊緣、水濱濕地、淺山林緣、中高海拔)
  elevation: ElevationCategory; // 海拔等級
  elevationDesc: string; // 海拔詳細描述 (e.g. 海拔 0-1,200m 向陽開闊地)
  regions: string[]; // 分佈地區 (全台低海拔、東亞溫帶、全球廣布)
  season: string[]; // 適合採集季節 (春、夏、秋、冬、全年)
  abundance: AbundanceLevel; // 普遍程度
}

export interface PlantItem {
  id: string;
  name: string; // 中文名稱 (e.g. 龍葵)
  scientificName: string; // 學名 (e.g. Solanum nigrum L.)
  aliases: string[]; // 別名 (e.g. 烏甜仔菜, 黑天茄)
  family: string; // 科別 (e.g. 茄科 Solanaceae)
  category: PlantCategory; // 分類類型
  edibleParts: string[]; // 可食用部位 (嫩莖葉, 果實, 花, 嫩芽, 塊莖)
  
  characteristics: PlantCharacteristics; // 外觀與辨識特徵
  preparation: PlantPreparation; // 料理與處理方式
  nutrition: PlantNutrition; // 營養成分 (每 100g)
  distribution: PlantDistribution; // 生態分佈

  images: PlantImage[]; // 照片集
  
  isEdible?: boolean; // 食用性質：是否可食用 (true: 可食用, false: 無法食用/有毒/觀察記錄)

  userNotes?: string; // 個人採集筆記 / 心得
  foragingLocations?: string; // 發現地點記錄
  isFavorite?: boolean; // 收藏標記
  rating?: number; // 評分 (1-5)

  createdAt: string;
  updatedAt: string;
  isCustom?: boolean; // 使用者自訂或是內建百科
}

export interface PlantFilterOptions {
  searchQuery: string;
  family: string; // 'all' or specific family
  category: string; // 'all' or specific category
  edibility?: 'all' | 'edible' | 'inedible'; // 食用性質過濾
  
  // 營養篩選
  calorieRange: [number, number]; // [min, max]
  minProtein: number; // 蛋白質下限 g
  maxProtein?: number;
  minFiber: number; // 膳食纖維下限 g
  
  // 分佈篩選
  habitat: string; // 'all' or specific habitat
  elevation: string; // 'all' | 'low' | 'mid' | 'high'
  season: string; // 'all' | '春' | '夏' | '秋' | '冬' | '全年'
  
  // 排序
  sortBy: 'name' | 'calories_desc' | 'calories_asc' | 'protein_desc' | 'fiber_desc' | 'updatedAt';
}

