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

    const prompt = `請以「野外求生植物學家、野營覓食專家與民族植物學家」身份，為植物「${cleanName}」生成詳盡客觀的求生食用與加工檔案。請以繁體中文 (Traditional Chinese) 提供。

【重要準則】
1. 【完整學名與科別】：必須精準提供真實完整的拉丁學名 (含命名者縮寫，例如：Crassocephalum crepidioides (Benth.) S.Moore) 以及科別 (格式必須為：中文科名 (拉丁科名)，例如：菊科 (Asteraceae), 茄科 (Solanaceae), 豆科 (Fabaceae))。不可留空！
2. 【野外求生風格料理】：料理手法必須是「野外求生/叢林技能 (Bushcraft & Wilderness Survival)」風格（例如：葉蛋白萃取(LPC)、乳酸野外自然發酵、草木灰水鹼浸脫毒、流水長時浸洗脫苦、反覆換水沸煮脫澀、石板野火烙炙、竹筒填塞炭火煨熟、坑式地爐燜烤、日曬乾燥磨粉存糧、柴火低溫煙燻等），【嚴禁】出現家常炒菜（如「蒜炒」、「煮蛋花湯」）。
3. 【抗營養物質分析】：必須詳加分析「抗營養物質 (Antinutrients)」（如：草酸、植酸、單寧/鞣酸、生物鹼、皂苷、氰苷、草酸鈣針晶、胰蛋白酶抑制劑）與其對應的求生消除與脫毒降解手法。
4. 【物種專屬差異數據】：熱量、蛋白質、碳水化合物、纖維與微量元素必須具備植物專屬科學估計差異，不可千篇一律填入固定數值。

請嚴格遵照下列 JSON 格式回傳純 JSON 物件：
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
}
注意：
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
