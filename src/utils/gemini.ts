import { PlantItem, ToxicityLevel, PlantCategory, ElevationCategory, AbundanceLevel } from '../types/plant';
import { INITIAL_PLANTS } from '../data/plantPresets';
import { inferBotanicalFallback, normalizeBotanicalFamily } from '../data/botanicalKnowledge';

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite (超輕量省配額)',
    tag: '極省額度 · 推薦',
    desc: '配額上限高（高 RPM/RPD）、Token 消耗最少，不易觸發 429 資源耗盡，非常適合日常連續紀錄植物。',
    isRecommended: true,
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash (標準版)',
    tag: '平衡款',
    desc: '標準 Flash 模型，兼具回答速度與細緻度。',
    isRecommended: false,
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (最新高階版)',
    tag: '高深度 · 耗配額快',
    desc: '最新旗艦模型，植物學邏輯極其嚴謹，但免費層每分鐘請求限制嚴格，容易迅速耗盡額度。',
    isRecommended: false,
  },
] as const;

export function getStoredModel(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('botanica_user_gemini_model') || 'gemini-3.1-flash-lite';
  }
  return 'gemini-3.1-flash-lite';
}

export function setStoredModel(model: string): void {
  if (typeof window !== 'undefined') {
    if (model.trim()) {
      localStorage.setItem('botanica_user_gemini_model', model.trim());
    }
  }
}

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

  const isEdible =
    fallback.isEdible === false || parsed.isEdible === false
      ? false
      : typeof parsed.isEdible === 'boolean'
      ? parsed.isEdible
      : true;

  if (!isEdible) {
    return {
      name: parsed.name || plantName,
      scientificName,
      aliases,
      family,
      category: (parsed.category as PlantCategory) || fallback.category,
      isEdible: false,
      edibleParts: [],
      characteristics: {
        leaves: parsed.characteristics?.leaves || fallback.characteristics.leaves,
        stemAndRoots: parsed.characteristics?.stemAndRoots || fallback.characteristics.stemAndRoots,
        flowers: parsed.characteristics?.flowers || fallback.characteristics.flowers,
        fruitsAndSeeds: parsed.characteristics?.fruitsAndSeeds || fallback.characteristics.fruitsAndSeeds,
        distinctiveFeatures: parsed.characteristics?.distinctiveFeatures || fallback.characteristics.distinctiveFeatures,
      },
      preparation: {
        prepMethod: parsed.preparation?.prepMethod || '此植物非食用植物 / 具毒性或未明，嚴禁食用',
        cookingMethods: [],
        toxicity: (parsed.preparation?.toxicity as ToxicityLevel) || 'warning',
        toxicityNotes: parsed.preparation?.toxicityNotes || fallback.preparation.toxicityNotes || '非食用植物 / 具毒性警示，請勿採食',
        antinutrients: parsed.preparation?.antinutrients || fallback.preparation.antinutrients,
        antinutrientRemoval: parsed.preparation?.antinutrientRemoval || '無法藉由一般水煮烹調去毒，嚴禁食用！',
        flavorProfile: '',
        storageMethod: '',
      },
      nutrition: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        micronutrients: {
          calciumMg: 0,
          ironMg: 0,
          vitaminCMg: 0,
          potassiumMg: 0,
        },
        nutritionHighlights: ['無法食用', '非食用植物'],
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

  return {
    name: parsed.name || plantName,
    scientificName,
    aliases,
    family,
    category: (parsed.category as PlantCategory) || fallback.category,
    isEdible: true,
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
async function callGeminiDirectFast(
  apiKey: string,
  prompt: string,
  preferredModel?: string
): Promise<Record<string, any>> {
  // Strict model strategy:
  // If the user selected a specific model, prioritize it strictly!
  // If user selected a budget/lite model (like gemini-3.1-flash-lite or gemini-flash-latest),
  // NEVER fall back to high-tier gemini-3.8-flash, which triggers 429 quota exhaustion.
  let candidateModels: string[];
  if (preferredModel === 'gemini-3.8-flash') {
    candidateModels = ['gemini-3.8-flash'];
  } else if (preferredModel) {
    const safeLiteFallbacks = ['gemini-3.1-flash-lite', 'gemini-flash-latest'].filter((m) => m !== preferredModel);
    candidateModels = [preferredModel, ...safeLiteFallbacks];
  } else {
    candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
  }

  const errors: string[] = [];

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
        signal: AbortSignal.timeout(35000), // 35s timeout to prevent premature aborts on complex plant taxonomy
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
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`[${model}] ${errMsg}`);
      console.warn(`Model ${model} direct call attempt failed:`, errMsg);
    }
  }

  throw new Error(`所選模型呼叫失敗：${errors.join('； ') || '無法取得回應'}`);
}

export type AutofillSource = 'gemini_direct' | 'gemini_server';

export interface AutofillResult {
  data: Partial<PlantItem>;
  source: AutofillSource;
  sourceLabel: string;
  sourceDescription: string;
}

// Generate structured plant information using Server Proxy or Client API Key (Strict AI-Only)
export async function generatePlantDetailsWithAI(plantName: string): Promise<AutofillResult> {
  const cleanName = plantName.trim();
  if (!cleanName) {
    throw new Error('請輸入植物中文名稱');
  }

  const clientKey = getStoredApiKey();
  const selectedModel = getStoredModel();
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

  const detailedPrompt = `請以「野外求生植物學家、野外毒物學專家與民族植物學家」身份，為植物「${cleanName}」生成詳盡客觀的植物學鑑定與食用/毒性安全性檔案。請以繁體中文 (Traditional Chinese) 提供。

【重要準則】
1. 【食用性質判斷 isEdible】：首先精準判斷該植物是否可供人類安全食用！若為【不可食用、具毒性、或非食用植物】（例如：姑婆芋、曼陀羅、夾竹桃、咬人貓、馬纓丹、毛地黃、海檬果、毒芹、斷腸草、相思豆等），"isEdible" 必須設為 false！若是安全可食之野生蔬菜/野菜，"isEdible" 設為 true。
2. 【若為不可食用植物 (isEdible: false)】：
   - "edibleParts" 必須為空陣列 []
   - "characteristics" 必須詳盡描述外觀形態與【關鍵鑑別要點與防混淆（嚴防誤採）】
   - "preparation" 中：cookingMethods 必須為空陣列 []，toxicity 設為 'warning' 或 'toxic_raw'，toxicityNotes 必須清楚載明毒性部位、毒素成分與中毒危險性，prepMethod 註明不可食用
   - "nutrition" 中：熱量、蛋白質、碳水、脂肪、纖維全為 0，nutritionHighlights 填入 ["無法食用", "非食用植物"]
3. 【若為可食用植物 (isEdible: true)】：
   - 料理手法必須是「野外求生/叢林技能 (Bushcraft & Wilderness Survival)」風格（例如：葉蛋白萃取(LPC)、乳酸野外自然發酵、草木灰水鹼浸脫毒、流水長時浸洗脫苦、反覆換水沸煮脫澀、石板野火烙炙、竹筒填塞炭火煨熟、坑式地爐燜烤等），【嚴禁】出現家常炒菜（如「蒜炒」、「煮蛋花湯」）。
   - 詳加分析抗營養物質 (如草酸、植酸、單寧、生物鹼、皂苷、草酸鈣針晶) 與去除手法。
   - 估計物種專屬之熱量與營養數值。

請嚴格遵照下列格式回傳純 JSON 物件：
{
  "name": "${cleanName}",
  "isEdible": true,
  "scientificName": "完整拉丁學名 (含命名者縮寫)",
  "aliases": ["常見俗名1", "別名2"],
  "family": "中文科名 (拉丁科名)",
  "category": "wild",
  "edibleParts": ["嫩莖葉", "一般根"],
  "characteristics": {
    "leaves": "葉部形態特徵 (葉形、葉緣、葉脈、質地)",
    "stemAndRoots": "莖柱與根系形態",
    "flowers": "花部特徵 (花期、花型、花色)",
    "fruitsAndSeeds": "果實與種子形態及傳播",
    "distinctiveFeatures": "關鍵辨識要點與防混淆（避免誤採劇毒相近種）"
  },
  "preparation": {
    "prepMethod": "求生前置清洗與脫毒處理步驟（不可食則註記不可食用）",
    "cookingMethods": ["葉蛋白萃取 (LPC)", "反覆換水沸煮脫澀"],
    "toxicity": "none",
    "toxicityNotes": "毒性與安全警語 (若不可食請清楚說明中毒理與風險)",
    "antinutrients": "主要抗營養物質或毒素成分",
    "antinutrientRemoval": "對應之求生消除與脫毒手法（不可食則註記無法藉由烹煮脫毒）",
    "flavorProfile": "野外口感描述（不可食則註記不可食用）",
    "storageMethod": "野外保存方式"
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
}
注意：
- isEdible 必須為 boolean 值 (true 或 false)`;

  // If user provided a client API Key, use direct fast REST call with preferred model
  if (clientKey) {
    try {
      const parsed = await callGeminiDirectFast(clientKey, detailedPrompt, selectedModel);
      const data = mapRawToPlantItem(parsed, cleanName);
      return {
        data,
        source: 'gemini_direct',
        sourceLabel: `Gemini AI (${selectedModel})`,
        sourceDescription: `已成功呼叫 Google Gemini 模型，即時為「${cleanName}」生成專屬野外特徵與求生安全檔案！`,
      };
    } catch (clientApiErr) {
      const errMsg = clientApiErr instanceof Error ? clientApiErr.message : String(clientApiErr);
      throw new Error(`Gemini API 金鑰呼叫失敗：${errMsg}。請確認右上角「AI 設定」中的 API Key 是否有效或配額充足。`);
    }
  }

  // If running on static GitHub Pages without client key
  if (isGitHubPages) {
    throw new Error('目前部署於 GitHub Pages 靜態網站，請點擊右上角「AI 設定」輸入您的 Google Gemini API Key，即可啟用 AI 智能補全功能！');
  }

  // Call Server-side Proxy (sending clientKey and user-selected model)
  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientKey ? { 'x-gemini-api-key': clientKey } : {}),
      },
      body: JSON.stringify({ plantName: cleanName, apiKey: clientKey, model: selectedModel }),
      signal: AbortSignal.timeout(35000),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || !result || !result.success) {
      const errorMsg = result?.error || `AI 伺服器回應異常 (HTTP ${res.status}: ${res.statusText})`;
      throw new Error(errorMsg);
    }

    const data = mapRawToPlantItem(result.data, cleanName);
    return {
      data,
      source: 'gemini_server',
      sourceLabel: `Gemini AI (${result.model || selectedModel})`,
      sourceDescription: `已成功透過雲端 Gemini AI 為「${cleanName}」即時運算生成特徵、辨識要點與安全性檔案！`,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('連線至 AI 伺服器失敗，請確認網路連線是否正常。');
  }
}
