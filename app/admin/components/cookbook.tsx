'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCommonPurchaseUnits } from '@/lib/unit-conversions';
import { 
  BookOpen,
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown,
  ChevronUp,
  Leaf,
  Package,
  X,
  Save,
  ShoppingBag,
  ImagePlus,
  ArrowRight,
  ExternalLink,
  Beaker,
  Tag,
  PackageCheck,
  PackageX
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
}

type CookbookTab = 'ideas' | 'ready' | 'published';

// Calculate costs for a recipe
function calculateRecipeCosts(recipe: Recipe) {
  const ingredientsCost = recipe.ingredients.reduce((sum, ri) => {
    // Garden ingredients are "free" - they come from the garden!
    const cost = ri.ingredient.source === 'GARDEN' ? 0 : ri.ingredient.unitCost * ri.quantity;
    return sum + cost;
  }, 0);
  
  const totalCost = ingredientsCost + recipe.containerCost + recipe.labelCost + recipe.energyCost;
  const profit = recipe.retailPrice - totalCost;
  const margin = recipe.retailPrice > 0 ? (profit / recipe.retailPrice) * 100 : 0;
  
  return { ingredientsCost, totalCost, profit, margin };
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Get margin styling based on percentage
function getMarginStyle(margin: number): { color: string; bg: string; label: string } {
  if (margin >= 80) return { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Excellent' };
  if (margin >= 60) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Good' };
  if (margin >= 40) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'OK' };
  return { color: 'text-red-600', bg: 'bg-red-50', label: 'Review' };
}

export default function Cookbook() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CookbookTab>('ideas');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [batchSizes, setBatchSizes] = useState<Record<string, number>>({});
  const [showIngredients, setShowIngredients] = useState(false);
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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productEdits, setProductEdits] = useState<{
    name: string;
    description: string;
    imageUrl: string;
    category: string;
  }>({ name: '', description: '', imageUrl: '', category: '' });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

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

  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {};
    ingredients.forEach(ing => {
      const cat = ing.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ing);
    });
    return groups;
  }, [ingredients]);

  // Count recipes by status
  const recipeCounts = useMemo(() => {
    const counts = { ideas: 0, ready: 0, published: 0 };
    recipes.forEach(r => {
      const status = r.status || 'IDEA';
      if (status === 'IDEA') counts.ideas++;
      else if (status === 'READY') counts.ready++;
      else if (status === 'PUBLISHED') counts.published++;
    });
    return counts;
  }, [recipes]);

  // Filter and sort recipes by active tab
  const filteredRecipes = useMemo(() => {
    const statusMap: Record<CookbookTab, RecipeStatus> = {
      ideas: 'IDEA',
      ready: 'READY', 
      published: 'PUBLISHED'
    };
    const targetStatus = statusMap[activeTab];
    
    return recipes
      .filter(r => (r.status || 'IDEA') === targetStatus)
      .sort((a, b) => {
        const marginA = calculateRecipeCosts(a).margin;
        const marginB = calculateRecipeCosts(b).margin;
        return marginB - marginA;
      });
  }, [recipes, activeTab]);

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

  // Tab configuration
  const tabs: { id: CookbookTab; label: string; count: number }[] = [
    { id: 'ideas', label: '💡 Ideas', count: recipeCounts.ideas },
    { id: 'ready', label: '✨ Ready', count: recipeCounts.ready },
    { id: 'published', label: '🏪 Selling', count: recipeCounts.published },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5C4A3D] flex items-center gap-2">
            <BookOpen size={24} className="text-[#4A7C59]" />
            Cookbook
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Your recipes, from idea to shelf
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="px-4 py-2 text-sm font-medium text-[#5C4A3D] bg-white border border-[#E5DDD3] rounded-lg hover:bg-[#FDF8F3] transition-colors"
          >
            {showIngredients ? 'Hide' : 'Show'} Ingredients
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4A7C59] rounded-lg hover:bg-[#3d6549] transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Idea
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#E5DDD3]">
        <nav className="flex gap-8" aria-label="Cookbook tabs">
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
      </div>

      {/* Ingredients Panel */}
      {showIngredients && (
        <div className="bg-white rounded-xl border border-[#E5DDD3] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-[#5C4A3D]">Ingredient Library</h3>
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-400">Click to edit</p>
              <button
                onClick={() => setIsAddingIngredient(true)}
                className="px-3 py-1.5 text-sm font-medium text-[#4A7C59] border border-[#4A7C59] rounded-lg hover:bg-[#E8F0EA] transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(groupedIngredients).map(([category, ings]) => (
              <div key={category}>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {category === 'Garden' ? 'Produce' : category}
                </h4>
                <ul className="space-y-0.5">
                  {ings.map(ing => (
                    <li key={ing.id} className="text-sm">
{editingIngredient === ing.id ? (
                                        /* Editing Mode */
                                        <div className="bg-[#FDF8F3] p-3 rounded-lg -mx-2 space-y-3">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-[#5C4A3D]">
                                              {ing.name}
                                            </span>
                                            <div className="flex gap-1">
                                              <button
                                                onClick={() => handleSaveIngredient(ing.id)}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                title="Save"
                                              >
                                                <Save size={14} />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteIngredient(ing.id)}
                                                className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                                                title="Delete"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                              <button
                                                onClick={() => setEditingIngredient(null)}
                                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
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
                                                  className="w-14 px-1.5 py-1 border border-[#E5DDD3] rounded text-sm text-center"
                                                />
                                                <select
                                                  value={editValues.purchaseUnit || ''}
                                                  onChange={(e) => setEditValues({ ...editValues, purchaseUnit: e.target.value || null })}
                                                  className="w-16 px-1 py-1 border border-[#E5DDD3] rounded text-sm bg-white"
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
                                                  className="w-14 px-1.5 py-1 border border-[#E5DDD3] rounded text-sm text-right"
                                                />
                                              </div>
                                              {editValues.purchaseSize && editValues.purchaseUnit && editValues.purchaseCost && (
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                  {editValues.purchaseSize} {editValues.purchaseUnit} for ${editValues.purchaseCost.toFixed(2)}
                                                </p>
                                              )}
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
                                                  className="w-16 px-1.5 py-1 border border-[#E5DDD3] rounded text-sm text-right"
                                                  autoFocus
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        /* Display Mode - Just name, click to edit */
                                        <div 
                                          className="cursor-pointer hover:bg-[#FDF8F3] rounded px-2 py-1 -mx-2 transition-colors text-[#5C4A3D] hover:text-[#4A7C59]"
                                          onClick={() => startEditingIngredient(ing)}
                                        >
                                          {ing.name}
                                        </div>
                                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Cards */}
      <div className="space-y-4">
        {filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5DDD3] p-12 text-center">
            {activeTab === 'ideas' ? (
              <>
                <Beaker size={48} className="mx-auto text-[#E5DDD3] mb-4" />
                <p className="text-lg font-serif text-[#5C4A3D]">No recipe ideas yet</p>
                <p className="text-sm text-gray-500 mt-1">Start experimenting! Create your first recipe to calculate costs.</p>
              </>
            ) : activeTab === 'ready' ? (
              <>
                <ArrowRight size={48} className="mx-auto text-[#E5DDD3] mb-4" />
                <p className="text-lg font-serif text-[#5C4A3D]">Nothing ready to share yet</p>
                <p className="text-sm text-gray-500 mt-1">When your recipe ideas are perfected, move them here for final polish.</p>
              </>
            ) : (
              <>
                <ShoppingBag size={48} className="mx-auto text-[#E5DDD3] mb-4" />
                <p className="text-lg font-serif text-[#5C4A3D]">Nothing on the shelf yet</p>
                <p className="text-sm text-gray-500 mt-1">Published recipes will appear here once they&apos;re live in your store.</p>
              </>
            )}
          </div>
        ) : (
          filteredRecipes.map(recipe => {
            const costs = calculateRecipeCosts(recipe);
            const isExpanded = expandedRecipe === recipe.id;
            const batchSize = batchSizes[recipe.id] || 1;

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Recipe Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                        <Package size={20} />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-[#5C4A3D]">{recipe.name}</h3>
                        <p className="text-xs text-gray-500">{recipe.containerType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {/* Quick Stats */}
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase">Cost</p>
                          <p className="font-bold text-[#5C4A3D]">{formatCurrency(costs.totalCost)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase">Price</p>
                          <p className="font-bold text-[#5C4A3D]">{formatCurrency(recipe.retailPrice)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase">💰 Profit</p>
                          <p className="font-bold text-[#4A7C59]">{formatCurrency(costs.profit)}</p>
                        </div>
                        <div className={`text-center px-3 py-1 rounded-lg ${getMarginStyle(costs.margin).bg}`}>
                          <p className="text-xs text-gray-400 uppercase">Margin</p>
                          <p className={`font-bold ${getMarginStyle(costs.margin).color}`}>
                            {costs.margin.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#E5DDD3] p-4 bg-[#FDF8F3]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Ingredients Breakdown */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                          Ingredients
                        </h4>
                        <ul className="space-y-2">
                          {recipe.ingredients.map(ri => {
                            const cost = ri.ingredient.source === 'GARDEN' ? 0 : ri.ingredient.unitCost * ri.quantity;
                            return (
                              <li key={ri.id} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  {ri.ingredient.source === 'GARDEN' && <span>🌱</span>}
                                  {ri.ingredient.source === 'PACKAGING' && <span>📦</span>}
                                  {ri.quantity} {ri.ingredient.unit} {ri.ingredient.name}
                                </span>
                                <span className={ri.ingredient.source === 'GARDEN' ? 'text-green-600' : 'text-gray-600'}>
                                  {ri.ingredient.source === 'GARDEN' ? '🌱' : formatCurrency(cost)}
                                </span>
                              </li>
                            );
                          })}
                          <li className="flex items-center justify-between text-sm pt-2 border-t border-[#E5DDD3]">
                            <span>Container ({recipe.containerType})</span>
                            <span className="text-gray-600">{formatCurrency(recipe.containerCost)}</span>
                          </li>
                          <li className="flex items-center justify-between text-sm">
                            <span>Label</span>
                            <span className="text-gray-600">{formatCurrency(recipe.labelCost)}</span>
                          </li>
                          <li className="flex items-center justify-between text-sm">
                            <span>Energy/Water</span>
                            <span className="text-gray-600">{formatCurrency(recipe.energyCost)}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Profit Calculator */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                          Batch Calculator
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-[#E5DDD3]">
                          <div className="flex items-center gap-3 mb-4">
                            <label className="text-sm text-gray-600">How many jars?</label>
                            <input
                              type="number"
                              min="1"
                              value={batchSize}
                              onChange={(e) => setBatchSizes({ ...batchSizes, [recipe.id]: parseInt(e.target.value) || 1 })}
                              className="w-20 px-3 py-1 border border-[#E5DDD3] rounded-lg text-center font-bold"
                            />
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Cost:</span>
                              <span className="font-bold">{formatCurrency(costs.totalCost * batchSize)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Revenue @ {formatCurrency(recipe.retailPrice)}:</span>
                              <span className="font-bold">{formatCurrency(recipe.retailPrice * batchSize)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-[#E5DDD3]">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Leaf size={14} className="text-green-500" />
                                Profit for Donation:
                              </span>
                              <span className="font-bold text-green-600 text-lg">
                                {formatCurrency(costs.profit * batchSize)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {recipe.notes && (
                          <p className="text-xs text-gray-500 mt-3 italic">{recipe.notes}</p>
                        )}
                      </div>
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
                            Back to Ideas
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
                      
                      {activeTab === 'published' && recipe.product && (
                        <div className="space-y-4">
                          {/* Product Controls Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* In Stock Toggle */}
                              <button
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/products/${recipe.product!.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ isAvailable: !recipe.product!.isAvailable })
                                    });
                                    await fetchData();
                                  } catch (e) {
                                    console.error('Failed to toggle availability:', e);
                                  }
                                }}
                                className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 font-medium ${
                                  recipe.product.isAvailable 
                                    ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200' 
                                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200'
                                }`}
                              >
                                {recipe.product.isAvailable ? <PackageCheck size={16} /> : <PackageX size={16} />}
                                {recipe.product.isAvailable ? 'In Stock' : 'Out of Stock'}
                              </button>
                              <a
                                href="/shop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 text-sm text-[#5C4A3D] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <ExternalLink size={14} />
                                View in Shop
                              </a>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingRecipe(recipe)}
                                className="px-3 py-1.5 text-sm text-[#5C4A3D] hover:bg-white rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Edit3 size={14} />
                                Edit Recipe
                              </button>
                              <button
                                onClick={() => handleMoveRecipe(recipe.id, 'READY')}
                                className="px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1"
                              >
                                Remove from Shelf
                              </button>
                            </div>
                          </div>
                          
                          {/* Product Details Section */}
                          <div className="border-t border-[#E5DDD3] pt-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <ShoppingBag size={14} />
                              Product Details
                            </h4>
                            
                            {editingProductId === recipe.product.id ? (
                              /* Edit Mode */
                              <div className="space-y-4 bg-white rounded-lg p-4 border border-[#E5DDD3]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                                    <input
                                      type="text"
                                      value={productEdits.name}
                                      onChange={(e) => setProductEdits({ ...productEdits, name: e.target.value })}
                                      className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                                    <select
                                      value={productEdits.category}
                                      onChange={(e) => setProductEdits({ ...productEdits, category: e.target.value })}
                                      className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg text-sm bg-white"
                                    >
                                      <option value="">No category</option>
                                      <option value="Applesauces">Applesauces</option>
                                      <option value="Spreads">Spreads</option>
                                      <option value="Dried Goods">Dried Goods</option>
                                      <option value="Jams">Jams</option>
                                      <option value="Pickled Goods">Pickled Goods</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                  <textarea
                                    value={productEdits.description}
                                    onChange={(e) => setProductEdits({ ...productEdits, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                                  <input
                                    type="text"
                                    value={productEdits.imageUrl}
                                    onChange={(e) => setProductEdits({ ...productEdits, imageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg text-sm"
                                    placeholder="https://..."
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingProductId(null)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await fetch(`/api/products/${recipe.product!.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify(productEdits)
                                        });
                                        await fetchData();
                                        setEditingProductId(null);
                                      } catch (e) {
                                        console.error('Failed to update product:', e);
                                      }
                                    }}
                                    className="px-4 py-2 text-sm bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6549] flex items-center gap-2"
                                  >
                                    <Save size={14} />
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <div className="bg-white rounded-lg p-4 border border-[#E5DDD3]">
                                <div className="flex gap-4">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                                      <img 
                                        src={recipe.product.imageUrl} 
                                        alt={recipe.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h5 className="font-medium text-[#5C4A3D]">{recipe.product.name}</h5>
                                        {recipe.product.category && (
                                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Tag size={10} />
                                            {recipe.product.category}
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => {
                                          setEditingProductId(recipe.product!.id);
                                          setProductEdits({
                                            name: recipe.product!.name,
                                            description: recipe.product!.description || '',
                                            imageUrl: recipe.product!.imageUrl,
                                            category: recipe.product!.category || ''
                                          });
                                        }}
                                        className="text-sm text-[#4A7C59] hover:text-[#3d6549] flex items-center gap-1"
                                      >
                                        <Edit3 size={12} />
                                        Edit
                                      </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                      {recipe.product.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
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
  const [recipeIngredients, setRecipeIngredients] = useState<{ ingredientId: string; quantity: number }[]>(
    recipe?.ingredients.map(ri => ({ ingredientId: ri.ingredientId, quantity: ri.quantity })) || []
  );

  const containerPresets: Record<string, number> = {
    'Quart Jar': 1.30,
    'Pint Jar': 1.25,
    '8oz Jar': 1.00,
    '4oz Jar': 0.75,
    '4oz Bag': 0.30,
    '16oz Bottle': 0.75,
  };

  // Calculate live preview
  const previewCosts = useMemo(() => {
    const ingredientsCost = recipeIngredients.reduce((sum, ri) => {
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      if (!ing || ing.source === 'GARDEN') return sum;
      return sum + (ing.unitCost * ri.quantity);
    }, 0);
    
    const totalCost = ingredientsCost + containerCost + labelCost + energyCost;
    const profit = retailPrice - totalCost;
    const margin = retailPrice > 0 ? (profit / retailPrice) * 100 : 0;
    
    return { ingredientsCost, totalCost, profit, margin };
  }, [recipeIngredients, ingredients, containerCost, labelCost, energyCost, retailPrice]);

  const addIngredient = () => {
    if (ingredients.length > 0) {
      setRecipeIngredients([...recipeIngredients, { ingredientId: ingredients[0].id, quantity: 1 }]);
    }
  };

  const updateIngredient = (index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
    const updated = [...recipeIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

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
      ingredients: recipeIngredients
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5DDD3] p-4 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#5C4A3D]">
            {recipe ? 'Edit Recipe' : 'New Recipe'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
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
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                placeholder="Optional description"
              />
            </div>
          </div>

          {/* Container & Costs */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Packaging & Overhead</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Container Type</label>
                <select
                  value={containerType}
                  onChange={(e) => {
                    setContainerType(e.target.value);
                    if (containerPresets[e.target.value]) {
                      setContainerCost(containerPresets[e.target.value]);
                    }
                  }}
                  className="w-full px-2 py-2 border border-[#E5DDD3] rounded-lg text-sm"
                >
                  {Object.keys(containerPresets).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Container Cost</label>
                <div className="relative">
                  <span className="absolute left-2 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={containerCost}
                    onChange={(e) => setContainerCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-2 border border-[#E5DDD3] rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Label Cost</label>
                <div className="relative">
                  <span className="absolute left-2 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={labelCost}
                    onChange={(e) => setLabelCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-2 border border-[#E5DDD3] rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Energy/Water</label>
                <div className="relative">
                  <span className="absolute left-2 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={energyCost}
                    onChange={(e) => setEnergyCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-2 border border-[#E5DDD3] rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700">Ingredients</h4>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm text-[#4A7C59] hover:underline flex items-center gap-1"
              >
                <Plus size={14} />
                Add Ingredient
              </button>
            </div>
            <div className="space-y-2">
              {recipeIngredients.map((ri, index) => {
                const ing = ingredients.find(i => i.id === ri.ingredientId);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ri.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-2 border border-[#E5DDD3] rounded-lg text-sm text-center"
                    />
                    <select
                      value={ri.ingredientId}
                      onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                      className="flex-1 px-2 py-2 border border-[#E5DDD3] rounded-lg text-sm"
                    >
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>
                          {ing.source === 'GARDEN' ? '🌱 ' : ing.source === 'PACKAGING' ? '📦 ' : ''}{ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                    <span className="w-16 text-right text-sm text-gray-500">
                      {ing?.source === 'GARDEN' ? (
                        <span className="text-green-600">🌱</span>
                      ) : (
                        formatCurrency((ing?.unitCost || 0) * ri.quantity)
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                );
              })}
              {recipeIngredients.length === 0 && (
                <p className="text-sm text-gray-400 italic py-2">No ingredients added yet</p>
              )}
            </div>
          </div>

          {/* Retail Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Retail Price</label>
            <div className="relative w-32">
              <span className="absolute left-3 top-2.5 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={retailPrice}
                onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-[#E5DDD3] rounded-lg font-bold text-lg"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-sm"
              placeholder="Optional notes about this recipe..."
            />
          </div>

          {/* Live Preview */}
          <div className="bg-[#E8F0EA] rounded-xl p-4">
            <h4 className="text-xs font-bold text-[#4A7C59] uppercase tracking-wider mb-3">
              Cost Preview
            </h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Ingredients</p>
                <p className="font-bold text-[#5C4A3D]">{formatCurrency(previewCosts.ingredientsCost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Cost</p>
                <p className="font-bold text-[#5C4A3D]">{formatCurrency(previewCosts.totalCost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Profit</p>
                <p className="font-bold text-green-600">{formatCurrency(previewCosts.profit)}</p>
              </div>
              <div className={`px-2 py-1 rounded ${getMarginStyle(previewCosts.margin).bg}`}>
                <p className="text-xs text-gray-500">Margin</p>
                <p className={`font-bold ${getMarginStyle(previewCosts.margin).color}`}>
                  {previewCosts.margin.toFixed(0)}%
                </p>
              </div>
            </div>
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
              {recipe ? 'Save Changes' : 'Create Recipe'}
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

function AddIngredientModal({ onClose, onSave }: AddIngredientModalProps) {
  const [name, setName] = useState('');
  const [unitCost, setUnitCost] = useState(0);
  const [unit, setUnit] = useState('cup');
  const [source, setSource] = useState<IngredientSource>('PANTRY');
  const [category, setCategory] = useState('Pantry');
  // Purchase tracking
  const [purchaseSize, setPurchaseSize] = useState<number | null>(null);
  const [purchaseUnit, setPurchaseUnit] = useState<string | null>(null);
  const [purchaseCost, setPurchaseCost] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      unitCost: source === 'GARDEN' ? 0 : unitCost,
      unit,
      source,
      category,
      purchaseSize: source === 'PANTRY' ? purchaseSize : null,
      purchaseUnit: source === 'PANTRY' ? purchaseUnit : null,
      purchaseCost: source === 'PANTRY' ? purchaseCost : null,
    });
  };

  // Sync category with source
  const handleSourceChange = (newSource: IngredientSource) => {
    setSource(newSource);
    if (newSource === 'GARDEN') setCategory('Produce');
    else if (newSource === 'PACKAGING') setCategory('Packaging');
    else setCategory('Pantry');
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

          {/* Source Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Where does this come from?</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSourceChange('PANTRY')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  source === 'PANTRY' 
                    ? 'border-[#4A7C59] bg-[#E8F0EA]' 
                    : 'border-[#E5DDD3] hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">Pantry</div>
                <div className="text-[10px] text-gray-500">Store-bought</div>
              </button>
              <button
                type="button"
                onClick={() => handleSourceChange('GARDEN')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  source === 'GARDEN' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-[#E5DDD3] hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">Produce</div>
                <div className="text-[10px] text-gray-500">Homegrown</div>
              </button>
              <button
                type="button"
                onClick={() => handleSourceChange('PACKAGING')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  source === 'PACKAGING' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-[#E5DDD3] hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">Packaging</div>
                <div className="text-[10px] text-gray-500">Jars, lids, etc.</div>
              </button>
            </div>
          </div>

          {/* Cost and Unit - different UI per source */}
          {source === 'PANTRY' && (
            <div className="bg-[#FDF8F3] rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                What you buy at the store
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

          {source === 'GARDEN' && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
              🌱 Produce from the garden has no cost — it&apos;s homegrown!
            </p>
          )}

          {source === 'PACKAGING' && (
            <div className="bg-[#FDF8F3] rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost per item</label>
              <div className="relative w-32">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 border border-[#E5DDD3] rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {name && (
            <div className="bg-[#FDF8F3] rounded-lg p-3 text-center">
              <span className="text-sm text-[#5C4A3D] font-medium">{name}</span>
              <span className="text-xs text-gray-400 ml-2">
                {source === 'GARDEN' ? '(Produce)' : source === 'PACKAGING' ? '(Packaging)' : '(Pantry)'}
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
  const [price, setPrice] = useState(recipe.retailPrice);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const costs = calculateRecipeCosts(recipe);
  const estimatedProfit = price - costs.totalCost;
  const estimatedMargin = price > 0 ? (estimatedProfit / price) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          price, // Will be converted to cents by API
          imageUrl,
          category: category || null,
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

  const categories = ['Applesauces', 'Spreads', 'Dried Goods', 'Jams', 'Pickled Goods', 'Other'];

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
          {/* Cost Summary */}
          <div className="bg-[#FDF8F3] rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cost Analysis</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Production Cost</span>
              <span className="font-medium">{formatCurrency(costs.totalCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Retail Price</span>
              <span className="font-bold text-[#4A7C59]">{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#E5DDD3] pt-2">
              <span className="text-gray-600">Estimated Profit</span>
              <span className={`font-bold ${estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(estimatedProfit)} ({estimatedMargin.toFixed(0)}%)
              </span>
            </div>
          </div>

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

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full pl-7 pr-3 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suggested based on recipe retail price. Synced initially, can be adjusted independently later.
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/20 focus:border-[#4A7C59]"
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
              disabled={isSubmitting || !name.trim() || !imageUrl.trim()}
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

