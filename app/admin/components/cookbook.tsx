'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getCommonPurchaseUnits } from '@/lib/unit-conversions';
import { type ParsedIngredient } from '@/lib/ingredient-parser';
import IngredientTextInput from './ingredient-text-input';
import { 
  BookOpen,
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown,
  ChevronUp,
  Package,
  X,
  Save,
  ShoppingBag,
  ImagePlus,
  ArrowRight,
  Search
} from 'lucide-react';

// Types
type IngredientSource = 'GARDEN' | 'PANTRY' | 'PACKAGING';

interface Ingredient {
  id: string;
  name: string;
  unitCost: number;
  unit: string;
  source: IngredientSource;
  category: string | null;
  notes: string | null;
  // Purchase tracking
  purchaseSize: number | null;
  purchaseUnit: string | null;
  purchaseCost: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RecipeIngredient {
  id: string;
  ingredientId: string;
  quantity: number;
  ingredient: Ingredient;
}

type RecipeStatus = 'IDEA' | 'READY' | 'PUBLISHED';

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  containerType: string;
  containerCost: number;
  labelCost: number;
  energyCost: number;
  retailPrice: number;
  notes: string | null;
  status: RecipeStatus;
  batchYield: number | null; // Number of jars this batch makes (null = per-jar mode)
  ingredients: RecipeIngredient[];
  product?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string | null;
    isAvailable: boolean;
    price: number;
  } | null;
  // New hierarchy - linked ProductFlavor
  flavor?: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string;
    isAvailable: boolean;
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
    sizes: {
      id: string;
      sizeLabel: string;
      unitPrice: number;
      quantity: number;
    }[];
  } | null;
}

type CookbookTab = 'ideas' | 'ready';

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

interface CookbookProps {
  expandRecipeId?: string | null;
  onRecipeExpanded?: () => void;
}

export default function Cookbook({ expandRecipeId, onRecipeExpanded }: CookbookProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CookbookTab>('ideas');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [ingredientCategory, setIngredientCategory] = useState<'produce' | 'pantry' | 'spices' | 'other'>('produce');
  const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a'>('a-z');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ 
    unitCost: number; 
    unit: string;
    purchaseSize: number | null;
    purchaseUnit: string | null;
    purchaseCost: number | null;
  }>({ unitCost: 0, unit: '', purchaseSize: null, purchaseUnit: null, purchaseCost: null });
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [publishingRecipe, setPublishingRecipe] = useState<Recipe | null>(null);
  const [pendingRecipeSave, setPendingRecipeSave] = useState<{
    recipe: Recipe;
    data: unknown;
    linkedFlavor: { name: string; sizeCount: number } | null;
  } | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle external recipe expansion request (from Shop "View recipe" link)
  useEffect(() => {
    if (expandRecipeId && recipes.length > 0) {
      // Find the recipe and switch to its tab
      const recipe = recipes.find(r => r.id === expandRecipeId);
      if (recipe) {
        const status = recipe.status || 'IDEA';
        if (status === 'IDEA') setActiveTab('ideas');
        else if (status === 'READY') setActiveTab('ready');
        // Note: PUBLISHED recipes now only show in Shop, not Kitchen
        setExpandedRecipe(expandRecipeId);
        onRecipeExpanded?.();
      }
    }
  }, [expandRecipeId, recipes, onRecipeExpanded]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recipesRes, ingredientsRes] = await Promise.all([
        fetch('/api/admin/cogs/recipes'),
        fetch('/api/admin/cogs/ingredients')
      ]);
      
      if (recipesRes.ok) {
        const data = await recipesRes.json();
        setRecipes(data);
      }
      if (ingredientsRes.ok) {
        const data = await ingredientsRes.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Failed to fetch COGS data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Smart ingredient categorization (4 categories: produce, pantry, spices, other)
  const categorizeIngredient = useCallback((ing: Ingredient): 'produce' | 'pantry' | 'spices' | 'other' => {
    // Garden produce
    if (ing.source === 'GARDEN') return 'produce';
    
    // Check if it's a spice (by name patterns)
    const spicePatterns = /^(cinnamon|cumin|paprika|oregano|thyme|rosemary|basil|parsley|dill|sage|bay leaf|nutmeg|clove|ginger|turmeric|pepper|cayenne|chili|garlic powder|onion powder|allspice|cardamom|coriander|fennel|mustard seed|vanilla|saffron|spices?)/i;
    const name = ing.name.toLowerCase();
    if (spicePatterns.test(name) || name.includes('spice') || name.includes('seasoning') || name.includes('herb')) {
      return 'spices';
    }
    
    // Packaging goes to "other"
    if (ing.source === 'PACKAGING') return 'other';
    
    // Default pantry items
    if (ing.source === 'PANTRY') return 'pantry';
    
    return 'other';
  }, []);

  // Group ingredients by smart categories
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {
      produce: [],
      pantry: [],
      spices: [],
      other: []
    };
    ingredients.forEach(ing => {
      const cat = categorizeIngredient(ing);
      groups[cat].push(ing);
    });
    // Sort each group alphabetically
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    return groups;
  }, [ingredients, categorizeIngredient]);

  // Count ingredients by category for badges
  const ingredientCounts = useMemo(() => ({
    produce: groupedIngredients.produce?.length || 0,
    pantry: groupedIngredients.pantry?.length || 0,
    spices: groupedIngredients.spices?.length || 0,
    other: groupedIngredients.other?.length || 0,
  }), [groupedIngredients]);

  // Count recipes by status (only IDEA and READY shown in Kitchen)
  const recipeCounts = useMemo(() => {
    const counts = { ideas: 0, ready: 0 };
    recipes.forEach(r => {
      const status = r.status || 'IDEA';
      if (status === 'IDEA') counts.ideas++;
      else if (status === 'READY') counts.ready++;
      // PUBLISHED recipes are managed in Shop, not Kitchen
    });
    return counts;
  }, [recipes]);

  // Filter and sort recipes by active tab (Kitchen only shows IDEA and READY)
  const filteredRecipes = useMemo(() => {
    const statusMap: Record<CookbookTab, RecipeStatus> = {
      ideas: 'IDEA',
      ready: 'READY'
    };
    const targetStatus = statusMap[activeTab];
    const query = searchQuery.toLowerCase().trim();
    
    return recipes
      .filter(r => (r.status || 'IDEA') === targetStatus)
      .filter(r => !query || r.name.toLowerCase().includes(query))
      .sort((a, b) => {
        // Alphabetical sorting
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === 'a-z' ? comparison : -comparison;
      });
  }, [recipes, activeTab, sortOrder, searchQuery]);

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Delete this recipe?')) return;
    
    try {
      const res = await fetch(`/api/admin/cogs/recipes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecipes(recipes.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const startEditingIngredient = (ing: Ingredient) => {
    setEditingIngredient(ing.id);
    setEditValues({ 
      unitCost: ing.unitCost, 
      unit: ing.unit,
      purchaseSize: ing.purchaseSize,
      purchaseUnit: ing.purchaseUnit,
      purchaseCost: ing.purchaseCost,
    });
  };

  const handleSaveIngredient = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/cogs/ingredients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues)
      });
      if (res.ok) {
        // Update local state
        setIngredients(ingredients.map(ing => 
          ing.id === id ? { ...ing, ...editValues } : ing
        ));
        // Also refresh recipes since they reference ingredients
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to save ingredient:', error);
    } finally {
      setEditingIngredient(null);
    }
  };

  const handleAddIngredient = async (data: {
    name: string;
    unitCost: number;
    unit: string;
    source: IngredientSource;
    category: string;
  }) => {
    try {
      const res = await fetch('/api/admin/cogs/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add ingredient:', error);
    } finally {
      setIsAddingIngredient(false);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    if (!confirm('Delete this ingredient? This will remove it from all recipes.')) return;
    
    try {
      const res = await fetch(`/api/admin/cogs/ingredients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIngredients(ingredients.filter(ing => ing.id !== id));
        await fetchData(); // Refresh recipes too
      }
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]"></div>
      </div>
    );
  }

  // Handle moving recipe to different status
  const handleMoveRecipe = async (recipeId: string, newStatus: RecipeStatus) => {
    try {
      const res = await fetch(`/api/admin/cogs/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update recipe status:', error);
    }
  };

  // Tab configuration - friendly, inviting labels (Kitchen only, no selling)
  const tabs: { id: CookbookTab; label: string; count: number }[] = [
    { id: 'ideas', label: '💡 Dreaming Up', count: recipeCounts.ideas },
    { id: 'ready', label: '✨ Almost There', count: recipeCounts.ready },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5C4A3D] flex items-center gap-2">
            <BookOpen size={24} className="text-[#4A7C59]" />
            Kitchen
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Your recipes, from idea to shelf
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-[#4A7C59] rounded-lg hover:bg-[#3d6549] transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          New Idea
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#E5DDD3]">
        <div className="flex items-center justify-between">
          <nav className="flex gap-8" aria-label="Kitchen tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#4A7C59]'
                    : 'text-gray-500 hover:text-[#5C4A3D]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-[#E8F0EA] text-[#4A7C59]' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                </span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A7C59]" />
                )}
              </button>
            ))}
          </nav>
          
          {/* Search & Sort - Minimal */}
          <div className="flex items-center gap-2 pb-3">
            {showSearch ? (
              <div className="relative animate-in slide-in-from-right-2 duration-200">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-40 pl-3 pr-8 py-1.5 text-sm border border-[#4A7C59] rounded-full focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 bg-white"
                />
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-1.5 text-gray-400 hover:text-[#4A7C59] hover:bg-[#E8F0EA] rounded-full transition-colors"
                title="Search recipes"
              >
                <Search size={16} />
              </button>
            )}
            <button
              onClick={() => setSortOrder(sortOrder === 'a-z' ? 'z-a' : 'a-z')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#4A7C59] transition-colors"
              title={sortOrder === 'a-z' ? 'Sorted A→Z' : 'Sorted Z→A'}
            >
              {sortOrder === 'a-z' ? 'A→Z' : 'Z→A'}
              <ChevronDown size={14} className={sortOrder === 'z-a' ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients Panel - Collapsible with Category Tabs */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        {/* Collapsible Header - Always Visible */}
        <button
          onClick={() => setShowIngredients(!showIngredients)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#FDF8F3] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[#4A7C59]" />
            <h3 className="font-serif font-bold text-[#5C4A3D] text-sm">Ingredient Library</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {ingredients.length} items
            </span>
          </div>
          <ChevronDown 
            size={18} 
            className={`text-gray-400 transition-transform duration-200 ${showIngredients ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Collapsible Content */}
        {showIngredients && (
          <div className="px-4 pb-4 border-t border-[#E5DDD3]">
            {/* Category Tabs */}
            <div className="flex gap-1 py-3 overflow-x-auto">
              {[
                { key: 'produce' as const, icon: '🌱', label: 'Produce' },
                { key: 'pantry' as const, icon: '🥫', label: 'Pantry' },
                { key: 'spices' as const, icon: '🌿', label: 'Spices' },
                { key: 'other' as const, icon: '📦', label: 'Other' },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => setIngredientCategory(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    ingredientCategory === key
                      ? 'bg-[#4A7C59] text-white shadow-sm'
                      : 'bg-[#FDF8F3] text-[#5C4A3D] hover:bg-[#E8F0EA]'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                  {ingredientCounts[key] > 0 && (
                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      ingredientCategory === key
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E5DDD3] text-[#5C4A3D]'
                    }`}>
                      {ingredientCounts[key]}
                    </span>
                  )}
                </button>
              ))}
              {/* Add Button */}
              <button
                onClick={() => setIsAddingIngredient(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#4A7C59] border border-dashed border-[#4A7C59] hover:bg-[#E8F0EA] transition-colors ml-auto"
              >
                <Plus size={12} />
                Add
              </button>
            </div>

            {/* Ingredient Chips */}
            <div className="flex flex-wrap gap-1.5">
              {(groupedIngredients[ingredientCategory] || []).map(ing => (
                editingIngredient === ing.id ? (
                  /* Editing Mode - Inline Popover Style */
                  <div key={ing.id} className="w-full bg-[#FDF8F3] p-3 rounded-lg border border-[#E5DDD3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#5C4A3D] text-sm">{ing.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSaveIngredient(ing.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Save"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteIngredient(ing.id)}
                          className="p-1 text-red-400 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setEditingIngredient(null)}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {ing.source === 'PANTRY' && (
                      <div className="bg-white rounded-lg p-2 border border-[#E5DDD3]">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">What you buy</div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Qty"
                            value={editValues.purchaseSize || ''}
                            onChange={(e) => setEditValues({ ...editValues, purchaseSize: parseFloat(e.target.value) || null })}
                            className="w-14 px-1.5 py-1 border border-[#E5DDD3] rounded text-xs text-center"
                          />
                          <select
                            value={editValues.purchaseUnit || ''}
                            onChange={(e) => setEditValues({ ...editValues, purchaseUnit: e.target.value || null })}
                            className="w-16 px-1 py-1 border border-[#E5DDD3] rounded text-xs bg-white"
                          >
                            <option value="">unit</option>
                            {getCommonPurchaseUnits().map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                          <span className="text-gray-400 text-xs">@</span>
                          <span className="text-gray-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={editValues.purchaseCost || ''}
                            onChange={(e) => setEditValues({ ...editValues, purchaseCost: parseFloat(e.target.value) || null })}
                            className="w-14 px-1.5 py-1 border border-[#E5DDD3] rounded text-xs text-right"
                          />
                        </div>
                      </div>
                    )}
                    
                    {ing.source === 'GARDEN' && (
                      <p className="text-xs text-green-600">🌱 From the garden — no cost</p>
                    )}
                    
                    {ing.source === 'PACKAGING' && (
                      <div className="bg-white rounded-lg p-2 border border-[#E5DDD3]">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Cost per item</div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editValues.unitCost}
                            onChange={(e) => setEditValues({ ...editValues, unitCost: parseFloat(e.target.value) || 0 })}
                            className="w-16 px-1.5 py-1 border border-[#E5DDD3] rounded text-xs text-right"
                            autoFocus
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Display Mode - Compact Chip */
                  <button
                    key={ing.id}
                    onClick={() => startEditingIngredient(ing)}
                    className="px-2.5 py-1 text-xs bg-white border border-[#E5DDD3] rounded-full text-[#5C4A3D] hover:bg-[#FDF8F3] hover:border-[#4A7C59] hover:text-[#4A7C59] transition-all cursor-pointer"
                  >
                    {ing.name}
                  </button>
                )
              ))}
              {(groupedIngredients[ingredientCategory] || []).length === 0 && (
                <p className="text-xs text-gray-400 italic py-2">
                  No {ingredientCategory} ingredients yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Cards - Compact List with Dividers */}
      <div className="bg-white rounded-lg border border-[#E5DDD3] divide-y divide-[#E5DDD3]">
        {filteredRecipes.length === 0 ? (
          <div className="bg-gradient-to-b from-[#FDF8F3] to-white rounded-xl border border-[#E5DDD3] p-12 text-center">
            {activeTab === 'ideas' ? (
              <>
                <div className="text-5xl mb-4">✨</div>
                <p className="text-lg font-serif text-[#5C4A3D]">Time to dream up something delicious!</p>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  The best recipes start with a spark of inspiration. What&apos;s growing in the garden? What flavors are calling to you?
                </p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-6 px-5 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6549] transition-colors text-sm font-medium"
                >
                  Start a New Idea
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🌱</div>
                <p className="text-lg font-serif text-[#5C4A3D]">Good things take time</p>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  When your ideas are ready to become real recipes, they&apos;ll show up here for their final touches before hitting the shelf.
                </p>
              </>
            )}
          </div>
        ) : (
          filteredRecipes.map(recipe => {
            const isExpanded = expandedRecipe === recipe.id;

            return (
              <div
                key={recipe.id}
                className="overflow-hidden"
              >
                {/* Recipe Header - Ultra Clean */}
                <div
                  className="group px-4 py-3 cursor-pointer hover:bg-[#FDF8F3] transition-colors"
                  onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#5C4A3D]">{recipe.name}</h3>
                    <div className="flex items-center gap-2">
                      {/* Jar size only visible on hover or when expanded */}
                      <span className={`text-xs text-gray-400 transition-opacity duration-200 ${
                        isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {recipe.containerType}
                      </span>
                      <ChevronDown size={16} className={`text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#E5DDD3] p-4 bg-[#FDF8F3]">
                    <div className="space-y-4">
                      {/* Ingredients Breakdown */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                          Ingredients
                        </h4>
                        <ul className="space-y-2">
                          {recipe.ingredients.map(ri => (
                            <li key={ri.id} className="flex items-center text-sm">
                              <span className="flex items-center gap-2">
                                {ri.ingredient.source === 'GARDEN' && <span>🌱</span>}
                                {ri.ingredient.source === 'PACKAGING' && <span>📦</span>}
                                {ri.quantity} {ri.ingredient.unit} {ri.ingredient.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Batch Yield Info */}
                      {recipe.batchYield && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Batch yield:</span> {recipe.batchYield} {recipe.containerType || 'units'}
                        </div>
                      )}

                      {/* Notes */}
                      {recipe.notes && (
                        <div className="pt-4 border-t border-[#E5DDD3]">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
                          <p className="text-sm text-gray-600 italic">{recipe.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions - Different per tab */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#E5DDD3]">
                      {activeTab === 'ideas' && (
                        <>
                          <button
                            onClick={() => handleMoveRecipe(recipe.id, 'READY')}
                            className="px-3 py-1.5 text-sm text-[#4A7C59] hover:bg-[#E8F0EA] rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                          >
                            Ready to Share
                            <ArrowRight size={14} />
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingRecipe(recipe)}
                              className="px-3 py-1.5 text-sm text-[#5C4A3D] hover:bg-white rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecipe(recipe.id)}
                              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                      
                      {activeTab === 'ready' && (
                        <>
                          <button
                            onClick={() => handleMoveRecipe(recipe.id, 'IDEA')}
                            className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <ArrowRight size={14} className="rotate-180" />
                            Back to Dreaming
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingRecipe(recipe)}
                              className="px-3 py-1.5 text-sm text-[#5C4A3D] hover:bg-white rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => setPublishingRecipe(recipe)}
                              className="px-4 py-1.5 text-sm bg-[#4A7C59] text-white hover:bg-[#3d6649] rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                            >
                              <ShoppingBag size={14} />
                              Put on Shelf
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Recipe Editor Modal */}
      {(isCreating || editingRecipe) && (
        <RecipeEditorModal
          recipe={editingRecipe}
          ingredients={ingredients}
          onClose={() => {
            setIsCreating(false);
            setEditingRecipe(null);
          }}
          onSave={async (data) => {
            try {
              if (editingRecipe) {
                // Check if this is a PUBLISHED recipe with linked products
                if (editingRecipe.status === 'PUBLISHED' && editingRecipe.flavor) {
                  // Show warning modal before saving
                  setPendingRecipeSave({
                    recipe: editingRecipe,
                    data,
                    linkedFlavor: {
                      name: editingRecipe.flavor.name,
                      sizeCount: editingRecipe.flavor.sizes?.length || 0
                    }
                  });
                  return; // Don't save yet, wait for confirmation
                }

                const res = await fetch(`/api/admin/cogs/recipes/${editingRecipe.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                if (res.ok) {
                  await fetchData();
                }
              } else {
                const res = await fetch('/api/admin/cogs/recipes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                if (res.ok) {
                  await fetchData();
                }
              }
              setIsCreating(false);
              setEditingRecipe(null);
            } catch (error) {
              console.error('Failed to save recipe:', error);
            }
          }}
        />
      )}

      {/* Add Ingredient Modal */}
      {isAddingIngredient && (
        <AddIngredientModal
          onClose={() => setIsAddingIngredient(false)}
          onSave={handleAddIngredient}
        />
      )}

      {/* Recipe Edit Warning Modal - for published recipes */}
      {pendingRecipeSave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <span className="text-xl">⚠️</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">Update Shop Costs?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This recipe is published to the Shop as <span className="font-medium">&quot;{pendingRecipeSave.linkedFlavor?.name}&quot;</span>
              {pendingRecipeSave.linkedFlavor && pendingRecipeSave.linkedFlavor.sizeCount > 0 && (
                <> with {pendingRecipeSave.linkedFlavor.sizeCount} size{pendingRecipeSave.linkedFlavor.sizeCount !== 1 ? 's' : ''}</>
              )}.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Saving these changes will update the cost calculations in the Shop. Prices may need to be reviewed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setPendingRecipeSave(null);
                  // Keep editor open so user can cancel
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Proceed with save
                  try {
                    const res = await fetch(`/api/admin/cogs/recipes/${pendingRecipeSave.recipe.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(pendingRecipeSave.data)
                    });
                    if (res.ok) {
                      await fetchData();
                    }
                    setIsCreating(false);
                    setEditingRecipe(null);
                    setPendingRecipeSave(null);
                  } catch (error) {
                    console.error('Failed to save recipe:', error);
                    setPendingRecipeSave(null);
                  }
                }}
                className="px-6 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6549] transition-colors font-medium"
              >
                Update & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish to Store Modal */}
      {publishingRecipe && (
        <PublishToStoreModal
          recipe={publishingRecipe}
          onClose={() => setPublishingRecipe(null)}
          onPublish={async () => {
            await fetchData();
            setPublishingRecipe(null);
          }}
        />
      )}
    </div>
  );
}

// Recipe Editor Modal Component
interface RecipeEditorModalProps {
  recipe: Recipe | null;
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    containerType: string;
    containerCost: number;
    labelCost: number;
    energyCost: number;
    retailPrice: number;
    notes: string;
    batchYield: number | null;
    ingredients: { ingredientId: string; quantity: number }[];
  }) => void;
}

function RecipeEditorModal({ recipe, ingredients, onClose, onSave }: RecipeEditorModalProps) {
  const [name, setName] = useState(recipe?.name || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [containerType, setContainerType] = useState(recipe?.containerType || 'Quart Jar');
  const [containerCost, setContainerCost] = useState(recipe?.containerCost || 1.30);
  const [labelCost, setLabelCost] = useState(recipe?.labelCost || 0.20);
  const [energyCost, setEnergyCost] = useState(recipe?.energyCost || 0.30);
  const [retailPrice, setRetailPrice] = useState(recipe?.retailPrice || 10);
  const [notes, setNotes] = useState(recipe?.notes || '');
  const [batchYield, setBatchYield] = useState<number | null>(recipe?.batchYield ?? null);
  const [batchYieldUnit, setBatchYieldUnit] = useState('jars'); // Could be jars, lbs, cups, oz, etc.
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([]);
  const [localIngredients, setLocalIngredients] = useState<Ingredient[]>(ingredients);
  const [showCostDetails, setShowCostDetails] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const costSectionRef = useRef<HTMLDivElement>(null);
  const additionalSectionRef = useRef<HTMLDivElement>(null);
  
  // Convert existing recipe ingredients to parsed format for initial display
  const initialParsedLines: ParsedIngredient[] = recipe?.ingredients.map(ri => ({
    amount: ri.quantity,
    unit: ri.ingredient.unit,
    name: ri.ingredient.name,
    rawLine: `${ri.quantity} ${ri.ingredient.unit} ${ri.ingredient.name}`,
    matchedIngredient: ri.ingredient as Ingredient,
  })) || [];
  
  // Build recipeIngredients from parsedIngredients for submission
  const recipeIngredients = parsedIngredients
    .filter(p => p.matchedIngredient && !p.parseError)
    .map(p => ({
      ingredientId: p.matchedIngredient!.id,
      quantity: p.amount,
    }));
    
  // Handle new ingredient creation
  const handleCreateIngredient = useCallback(async (ingredientName: string, source: IngredientSource): Promise<Ingredient> => {
    const res = await fetch('/api/admin/cogs/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: ingredientName, source }),
    });
    
    if (!res.ok) {
      throw new Error('Failed to create ingredient');
    }
    
    const newIngredient = await res.json();
    setLocalIngredients(prev => [...prev, newIngredient]);
    return newIngredient;
  }, []);

  const containerPresets: Record<string, number> = {
    'Quart Jar': 1.30,
    'Pint Jar': 1.25,
    '8oz Jar': 1.00,
    '4oz Jar': 0.75,
    '4oz Bag': 0.30,
    '16oz Bottle': 0.75,
  };

  // Calculate live preview with batch/per-jar mode support
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      containerType,
      containerCost,
      labelCost,
      energyCost,
      retailPrice,
      notes,
      batchYield,
      ingredients: recipeIngredients
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5DDD3] p-4 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">
            {recipe ? 'Edit Idea' : 'New Idea'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipe Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
              placeholder="e.g., Pepper Jelly"
            />
          </div>

          {/* Ingredients - Natural Text Input */}
          <div>
            <IngredientTextInput
              ingredients={localIngredients}
              initialLines={initialParsedLines}
              onChange={setParsedIngredients}
              onCreateIngredient={handleCreateIngredient}
            />
          </div>

          {/* Collapsible Additional Details */}
          <div ref={additionalSectionRef} className="border-t border-[#E5DDD3] pt-4">
            <button
              type="button"
              onClick={() => {
                const newState = !showAdditionalDetails;
                setShowAdditionalDetails(newState);
                if (newState) {
                  setTimeout(() => {
                    additionalSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showAdditionalDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>Additional Details</span>
              {(batchYield || description || notes) && (
                <span className="text-xs text-gray-400">
                  {batchYield ? `${batchYield} ${batchYieldUnit}` : ''}
                  {batchYield && (description || notes) ? ' • ' : ''}
                  {(description || notes) ? 'has notes' : ''}
                </span>
              )}
            </button>
            
            {showAdditionalDetails && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
                {/* Batch Yield */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Batch Yield</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      placeholder="—"
                      value={batchYield ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBatchYield(val ? parseFloat(val) : null);
                      }}
                      className="w-20 px-3 py-1.5 border border-[#E5DDD3] rounded-lg text-sm"
                    />
                    <select
                      value={batchYieldUnit}
                      onChange={(e) => setBatchYieldUnit(e.target.value)}
                      className="px-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm bg-white"
                    >
                      <option value="jars">jars</option>
                      <option value="lbs">lbs</option>
                      <option value="oz">oz</option>
                      <option value="cups">cups</option>
                      <option value="quarts">quarts</option>
                      <option value="pints">pints</option>
                      <option value="bags">bags</option>
                      <option value="bottles">bottles</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">How much does this batch make?</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#E5DDD3] rounded-lg text-sm"
                    placeholder="Brief description for the store"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 border border-[#E5DDD3] rounded-lg text-sm"
                    placeholder="Personal notes about this recipe..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Pricing & Costs Section */}
          <div ref={costSectionRef} className="border-t border-[#E5DDD3] pt-4">
            <button
              type="button"
              onClick={() => {
                const newState = !showCostDetails;
                setShowCostDetails(newState);
                // Scroll into view when opening
                if (newState) {
                  setTimeout(() => {
                    costSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showCostDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>Pricing & Packaging</span>
              <span className="text-xs text-gray-400">
                ({containerType} • {formatCurrency(retailPrice)}/jar)
              </span>
            </button>
            
            {showCostDetails && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
                {/* Jar & Retail Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Jar Type</label>
                    <select
                      value={containerType}
                      onChange={(e) => {
                        setContainerType(e.target.value);
                        if (containerPresets[e.target.value]) {
                          setContainerCost(containerPresets[e.target.value]);
                        }
                      }}
                      className="w-full px-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm bg-white"
                    >
                      {Object.keys(containerPresets).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Retail Price (per jar)</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={retailPrice}
                        onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Overhead Costs */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Per-jar overhead costs</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Container</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={containerCost}
                          onChange={(e) => setContainerCost(parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Label</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={labelCost}
                          onChange={(e) => setLabelCost(parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Energy</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={energyCost}
                          onChange={(e) => setEnergyCost(parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DDD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6549] transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              {recipe ? 'Save Changes' : 'Save Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Ingredient Modal Component
interface AddIngredientModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    unitCost: number;
    unit: string;
    source: IngredientSource;
    category: string;
    purchaseSize?: number | null;
    purchaseUnit?: string | null;
    purchaseCost?: number | null;
  }) => void;
}

// Category type for the 4 display categories
type IngredientCategory = 'produce' | 'pantry' | 'spices' | 'other';

function AddIngredientModal({ onClose, onSave }: AddIngredientModalProps) {
  const [name, setName] = useState('');
  const [unitCost, setUnitCost] = useState(0);
  const [unit, setUnit] = useState('cup');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory>('pantry');
  // Purchase tracking
  const [purchaseSize, setPurchaseSize] = useState<number | null>(null);
  const [purchaseUnit, setPurchaseUnit] = useState<string | null>(null);
  const [purchaseCost, setPurchaseCost] = useState<number | null>(null);

  // Map display category to database source
  const getSourceFromCategory = (cat: IngredientCategory): IngredientSource => {
    if (cat === 'produce') return 'GARDEN';
    return 'PANTRY'; // pantry, spices, and other all use PANTRY source
  };

  // Check if this category needs purchase tracking
  const needsPurchaseTracking = (cat: IngredientCategory): boolean => {
    return cat === 'pantry' || cat === 'spices' || cat === 'other';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const source = getSourceFromCategory(selectedCategory);
    onSave({
      name,
      unitCost: source === 'GARDEN' ? 0 : unitCost,
      unit,
      source,
      category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1), // Capitalize for DB
      purchaseSize: needsPurchaseTracking(selectedCategory) ? purchaseSize : null,
      purchaseUnit: needsPurchaseTracking(selectedCategory) ? purchaseUnit : null,
      purchaseCost: needsPurchaseTracking(selectedCategory) ? purchaseCost : null,
    });
  };

  const handleCategoryChange = (cat: IngredientCategory) => {
    setSelectedCategory(cat);
    // Reset unit cost for garden produce
    if (cat === 'produce') setUnitCost(0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-[#E5DDD3] p-4 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">Add New Ingredient</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
              placeholder="e.g., Brown Sugar"
              autoFocus
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'produce' as const, icon: '🌱', label: 'Produce', desc: 'Homegrown' },
                { key: 'pantry' as const, icon: '🥫', label: 'Pantry', desc: 'Store-bought' },
                { key: 'spices' as const, icon: '🌿', label: 'Spices', desc: 'Herbs & spices' },
                { key: 'other' as const, icon: '📦', label: 'Other', desc: 'Everything else' },
              ].map(({ key, icon, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategoryChange(key)}
                  className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                    selectedCategory === key 
                      ? key === 'produce' 
                        ? 'border-green-500 bg-green-50'
                        : 'border-[#4A7C59] bg-[#E8F0EA]'
                      : 'border-[#E5DDD3] hover:border-gray-300'
                  }`}
                >
                  <div className="text-base mb-0.5">{icon}</div>
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-[9px] text-gray-500">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cost and Unit - different UI per category */}
          {needsPurchaseTracking(selectedCategory) && (
            <div className="bg-[#FDF8F3] rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                {selectedCategory === 'spices' ? 'Where you buy this' : 'What you buy at the store'}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Size</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 2"
                    value={purchaseSize || ''}
                    onChange={(e) => setPurchaseSize(parseFloat(e.target.value) || null)}
                    className="w-full px-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unit</label>
                  <select
                    value={purchaseUnit || ''}
                    onChange={(e) => {
                      const newUnit = e.target.value || null;
                      setPurchaseUnit(newUnit);
                      // Also set the ingredient unit to match
                      if (newUnit) setUnit(newUnit);
                    }}
                    className="w-full px-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm bg-white"
                  >
                    <option value="">Select...</option>
                    {getCommonPurchaseUnits().map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="4.00"
                      value={purchaseCost || ''}
                      onChange={(e) => setPurchaseCost(parseFloat(e.target.value) || null)}
                      className="w-full pl-5 pr-2 py-1.5 border border-[#E5DDD3] rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
              {purchaseSize && purchaseUnit && purchaseCost && (
                <p className="text-xs text-gray-500">
                  {purchaseSize} {purchaseUnit} for ${purchaseCost.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {selectedCategory === 'produce' && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
              🌱 Produce from the garden has no cost — it&apos;s homegrown!
            </p>
          )}

          {/* Preview */}
          {name && (
            <div className="bg-[#FDF8F3] rounded-lg p-3 text-center">
              <span className="text-sm text-[#5C4A3D] font-medium">{name}</span>
              <span className="text-xs text-gray-400 ml-2">
                ({selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)})
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6549] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={18} />
              Add Ingredient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Publish to Store Modal
interface PublishToStoreModalProps {
  recipe: Recipe;
  onClose: () => void;
  onPublish: () => void;
}

function PublishToStoreModal({ recipe, onClose, onPublish }: PublishToStoreModalProps) {
  const [name, setName] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description || `Handcrafted ${recipe.name} made with care.`);
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [firstSizeOz, setFirstSizeOz] = useState(8); // Default to 8oz
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Auto-populate container type based on size
  const containerType = firstSizeOz === 4 ? 'bag' : 'jar';

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/catalog/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const res = await fetch('/api/catalog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (res.ok) {
        const newCategory = await res.json();
        setCategories(prev => [...prev, newCategory]);
        setCategoryId(newCategory.id);
        setNewCategoryName('');
        setShowNewCategoryInput(false);
      } else {
        throw new Error('Failed to create category');
      }
    } catch {
      setError('Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!firstSizeOz) {
      setError('Please select a size');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/products/from-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: recipe.id,
          name,
          description,
          imageUrl,
          categoryId,
          firstSizeOz, // Size determines container type and price calculation
          isAvailable,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to publish product');
      }

      onPublish();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5DDD3] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">Publish to Store</h3>
              <p className="text-xs text-gray-500">Create a product from: {recipe.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
              placeholder="e.g., Heritage Apple Cinnamon Butter"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] resize-none"
              placeholder="Describe your product..."
            />
          </div>

          {/* First Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Size <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={firstSizeOz}
                onChange={(e) => setFirstSizeOz(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
              >
                <option value={4}>4 oz</option>
                <option value={8}>8 oz</option>
                <option value={16}>16 oz</option>
                <option value={32}>32 oz</option>
              </select>
              <div className="px-4 py-2 bg-[#FDF8F3] border border-[#E5DDD3] rounded-lg text-sm text-gray-600 flex items-center gap-1">
                <Package size={14} />
                {containerType}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Price will be auto-calculated from recipe costs. You can add more sizes in the Shop.
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
                placeholder="https://..."
              />
              <ImagePlus size={18} className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload your image to a service like Unsplash or Cloudinary and paste the URL.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            {showNewCategoryInput ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    className="flex-1 px-3 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateCategory();
                      }
                      if (e.key === 'Escape') {
                        setShowNewCategoryInput(false);
                        setNewCategoryName('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                    className="px-3 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6549] transition-colors disabled:opacity-50"
                  >
                    {creatingCategory ? '...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                    }}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={categoryId}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setShowNewCategoryInput(true);
                    } else {
                      setCategoryId(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
                >
                  <option value="">Select a category...</option>
                  {loadingCategories ? (
                    <option disabled>Loading...</option>
                  ) : (
                    <>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                      <option value="__new__">+ Add New Category...</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAvailable ? 'bg-[#4A7C59]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">
              {isAvailable ? 'Visible in store' : 'Hidden (draft mode)'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DDD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !imageUrl.trim() || !categoryId}
              className="px-6 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6549] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Publish Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

