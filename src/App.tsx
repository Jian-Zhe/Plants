import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { PlantItem, PlantFilterOptions } from './types/plant';
import {
  getAllPlants,
  savePlant,
  deletePlant,
  subscribeToCloudPlants,
  syncLocalPlantsToCloud,
  loadDefaultPresets,
} from './utils/db';
import { loginWithGoogle, logoutUser, subscribeToAuth, handleAuthRedirect } from './firebase';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { PlantCard } from './components/PlantCard';
import { PlantDetailModal } from './components/PlantDetailModal';
import { PlantFormModal } from './components/PlantFormModal';
import { BackupModal } from './components/BackupModal';
import { GitHubPagesGuideModal } from './components/GitHubPagesGuideModal';
import { AISettingsModal } from './components/AISettingsModal';
import { LoginModal } from './components/LoginModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Sprout,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Active Modals State
  const [selectedPlant, setSelectedPlant] = useState<PlantItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantItem | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isGithubGuideOpen, setIsGithubGuideOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOnlyFavorites, setIsOnlyFavorites] = useState(false);


  // Filter State
  const [filters, setFilters] = useState<PlantFilterOptions>({
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
    edibility: 'all',
  });

  // Listen to Firebase Auth state & manage offline vs cloud sync
  useEffect(() => {
    // Check if returning from a mobile redirect sign-in flow
    handleAuthRedirect()
      .then((redirectUser) => {
        if (redirectUser) {
          setCurrentUser(redirectUser);
          setIsLoginModalOpen(false);
        }
      })
      .catch((err) => {
        console.warn('Redirect check error:', err);
      });

    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoginModalOpen(false);
      }

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (user) {
        setIsSyncing(true);
        try {
          // If user has local plants, seamlessly sync them into cloud Firestore
          const localList = await getAllPlants();
          await syncLocalPlantsToCloud(user.uid, localList);

          // Listen to real-time updates from user's Firestore collection
          unsubscribeFirestore = subscribeToCloudPlants(user.uid, (cloudPlants) => {
            setPlants(cloudPlants);
            setIsSyncing(false);
            setIsLoading(false);
          });
        } catch (err) {
          console.error('Error during cloud sync setup:', err);
          setIsSyncing(false);
          setIsLoading(false);
        }
      } else {
        // Offline / Guest Mode: load from IndexedDB
        try {
          const list = await getAllPlants();
          setPlants(list);
        } catch (err) {
          console.error('Error loading plants', err);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Authentication Handlers
  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Save Plant Handler (Local + Cloud if signed in)
  const handleSavePlant = async (saved: PlantItem) => {
    await savePlant(saved, currentUser?.uid);
    setPlants((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [saved, ...prev];
    });
  };

  // Delete Plant Handler (Local + Cloud if signed in)
  const handleDeletePlant = async (id: string) => {
    await deletePlant(id, currentUser?.uid);
    setPlants((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlant?.id === id) {
      setSelectedPlant(null);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (plant: PlantItem) => {
    const updated: PlantItem = {
      ...plant,
      isFavorite: !plant.isFavorite,
      updatedAt: new Date().toISOString(),
    };
    await savePlant(updated, currentUser?.uid);
    setPlants((prev) => prev.map((p) => (p.id === plant.id ? updated : p)));
    if (selectedPlant?.id === plant.id) {
      setSelectedPlant(updated);
    }
  };

  // Filter and Sort Pipeline
  const filteredPlants = useMemo(() => {
    return plants
      .filter((plant) => {
        // Favorites filter
        if (isOnlyFavorites && !plant.isFavorite) return false;

        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = plant.name.toLowerCase().includes(q);
          const matchSci = plant.scientificName.toLowerCase().includes(q);
          const matchAlias = plant.aliases?.some((a) => a.toLowerCase().includes(q));
          const matchFamily = plant.family.toLowerCase().includes(q);
          const matchFeatures =
            plant.characteristics.distinctiveFeatures.toLowerCase().includes(q) ||
            plant.characteristics.leaves.toLowerCase().includes(q);
          const matchPrep = plant.preparation.prepMethod.toLowerCase().includes(q);
          const matchCook = plant.preparation.cookingMethods?.some((m) => m.toLowerCase().includes(q));

          if (!matchName && !matchSci && !matchAlias && !matchFamily && !matchFeatures && !matchPrep && !matchCook) {
            return false;
          }
        }

        // Edibility filter
        if (filters.edibility && filters.edibility !== 'all') {
          const isPlantEdible = plant.isEdible !== false;
          if (filters.edibility === 'edible' && !isPlantEdible) return false;
          if (filters.edibility === 'inedible' && isPlantEdible) return false;
        }

        // Family filter
        if (filters.family !== 'all') {
          if (!plant.family.startsWith(filters.family)) return false;
        }

        // Nutrition: Calories
        if (
          plant.nutrition.calories < filters.calorieRange[0] ||
          plant.nutrition.calories > filters.calorieRange[1]
        ) {
          return false;
        }

        // Nutrition: Protein
        if (plant.nutrition.protein < filters.minProtein) {
          return false;
        }

        // Nutrition: Fiber
        if (plant.nutrition.fiber < filters.minFiber) {
          return false;
        }

        // Habitat
        if (filters.habitat !== 'all') {
          if (!plant.distribution.habitat.some((h) => h.includes(filters.habitat))) {
            return false;
          }
        }

        // Elevation
        if (filters.elevation !== 'all') {
          if (plant.distribution.elevation !== filters.elevation && plant.distribution.elevation !== 'all') {
            return false;
          }
        }

        // Season
        if (filters.season !== 'all') {
          if (
            !plant.distribution.season.includes(filters.season) &&
            !plant.distribution.season.includes('全年')
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'protein_desc':
            return b.nutrition.protein - a.nutrition.protein;
          case 'calories_asc':
            return a.nutrition.calories - b.nutrition.calories;
          case 'calories_desc':
            return b.nutrition.calories - a.nutrition.calories;
          case 'fiber_desc':
            return b.nutrition.fiber - a.nutrition.fiber;
          case 'name':
            return a.name.localeCompare(b.name, 'zh-Hant');
          case 'updatedAt':
          default:
            return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        }
      });
  }, [plants, filters, isOnlyFavorites]);

  // Favorites count for Navbar badge
  const favoritesCount = useMemo(() => plants.filter((p) => p.isFavorite).length, [plants]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white pb-24 sm:pb-12">
      {/* Top Navbar */}
      <Navbar
        onOpenGithubGuide={() => setIsGithubGuideOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        isOnlyFavorites={isOnlyFavorites}
        onToggleOnlyFavorites={() => setIsOnlyFavorites(!isOnlyFavorites)}
        favoritesCount={favoritesCount}
        user={currentUser}
        isSyncing={isSyncing}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-5">


        {/* Multi-dimensional Filter Bar */}
        <FilterBar
          plants={plants}
          filters={filters}
          onChange={setFilters}
          filteredCount={filteredPlants.length}
        />

        {/* Main Content Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-500">
            <Sprout className="w-10 h-10 animate-bounce text-emerald-500 mb-3" />
            <p className="text-sm">載入植物圖鑑資料庫中...</p>
          </div>
        ) : plants.length === 0 ? (
          /* Zero Plants in Library (Clean State) */
          <div className="py-20 px-4 rounded-3xl bg-stone-900/40 border border-stone-800/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-700/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <Sprout className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">目前尚無植物紀錄</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                預設植物已清空。您可以立即手動新增您在野外採集或園藝栽培認識的植物，並可隨時使用內建範本或 AI 智能快速填寫！
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  setEditingPlant(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm text-white font-semibold shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>新增第一株植物</span>
              </button>

              <button
                onClick={async () => {
                  const restored = await loadDefaultPresets(currentUser?.uid);
                  setPlants(restored);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs text-stone-300 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>載入 18 種經典野外植物範本</span>
              </button>
            </div>
          </div>
        ) : filteredPlants.length === 0 ? (
          /* Filtered empty state */
          <div className="py-20 px-4 rounded-3xl bg-stone-900/40 border border-stone-800/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
              <Sprout className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">找不到符合篩選條件的植物紀錄</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                可以嘗試放寬熱量或蛋白質範圍、切換科別，或點選下方按鈕重設所有篩選。
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() =>
                  setFilters({
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
                    edibility: 'all',
                  })
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重設所有篩選條件</span>
              </button>

              <button
                onClick={() => {
                  setEditingPlant(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增這株植物</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onSelect={setSelectedPlant}
                onEdit={(p) => {
                  setEditingPlant(p);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeletePlant}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button for Adding Plant (Desktop & Mobile) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setEditingPlant(null);
            setIsFormOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-950/90 active:scale-95 hover:scale-105 transition-all border border-emerald-400/50 group cursor-pointer"
          title="新增植物紀錄"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />

      {/* Modals */}
      <PlantDetailModal
        plant={selectedPlant}
        isOpen={!!selectedPlant}
        onClose={() => setSelectedPlant(null)}
        onEdit={(p) => {
          setEditingPlant(p);
          setIsFormOpen(true);
        }}
        onDelete={handleDeletePlant}
        onToggleFavorite={handleToggleFavorite}
      />

      <PlantFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPlant(null);
        }}
        onSave={handleSavePlant}
        editingPlant={editingPlant}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataChanged={(updated) => setPlants(updated)}
        totalPlants={plants.length}
        userUid={currentUser?.uid}
      />

      <GitHubPagesGuideModal
        isOpen={isGithubGuideOpen}
        onClose={() => setIsGithubGuideOpen(false)}
      />

      <AISettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
