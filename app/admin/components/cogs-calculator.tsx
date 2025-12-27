'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown,
  ChevronUp,
  Leaf,
  Package,
  DollarSign,
  Percent,
  X,
  Save,
  Sparkles
} from 'lucide-react';

// Types
interface Ingredient {
  id: string;
  name: string;
  unitCost: number;
  unit: string;
  isFromGarden: boolean;
  category: string | null;
  notes: string | null;
}

interface RecipeIngredient {
  id: string;
  ingredientId: string;
  quantity: number;
  ingredient: Ingredient;
}

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
  ingredients: RecipeIngredient[];
}

// Calculate costs for a recipe
function calculateRecipeCosts(recipe: Recipe) {
  const ingredientsCost = recipe.ingredients.reduce((sum, ri) => {
    const cost = ri.ingredient.isFromGarden ? 0 : ri.ingredient.unitCost * ri.quantity;
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

export default function CogsCalculator() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [batchSizes, setBatchSizes] = useState<Record<string, number>>({});
  const [showIngredients, setShowIngredients] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ unitCost: number; unit: string }>({ unitCost: 0, unit: '' });
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);

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

  // Sort recipes by margin
  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => {
      const marginA = calculateRecipeCosts(a).margin;
      const marginB = calculateRecipeCosts(b).margin;
      return marginB - marginA;
    });
  }, [recipes]);

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
    setEditValues({ unitCost: ing.unitCost, unit: ing.unit });
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
    isFromGarden: boolean;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#5C4A3D] flex items-center gap-2">
            <Calculator size={24} className="text-[#4A7C59]" />
            Recipe Costing
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            See what it costs to make each product and how much you&apos;ll earn
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
            New Recipe
          </button>
        </div>
      </div>

      {/* Ingredients Panel */}
      {showIngredients && (
        <div className="bg-white rounded-xl border border-[#E5DDD3] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-[#5C4A3D]">Ingredient Library</h3>
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-400">Click any ingredient to edit</p>
              <button
                onClick={() => setIsAddingIngredient(true)}
                className="px-3 py-1.5 text-sm font-medium text-[#4A7C59] border border-[#4A7C59] rounded-lg hover:bg-[#E8F0EA] transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                Add Ingredient
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(groupedIngredients).map(([category, ings]) => (
              <div key={category}>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {category}
                </h4>
                <ul className="space-y-1">
                  {ings.map(ing => (
                    <li key={ing.id} className="text-sm py-1">
                      {editingIngredient === ing.id ? (
                        /* Editing Mode */
                        <div className="flex items-center gap-2 bg-[#FDF8F3] p-2 rounded-lg -mx-2">
                          <span className="flex items-center gap-1 flex-1 min-w-0">
                            {ing.isFromGarden && <Leaf size={14} className="text-green-500 flex-shrink-0" />}
                            <span className="truncate">{ing.name}</span>
                          </span>
                          {ing.isFromGarden ? (
                            /* Garden item - just edit unit */
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400 text-xs">per</span>
                              <input
                                type="text"
                                value={editValues.unit}
                                onChange={(e) => setEditValues({ ...editValues, unit: e.target.value })}
                                className="w-14 px-1 py-0.5 border border-[#E5DDD3] rounded text-sm"
                                autoFocus
                              />
                            </div>
                          ) : (
                            /* Purchased item - edit cost and unit */
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editValues.unitCost}
                                onChange={(e) => setEditValues({ ...editValues, unitCost: parseFloat(e.target.value) || 0 })}
                                className="w-16 px-1 py-0.5 border border-[#E5DDD3] rounded text-sm text-right"
                                autoFocus
                              />
                              <span className="text-gray-400">/</span>
                              <input
                                type="text"
                                value={editValues.unit}
                                onChange={(e) => setEditValues({ ...editValues, unit: e.target.value })}
                                className="w-14 px-1 py-0.5 border border-[#E5DDD3] rounded text-sm"
                              />
                            </div>
                          )}
                          <button
                            onClick={() => handleSaveIngredient(ing.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Save"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteIngredient(ing.id)}
                            className="p-1 text-red-400 hover:bg-red-50 rounded"
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
                      ) : (
                        /* Display Mode */
                        <div 
                          className="flex items-center justify-between cursor-pointer hover:bg-[#FDF8F3] rounded-lg px-2 py-1 -mx-2 transition-colors group"
                          onClick={() => startEditingIngredient(ing)}
                        >
                          <span className="flex items-center gap-2">
                            {ing.isFromGarden && <Leaf size={14} className="text-green-500" />}
                            {ing.name}
                          </span>
                          <span className="flex items-center gap-1">
                            {ing.isFromGarden ? (
                              <>
                                <span className="text-gray-400 text-sm">per {ing.unit}</span>
                                <Edit3 size={12} className="text-gray-300 group-hover:text-[#4A7C59] transition-colors" />
                              </>
                            ) : (
                              <>
                                <span className="text-gray-500">{formatCurrency(ing.unitCost)}/{ing.unit}</span>
                                <Edit3 size={12} className="text-gray-300 group-hover:text-[#4A7C59] transition-colors" />
                              </>
                            )}
                          </span>
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
        {sortedRecipes.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5DDD3] p-12 text-center">
            <Sparkles size={48} className="mx-auto text-[#E5DDD3] mb-4" />
            <p className="text-lg font-serif text-[#5C4A3D]">No recipes yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first recipe to start calculating costs!</p>
          </div>
        ) : (
          sortedRecipes.map(recipe => {
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
                          <p className="text-xs text-gray-400 uppercase">You Earn</p>
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
                            const cost = ri.ingredient.isFromGarden ? 0 : ri.ingredient.unitCost * ri.quantity;
                            return (
                              <li key={ri.id} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  {ri.ingredient.isFromGarden && <Leaf size={12} className="text-green-500" />}
                                  {ri.quantity} {ri.ingredient.unit} {ri.ingredient.name}
                                </span>
                                <span className={ri.ingredient.isFromGarden ? 'text-green-600' : 'text-gray-600'}>
                                  {ri.ingredient.isFromGarden ? '🌱' : formatCurrency(cost)}
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

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#E5DDD3]">
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
      if (!ing || ing.isFromGarden) return sum;
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
                          {ing.isFromGarden ? '🏡 ' : ''}{ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                    <span className="w-16 text-right text-sm text-gray-500">
                      {ing?.isFromGarden ? (
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
    isFromGarden: boolean;
    category: string;
  }) => void;
}

function AddIngredientModal({ onClose, onSave }: AddIngredientModalProps) {
  const [name, setName] = useState('');
  const [unitCost, setUnitCost] = useState(0);
  const [unit, setUnit] = useState('cup');
  const [isFromGarden, setIsFromGarden] = useState(false);
  const [category, setCategory] = useState('Pantry');

  const commonUnits = ['cup', 'tbsp', 'tsp', 'lb', 'oz', 'each', 'bunch', 'clove', 'packet'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      unitCost: isFromGarden ? 0 : unitCost,
      unit,
      isFromGarden,
      category
    });
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

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg"
            >
              <option value="Pantry">Pantry (purchased items)</option>
              <option value="Garden">Garden (homegrown)</option>
              <option value="Packaging">Packaging</option>
            </select>
          </div>

          {/* From Garden Toggle */}
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => setIsFromGarden(!isFromGarden)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isFromGarden ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isFromGarden ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700 flex items-center gap-2">
              <Leaf size={16} className={isFromGarden ? 'text-green-500' : 'text-gray-400'} />
              From the Garden (homegrown)
            </span>
          </div>

          {/* Cost and Unit */}
          {!isFromGarden && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit</label>
                <div className="relative">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg"
                >
                  {commonUnits.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {isFromGarden && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit (for measuring)</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg"
              >
                {commonUnits.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          )}

          {/* Preview */}
          <div className="bg-[#FDF8F3] rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              {isFromGarden && <Leaf size={14} className="text-green-500" />}
              {name || 'Ingredient Name'}
            </span>
            <span className="text-sm font-medium">
              {isFromGarden ? (
                <span className="text-green-600">🌱 per {unit}</span>
              ) : (
                `${formatCurrency(unitCost)}/${unit}`
              )}
            </span>
          </div>

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

