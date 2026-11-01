import { PlantItem, ToxicityLevel, PlantCategory, ElevationCategory, AbundanceLevel } from '../types/plant';
import { INITIAL_PLANTS } from '../data/plantPresets';
import { inferBotanicalFallback, normalizeBotanicalFamily } from '../data/botanicalKnowledge';

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('botanica_user_gemini_key') || '';
  }
  return '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('botanica_user_gemini_key', key.trim());
    } else {
      localStorage.removeItem('botanica_user_gemini_key');
    }
  }
}

// Search built-in presets by name or alias
export function findPresetMatch(query: string): PlantItem | undefined {
  const clean = query.trim().toLowerCase();
  if (!clean) return undefined;

  return INITIAL_PLANTS.find(
    (p) =>
      p.name.toLowerCase().includes(clean) ||
      clean.includes(p.name.toLowerCase()) ||
      p.scientificName.toLowerCase().includes(clean) ||
      p.aliases.some((a) => a.toLowerCase().includes(clean) || clean.includes(a.toLowerCase()))
  );
}

// Format raw JSON response into structured PlantItem fields with taxonomy guarantees
function mapRawToPlantItem(parsed: Record<string, any>, plantName: string): Partial<PlantItem> {
  const fallback = inferBotanicalFallback(plantName);

  // Normalize family string into standard format e.g. "菊科 (Asteraceae)"
  const rawFamily = typeof parsed.family === 'string' ? parsed.family.trim() : '';
  const family = rawFamily ? normalizeBotanicalFamily(rawFamily) : fallback.family;

  // Ensure scientific name is not empty
  const rawScientific = typeof parsed.scientificName === 'string' ? parsed.scientificName.trim() : '';
  const scientificName = rawScientific || fallback.scientificName;

  // Aliases
  let aliases: string[] = [];
  if (Array.isArray(parsed.aliases) && parsed.aliases.length > 0) {
    aliases = parsed.aliases.map((a: unknown) => String(a).trim()).filter(Boolean);
  } else {
    aliases = fallback.aliases;
  }

  // Edible parts
  let edibleParts: string[] = ['嫩莖葉', '一般根'];
  if (Array.isArray(parsed.edibleParts) && parsed.edibleParts.length > 0) {
    edibleParts = parsed.edibleParts.map((p: unknown) => String(p).trim()).filter(Boolean);
  } else {
    edibleParts = fallback.edibleParts;
  }

  // Cooking methods
  let cookingMethods: string[] = fallback.preparation.cookingMethods;
  if (Array.isArray(parsed.preparation?.cookingMethods) && parsed.preparation.cookingMethods.length > 0) {
    cookingMethods = parsed.preparation.cookingMethods.map((m: unknown) => String(m).trim()).filter(Boolean);
  }

  // Nutrition numbers with reasonable defaults if missing
  const calories = Number(parsed.nutrition?.calories) || fallback.nutrition.calories;
  const protein = Number(parsed.nutrition?.protein) || fallback.nutrition.protein;
  const carbohydrates = Number(parsed.nutrition?.carbohydrates) || fallback.nutrition.carbohydrates;
  const fat = Number(parsed.nutrition?.fat) || fallback.nutrition.fat;
  const fiber = Number(parsed.nutrition?.fiber) || fallback.nutrition.fiber;

  const calciumMg = Number(parsed.nutrition?.micronutrients?.calciumMg) || fallback.nutrition.micronutrients?.calciumMg;
  const ironMg = Number(parsed.nutrition?.micronutrients?.ironMg) || fallback.nutrition.micronutrients?.ironMg;
  const vitaminCMg = Number(parsed.nutrition?.micronutrients?.vitaminCMg) || fallback.nutrition.micronutrients?.vitaminCMg;
  const potassiumMg = Number(parsed.nutrition?.micronutrients?.potassiumMg) || fallback.nutrition.micronutrients?.potassiumMg;

  // Distribution
  const habitat = Array.isArray(parsed.distribution?.habitat) && parsed.distribution.habitat.length > 0
    ? parsed.distribution.habitat.map((h: unknown) => String(h).trim()).filter(Boolean)
    : fallback.distribution.habitat;

  const regions = Array.isArray(parsed.distribution?.regions) && parsed.distribution.regions.length > 0
    ? parsed.distribution.regions.map((r: unknown) => String(r).trim()).filter(Boolean)
    : fallback.distribution.regions;

  const season = Array.isArray(parsed.distribution?.season) && parsed.distribution.season.length > 0
    ? parsed.distribution.season.map((s: unknown) => String(s).trim()).filter(Boolean)
    : fallback.distribution.season;

  return {
    name: parsed.name || plantName,
    scientificName,
    aliases,
    family,
    category: (parsed.category as PlantCategory) || fallback.category,
    isEdible: typeof parsed.isEdible === 'boolean' ? parsed.isEdible : true,
    edibleParts,
    characteristics: {
      leaves: parsed.characteristics?.leaves || fallback.characteristics.leaves,
      stemAndRoots: parsed.characteristics?.stemAndRoots || fallback.characteristics.stemAndRoots,
      flowers: parsed.characteristics?.flowers || fallback.characteristics.flowers,
      fruitsAndSeeds: parsed.characteristics?.fruitsAndSeeds || fallback.characteristics.fruitsAndSeeds,
      distinctiveFeatures: parsed.characteristics?.distinctiveFeatures || fallback.characteristics.distinctiveFeatures,
    },
    preparation: {
      prepMethod: parsed.preparation?.prepMethod || fallback.preparation.prepMethod,
      cookingMethods,
      toxicity: (parsed.preparation?.toxicity as ToxicityLevel) || fallback.preparation.toxicity,
      toxicityNotes: parsed.preparation?.toxicityNotes || fallback.preparation.toxicityNotes,
      antinutrients: parsed.preparation?.antinutrients || fallback.preparation.antinutrients,
      antinutrientRemoval: parsed.preparation?.antinutrientRemoval || fallback.preparation.antinutrientRemoval,
      flavorProfile: parsed.preparation?.flavorProfile || fallback.preparation.flavorProfile,
      storageMethod: parsed.preparation?.storageMethod || fallback.preparation.storageMethod,
    },
    nutrition: {
      calories,
      protein,
      carbohydrates,
      fat,
      fiber,
      micronutrients: {
        calciumMg,
        ironMg,
        vitaminCMg,
        potassiumMg,
      },
      nutritionHighlights: Array.isArray(parsed.nutrition?.nutritionHighlights) && parsed.nutrition.nutritionHighlights.length > 0
        ? parsed.nutrition.nutritionHighlights
        : fallback.nutrition.nutritionHighlights,
    },
    distribution: {
      habitat,
      elevation: (parsed.distribution?.elevation as ElevationCategory) || fallback.distribution.elevation,
      elevationDesc: parsed.distribution?.elevationDesc || fallback.distribution.elevationDesc,
      regions,
      season,
      abundance: (parsed.distribution?.abundance as AbundanceLevel) || fallback.distribution.abundance,
    },
  };
}

// Direct fast Gemini call for client-side / GitHub Pages usage
async function callGeminiDirectFast(apiKey: string, prompt: string): Promise<Record<string, any>> {
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
        signal: AbortSignal.timeout(12000), // 12s per model
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        const msg = errorJson.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Model ${model} direct call attempt failed:`, lastError.message);
    }
  }

  throw lastError || new Error('所有 Gemini 模型連線逾時或失敗');
}

export type AutofillSource =
  | 'gemini_direct'
  | 'gemini_server'
  | 'preset_library'
  | 'botanical_knowledge';

export interface AutofillResult {
  data: Partial<PlantItem>;
  source: AutofillSource;
  sourceLabel: string;
  sourceDescription: string;
}

// Generate structured plant information using Server Proxy or Client API Key
export async function generatePlantDetailsWithAI(plantName: string): Promise<AutofillResult> {
  const cleanName = plantName.trim();
  if (!cleanName) {
    throw new Error('請輸入植物名稱');
  }

  const clientKey = getStoredApiKey();
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

  const detailedPrompt = `請以「野外求生植物學家、野營覓食專家與民族植物學家」身份，為植物「${cleanName}」生成詳盡客觀的求生食用與加工檔案。請以繁體中文 (Traditional Chinese) 提供。

【重要準則】
1. 【完整學名與科別】：必須精準提供真實完整的拉丁學名 (含命名者縮寫，例如：Crassocephalum crepidioides (Benth.) S.Moore) 以及科別 (格式必須為：中文科名 (拉丁科名)，例如：菊科 (Asteraceae), 茄科 (Solanaceae), 豆科 (Fabaceae))。不可留空！
2. 【野外求生風格料理】：料理手法必須是「野外求生/叢林技能 (Bushcraft & Wilderness Survival)」風格（例如：葉蛋白萃取(LPC)、乳酸野外自然發酵、草木灰水鹼浸脫毒、流水長時浸洗脫苦、反覆換水沸煮脫澀、石板野火烙炙、竹筒填塞炭火煨熟、坑式地爐燜烤、日曬乾燥磨粉存糧、柴火低溫煙燻等），【嚴禁】出現家常炒菜（如「蒜炒」、「煮蛋花湯」）。
3. 【抗營養物質分析】：必須詳加分析「抗營養物質 (Antinutrients)」（如：草酸、植酸、單寧/鞣酸、生物鹼、皂苷、草酸鈣針晶、胰蛋白酶抑制劑）與求生消除脫毒降解手法。
4. 【物種專屬差異數據】：熱量、蛋白質、碳水化合物、纖維與微量元素必須具備植物專屬科學估計差異，不可千篇一律填入固定數值。

請嚴格遵照下列格式回傳純 JSON 物件：
{
  "name": "${cleanName}",
  "scientificName": "完整拉丁學名 (含命名者縮寫)",
  "aliases": ["常見俗名1", "別名2"],
  "family": "中文科名 (拉丁科名)",
  "category": "wild",
  "edibleParts": ["嫩莖葉", "一般根"],
  "characteristics": {
    "leaves": "葉部形態特徵 (葉形、葉緣、葉脈、質地)",
    "stemAndRoots": "莖柱與根系（包含一般根或塊根）形態",
    "flowers": "花部特徵 (花期、花型、花色)",
    "fruitsAndSeeds": "果實與種子形態及傳播",
    "distinctiveFeatures": "關鍵辨識要點與防混淆（避免誤採劇毒相近種）"
  },
  "preparation": {
    "prepMethod": "求生前置清洗與脫毒處理步驟",
    "cookingMethods": ["葉蛋白萃取 (LPC)", "反覆換水沸煮脫澀", "草木灰水鹼浸脫毒", "石板野火烙炙"],
    "toxicity": "caution",
    "toxicityNotes": "毒性與安全警語 (生食風險、未熟風險等)",
    "antinutrients": "該植物主要抗營養物質 (如草酸、單寧、生物鹼等)",
    "antinutrientRemoval": "對應之求生消除與脫毒手法",
    "flavorProfile": "野外口感與風味描述",
    "storageMethod": "野外長效保存方式 (日曬磨粉、煙燻、發酵)"
  },
  "nutrition": {
    "calories": 25,
    "protein": 2.8,
    "carbohydrates": 4.0,
    "fat": 0.3,
    "fiber": 2.5,
    "micronutrients": {
      "calciumMg": 90,
      "ironMg": 2.5,
      "vitaminCMg": 25,
      "potassiumMg": 320
    },
    "nutritionHighlights": ["富含野生膳食纖維", "求生植物性蛋白質"]
  },
  "distribution": {
    "habitat": ["平地荒野", "淺山林緣向陽處"],
    "elevation": "low",
    "elevationDesc": "平地至低海拔開闊向陽地",
    "regions": ["全島廣泛常見分佈"],
    "season": ["春季", "夏季", "秋季"],
    "abundance": "common"
  }
}`;

  // Case A: If user provided a client API Key, use direct fast REST
  if (clientKey) {
    try {
      const parsed = await callGeminiDirectFast(clientKey, detailedPrompt);
      const data = mapRawToPlantItem(parsed, cleanName);
      return {
        data,
        source: 'gemini_direct',
        sourceLabel: 'Gemini AI (個人 API 金鑰)',
        sourceDescription: `已成功呼叫 Google Gemini 大模型，為「${cleanName}」即時專屬生成全新求生與植物學檔案！`,
      };
    } catch (clientApiErr) {
      console.warn('Client-side Gemini API call failed, attempting fallback...', clientApiErr);
    }
  }

  // Case B: If not on GitHub Pages, call server proxy (30s timeout so LLM has ample time)
  if (!isGitHubPages) {
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plantName: cleanName }),
        signal: AbortSignal.timeout(30000), // 30s timeout to allow full generation
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const isRealAi = result.source === 'ai';
          const data = mapRawToPlantItem(result.data, cleanName);
          return {
            data,
            source: isRealAi ? 'gemini_server' : 'botanical_knowledge',
            sourceLabel: isRealAi ? 'Gemini 3.1 Flash AI' : '內建植物學百科庫',
            sourceDescription: isRealAi
              ? `已成功透過雲端 Gemini AI 運算生成，為「${cleanName}」產出專屬求生食用與特徵資料！`
              : `伺服器未啟用 AI 服務，已改由內建野外植物學百科庫為「${cleanName}」填入資料。`,
          };
        }
      }
    } catch (serverErr) {
      console.warn('Server proxy unavailable or timed out, continuing with botanical knowledge synthesis...', serverErr);
    }
  }

  // Case C: Botanical database knowledge synthesis (species-specific, complete taxonomy guaranteed)
  const fallback = inferBotanicalFallback(cleanName);
  const isPreset = INITIAL_PLANTS.some(
    (p) => p.name.includes(cleanName) || cleanName.includes(p.name)
  );

  return {
    data: {
      ...fallback,
      name: cleanName,
    },
    source: isPreset ? 'preset_library' : 'botanical_knowledge',
    sourceLabel: isPreset ? '內建經典植物圖鑑' : '內建植物學百科庫 (離線兜底)',
    sourceDescription: isGitHubPages && !clientKey
      ? `目前在 GitHub Pages 靜態網站且未設定 API Key，已由系統內建植物學百科庫為「${cleanName}」填入資料。若需真實 AI 即時生成，請點擊右上角設定 API Key！`
      : `目前未連線至 AI 伺服器，已由系統內建野外植物學百科庫為「${cleanName}」完成填入。`,
  };
}
