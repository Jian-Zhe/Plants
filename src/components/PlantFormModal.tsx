import React, { useState, useEffect, useRef } from 'react';
import {
  PlantItem,
  ToxicityLevel,
  PlantCategory,
  ElevationCategory,
  AbundanceLevel,
  PlantImage,
} from '../types/plant';
import { generatePlantDetailsWithAI, AutofillResult } from '../utils/gemini';
import {
  X,
  Sparkles,
  Camera,
  Upload,
  Link,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  Flame,
  Zap,
  BookOpen,
  Utensils,
  Ban,
  Mountain,
  ChevronDown,
  ChevronUp,
  Database,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plant: PlantItem) => void;
  editingPlant: PlantItem | null;
  onOpenAiSettings?: () => void;
}

export const PlantFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingPlant,
  onOpenAiSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState('');
  const [family, setFamily] = useState('');
  const [category, setCategory] = useState<PlantCategory>('wild');
  const [isEdible, setIsEdible] = useState<boolean>(true);
  const [edibleParts, setEdibleParts] = useState<string[]>([]);

  // Characteristics
  const [leaves, setLeaves] = useState('');
  const [stemAndRoots, setStemAndRoots] = useState('');
  const [flowers, setFlowers] = useState('');
  const [fruitsAndSeeds, setFruitsAndSeeds] = useState('');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState('');

  // Preparation
  const [prepMethod, setPrepMethod] = useState('');
  const [cookingMethods, setCookingMethods] = useState<string[]>([]);
  const [customCookingMethodInput, setCustomCookingMethodInput] = useState('');
  const [showCustomCookingInput, setShowCustomCookingInput] = useState(false);
  const [antinutrients, setAntinutrients] = useState('');
  const [antinutrientRemoval, setAntinutrientRemoval] = useState('');
  const [toxicity, setToxicity] = useState<ToxicityLevel>('none');
  const [toxicityNotes, setToxicityNotes] = useState('');
  const [flavorProfile, setFlavorProfile] = useState('');
  const [storageMethod, setStorageMethod] = useState('');

  // Nutrition
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbohydrates, setCarbohydrates] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [fiber, setFiber] = useState<number | ''>('');
  const [calciumMg, setCalciumMg] = useState<number | ''>('');
  const [ironMg, setIronMg] = useState<number | ''>('');
  const [vitaminCMg, setVitaminCMg] = useState<number | ''>('');
  const [potassiumMg, setPotassiumMg] = useState<number | ''>('');

  // Distribution
  const [habitats, setHabitats] = useState<string[]>([]);
  const [elevation, setElevation] = useState<ElevationCategory>('low');
  const [elevationDesc, setElevationDesc] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [abundance, setAbundance] = useState<AbundanceLevel>('common');

  // Media
  const [images, setImages] = useState<PlantImage[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // User Notes
  const [userNotes, setUserNotes] = useState('');
  const [foragingLocations, setForagingLocations] = useState('');

  // AI Assistant states (Strict AI-Only)
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [autofillStatus, setAutofillStatus] = useState<AutofillResult | null>(null);

  // Quick preset families
  const commonFamilies = [
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
  ];

  const commonEdibleParts = ['嫩莖葉', '成熟果實', '花苞與花', '塊根塊莖', '一般根', '幼嫩芽梢', '種子', '全草'];
  const commonCookingMethods = [
    '乳酸發酵',
    '葉蛋白萃取',
    '反覆煮沸',
    '流水浸洗',
    '低溫熬煮',
    '悶烤',
  ];

  const commonAntinutrients = [
    '草酸 (Oxalate)',
    '草酸鈣針晶 (Raphides)',
    '單寧酸 (Tannin)',
    '植物生物鹼 (Alkaloid)',
    '皂苷 (Saponin)',
    '氰苷 (Cyanogenic glycoside)',
    '植酸 (Phytic acid)',
    '胰蛋白酶抑制劑 (Trypsin inhibitor)',
    '致甲狀腺腫素 (Goitrogens)',
  ];

  const commonAntinutrientRemovals = [
    '反覆滾水沸煮更換浸出液',
    '流水持續沖浸數小時',
    '草木灰水鹼浸中和脫毒',
    '粉碎水洗過濾提純 (葉蛋白/澱粉)',
    '密閉厭氧乳酸自然發酵',
    '柴火高溫炭煨透熟破壞熱敏毒素',
    '強烈日曬紫外線光解',
    '揉捻擠壓排除苦澀汁液',
  ];

  const commonHabitats = ['平地荒野', '農田田埂', '水濱濕地', '淺山林緣', '中高海拔', '海濱沙地', '居家園圃'];
  const commonSeasons = ['春季', '夏季', '秋季', '冬季', '全年'];

  // Initialize or populate when editing
  useEffect(() => {
    if (editingPlant) {
      setName(editingPlant.name);
      setScientificName(editingPlant.scientificName);
      setAliases(editingPlant.aliases || []);
      setFamily(editingPlant.family);
      setCategory(editingPlant.category || 'wild');
      setIsEdible(editingPlant.isEdible !== false);
      setEdibleParts(editingPlant.edibleParts || []);

      setLeaves(editingPlant.characteristics.leaves);
      setStemAndRoots(editingPlant.characteristics.stemAndRoots);
      setFlowers(editingPlant.characteristics.flowers);
      setFruitsAndSeeds(editingPlant.characteristics.fruitsAndSeeds || '');
      setDistinctiveFeatures(editingPlant.characteristics.distinctiveFeatures);

      setPrepMethod(editingPlant.preparation.prepMethod);
      setCookingMethods(editingPlant.preparation.cookingMethods || []);
      setCustomCookingMethodInput('');
      setShowCustomCookingInput(false);
      setAntinutrients(editingPlant.preparation.antinutrients || '');
      setAntinutrientRemoval(editingPlant.preparation.antinutrientRemoval || '');
      setToxicity(editingPlant.preparation.toxicity);
      setToxicityNotes(editingPlant.preparation.toxicityNotes);
      setFlavorProfile(editingPlant.preparation.flavorProfile || '');
      setStorageMethod(editingPlant.preparation.storageMethod || '');

      setCalories(editingPlant.nutrition.calories);
      setProtein(editingPlant.nutrition.protein);
      setCarbohydrates(editingPlant.nutrition.carbohydrates);
      setFat(editingPlant.nutrition.fat);
      setFiber(editingPlant.nutrition.fiber);
      setCalciumMg(editingPlant.nutrition.micronutrients?.calciumMg ?? '');
      setIronMg(editingPlant.nutrition.micronutrients?.ironMg ?? '');
      setVitaminCMg(editingPlant.nutrition.micronutrients?.vitaminCMg ?? '');
      setPotassiumMg(editingPlant.nutrition.micronutrients?.potassiumMg ?? '');

      setHabitats(editingPlant.distribution.habitat || []);
      setElevation(editingPlant.distribution.elevation || 'low');
      setElevationDesc(editingPlant.distribution.elevationDesc || '');
      setRegions(editingPlant.distribution.regions || []);
      setSeasons(editingPlant.distribution.season || []);
      setAbundance(editingPlant.distribution.abundance || 'common');

      setImages(editingPlant.images || []);
      setUserNotes(editingPlant.userNotes || '');
      setForagingLocations(editingPlant.foragingLocations || '');
    } else {
      resetForm();
    }
  }, [editingPlant, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const resetForm = () => {
    setName('');
    setScientificName('');
    setAliases([]);
    setAliasInput('');
    setFamily('');
    setCategory('wild');
    setIsEdible(true);
    setEdibleParts([]);

    setLeaves('');
    setStemAndRoots('');
    setFlowers('');
    setFruitsAndSeeds('');
    setDistinctiveFeatures('');

    setPrepMethod('');
    setCookingMethods([]);
    setCustomCookingMethodInput('');
    setShowCustomCookingInput(false);
    setAntinutrients('');
    setAntinutrientRemoval('');
    setToxicity('none');
    setToxicityNotes('');
    setFlavorProfile('');
    setStorageMethod('');

    setCalories('');
    setProtein('');
    setCarbohydrates('');
    setFat('');
    setFiber('');
    setCalciumMg('');
    setIronMg('');
    setVitaminCMg('');
    setPotassiumMg('');

    setHabitats([]);
    setElevation('low');
    setElevationDesc('');
    setRegions([]);
    setSeasons([]);
    setAbundance('common');

    setImages([]);
    setUserNotes('');
    setForagingLocations('');
    setAutofillStatus(null);
  };

  // Update plant name and reset previous error
  const handleNameChange = (val: string) => {
    setName(val);
    if (aiError) setAiError(null);
  };

  // Add custom survival cooking method
  const handleAddCustomCookingMethod = () => {
    const trimmed = customCookingMethodInput.trim();
    if (trimmed) {
      if (!cookingMethods.includes(trimmed)) {
        setCookingMethods((prev) => [...prev, trimmed]);
      }
      setCustomCookingMethodInput('');
      setShowCustomCookingInput(false);
    }
  };

  // Trigger Gemini AI Autofill
  const handleAiAutofill = async () => {
    if (!name.trim()) {
      alert('請先輸入植物名稱（例如：昭和草、車前草、姑婆芋、咬人貓）');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      const result = await generatePlantDetailsWithAI(name.trim());
      setAutofillStatus(result);
      const generated = result.data;

      // 0. Edibility evaluation
      const targetIsEdible = generated.isEdible !== false;
      setIsEdible(targetIsEdible);

      // 1. Basic Info & Taxonomy
      if (generated.scientificName) setScientificName(generated.scientificName);
      if (generated.family) setFamily(generated.family);
      if (generated.aliases && generated.aliases.length > 0) setAliases(generated.aliases);
      if (generated.category) setCategory(generated.category);
      
      if (targetIsEdible) {
        if (generated.edibleParts && generated.edibleParts.length > 0) {
          setEdibleParts(generated.edibleParts);
        }
      } else {
        setEdibleParts([]);
        setCookingMethods([]);
        setAntinutrients('');
        setAntinutrientRemoval('');
        setCalories(0);
        setProtein(0);
        setCarbohydrates(0);
        setFat(0);
        setFiber(0);
        setCalciumMg(0);
        setIronMg(0);
        setVitaminCMg(0);
        setPotassiumMg(0);
      }

      // 2. Characteristics
      if (generated.characteristics) {
        if (generated.characteristics.leaves) setLeaves(generated.characteristics.leaves);
        if (generated.characteristics.stemAndRoots) setStemAndRoots(generated.characteristics.stemAndRoots);
        if (generated.characteristics.flowers) setFlowers(generated.characteristics.flowers);
        if (generated.characteristics.fruitsAndSeeds) setFruitsAndSeeds(generated.characteristics.fruitsAndSeeds);
        if (generated.characteristics.distinctiveFeatures) setDistinctiveFeatures(generated.characteristics.distinctiveFeatures);
      }

      // 3. Preparation, Survival Cooking & Antinutrients
      if (generated.preparation) {
        if (targetIsEdible) {
          if (generated.preparation.prepMethod) setPrepMethod(generated.preparation.prepMethod);
          if (generated.preparation.cookingMethods && generated.preparation.cookingMethods.length > 0) {
            setCookingMethods(generated.preparation.cookingMethods);
          }
          if (generated.preparation.antinutrients) setAntinutrients(generated.preparation.antinutrients);
          if (generated.preparation.antinutrientRemoval) setAntinutrientRemoval(generated.preparation.antinutrientRemoval);
          if (generated.preparation.flavorProfile) setFlavorProfile(generated.preparation.flavorProfile);
          if (generated.preparation.storageMethod) setStorageMethod(generated.preparation.storageMethod);
        } else {
          setPrepMethod('非食用植物 / 具毒性或未明，嚴禁食用');
          setCookingMethods([]);
          setAntinutrients('');
          setAntinutrientRemoval('');
          setFlavorProfile('');
          setStorageMethod('');
        }
        if (generated.preparation.toxicity) setToxicity(generated.preparation.toxicity);
        if (generated.preparation.toxicityNotes) setToxicityNotes(generated.preparation.toxicityNotes);
      } else if (!targetIsEdible) {
        setToxicity('warning');
        setToxicityNotes('具毒性或非食用植物，嚴禁採食！');
      }

      // 4. Nutrition (Only for edible plants)
      if (targetIsEdible && generated.nutrition) {
        if (generated.nutrition.calories !== undefined) setCalories(generated.nutrition.calories);
        if (generated.nutrition.protein !== undefined) setProtein(generated.nutrition.protein);
        if (generated.nutrition.carbohydrates !== undefined) setCarbohydrates(generated.nutrition.carbohydrates);
        if (generated.nutrition.fat !== undefined) setFat(generated.nutrition.fat);
        if (generated.nutrition.fiber !== undefined) setFiber(generated.nutrition.fiber);
        if (generated.nutrition.micronutrients) {
          setCalciumMg(generated.nutrition.micronutrients.calciumMg ?? 0);
          setIronMg(generated.nutrition.micronutrients.ironMg ?? 0);
          setVitaminCMg(generated.nutrition.micronutrients.vitaminCMg ?? 0);
          setPotassiumMg(generated.nutrition.micronutrients.potassiumMg ?? 0);
        }
      }

      // 5. Distribution (Applies to all plants)
      if (generated.distribution) {
        if (generated.distribution.habitat && generated.distribution.habitat.length > 0) setHabitats(generated.distribution.habitat);
        if (generated.distribution.elevation) setElevation(generated.distribution.elevation);
        if (generated.distribution.elevationDesc) setElevationDesc(generated.distribution.elevationDesc);
        if (generated.distribution.regions && generated.distribution.regions.length > 0) setRegions(generated.distribution.regions);
        if (generated.distribution.season && generated.distribution.season.length > 0) setSeasons(generated.distribution.season);
        if (generated.distribution.abundance) setAbundance(generated.distribution.abundance);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setAiError(errMsg);
      setAutofillStatus(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Image Upload handler with compression
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      // Compress slightly to prevent massive memory usage
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1000;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Try webp first for maximum compression, fallback to jpeg
          let compressed = canvas.toDataURL('image/webp', 0.8);
          if (!compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/jpeg', 0.78);
          }
          const newImg: PlantImage = {
            id: 'img-' + Date.now() + Math.random().toString(36).substr(2, 4),
            dataUrl: compressed,
            caption: '野外拍攝記錄',
            isCover: images.length === 0,
          };
          setImages((prev) => [...prev, newImg]);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const newImg: PlantImage = {
      id: 'img-' + Date.now(),
      dataUrl: imageUrlInput.trim(),
      caption: '',
      isCover: images.length === 0,
    };
    setImages((prev) => [...prev, newImg]);
    setImageUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('請填寫植物中文名稱');
      return;
    }

    const numCalories = calories !== '' ? Number(calories) : 0;
    const numProtein = protein !== '' ? Number(protein) : 0;
    const numCarbs = carbohydrates !== '' ? Number(carbohydrates) : 0;
    const numFat = fat !== '' ? Number(fat) : 0;
    const numFiber = fiber !== '' ? Number(fiber) : 0;

    const newPlant: PlantItem = {
      id: editingPlant?.id || 'plant-' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      scientificName: scientificName.trim(),
      aliases,
      family: family.trim() || '未分類',
      category: isEdible ? category : 'wild',
      isEdible,
      edibleParts: isEdible ? edibleParts : [],
      characteristics: {
        leaves: leaves.trim(),
        stemAndRoots: stemAndRoots.trim(),
        flowers: flowers.trim(),
        fruitsAndSeeds: fruitsAndSeeds.trim(),
        distinctiveFeatures: distinctiveFeatures.trim(),
      },
      preparation: isEdible
        ? {
            prepMethod: prepMethod.trim(),
            cookingMethods,
            antinutrients: antinutrients.trim(),
            antinutrientRemoval: antinutrientRemoval.trim(),
            toxicity,
            toxicityNotes: toxicityNotes.trim(),
            flavorProfile: flavorProfile.trim(),
            storageMethod: storageMethod.trim(),
          }
        : {
            prepMethod: '非食用植物 / 具毒性或未明，嚴禁食用',
            cookingMethods: [],
            antinutrients: '',
            antinutrientRemoval: '',
            toxicity: 'warning',
            toxicityNotes: '非食用植物 / 具毒性警示，請勿採食',
            flavorProfile: '',
            storageMethod: '',
          },
      nutrition: isEdible
        ? {
            calories: numCalories,
            protein: numProtein,
            carbohydrates: numCarbs,
            fat: numFat,
            fiber: numFiber,
            micronutrients: {
              calciumMg: calciumMg !== '' ? Number(calciumMg) : 0,
              ironMg: ironMg !== '' ? Number(ironMg) : 0,
              vitaminCMg: vitaminCMg !== '' ? Number(vitaminCMg) : 0,
              potassiumMg: potassiumMg !== '' ? Number(potassiumMg) : 0,
            },
            nutritionHighlights: [
              numCalories > 0 ? (numCalories < 25 ? '低卡清爽' : numCalories > 80 ? '高熱量存糧' : '熱量適中') : '',
              numProtein > 0 ? (numProtein >= 3 ? '高蛋白質野植' : '含植物性蛋白質') : '',
              numFiber > 0 ? (numFiber >= 3 ? '高纖順暢' : '膳食纖維') : '',
            ].filter(Boolean),
          }
        : {
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
        habitat: habitats.length > 0 ? habitats : ['野外荒地'],
        elevation,
        elevationDesc: elevationDesc.trim(),
        regions,
        season: seasons,
        abundance,
      },
      images,
      userNotes: userNotes.trim(),
      foragingLocations: foragingLocations.trim(),
      isFavorite: editingPlant?.isFavorite || false,
      rating: editingPlant?.rating || 5,
      isCustom: true,
      createdAt: editingPlant?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newPlant);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/95 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {editingPlant ? `編輯植物：${editingPlant.name}` : '新增植物野外紀錄'}
              </h2>
              <p className="text-xs text-stone-400">完整記錄外觀特徵、照片、處理方式、營養與生態分佈</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-7 text-stone-200">
          {/* AI Error Alert with Actionable Diagnostics */}
          {aiError && (
            <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/80 text-rose-100 space-y-2.5 animate-in fade-in shadow-xl">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>AI 智能補全未成功</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiError(null)}
                  className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
                  aria-label="關閉錯誤提示"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/90 border border-rose-800/60 font-mono text-xs text-rose-200 leading-relaxed break-all">
                {aiError}
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-stone-300 flex items-center gap-1.5">
                  <span className="text-amber-400 font-semibold">💡 故障排除：</span>
                  <span>可前往「AI 設定」確認或輸入您的 Gemini API Key，或確認植物名稱是否正確。</span>
                </div>
                {onOpenAiSettings && (
                  <button
                    type="button"
                    onClick={onOpenAiSettings}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 border border-amber-500/70 text-amber-200 font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>前往設定 Gemini API Key</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* AI Success Banner */}
          {autofillStatus && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-100 flex items-start justify-between gap-3 shadow-md animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-800 text-emerald-200 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">✨ AI 智能自動補全成功</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700 font-medium">
                      {autofillStatus.sourceLabel}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {autofillStatus.sourceDescription}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutofillStatus(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition shrink-0"
                aria-label="關閉提示"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section 1: 基本資訊與名稱 (Basic Info & Name) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs">1</span>
              基本資訊與名稱
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Plant Name with AI button */}
              <div className="relative">
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  植物中文名稱 <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="輸入植物中文名稱"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAiAutofill}
                    disabled={isAiLoading || !name.trim()}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition shadow cursor-pointer ${
                      isAiLoading
                        ? 'bg-amber-950 text-amber-300 animate-pulse border border-amber-600'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40'
                    }`}
                    title="使用 Gemini AI 自動查詢並填寫該植物所有特徵、營養與分佈"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                    <span>{isAiLoading ? 'AI 查詢中...' : '✨ AI 自動填寫'}</span>
                  </button>
                </div>

                {/* Status indicator below plant name if generated */}
                {autofillStatus && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] px-0.5 text-emerald-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                      已透過 Gemini AI 填入資料
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">
                      {autofillStatus.sourceLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Scientific Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  植物學名 (拉丁學名)
                </label>
                <input
                  type="text"
                  placeholder="輸入拉丁學名 (選填)"
                  value={scientificName}
                  onChange={(e) => setScientificName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-sm font-serif italic"
                />
              </div>

              {/* Family Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  植物科別 (Family) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  list="family-list"
                  placeholder="選擇或輸入科別"
                  value={family}
                  onChange={(e) => setFamily(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
                <datalist id="family-list">
                  {commonFamilies.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>

                {/* Quick family chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {commonFamilies.slice(0, 6).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFamily(f)}
                      className="px-2 py-0.5 rounded text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                    >
                      {f.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aliases */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  別名 / 俗名 (逗號分隔)
                </label>
                <input
                  type="text"
                  placeholder="輸入別名/俗名，以逗號分隔 (選填)"
                  value={aliases.join(', ')}
                  onChange={(e) =>
                    setAliases(
                      e.target.value
                        .split(/[,，]/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* 食用性質選擇器 (Edibility Selector) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-200 flex items-center justify-between">
                <span>🌱 食用性質（可食 vs 無法食用）</span>
                <span className="text-[11px] font-normal text-stone-400">
                  {isEdible ? '🌿 此植物為可食用植物' : '🚫 此植物無法食用 / 具毒性或僅供觀測'}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEdible(true)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
                    isEdible
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 shadow-sm'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isEdible ? 'bg-emerald-800 text-white' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">可食用植物</div>
                    <div className="text-[10px] text-stone-400">可供野菜烹煮或求生加工食用</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEdible(false);
                    if (toxicity === 'none') {
                      setToxicity('warning');
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
                    !isEdible
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-1 ring-rose-500 shadow-sm'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      !isEdible ? 'bg-rose-800 text-white' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">無法食用 / 有毒</div>
                    <div className="text-[10px] text-stone-400">不可食用、具毒性或純形態紀錄</div>
                  </div>
                </button>
              </div>

              {!isEdible && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-rose-200">已標記為無法食用植物：</strong>
                    <p className="text-stone-300 mt-0.5 leading-relaxed">
                      僅需填寫「照片」與「外觀形態辨識特徵」以利野外鑑別防誤採，後續所有食用部位、料理手法、脫毒處理與營養數據欄位已為您隱藏。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Edible Parts Chips (Only shown when edible) */}
            {isEdible && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  可食用部位 (點擊切換)
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonEdibleParts.map((part) => {
                    const isChecked = edibleParts.includes(part);
                    return (
                      <button
                        key={part}
                        type="button"
                        onClick={() => toggleArrayItem(edibleParts, part, setEdibleParts)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {part}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: 照片上傳與相機拍照 (Photos & Camera) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs">2</span>
              植物照片與現場紀錄
            </h3>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />

            {/* Upload Action Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>手機拍照 (現場捕捉)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>上傳相簿照片</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-semibold transition cursor-pointer"
              >
                <Link className="w-4 h-4" />
                <span>輸入圖片網址 (URL)</span>
              </button>
            </div>

            {/* URL input drawer */}
            {showUrlInput && (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  加入
                </button>
              </div>
            )}

            {/* Images Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-4/3 group bg-stone-950 ${
                      img.isCover ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-stone-800'
                    }`}
                  >
                    <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                    {img.isCover && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow">
                        封面主圖
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      {!img.isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.id)}
                          className="p-1.5 bg-stone-800 text-xs text-stone-200 rounded-lg hover:bg-stone-700"
                          title="設為封面"
                        >
                          設封面
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-1.5 bg-rose-950 text-rose-300 rounded-lg hover:bg-rose-900"
                        title="刪除照片"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: 形態特徵 (Botanical Characteristics) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs">3</span>
              植物形態與辨識特徵
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  🍃 葉部特徵 (葉形、葉緣、質地)
                </label>
                <textarea
                  rows={2}
                  placeholder="葉形、葉緣、質地等特徵描述..."
                  value={leaves}
                  onChange={(e) => setLeaves(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  🎋 莖與根特徵 (直立/匍匐、刺毛)
                </label>
                <textarea
                  rows={2}
                  placeholder="直立或匍匐、地下根系等特徵描述..."
                  value={stemAndRoots}
                  onChange={(e) => setStemAndRoots(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  🌸 花部特徵 (花期、花色、花型)
                </label>
                <textarea
                  rows={2}
                  placeholder="花期、花色、花型等特徵描述..."
                  value={flowers}
                  onChange={(e) => setFlowers(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  🍒 果實與種子
                </label>
                <textarea
                  rows={2}
                  placeholder="果實與種子形態..."
                  value={fruitsAndSeeds}
                  onChange={(e) => setFruitsAndSeeds(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Distinctive Features */}
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                關鍵鑑別要點與防混淆（避免誤採有毒相近植物）
              </label>
              <textarea
                rows={2}
                placeholder="關鍵鑑別要點、防混淆或防誤採警語..."
                value={distinctiveFeatures}
                onChange={(e) => setDistinctiveFeatures(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
              />
            </div>

            {/* Optional Location Notes for Inedible/Poisonous Plant */}
            {!isEdible && (
              <div className="pt-2 border-t border-stone-800/80">
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  發現地點或野外觀察筆記 (選填)
                </label>
                <input
                  type="text"
                  placeholder="發現地點、座標或野外生長環境備註 (選填)..."
                  value={foragingLocations}
                  onChange={(e) => setForagingLocations(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white placeholder-stone-600 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>
            )}
          </div>

          {/* Sections 4, 5, 6, 7 are ONLY for edible plants (hidden completely when marked inedible) */}
          {isEdible && (
            <>
              {/* Section 4: 處理方式與料理手法 (Preparation & Cooking) */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs">4</span>
                  前置脫毒處理與料理手法
                </h3>

            {/* Toxicity Level Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                毒性與食用安全評級
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none', label: '安全無毒', desc: '可放心適量食用', color: 'border-emerald-600 text-emerald-300 bg-emerald-950/60' },
                  { id: 'caution', label: '微毒 / 需汆燙', desc: '含草酸需滾燙去水', color: 'border-amber-600 text-amber-300 bg-amber-950/60' },
                  { id: 'toxic_raw', label: '生食有毒', desc: '務必徹底高溫煮透', color: 'border-rose-600 text-rose-300 bg-rose-950/60' },
                  { id: 'warning', label: '部位有毒警示', desc: '未熟果/根部禁食', color: 'border-purple-600 text-purple-300 bg-purple-950/60' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setToxicity(item.id as ToxicityLevel)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      toxicity === item.id
                        ? `${item.color} ring-1 ring-emerald-500 font-semibold shadow-md`
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toxicity Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                毒性說明與安全警語
              </label>
              <input
                type="text"
                placeholder="毒性警語、食用限制..."
                value={toxicityNotes}
                onChange={(e) => setToxicityNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
              />
            </div>

            {/* Antinutrients */}
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                🧪 抗營養物質 (Anti-nutritional Factors)
              </label>
              <input
                type="text"
                placeholder="草酸、單寧、生物鹼等抗營養因子..."
                value={antinutrients}
                onChange={(e) => setAntinutrients(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-rose-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {commonAntinutrients.map((anti) => {
                  const label = anti.split(' ')[0];
                  return (
                    <button
                      key={anti}
                      type="button"
                      onClick={() => {
                        const current = antinutrients ? antinutrients.split(/[,，、]/).map((s) => s.trim()).filter(Boolean) : [];
                        if (!current.includes(label)) {
                          setAntinutrients(current.concat(label).join('、'));
                        }
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-stone-950 border border-stone-800 text-stone-400 hover:text-rose-300 hover:border-rose-800 transition"
                    >
                      + {anti}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Antinutrient Removal & Survival Neutralization */}
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                🛠️ 求生脫除 / 中和處理手法 (Neutralization & Leaching)
              </label>
              <textarea
                rows={2}
                placeholder="草木灰水鹼浸、流水浸洗、沸煮脫澀、葉蛋白萃取等手法..."
                value={antinutrientRemoval}
                onChange={(e) => setAntinutrientRemoval(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {commonAntinutrientRemovals.map((rem) => (
                  <button
                    key={rem}
                    type="button"
                    onClick={() => {
                      if (!antinutrientRemoval.includes(rem)) {
                        setAntinutrientRemoval(antinutrientRemoval ? `${antinutrientRemoval}；${rem}` : rem);
                      }
                    }}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-amber-800 transition"
                  >
                    + {rem}
                  </button>
                ))}
              </div>
            </div>

            {/* Prep Method */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                野外前置處理步驟 (清洗、去苦澀、浸潤脫毒)
              </label>
              <textarea
                rows={2}
                placeholder="清洗、殺青、脫澀、漂洗步驟..."
                value={prepMethod}
                onChange={(e) => setPrepMethod(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Cooking Methods Chips - Survival Bushcraft */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  野外求生加工與料理手法 (可多選，點擊切換)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomCookingInput(!showCustomCookingInput)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>其他 (自訂輸入)</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {commonCookingMethods.map((m) => {
                  const isChecked = cookingMethods.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleArrayItem(cookingMethods, m, setCookingMethods)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                        isChecked
                          ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-sm ring-1 ring-amber-500/50'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {m}
                    </button>
                  );
                })}

                {/* Render any custom methods that user entered and selected */}
                {cookingMethods
                  .filter((m) => !commonCookingMethods.includes(m))
                  .map((customMethod) => (
                    <span
                      key={customMethod}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-900/60 border border-amber-500 text-amber-200 shadow-sm"
                    >
                      <span>✓ {customMethod}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCookingMethods((prev) => prev.filter((item) => item !== customMethod))
                        }
                        className="hover:text-white p-0.5 rounded cursor-pointer"
                        title="移除自訂手法"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                {/* Quick "+ 其他" chip in row if not already showing input */}
                {!showCustomCookingInput && (
                  <button
                    type="button"
                    onClick={() => setShowCustomCookingInput(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-stone-700 text-stone-400 hover:text-amber-300 hover:border-amber-600/60 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>其他...</span>
                  </button>
                )}
              </div>

              {/* Custom Cooking Method Input Box */}
              {showCustomCookingInput && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-stone-950 border border-amber-800/60 flex items-center gap-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="輸入自訂求生加工手法 (例如：石板烙炙、草木灰水浸泡、柴火煙燻)..."
                    value={customCookingMethodInput}
                    onChange={(e) => setCustomCookingMethodInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomCookingMethod();
                      }
                    }}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCookingMethod}
                    disabled={!customCookingMethodInput.trim()}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition"
                  >
                    加入手法
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomCookingInput(false);
                      setCustomCookingMethodInput('');
                    }}
                    className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Flavor & Storage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  風味與口感描述
                </label>
                <input
                  type="text"
                  placeholder="野外口感、香氣與風味..."
                  value={flavorProfile}
                  onChange={(e) => setFlavorProfile(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  採集後保存建議
                </label>
                <input
                  type="text"
                  placeholder="日曬乾燥、發酵、低溫保存等..."
                  value={storageMethod}
                  onChange={(e) => setStorageMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: 營養成分 (每 100g) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs">5</span>
              每 100g 營養價值與熱量
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <label className="block text-[11px] text-orange-400 font-semibold mb-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  熱量 (kcal)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={calories}
                  placeholder="0"
                  onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <label className="block text-[11px] text-blue-400 font-semibold mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  蛋白質 (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={protein}
                  placeholder="0"
                  onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <label className="block text-[11px] text-emerald-400 font-semibold mb-1">
                  膳食纖維 (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={fiber}
                  placeholder="0"
                  onChange={(e) => setFiber(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <label className="block text-[11px] text-stone-400 font-semibold mb-1">
                  碳水化合物 (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={carbohydrates}
                  placeholder="0"
                  onChange={(e) => setCarbohydrates(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 col-span-2 sm:col-span-1">
                <label className="block text-[11px] text-stone-400 font-semibold mb-1">
                  脂肪 (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={fat}
                  placeholder="0"
                  onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-white text-sm font-bold"
                />
              </div>
            </div>

            {/* Micronutrients */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">鈣質 (mg)</label>
                <input
                  type="number"
                  value={calciumMg}
                  placeholder="0"
                  onChange={(e) => setCalciumMg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">鐵質 (mg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={ironMg}
                  placeholder="0"
                  onChange={(e) => setIronMg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">維生素 C (mg)</label>
                <input
                  type="number"
                  value={vitaminCMg}
                  placeholder="0"
                  onChange={(e) => setVitaminCMg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">鉀 (mg)</label>
                <input
                  type="number"
                  value={potassiumMg}
                  placeholder="0"
                  onChange={(e) => setPotassiumMg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 6: 生態棲地與分佈 (Ecology & Distribution) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs">6</span>
              生態棲地與分佈季節
            </h3>

            {/* Habitat Chips */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                生長棲地環境 (點擊多選)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonHabitats.map((hab) => {
                  const isChecked = habitats.includes(hab);
                  return (
                    <button
                      key={hab}
                      type="button"
                      onClick={() => toggleArrayItem(habitats, hab, setHabitats)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {hab}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">海拔等級</label>
                <select
                  value={elevation}
                  onChange={(e) => setElevation(e.target.value as ElevationCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
                >
                  <option value="low">低海拔 (&lt;500m 平地至淺山)</option>
                  <option value="mid">中海拔 (500-1500m 山地)</option>
                  <option value="high">高海拔 (&gt;1500m 高山)</option>
                  <option value="all">全海拔普遍分佈</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  海拔詳細描述
                </label>
                <input
                  type="text"
                  placeholder="分佈海拔詳細說明..."
                  value={elevationDesc}
                  onChange={(e) => setElevationDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
                />
              </div>
            </div>

            {/* Season Chips */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                適宜採集季節 (點擊多選)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSeasons.map((s) => {
                  const isChecked = seasons.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleArrayItem(seasons, s, setSeasons)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 7: 個人採集筆記 (User Notes) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-stone-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-xs">7</span>
              個人採集筆記與發現地點
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                發現地點或路徑
              </label>
              <input
                type="text"
                placeholder="採集地點、座標或路徑備註..."
                value={foragingLocations}
                onChange={(e) => setForagingLocations(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                個人採集心得或私房食譜
              </label>
              <textarea
                rows={2}
                placeholder="個人採集心得、食用經驗紀錄..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs leading-relaxed"
              />
            </div>
          </div>
        </>
      )}

          {/* Sticky Submit Footer */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between sticky bottom-0 bg-stone-900/95 py-3 -mb-2 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer"
            >
              取消
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/40 transition active:scale-95 cursor-pointer"
            >
              {editingPlant ? '儲存變更' : '新增植物到圖鑑'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
