import { PlantItem, ToxicityLevel, PlantCategory, ElevationCategory, AbundanceLevel } from '../types/plant';

export const COMMON_BOTANICAL_FAMILIES = [
  '菊科 (Asteraceae)',
  '茄科 (Solanaceae)',
  '豆科 (Fabaceae)',
  '馬齒莧科 (Portulacaceae)',
  '蹄蓋蕨科 (Athyriaceae)',
  '車前科 (Plantaginaceae)',
  '莧科 (Amaranthaceae)',
  '番杏科 (Aizoaceae)',
  '旋花科 (Convolvulaceae)',
  '紫草科 (Boraginaceae)',
  '薑科 (Zingiberaceae)',
  '三白草科 (Saururaceae)',
  '桑科 (Moraceae)',
  '唇形科 (Lamiaceae)',
  '辣木科 (Moringaceae)',
  '落葵科 (Basellaceae)',
  '十字花科 (Brassicaceae)',
  '繖形科 (Apiaceae)',
  '蕁麻科 (Urticaceae)',
  '蓼科 (Polygonaceae)',
  '禾本科 (Poaceae)',
  '天南星科 (Araceae)',
  '鐵角蕨科 (Aspleniaceae)',
  '石竹科 (Caryophyllaceae)',
  '石蒜科 (Amaryllidaceae)',
  '酢醬草科 (Oxalidaceae)',
  '鴨跖草科 (Commelinaceae)',
  '葫蘆科 (Cucurbitaceae)',
  '芸香科 (Rutaceae)',
  '漆樹科 (Anacardiaceae)',
  '爵床科 (Acanthaceae)',
  '胡椒科 (Piperaceae)',
  '桫欏科 (Cyatheaceae)',
];

export function normalizeBotanicalFamily(raw: string): string {
  if (!raw) return '常見草本植物科';
  const clean = raw.trim();

  // If already in standard list
  const exact = COMMON_BOTANICAL_FAMILIES.find((f) => f.toLowerCase() === clean.toLowerCase());
  if (exact) return exact;

  // Match by Chinese family name
  const matched = COMMON_BOTANICAL_FAMILIES.find((f) => {
    const chi = f.split(' ')[0];
    return clean.includes(chi) || chi.includes(clean);
  });
  if (matched) return matched;

  // Format "菊科 Asteraceae" into "菊科 (Asteraceae)"
  const parts = clean.split(/\s+/);
  if (parts.length >= 2 && !clean.includes('(')) {
    return `${parts[0]} (${parts.slice(1).join(' ')})`;
  }

  return clean;
}

export interface BotanicalEntry {
  name: string;
  scientificName: string;
  family: string;
  aliases: string[];
  category: PlantCategory;
  edibleParts: string[];
  characteristics: {
    leaves: string;
    stemAndRoots: string;
    flowers: string;
    fruitsAndSeeds: string;
    distinctiveFeatures: string;
  };
  preparation: {
    prepMethod: string;
    cookingMethods: string[];
    toxicity: ToxicityLevel;
    toxicityNotes: string;
    antinutrients: string;
    antinutrientRemoval: string;
    flavorProfile: string;
    storageMethod: string;
  };
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    micronutrients?: {
      calciumMg?: number;
      ironMg?: number;
      vitaminCMg?: number;
      potassiumMg?: number;
    };
    nutritionHighlights: string[];
  };
  distribution: {
    habitat: string[];
    elevation: ElevationCategory;
    elevationDesc: string;
    regions: string[];
    season: string[];
    abundance: AbundanceLevel;
  };
}

export const KNOWN_BOTANICAL_DATABASE: Record<string, BotanicalEntry> = {
  昭和草: {
    name: '昭和草',
    scientificName: 'Crassocephalum crepidioides (Benth.) S.Moore',
    family: '菊科 (Asteraceae)',
    aliases: ['飛機草', '山茼蒿', '神仙菜', '野木耳菜'],
    category: 'wild',
    edibleParts: ['嫩莖葉', '幼嫩芽梢', '一般根（洗淨熬湯）'],
    characteristics: {
      leaves: '單葉互生，葉橢圓形至倒披針形，葉緣不規則羽狀裂或粗鋸齒，葉面質地薄軟微皺。',
      stemAndRoots: '草本直立，中空肉質莖帶紫褐色斑紋，主根直深入土並具廣泛細根。',
      flowers: '頭狀花序頂生，花冠紅褐色或橙紅色，開花時整束筒狀低垂向下。',
      fruitsAndSeeds: '瘦果圓柱形，具大量白色羽狀冠毛，隨風飄散傳播極遠。',
      distinctiveFeatures: '全株揉碎具鮮明菊科茼蒿清芳，花苞低垂不張開為最顯著辨識特徵。',
    },
    preparation: {
      prepMethod: '摘取未開花之嫩葉嫩梢，清水洗淨泥沙。反覆滾水沸煮 1 至 2 回以排除微量生物鹼與苦澀物質。',
      cookingMethods: ['反覆換水沸煮脫澀', '石板野火烙炙', '竹筒填塞炭火煨熟', '葉蛋白萃取 (LPC)'],
      toxicity: 'caution',
      toxicityNotes: '全株含微量吡咯里西啶類生物鹼 (PA)，不可長期大量生食，高溫熟透後食用安全無虞。',
      antinutrients: '草酸 (Oxalate)、微量吡咯里西啶生物鹼、單寧',
      antinutrientRemoval: '大量滾水殺青換水傾倒苦液、草木灰鹼水短暫浸泡中和、榨汁熱凝葉蛋白純化。',
      flavorProfile: '帶有類似茼蒿之濃郁草本清香，口感滑嫩微甘。',
      storageMethod: '置於通風陰涼處曬乾後磨粉，或以柴火低溫煙燻乾燥。',
    },
    nutrition: {
      calories: 22,
      protein: 2.8,
      carbohydrates: 3.6,
      fat: 0.3,
      fiber: 2.5,
      micronutrients: { calciumMg: 120, ironMg: 3.4, vitaminCMg: 38, potassiumMg: 360 },
      nutritionHighlights: ['豐富天然胡蘿蔔素', '救荒優質植物蛋白', '高鈣高鉀平衡電解質'],
    },
    distribution: {
      habitat: ['平地荒野', '休耕田埂', '淺山林緣向陽處', '火燒跡地'],
      elevation: 'low',
      elevationDesc: '海平面至海拔 1,500 公尺向陽地帶',
      regions: ['全台灣平原至淺山山區全境普遍分佈'],
      season: ['春季', '夏季', '秋季', '冬季'],
      abundance: 'abundant',
    },
  },
  假酸漿: {
    name: '假酸漿',
    scientificName: 'Trichodesma calycosum Collett & Hemsl.',
    family: '紫草科 (Boraginaceae)',
    aliases: ['碧果草', '山地生菜', '白龍船花', '排灣包粽葉'],
    category: 'wild',
    edibleParts: ['嫩莖葉'],
    characteristics: {
      leaves: '單葉互生，長橢圓形至卵狀披針形，葉面佈滿白色粗糙刺毛，手摸觸感粗糙如砂紙。',
      stemAndRoots: '多年生亞灌木狀直立草本，莖圓柱形被倒生糙伏毛，基部略木質化。',
      flowers: '圓錐狀聚繖花序頂生，花冠鐘形白色或粉白，花萼大且宿存。',
      fruitsAndSeeds: '小堅果 4 枚，表面具網紋，包裹於膨大花萼中。',
      distinctiveFeatures: '原住民傳統「吉拿富 (Cinavu)」包裹葉片，葉面具獨特糙毛，熟後柔軟好消化。',
    },
    preparation: {
      prepMethod: '採收鮮綠無病害葉片，先於流動溪水中以細沙輕輕搓洗軟化葉面刺毛，滾水快速汆燙殺青。',
      cookingMethods: ['坑式地爐燜烤', '竹筒填塞炭火煨熟', '反覆換水沸煮脫澀', '乳酸野外自然發酵'],
      toxicity: 'none',
      toxicityNotes: '無急性毒性，葉面糙毛生食易刺癢口腔黏膜，熟化後刺毛軟化即可安心食用。',
      antinutrients: '草酸、單寧酸、微量植物鹼',
      antinutrientRemoval: '熱水沸煮軟化物理刺毛、草木灰鹼水浸泡中和草酸、包裹主食燜烤釋放清香。',
      flavorProfile: '自帶草本植物膠質與清甜香氣，能幫助消化油膩肉類。',
      storageMethod: '整片葉片陰乾壓平堆疊保存，或經鹽漬發酵長期存放。',
    },
    nutrition: {
      calories: 28,
      protein: 3.2,
      carbohydrates: 4.1,
      fat: 0.4,
      fiber: 2.8,
      micronutrients: { calciumMg: 140, ironMg: 2.8, vitaminCMg: 32, potassiumMg: 380 },
      nutritionHighlights: ['豐富葉綠素與水溶性多醣', '天然抗氧化多酚', '幫助腸道蠕動之植物纖維'],
    },
    distribution: {
      habitat: ['淺山林緣', '平地荒野', '河床向陽灌叢', '原民聚落周圍'],
      elevation: 'low',
      elevationDesc: '海拔 100 至 1,200 公尺開闊乾燥向陽坡面',
      regions: ['台灣中南部及東部淺山與原住民族聚落常見'],
      season: ['春季', '夏季', '秋季'],
      abundance: 'common',
    },
  },
  車前草: {
    name: '車前草',
    scientificName: 'Plantago asiatica L.',
    family: '車前科 (Plantaginaceae)',
    aliases: ['車輪菜', '五爪草', '當道', '地衣'],
    category: 'wild',
    edibleParts: ['嫩莖葉', '成熟種子 (車前子)', '一般根（煮水代茶）'],
    characteristics: {
      leaves: '根生葉叢生呈蓮座狀，葉片卵形或廣卵形，具 5 條明顯弧形脈，葉柄基部擴大。',
      stemAndRoots: '無地上莖，具短粗垂直根莖與多數白色鬚狀根。',
      flowers: '穗狀花序自葉叢抽出直立，小花細密白綠色，雄蕊外露伸長。',
      fruitsAndSeeds: '蓋果卵狀橢圓形，成熟時環狀裂開，內含細小黑褐色種子。',
      distinctiveFeatures: '葉片具典型 5 條弧形脈，韌性極強耐踩踏，常生於人車踩踏道路兩側。',
    },
    preparation: {
      prepMethod: '摘取幼嫩葉片，洗淨葉柄基部泥沙。因含較多黏液質與纖維，沸水燙煮 5 分鐘後浸入冷水浸漂。',
      cookingMethods: ['反覆換水沸煮脫澀', '流水長時浸洗脫苦', '日曬乾燥磨粉存糧', '低溫慢熬提煉高湯'],
      toxicity: 'none',
      toxicityNotes: '性偏寒涼，脾胃極度虛弱者求生環境下不宜連續單一大量食用。',
      antinutrients: '草酸、桃葉珊瑚苷 (Aucubin)、微量單寧',
      antinutrientRemoval: '反覆沸水換水殺青去除苦桃苷、長時流動水漂洗降低黏液澀感。',
      flavorProfile: '微甘而潤，帶有清涼草藥氣息，久嚼富含植物膠質。',
      storageMethod: '全草洗淨連根日曬曬乾，捆綁吊掛於乾燥背風處，可煮野外清熱解暑茶。',
    },
    nutrition: {
      calories: 24,
      protein: 2.3,
      carbohydrates: 4.2,
      fat: 0.2,
      fiber: 2.9,
      micronutrients: { calciumMg: 160, ironMg: 4.1, vitaminCMg: 28, potassiumMg: 410 },
      nutritionHighlights: ['極高天然利尿鉀離子', '車前草膠質 (Mucilage)', '高胡蘿蔔素維生素A原'],
    },
    distribution: {
      habitat: ['平地荒野', '農田田埂', '路旁踩踏開闊地', '居家園圃周邊'],
      elevation: 'low',
      elevationDesc: '平地至中海拔 2,000 公尺之道路邊緣',
      regions: ['全台灣全島低至中海拔普遍常見'],
      season: ['春季', '夏季', '秋季'],
      abundance: 'abundant',
    },
  },
  刺莧: {
    name: '刺莧',
    scientificName: 'Amaranthus spinosus L.',
    family: '莧科 (Amaranthaceae)',
    aliases: ['刺莧菜', '野刺莧', '勒莧菜'],
    category: 'wild',
    edibleParts: ['嫩莖葉', '幼嫩芽梢', '種子', '一般根（熬湯利水）'],
    characteristics: {
      leaves: '單葉互生，卵形或菱狀卵形，葉柄基部兩側各具 1 對尖銳直硬之托葉刺。',
      stemAndRoots: '莖直立多分枝，綠色或紫紅色，具鈍稜。主根粗壯黃褐色。',
      flowers: '圓錐花序腋生或頂生，花單性綠色，苞片具刺芒。',
      fruitsAndSeeds: '胞果近球形，含光澤黑色扁圓形細小種子。',
      distinctiveFeatures: '葉腋處長有 2 根銳利硬刺，採集時需防刺傷；嫩梢處刺尚未木質化最易採食。',
    },
    preparation: {
      prepMethod: '以小刀削取嫩梢嫩葉避開硬刺，滾水加少許木灰或食鹽沸煮殺青，棄煮水以去草酸。',
      cookingMethods: ['葉蛋白萃取 (LPC)', '反覆換水沸煮脫澀', '石板野火烙炙', '日曬乾燥磨粉存糧'],
      toxicity: 'none',
      toxicityNotes: '無劇毒，含較多硝酸鹽與草酸，不宜未煮透生食。',
      antinutrients: '高草酸 (Oxalate)、硝酸鹽 (Nitrates)、植酸',
      antinutrientRemoval: '大量滾水沸煮更換浸出液以去除 70% 草酸；打碎壓汁加熱沉澱純化葉蛋白分離草酸。',
      flavorProfile: '口感滑嫩無異味，甘美如市售莧菜，野味純厚。',
      storageMethod: '嫩葉乾燥磨粉存糧；種子敲落收集後炒熟磨成野外高蛋白粉。',
    },
    nutrition: {
      calories: 27,
      protein: 3.5,
      carbohydrates: 3.9,
      fat: 0.3,
      fiber: 2.6,
      micronutrients: { calciumMg: 210, ironMg: 4.8, vitaminCMg: 45, potassiumMg: 490 },
      nutritionHighlights: ['極高植物性鐵質與鈣質', '野外頂級蛋白質救荒野菜', '豐富離胺酸 (Lysine)'],
    },
    distribution: {
      habitat: ['平地荒野', '休耕田埂', '放牧草地', '向陽廢棄地'],
      elevation: 'low',
      elevationDesc: '海平面至海拔 800 公尺向陽荒地',
      regions: ['全台灣平野、海濱沙灘後緣、荒廢田野極常見'],
      season: ['春季', '夏季', '秋季'],
      abundance: 'abundant',
    },
  },
  野莧: {
    name: '野莧',
    scientificName: 'Amaranthus viridis L.',
    family: '莧科 (Amaranthaceae)',
    aliases: ['綠莧', '鳥莧', '野莧菜', '細莧'],
    category: 'wild',
    edibleParts: ['嫩莖葉', '幼嫩芽梢', '種子', '一般根'],
    characteristics: {
      leaves: '單葉互生，卵形至卵狀菱形，葉端微凹具小凸尖，全緣或微波狀，無刺。',
      stemAndRoots: '莖直立具縱條紋，多分枝，無刺光滑。主根直入。',
      flowers: '細長穗狀花序頂生與腋生，綠色密集下垂。',
      fruitsAndSeeds: '胞果近球形具皺縮紋，內藏黑褐色光澤種子。',
      distinctiveFeatures: '與刺莧極似但全株無刺，葉柄基部無刺，採集極為安全方便。',
    },
    preparation: {
      prepMethod: '摘取嫩梢嫩葉，清水漂洗後滾水燙煮 3 分鐘棄水去酸。',
      cookingMethods: ['葉蛋白萃取 (LPC)', '反覆換水沸煮脫澀', '竹筒填塞炭火煨熟', '日曬乾燥磨粉存糧'],
      toxicity: 'none',
      toxicityNotes: '無毒性，含草酸成分建議徹底加熱熟食。',
      antinutrients: '草酸、硝酸鹽、植酸',
      antinutrientRemoval: '反覆沸水換水殺青排除水溶性草酸，或搾汁熱凝分離粗葉蛋白。',
      flavorProfile: '細膩柔滑，甘甜爽口，比家常莧菜更富濃郁菜香。',
      storageMethod: '日曬乾燥磨製成深綠色乾糧粉，或將成熟種子搖落曬乾儲存。',
    },
    nutrition: {
      calories: 26,
      protein: 3.3,
      carbohydrates: 3.8,
      fat: 0.3,
      fiber: 2.4,
      micronutrients: { calciumMg: 195, ironMg: 4.2, vitaminCMg: 40, potassiumMg: 450 },
      nutritionHighlights: ['豐富多種胺基酸', '高生物可利用性植物鈣', '清熱潤腸野生粗纖維'],
    },
    distribution: {
      habitat: ['平地荒野', '休耕田地', '菜園周邊', '路旁'],
      elevation: 'low',
      elevationDesc: '平地至低海拔 1,000 公尺開闊向陽處',
      regions: ['全台灣平野、海濱到低海拔山野處處可見'],
      season: ['全年', '春夏兩季最盛'],
      abundance: 'abundant',
    },
  },
  過溝菜蕨: {
    name: '過溝菜蕨',
    scientificName: 'Diplazium esculentum (Retz.) Sw.',
    family: '蹄蓋蕨科 (Athyriaceae)',
    aliases: ['過貓', '菜蕨', '黑蕨', '野蕨菜'],
    category: 'wild',
    edibleParts: ['幼嫩芽梢 (卷旋幼葉)', '嫩莖葉'],
    characteristics: {
      leaves: '二回羽狀複葉，幼葉頂端呈典型問號狀卷旋 (Crozier)，被褐色微鱗片。',
      stemAndRoots: '根莖直立粗短呈小樹幹狀，具叢生粗黑直根。',
      flowers: '蕨類無花果，成熟葉背沿葉脈著生線形孢子囊群。',
      fruitsAndSeeds: '以細微孢子繁殖。',
      distinctiveFeatures: '生長於陰濕溪流溝渠旁，卷曲嫩芽頂端手感脆嫩折斷多汁清脆。',
    },
    preparation: {
      prepMethod: '摘取頂端捲曲嫩葉，用指甲掐取脆嫩處。沸水加草木灰水滾燙殺青 2 分鐘，再於流動冷水中沖洗。',
      cookingMethods: ['反覆換水沸煮脫澀', '草木灰水鹼浸脫毒', '流水長時浸洗脫苦', '竹筒填塞炭火煨熟'],
      toxicity: 'caution',
      toxicityNotes: '蕨類普遍含原蕨苷 (Ptaquiloside) 與單寧，切忌生食，高溫熟化透徹後有害成分降解。',
      antinutrients: '原蕨苷 (微量)、單寧酸 (Tannins)、硫胺素酶 (Thiaminase)',
      antinutrientRemoval: '草木灰水鹼性浸洗中和苦味單寧，高溫沸水完全煮透滅活硫胺素酶與裂解原蕨苷。',
      flavorProfile: '爽脆滑口，略帶自然微黏液質，回甘清冽。',
      storageMethod: '滾水燙透後浸入冷泉保存 2 天，或經鹽揉天然乳酸自然發酵。',
    },
    nutrition: {
      calories: 21,
      protein: 2.7,
      carbohydrates: 3.2,
      fat: 0.2,
      fiber: 2.8,
      micronutrients: { calciumMg: 85, ironMg: 2.6, vitaminCMg: 22, potassiumMg: 310 },
      nutritionHighlights: ['豐富滑潤植物黏蛋白', '低卡高纖維', '豐富微量元素錳與鋅'],
    },
    distribution: {
      habitat: ['水濱濕地', '淺山林緣', '山澗溪溝', '陰濕山谷'],
      elevation: 'mid',
      elevationDesc: '低海拔至中海拔 1,500 公尺潮濕庇蔭水澤',
      regions: ['台灣全島陰濕溝渠、山溪邊緣極普遍'],
      season: ['春季', '夏季', '秋季', '雨後特別旺盛'],
      abundance: 'abundant',
    },
  },
  雷公根: {
    name: '雷公根',
    scientificName: 'Centella asiatica (L.) Urb.',
    family: '繖形科 (Apiaceae)',
    aliases: ['積雪草', '崩大碗', '蚶殼草', '落得打'],
    category: 'medicinal',
    edibleParts: ['嫩莖葉', '一般根', '全草'],
    characteristics: {
      leaves: '單葉互生，圓腎形至馬蹄形，葉緣具鈍鋸齒，葉柄細長基部鞘狀。',
      stemAndRoots: '葡匐莖細長伏地蔓延，節處生根並長出直立葉片。細鬚根多數。',
      flowers: '繖形花序單生或數個生於節上，花極小紅紫色。',
      fruitsAndSeeds: '雙懸果扁球形，表面具明顯網紋肋稜。',
      distinctiveFeatures: '匍匐於潮濕地表，葉如銅錢馬蹄形，具獨特淡雅胡蘿蔔與芹菜草本芳香。',
    },
    preparation: {
      prepMethod: '連根拔取後洗淨匍匐莖節間泥沙，以清水反覆漂洗，滾水短暫汆燙 1 分鐘除泥腥。',
      cookingMethods: ['低溫慢熬提煉高湯', '竹筒填塞炭火煨熟', '反覆換水沸煮脫澀', '石板野火烙炙'],
      toxicity: 'none',
      toxicityNotes: '無劇毒，性偏微寒，過量單次大量生食可能引起輕度腹瀉。',
      antinutrients: '皂苷 (積雪草苷)、微量單寧',
      antinutrientRemoval: '清水長時間長時浸洗脫去部分皂苷苦感，沸水加熱中和苦味。',
      flavorProfile: '微苦而後回甘，清涼爽口，具生津止渴之感。',
      storageMethod: '清洗後整株曬乾，裝袋防潮，野外可作為生津止渴清涼茶飲。',
    },
    nutrition: {
      calories: 20,
      protein: 2.1,
      carbohydrates: 3.5,
      fat: 0.2,
      fiber: 2.2,
      micronutrients: { calciumMg: 110, ironMg: 3.2, vitaminCMg: 30, potassiumMg: 390 },
      nutritionHighlights: ['富含積雪草苷多酚', '強效抗氧化修復力', '野生電解質補充'],
    },
    distribution: {
      habitat: ['平地荒野', '農田田埂', '水濱濕地', '陰濕草皮'],
      elevation: 'low',
      elevationDesc: '海平面至海拔 1,200 公尺潮濕向陽或半遮陰草地',
      regions: ['全台灣平野、低海拔濕潤土壤極常見'],
      season: ['全年', '春夏生長最繁茂'],
      abundance: 'abundant',
    },
  },
  魚腥草: {
    name: '魚腥草',
    scientificName: 'Houttuynia cordata Thunb.',
    family: '三白草科 (Saururaceae)',
    aliases: ['折耳根', '蕺菜', '臭菜', '豬鼻拱'],
    category: 'medicinal',
    edibleParts: ['一般根 (地下根狀莖)', '嫩莖葉', '幼嫩芽梢'],
    characteristics: {
      leaves: '單葉互生，心形或寬卵形，先端漸尖，基部心形，葉背常帶紫紅斑紋。',
      stemAndRoots: '地下具白色肉質匍匐根狀莖，節間長且各節生有鬚根。',
      flowers: '穗狀花序頂生，基部具 4 枚白色花瓣狀總苞片，小花黃綠色無花被。',
      fruitsAndSeeds: '蒴果卵圓形，頂端開裂。',
      distinctiveFeatures: '全株搓碎散發強烈魚腥及癸醯乙醛揮發油芳香，地下白色根莖脆嫩多汁。',
    },
    preparation: {
      prepMethod: '挖掘地下肥嫩白色根莖並摘取嫩葉，洗去泥沙。若不喜強烈腥味，可用滾水反覆沸煮 2 回使揮發油散逸。',
      cookingMethods: ['反覆換水沸煮脫澀', '流水長時浸洗脫苦', '泥裹灰燼煨熟', '低溫慢熬提煉高湯'],
      toxicity: 'none',
      toxicityNotes: '無毒性，含癸醯乙醛等抗菌揮發成分，加熱後腥味轉為清香。',
      antinutrients: '癸醯乙醛揮發精油、微量生物鹼、草酸',
      antinutrientRemoval: '高溫水煮揮發強烈魚腥油，長時浸水沖洗使辛辣刺激性轉為甘潤。',
      flavorProfile: '生品辛竄具腥香，高溫煨煮或發酵後轉為淡雅甘甜，根部脆如筍。',
      storageMethod: '地下根莖埋入潮濕細沙可保鮮 2 週；全草日曬乾燥後留存熬煮抗菌草本湯。',
    },
    nutrition: {
      calories: 25,
      protein: 2.2,
      carbohydrates: 4.5,
      fat: 0.3,
      fiber: 2.9,
      micronutrients: { calciumMg: 98, ironMg: 3.5, vitaminCMg: 35, potassiumMg: 370 },
      nutritionHighlights: ['天然植物廣譜抗菌成分魚腥草素', '抗發炎黃酮苷 (槲皮苷)', '高膳食纖維'],
    },
    distribution: {
      habitat: ['水濱濕地', '淺山林緣', '農田溝渠邊', '潮濕蔭蔽處'],
      elevation: 'mid',
      elevationDesc: '低海拔至中海拔 1,500 公尺山區陰濕溝谷',
      regions: ['台灣全島陰濕溝渠、林下山徑旁常見'],
      season: ['春季', '夏季', '秋季'],
      abundance: 'common',
    },
  },
  野薑花: {
    name: '野薑花',
    scientificName: 'Hedychium coronarium J.Koenig',
    family: '薑科 (Zingiberaceae)',
    aliases: ['穗花山奈', '蝴蝶薑', '蝴蝶花', '薑花'],
    category: 'wild',
    edibleParts: ['花苞與花', '嫩莖葉', '塊根塊莖', '一般根'],
    characteristics: {
      leaves: '單葉互生呈二列排，長橢圓狀披針形，葉面光滑鮮綠，葉背被短柔毛。',
      stemAndRoots: '地下具肥厚肉質根狀莖，橫走橫展，富含淡香薑味。',
      flowers: '穗狀花序頂生，花白色具強烈甜美芬芳，花冠形似展翅白蝴蝶。',
      fruitsAndSeeds: '蒴果球形，種子具紅色假種皮。',
      distinctiveFeatures: '花朵純白芳香如蝴蝶，生於溪流淺水旁，地下塊莖斷面具清香薑氣。',
    },
    preparation: {
      prepMethod: '採摘剛綻放之新鮮白花苞或洗刷地下塊莖。花苞直接入沸水快燙，塊莖切片長時間低溫煨煮。',
      cookingMethods: ['竹筒填塞炭火煨熟', '低溫慢熬提煉高湯', '石板野火烙炙', '日曬乾燥磨粉存糧'],
      toxicity: 'none',
      toxicityNotes: '全株無毒，芳香宜人，野外求生可用於去除野禽獸肉羶腥味。',
      antinutrients: '芳香揮發油精、微量單寧',
      antinutrientRemoval: '滾水快汆燙揮發多餘精油，或烘乾成天然野營調味料。',
      flavorProfile: '花朵甘甜滑潤帶濃郁野薑花芬芳，塊莖辛香溫暖驅寒。',
      storageMethod: '花苞日曬乾燥成香料花茶；根莖柴火低溫煙燻或切片烘乾長期備用。',
    },
    nutrition: {
      calories: 30,
      protein: 1.8,
      carbohydrates: 5.6,
      fat: 0.3,
      fiber: 2.1,
      micronutrients: { calciumMg: 75, ironMg: 2.2, vitaminCMg: 25, potassiumMg: 280 },
      nutritionHighlights: ['薑烯與芳香抗氧化多酚', '野外驅寒溫中之天然調味料', '低脂低熱量'],
    },
    distribution: {
      habitat: ['水濱濕地', '淺山林緣', '山澗溪畔', '池塘邊緣'],
      elevation: 'low',
      elevationDesc: '低海拔溪谷水澤與山澗旁',
      regions: ['全台灣低海拔溪畔山谷濕地普遍分佈'],
      season: ['夏季', '秋季'],
      abundance: 'abundant',
    },
  },
  構樹: {
    name: '構樹',
    scientificName: 'Broussonetia papyrifera (L.) L\'Hér. ex Vent.',
    family: '桑科 (Moraceae)',
    aliases: ['鹿仔樹', '穀樹', '鈔票樹', '奶樹'],
    category: 'wild',
    edibleParts: ['成熟果實', '嫩莖葉', '幼嫩芽梢', '雄花花穗'],
    characteristics: {
      leaves: '單葉互生，葉形多型性，常深裂或卵心形，葉面粗糙被粗毛，葉背密被柔毛。折斷有白色乳汁。',
      stemAndRoots: '落葉喬木，樹皮富含強韌纖維，主幹粗直，根系極深且廣。',
      flowers: '雌雄異株，雄花序葇荑狀下垂如毛毛蟲，雌花序球形頭狀。',
      fruitsAndSeeds: '聚合果球形，成熟時由綠轉為鮮豔橙紅色，肉質多汁味甜。',
      distinctiveFeatures: '枝葉折斷分泌大量白色黏稠乳汁；樹皮強韌為製作野外繩索與編織極佳材料。',
    },
    preparation: {
      prepMethod: '採收鮮紅成熟果實剔除蟲蟻直接享用；嫩葉採集後須沸水換水煮透以去除黏性乳汁。',
      cookingMethods: ['反覆換水沸煮脫澀', '竹筒填塞炭火煨熟', '葉蛋白萃取 (LPC)', '日曬乾燥磨粉存糧'],
      toxicity: 'caution',
      toxicityNotes: '生鮮白色乳汁接觸皮膚可能造成刺激，成熟紅果安全甜美，嫩葉務必煮透去乳汁。',
      antinutrients: '蛋白酶乳汁、草酸、生物鹼微量',
      antinutrientRemoval: '大量滾水沸煮溶解白色生膠乳汁，果實以淡鹽水淘洗防果蠅。',
      flavorProfile: '熟果甜美多汁似草莓與桑椹混合，嫩葉經處理後口感厚實如桑葉。',
      storageMethod: '成熟果實熬煮濃縮成野果糖蜜，嫩葉曬乾磨製存糧。',
    },
    nutrition: {
      calories: 35,
      protein: 2.9,
      carbohydrates: 6.2,
      fat: 0.4,
      fiber: 2.7,
      micronutrients: { calciumMg: 150, ironMg: 3.1, vitaminCMg: 45, potassiumMg: 320 },
      nutritionHighlights: ['熟果高果糖快速補充野外體能', '豐富維生素C抗壞血病', '強韌粗纖維'],
    },
    distribution: {
      habitat: ['平地荒野', '淺山林緣', '休耕田埂', '向陽開墾地'],
      elevation: 'low',
      elevationDesc: '海平面至海拔 1,000 公尺開闊向陽林緣',
      regions: ['全台灣平地至低海拔極為優勢之先驅樹種'],
      season: ['春季', '夏季'],
      abundance: 'abundant',
    },
  },
  艾草: {
    name: '艾草',
    scientificName: 'Artemisia argyi H.Lév. & Vaniot',
    family: '菊科 (Asteraceae)',
    aliases: ['艾葉', '醫草', '五月艾', '野艾'],
    category: 'medicinal',
    edibleParts: ['嫩莖葉', '幼嫩芽梢', '全草（驅蟲及外用）'],
    characteristics: {
      leaves: '單葉互生，羽狀深裂，葉面深綠，葉背密生灰白色綿毛，搓揉具強烈辛烈艾香。',
      stemAndRoots: '多年生草本，直立具條稜，被灰白色短柔毛。根莖橫臥分枝。',
      flowers: '頭狀花序橢圓形，排列成複總狀花序，花冠小管狀淡黃色。',
      fruitsAndSeeds: '瘦果長圓形無冠毛。',
      distinctiveFeatures: '葉背具顯著白絨毛，強烈特殊辛涼草藥香氣，野外常燃燒全草驅趕蚊蟲。',
    },
    preparation: {
      prepMethod: '採收鮮嫩葉片，加少量草木灰水滾燙沸煮 3 分鐘，再於流水中浸泡 1 小時以去強烈苦澀。',
      cookingMethods: ['反覆換水沸煮脫澀', '草木灰水鹼浸脫毒', '泥裹灰燼煨熟', '日曬乾燥磨粉存糧'],
      toxicity: 'none',
      toxicityNotes: '無急性毒性，含大量桉葉素、側柏酮等揮發油，不可生食或單次大量單一超量食用。',
      antinutrients: '揮發性萜類精油 (Thujone)、單寧、苦味素',
      antinutrientRemoval: '草木灰水浸煮中和苦澀成分、沸水換水揮發過濃刺激油性、搗爛成泥混合野糧。',
      flavorProfile: '草本辛溫芳烈，脫澀後回甘明顯，芳香醒胃。',
      storageMethod: '全草捆束懸掛於背陰處陰乾，防霉保存多年，可食亦可點燃防蚊防潮。',
    },
    nutrition: {
      calories: 32,
      protein: 3.1,
      carbohydrates: 4.8,
      fat: 0.5,
      fiber: 3.2,
      micronutrients: { calciumMg: 180, ironMg: 5.2, vitaminCMg: 30, potassiumMg: 390 },
      nutritionHighlights: ['極高天然植物鐵質', '多種揮發抗菌黃酮苷', '溫經散寒野外保健佳品'],
    },
    distribution: {
      habitat: ['平地荒野', '休耕田埂', '淺山林緣', '居家園圃周邊'],
      elevation: 'low',
      elevationDesc: '海平面至海拔 1,500 公尺開闊乾燥草地',
      regions: ['台灣全島荒地、田野向陽坡地常見'],
      season: ['春季', '夏季'],
      abundance: 'common',
    },
  },
  水芹菜: {
    name: '水芹菜',
    scientificName: 'Oenanthe javanica (Blume) DC.',
    family: '繖形科 (Apiaceae)',
    aliases: ['野芹菜', '水英', '楚葵', '刀芹'],
    category: 'wild',
    edibleParts: ['嫩莖葉', '一般根', '幼嫩芽梢'],
    characteristics: {
      leaves: '一至二回羽狀複葉，小葉卵形至披針形，葉緣鋸齒狀，具芹菜芳香。',
      stemAndRoots: '莖中空圓形具縱稜，下部匍匐節生鬚根，上部直立，常呈紫綠色。',
      flowers: '複繖形花序頂生或與葉對生，小花白色密聚。',
      fruitsAndSeeds: '雙懸果近四稜形或卵形。',
      distinctiveFeatures: '生長於清澈流溪泥水中，揉碎具典型芹菜香；【極其注意】：務必嚴防混淆劇毒「毒芹 (Cicuta)」，毒芹無清甜芹香且根部切開有黃色毒乳液。',
    },
    preparation: {
      prepMethod: '摘取肥嫩中空莖葉，徹底洗淨水草與泥沙。入沸水滾燙 1 分鐘殺青即可食用。',
      cookingMethods: ['反覆換水沸煮脫澀', '竹筒填塞炭火煨熟', '流水長時浸洗脫苦', '石板野火烙炙'],
      toxicity: 'caution',
      toxicityNotes: '水芹本身無毒，但生長於野外水質不良處易附著吸蟲與水生寄生蟲卵，【嚴禁生食】，必須徹底煮沸！',
      antinutrients: '精油揮發物、微量草酸、硝酸鹽',
      antinutrientRemoval: '滾水完全沸煮消滅可能之水生寄生蟲並破壞微量草酸。',
      flavorProfile: '質地爽脆中空爆汁，芹香清新回甜，野趣十足。',
      storageMethod: '根部包裹濕泥沙置陰涼處可存活數日，或汆燙後經鹽水乳酸自然發酵。',
    },
    nutrition: {
      calories: 18,
      protein: 1.9,
      carbohydrates: 3.1,
      fat: 0.2,
      fiber: 2.2,
      micronutrients: { calciumMg: 95, ironMg: 2.8, vitaminCMg: 32, potassiumMg: 340 },
      nutritionHighlights: ['豐富芹菜素 (Apigenin)', '高水分與電解質平衡', '生津醒神抗疲勞'],
    },
    distribution: {
      habitat: ['水濱濕地', '農田田埂', '山澗溪溝', '清澈水渠邊'],
      elevation: 'mid',
      elevationDesc: '海平面至中海拔 1,800 公尺淺水流動環境',
      regions: ['台灣全島流動水渠、水田旁水流充裕處'],
      season: ['春季', '冬季'],
      abundance: 'common',
    },
  },
  葛藤: {
    name: '葛藤',
    scientificName: 'Pueraria montana (Lour.) Merr.',
    family: '豆科 (Fabaceae)',
    aliases: ['葛根', '野葛', '台灣葛藤', '葛條'],
    category: 'starch',
    edibleParts: ['塊根塊莖 (葛根)', '一般根', '幼嫩芽梢', '花苞與花'],
    characteristics: {
      leaves: '三出複葉互生，頂生小葉菱狀卵形，兩側小葉斜卵形，常 2-3 裂，被黃褐色粗毛。',
      stemAndRoots: '多年生落葉木質大藤本，纏繞生長長達數十米；地下塊根極其粗壯肥大深入土中。',
      flowers: '總狀花序腋生直立，花冠蝶形紫紅色或紅紫色，極為芬芳。',
      fruitsAndSeeds: '莢果長扁平線形，密生黃褐色長硬毛。',
      distinctiveFeatures: '大型覆蓋性藤本，蔓延整片邊坡，地下巨型塊根富含大量白色葛根澱粉。',
    },
    preparation: {
      prepMethod: '挖掘地下肥大葛根，刮去外皮，搗碎加水沉澱洗出純淨白色葛根澱粉；春季嫩梢可直接沸水汆燙。',
      cookingMethods: ['坑式地爐燜烤', '竹筒填塞炭火煨熟', '日曬乾燥磨粉存糧', '低溫慢熬提煉高湯'],
      toxicity: 'none',
      toxicityNotes: '無急性毒性，生葛根含抗胰蛋白酶與皂苷，需徹底加熱熟化或水洗沉澱取粉。',
      antinutrients: '植酸、胰蛋白酶抑制劑、單寧、葛根素配糖體',
      antinutrientRemoval: '粉碎水洗過濾提純分離纖維與單寧，長時間地爐燜烤徹底熟透破壞熱敏抗營養物。',
      flavorProfile: '葛粉熟後呈半透明膠凍狀，溫潤軟糯甘甜；嫩芽脆嫩微帶豆香。',
      storageMethod: '沉澱所得葛根澱粉經太陽日曬曬乾成塊狀粉末，可乾燥存放數年作為最高等級熱量儲備。',
    },
    nutrition: {
      calories: 92,
      protein: 2.1,
      carbohydrates: 21.5,
      fat: 0.3,
      fiber: 3.5,
      micronutrients: { calciumMg: 80, ironMg: 1.9, vitaminCMg: 15, potassiumMg: 290 },
      nutritionHighlights: ['極高野外澱粉熱量儲備', '豐富異黃酮葛根素 (Puerarin)', '溫補胃腸生津退熱'],
    },
    distribution: {
      habitat: ['淺山林緣', '平地荒野', '向陽邊坡', '道路開闊灌叢'],
      elevation: 'low',
      elevationDesc: '海平面至海拔 1,500 公尺開闊乾燥向陽坡地',
      regions: ['全台灣低至中海拔荒坡、道路邊緣廣布'],
      season: ['全年', '秋冬採掘塊根最佳', '春季採嫩梢'],
      abundance: 'abundant',
    },
  },
};

export function inferBotanicalFallback(plantName: string): BotanicalEntry {
  const clean = plantName.trim();

  // 1. Check exact key match
  if (KNOWN_BOTANICAL_DATABASE[clean]) {
    return KNOWN_BOTANICAL_DATABASE[clean];
  }

  // 2. Check alias or partial inclusion
  for (const entry of Object.values(KNOWN_BOTANICAL_DATABASE)) {
    if (
      clean.includes(entry.name) ||
      entry.name.includes(clean) ||
      entry.aliases.some((a) => clean.includes(a) || a.includes(clean))
    ) {
      return {
        ...entry,
        name: clean,
      };
    }
  }

  // 3. Intelligent botanical deduction based on plant taxonomy keywords
  let family = '野外常見草本植物科';
  let scientificName = `${clean} sp.`;
  let category: PlantCategory = 'wild';
  let edibleParts = ['嫩莖葉', '一般根', '幼嫩芽梢'];
  let toxicity: ToxicityLevel = 'none';
  let toxicityNotes = '野生採集務必確認物種無誤，並以高溫透煮破壞熱敏抗營養因子。';
  let antinutrients = '草酸 (Oxalate)、植酸 (Phytate)、單寧 (Tannins)';
  let antinutrientRemoval = '反覆換水沸煮殺青更換浸出液、草木灰鹼水浸泡中和、搾汁熱凝分離葉蛋白。';
  let cookingMethods = ['反覆換水沸煮脫澀', '石板野火烙炙', '葉蛋白萃取 (LPC)', '竹筒填塞炭火煨熟'];
  let calories = 26;
  let protein = 2.8;
  let habitat = ['平地荒野', '淺山林緣向陽處'];

  if (clean.includes('蕨') || clean.includes('貓')) {
    family = '蹄蓋蕨科 (Athyriaceae)';
    scientificName = 'Pteridophyta sp.';
    edibleParts = ['幼嫩芽梢 (卷旋嫩葉)', '嫩莖葉'];
    toxicity = 'caution';
    toxicityNotes = '蕨類植物普遍含單寧與微量原蕨苷，【嚴禁生食】，務必充分加熱滾燙熟透。';
    antinutrients = '單寧 (Tannin)、原蕨苷微量、硫胺素酶';
    antinutrientRemoval = '草木灰鹼水浸洗脫去苦澀單寧，高溫透煮使硫胺素酶失活。';
    cookingMethods = ['草木灰水鹼浸脫毒', '流水長時浸洗脫苦', '反覆換水沸煮脫澀', '竹筒填塞炭火煨熟'];
    calories = 20;
    protein = 2.4;
    habitat = ['陰濕山谷', '水濱濕地', '淺山林緣'];
  } else if (clean.includes('芹') || clean.includes('茴') || clean.includes('芫')) {
    family = '繖形科 (Apiaceae)';
    scientificName = 'Apiaceae sp.';
    edibleParts = ['嫩莖葉', '一般根', '成熟種子'];
    antinutrients = '精油揮發物、微量草酸';
    antinutrientRemoval = '沸水汆燙揮發強烈精油刺激物，流動清水漂洗去除苦味。';
    cookingMethods = ['流水長時浸洗脫苦', '反覆換水沸煮脫澀', '竹筒填塞炭火煨熟', '低溫慢熬提煉高湯'];
    calories = 21;
    protein = 2.1;
    habitat = ['水濱濕地', '農田田埂', '清澈山溝邊'];
  } else if (clean.includes('莧')) {
    family = '莧科 (Amaranthaceae)';
    scientificName = 'Amaranthus sp.';
    edibleParts = ['嫩莖葉', '一般根', '種子'];
    antinutrients = '草酸 (Oxalate)、硝酸鹽、植酸';
    antinutrientRemoval = '滾水沸煮 2 回棄水倒湯以溶出 70% 草酸，打汁加熱純化分離葉蛋白。';
    cookingMethods = ['葉蛋白萃取 (LPC)', '反覆換水沸煮脫澀', '石板野火烙炙', '日曬乾燥磨粉存糧'];
    calories = 28;
    protein = 3.4;
  } else if (clean.includes('豆') || clean.includes('葛') || clean.includes('藤')) {
    family = '豆科 (Fabaceae)';
    scientificName = 'Fabaceae sp.';
    category = 'starch';
    edibleParts = ['塊根塊莖', '一般根', '種子', '幼嫩芽梢'];
    antinutrients = '植酸、胰蛋白酶抑制劑、凝集素、單寧';
    antinutrientRemoval = '長時間地爐燜烤或高溫水煮透熟以失活抗胰蛋白酶，沉澱水洗分離純澱粉。';
    cookingMethods = ['坑式地爐燜烤', '竹筒填塞炭火煨熟', '日曬乾燥磨粉存糧', '流水長時浸洗脫苦'];
    calories = 52;
    protein = 4.2;
  } else if (clean.includes('菊') || clean.includes('蒿') || clean.includes('艾') || clean.includes('蓬') || clean.includes('草')) {
    family = '菊科 (Asteraceae)';
    scientificName = 'Asteraceae sp.';
    edibleParts = ['嫩莖葉', '幼嫩芽梢', '一般根'];
    antinutrients = '單寧 (Tannins)、微量生物鹼、草酸';
    antinutrientRemoval = '沸水滾燙更換浸出液、草木灰鹼水短暫浸泡、日曬乾燥昇華苦味。';
    cookingMethods = ['反覆換水沸煮脫澀', '石板野火烙炙', '葉蛋白萃取 (LPC)', '日曬乾燥磨粉存糧'];
    calories = 24;
    protein = 2.9;
  } else if (clean.includes('茄') || clean.includes('椒') || clean.includes('葵')) {
    family = '茄科 (Solanaceae)';
    scientificName = 'Solanum sp.';
    edibleParts = ['嫩莖葉', '成熟果實'];
    toxicity = 'warning';
    toxicityNotes = '【安全警語】嚴禁採食未成熟青綠果實與根部（含高量生物鹼），嫩葉需沸水多次換水熟透。';
    antinutrients = '配糖生物鹼 (Solanine 茄鹼)、苦素、草酸';
    antinutrientRemoval = '絕對避免採食青果；嫩葉滾水反覆換水烹煮，丟棄苦汁溶出水溶性生物鹼。';
    cookingMethods = ['反覆換水沸煮脫澀', '乳酸野外自然發酵', '流水長時浸洗脫苦', '葉蛋白萃取 (LPC)'];
    calories = 24;
    protein = 3.0;
  } else if (clean.includes('芋')) {
    family = '天南星科 (Araceae)';
    scientificName = 'Araceae sp.';
    category = 'starch';
    edibleParts = ['塊根塊莖', '一般根', '嫩葉柄'];
    toxicity = 'toxic_raw';
    toxicityNotes = '【嚴禁生食】生品含大量銳利草酸鈣針晶，刺傷口腔咽喉致腫脹窒息，必須極長時間高溫透熟！';
    antinutrients = '草酸鈣針晶 (Calcium oxalate raphides)、皂苷';
    antinutrientRemoval = '長時間地爐高溫燜烤或數小時滾水劇烈沸煮，使針晶晶格受熱崩解徹底脫毒。';
    cookingMethods = ['坑式地爐燜烤', '反覆換水沸煮脫澀', '竹筒填塞炭火煨熟', '日曬乾燥磨粉存糧'];
    calories = 95;
    protein = 2.1;
    habitat = ['水濱濕地', '淺山陰濕溝谷'];
  } else if (clean.includes('薄荷') || clean.includes('紫蘇') || clean.includes('羅勒') || clean.includes('香薷')) {
    family = '唇形科 (Lamiaceae)';
    scientificName = 'Lamiaceae sp.';
    edibleParts = ['嫩莖葉', '幼嫩芽梢', '種子'];
    antinutrients = '芳香揮發精油、單寧';
    antinutrientRemoval = '沸水快速汆燙揮發過烈精油，低溫日曬陰乾保留草本芳香。';
    cookingMethods = ['低溫慢熬提煉高湯', '石板野火烙炙', '竹筒填塞炭火煨熟', '日曬乾燥磨粉存糧'];
    calories = 25;
    protein = 2.3;
  } else if (clean.includes('竹') || clean.includes('筍') || clean.includes('禾') || clean.includes('芒')) {
    family = '禾本科 (Poaceae)';
    scientificName = 'Poaceae sp.';
    category = 'wild';
    edibleParts = ['幼嫩筍芽', '成熟種子', '嫩莖葉'];
    antinutrients = '氰苷 (Cyanogenic glycoside，部分竹筍)、植酸、單寧';
    antinutrientRemoval = '剝去外籜後加水沸水劇烈滾煮 30 分鐘，揮發並水解微量氰苷脫苦。';
    cookingMethods = ['坑式地爐燜烤', '竹筒填塞炭火煨熟', '反覆換水沸煮脫澀', '泥裹灰燼煨熟'];
    calories = 27;
    protein = 2.6;
  }

  return {
    name: clean,
    scientificName,
    family,
    aliases: [`野外${clean}`, `${clean}草`],
    category,
    edibleParts,
    characteristics: {
      leaves: `單葉或複葉生長，葉片色澤翠綠多汁，葉緣與脈紋具「${clean}」典型野生物種形態特徵。`,
      stemAndRoots: `具直立或斜升之莖柱，地下具實用根系（主根或一般根），求生危機時可採挖刷洗應急。`,
      flowers: `花序頂生或腋生，花期多見於春夏季向陽開展。`,
      fruitsAndSeeds: `果實種子多數，成熟時散落繁衍，種子可收集曬乾補充野外緊急熱量。`,
      distinctiveFeatures: `野外求生採集「${clean}」時，請務必先確認全株氣味、乳汁有無及排除相近劇毒種 (如毒芹、斷腸草、曼陀羅)，不可輕率盲採。`,
    },
    preparation: {
      prepMethod: `採收鮮嫩葉芽或挖取一般根部，於溪流中搓揉刷除附著泥沙。求生環境下務必入沸水滾煮殺青更換浸出液以除生澀。`,
      cookingMethods,
      toxicity,
      toxicityNotes,
      antinutrients,
      antinutrientRemoval,
      flavorProfile: `野味清爽質樸，經求生脫毒烹熟後苦澀消退，轉為草本甘醇。`,
      storageMethod: `野外以強烈日曬脫水乾燥磨製成備用營養粉，或以柴火低溫煙燻乾燥。`,
    },
    nutrition: {
      calories,
      protein,
      carbohydrates: 3.8,
      fat: 0.3,
      fiber: 2.5,
      micronutrients: {
        calciumMg: 110,
        ironMg: 3.0,
        vitaminCMg: 30,
        potassiumMg: 350,
      },
      nutritionHighlights: ['豐富天然野生膳食纖維', '求生植物性蛋白質', '平衡電解質'],
    },
    distribution: {
      habitat,
      elevation: 'low',
      elevationDesc: '海平面至低海拔 1,000 公尺向陽或半遮陰開闊地',
      regions: ['台灣平野及低海拔山林向陽處常見'],
      season: ['春季', '夏季', '秋季'],
      abundance: 'common',
    },
  };
}
