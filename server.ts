import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { inferBotanicalFallback, normalizeBotanicalFamily } from './src/data/botanicalKnowledge';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side Gemini AI generation endpoint
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  const { plantName } = req.body;
  const cleanName = typeof plantName === 'string' ? plantName.trim() : '';

  if (!cleanName) {
    res.status(400).json({ error: '請提供植物名稱' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 30000,
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `請以「野外求生植物學家、野外毒物學專家與民族植物學家」身份，為植物「${cleanName}」生成詳盡客觀的植物學鑑定與食用/毒性安全性檔案。請以繁體中文 (Traditional Chinese) 提供。

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

請嚴格遵照下列 JSON 格式回傳純 JSON 物件：
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
    "toxicityNotes": "毒性與安全警語 (若不可食請清楚說明中學毒理與風險)",
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
- isEdible 必須為 boolean 值 (true 或 false)
- category 只能是 'wild', 'cultivated', 'herb', 'medicinal', 'starch', 'fruit' 之一
- toxicity 只能是 'none', 'caution', 'toxic_raw', 'warning' 之一
- elevation 只能是 'low', 'mid', 'high', 'all' 之一
- abundance 只能是 'abundant', 'common', 'occasional', 'rare' 之一`;

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '{}';
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') {
          // Normalize taxonomy
          const fallback = inferBotanicalFallback(cleanName);
          if (parsed.family) {
            parsed.family = normalizeBotanicalFamily(String(parsed.family));
          } else {
            parsed.family = fallback.family;
          }
          if (!parsed.scientificName || typeof parsed.scientificName !== 'string' || !parsed.scientificName.trim()) {
            parsed.scientificName = fallback.scientificName;
          }

          // Strict edibility normalization
          if (fallback.isEdible === false || parsed.isEdible === false) {
            parsed.isEdible = false;
          } else if (typeof parsed.isEdible !== 'boolean') {
            parsed.isEdible = true;
          }

          if (parsed.isEdible === false) {
            parsed.edibleParts = [];
            if (parsed.preparation) {
              parsed.preparation.cookingMethods = [];
              parsed.preparation.toxicity = parsed.preparation.toxicity === 'none' ? 'warning' : parsed.preparation.toxicity;
              parsed.preparation.prepMethod = parsed.preparation.prepMethod || '此植物非食用植物 / 具毒性或未明，嚴禁食用';
            }
            parsed.nutrition = {
              calories: 0,
              protein: 0,
              carbohydrates: 0,
              fat: 0,
              fiber: 0,
              micronutrients: { calciumMg: 0, ironMg: 0, vitaminCMg: 0, potassiumMg: 0 },
              nutritionHighlights: ['無法食用', '非食用植物'],
            };
          }

          res.json({ success: true, data: parsed, source: 'ai' });
          return;
        }
      } catch (err: unknown) {
        console.warn(`Model ${model} request failed, attempting next:`, err instanceof Error ? err.message : err);
      }
    }
  }

  // Graceful fallback to smart botanical knowledge synthesis with complete taxonomy guaranteed
  const fallbackData = inferBotanicalFallback(cleanName);
  res.json({ success: true, data: fallbackData, source: 'knowledge_base' });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
        watch: isHmrDisabled ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
