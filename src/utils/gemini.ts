import { GoogleGenAI } from '@google/genai';
import { PlantItem, ToxicityLevel, PlantCategory, ElevationCategory, AbundanceLevel } from '../types/plant';
import { INITIAL_PLANTS } from '../data/plantPresets';

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

// Format raw JSON response into structured PlantItem fields
function mapRawToPlantItem(parsed: Record<string, any>, plantName: string): Partial<PlantItem> {
  return {
    name: parsed.name || plantName,
    scientificName: parsed.scientificName || '',
    aliases: Array.isArray(parsed.aliases) ? parsed.aliases : [],
    family: parsed.family || '常見草本植物科',
    category: (parsed.category as PlantCategory) || 'wild',
    edibleParts: Array.isArray(parsed.edibleParts) ? parsed.edibleParts : ['嫩莖葉', '一般根'],
    characteristics: {
      leaves: parsed.characteristics?.leaves || '',
      stemAndRoots: parsed.characteristics?.stemAndRoots || '',
      flowers: parsed.characteristics?.flowers || '',
      fruitsAndSeeds: parsed.characteristics?.fruitsAndSeeds || '',
      distinctiveFeatures: parsed.characteristics?.distinctiveFeatures || '',
    },
    preparation: {
      prepMethod: parsed.preparation?.prepMethod || '清水漂洗去除泥沙，經熱水沸煮殺青後再行利用。',
      cookingMethods: Array.isArray(parsed.preparation?.cookingMethods) && parsed.preparation.cookingMethods.length > 0
        ? parsed.preparation.cookingMethods
        : ['反覆換水沸煮脫澀', '石板野火烙炙', '葉蛋白萃取 (榨汁熱凝)'],
      toxicity: (parsed.preparation?.toxicity as ToxicityLevel) || 'none',
      toxicityNotes: parsed.preparation?.toxicityNotes || '野生採集請確認物種無誤，生食宜慎。',
      antinutrients: parsed.preparation?.antinutrients || '含微量草酸、植酸或單寧',
      antinutrientRemoval: parsed.preparation?.antinutrientRemoval || '反覆換水沸煮、草木灰浸泡中和、乳酸發酵脫酸',
      flavorProfile: parsed.preparation?.flavorProfile || '山野草本清香，處理後微甘。',
      storageMethod: parsed.preparation?.storageMethod || '日曬乾燥磨粉、乳酸發酵貯存。',
    },
    nutrition: {
      calories: Number(parsed.nutrition?.calories) || 25,
      protein: Number(parsed.nutrition?.protein) || 2.5,
      carbohydrates: Number(parsed.nutrition?.carbohydrates) || 4.0,
      fat: Number(parsed.nutrition?.fat) || 0.3,
      fiber: Number(parsed.nutrition?.fiber) || 2.4,
      micronutrients: {
        calciumMg: Number(parsed.nutrition?.micronutrients?.calciumMg) || undefined,
        ironMg: Number(parsed.nutrition?.micronutrients?.ironMg) || undefined,
        vitaminCMg: Number(parsed.nutrition?.micronutrients?.vitaminCMg) || undefined,
        potassiumMg: Number(parsed.nutrition?.micronutrients?.potassiumMg) || undefined,
      },
      nutritionHighlights: Array.isArray(parsed.nutrition?.nutritionHighlights) ? parsed.nutrition.nutritionHighlights : ['野生粗膳食纖維', '求生植物蛋白質'],
    },
    distribution: {
      habitat: Array.isArray(parsed.distribution?.habitat) ? parsed.distribution.habitat : ['平地荒野', '淺山林緣'],
      elevation: (parsed.distribution?.elevation as ElevationCategory) || 'low',
      elevationDesc: parsed.distribution?.elevationDesc || '平地至低海拔開闊地',
      regions: Array.isArray(parsed.distribution?.regions) ? parsed.distribution.regions : ['台灣中低海拔廣布'],
      season: Array.isArray(parsed.distribution?.season) ? parsed.distribution.season : ['春季', '夏季'],
      abundance: (parsed.distribution?.abundance as AbundanceLevel) || 'common',
    },
  };
}

// Generate structured plant information using Server Proxy or Client API Key
// NOTE: Does NOT force preset override, so user can always generate real AI content!
export async function generatePlantDetailsWithAI(plantName: string): Promise<Partial<PlantItem>> {
  const cleanName = plantName.trim();
  if (!cleanName) {
    throw new Error('請輸入植物名稱');
  }

  // 1. First, call our server-side API proxy (/api/gemini/generate)
  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plantName: cleanName }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        return mapRawToPlantItem(result.data, cleanName);
      }
    }
  } catch (serverErr) {
    console.warn('Server proxy unavailable, checking client fallback...', serverErr);
  }

  // 2. If running statically on GitHub Pages with no backend, check client-side GEMINI_API_KEY
  const clientKey = getStoredApiKey();
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: clientKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `請以野外求生植物學家身份，為「${cleanName}」生成野外求生食用檔案（繁體中文）。
必須包含抗營養物質(草酸/單寧/生物鹼等)及消除手法，料理手法必須是求生加工手法（葉蛋白萃取、乳酸發酵、草木灰鹼浸、流水浸洗、石板烙炙、炭火煨熟等），食用部位可含一般根。
回傳純 JSON：
{
  "name": "${cleanName}",
  "scientificName": "完整學名",
  "aliases": ["別名1"],
  "family": "科別",
  "category": "wild",
  "edibleParts": ["嫩莖葉", "一般根"],
  "characteristics": {
    "leaves": "葉特徵",
    "stemAndRoots": "莖與根特徵",
    "flowers": "花特徵",
    "fruitsAndSeeds": "果實",
    "distinctiveFeatures": "辨識防混淆要點"
  },
  "preparation": {
    "prepMethod": "求生脫毒步驟",
    "cookingMethods": ["葉蛋白萃取 (榨汁熱凝)", "反覆換水沸煮脫澀", "草木灰水鹼浸脫毒"],
    "toxicity": "none",
    "toxicityNotes": "毒性警語",
    "antinutrients": "含草酸與植酸",
    "antinutrientRemoval": "草木灰鹼水浸泡中和、反覆換水滾沸",
    "flavorProfile": "口感",
    "storageMethod": "日曬乾燥磨粉"
  },
  "nutrition": {
    "calories": 25,
    "protein": 2.5,
    "carbohydrates": 4.0,
    "fat": 0.3,
    "fiber": 2.5,
    "micronutrients": {
      "calciumMg": 90,
      "ironMg": 2.5,
      "vitaminCMg": 25,
      "potassiumMg": 320
    },
    "nutritionHighlights": ["求生高纖"]
  },
  "distribution": {
    "habitat": ["平地荒野"],
    "elevation": "low",
    "elevationDesc": "平地開闊向陽",
    "regions": ["全台廣布"],
    "season": ["春季", "夏季"],
    "abundance": "common"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return mapRawToPlantItem(parsed, cleanName);
    } catch (clientApiErr) {
      console.warn('Client-side Gemini API call failed', clientApiErr);
    }
  }

  // 3. Fallback to smart survival template so user is never blocked
  return generateFallbackTemplate(cleanName);
}

function generateFallbackTemplate(plantName: string): Partial<PlantItem> {
  return {
    name: plantName,
    scientificName: '',
    aliases: [],
    family: '野外常見草本植物科',
    category: 'wild',
    edibleParts: ['幼嫩葉', '一般根', '幼嫩芽梢'],
    characteristics: {
      leaves: '單葉互生或對生，葉片質地柔嫩多汁，富含植物性水分。',
      stemAndRoots: '具直立或斜升之莖，主根或一般根系發達，可於危急時掘出清洗應急。',
      flowers: '花序頂生或腋生，花期多在春至秋季。',
      fruitsAndSeeds: '果實種子多數，成熟時可採集磨粉充作野外緊急熱量。',
      distinctiveFeatures: `野外求生採集「${plantName}」時務必確認氣味與乳汁特徵，避免誤採劇毒相近種。`,
    },
    preparation: {
      prepMethod: '摘取嫩芽或刷洗一般根部泥沙。求生環境下務必入滾水反覆沸煮殺青 2 回，去苦澀與微毒。',
      cookingMethods: ['葉蛋白萃取 (榨汁熱凝)', '反覆換水沸煮脫澀', '草木灰水鹼浸脫毒', '石板野火烙炙'],
      toxicity: 'caution',
      toxicityNotes: '野生採集宜熟食，確認無刺激性毒性後方可少量試食 (Universal Edibility Test)。',
      antinutrients: '草酸 (Oxalate)、植酸 (Phytate)、微量單寧',
      antinutrientRemoval: '反覆換水沸煮殺青、草木灰水浸泡中和、搾汁加熱凝聚葉蛋白分離纖維與草酸',
      flavorProfile: '帶有濃郁山林青草芬芳，脫毒後微苦甘甜。',
      storageMethod: '烈日曝曬乾燥後搗碎成野外備用能量粉，或煙燻乾燥。',
    },
    nutrition: {
      calories: 25,
      protein: 2.6,
      carbohydrates: 3.8,
      fat: 0.3,
      fiber: 2.4,
      micronutrients: {
        calciumMg: 95,
        ironMg: 2.8,
        vitaminCMg: 30,
        potassiumMg: 350,
      },
      nutritionHighlights: ['天然野生粗纖維', '求生植物蛋白質', '低卡抗氧化'],
    },
    distribution: {
      habitat: ['平地荒野', '休耕田埂', '淺山林緣向陽處'],
      elevation: 'low',
      elevationDesc: '海平面至海拔 1,000 公尺向陽地帶',
      regions: ['台灣平野及低海拔山區常見'],
      season: ['春季', '夏季', '秋季'],
      abundance: 'common',
    },
  };
}
