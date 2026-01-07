'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ImageIcon, Upload, Plus, Trash2, Loader2, Check } from 'lucide-react';

interface RecipeIngredient {
  id: string;
  quantity: number;
  ingredient: {
    id: string;
    name: string;
    unit: string;
    source: string;
  };
}

interface CogsRecipe {
  id: string;
  name: string;
  description: string | null;
  batchYield: number | null;
  batchYieldUnit: string | null;
  ingredients: RecipeIngredient[];
}

interface ProductSize {
  id: string;
  sizeKey: string;
  sizeLabel: string;
  sizeOz: number;
  unitPrice: number;
  quantity: number;
  containerType: string | null;
}

interface ProductFlavor {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  cogsRecipeId?: string | null;
  cogsRecipe?: CogsRecipe | null;
  sizes: ProductSize[];
  category?: {
    id: string;
    name: string;
  };
  // Extra fields from catalog-manager (not used but may be present)
  categoryId?: string;
  fullName?: string;
  totalQuantity?: number;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
  costPerOz?: number;
  costUpdatedAt?: string | null;
}

interface AvailableIngredient {
  id: string;
  name: string;
  unit: string;
  source: string;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  flavor: ProductFlavor | null;
  onSave?: () => void;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  flavor,
  onSave,
}: ProductDetailModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [batchYield, setBatchYield] = useState<number | null>(null);
  const [batchYieldUnit, setBatchYieldUnit] = useState('');
  
  // Available ingredients for adding
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientQty, setNewIngredientQty] = useState('');
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && flavor) {
      setName(flavor.name);
      setDescription(flavor.description || '');
      setImageUrl(flavor.imageUrl || '');
      
      if (flavor.cogsRecipe) {
        setRecipeName(flavor.cogsRecipe.name);
        setIngredients([...flavor.cogsRecipe.ingredients]);
        setBatchYield(flavor.cogsRecipe.batchYield);
        setBatchYieldUnit(flavor.cogsRecipe.batchYieldUnit || '');
      } else {
        setRecipeName('');
        setIngredients([]);
        setBatchYield(null);
        setBatchYieldUnit('');
      }
      
      // Fetch available ingredients
      fetchIngredients();
    }
  }, [isOpen, flavor]);

  const fetchIngredients = async () => {
    try {
      const res = await fetch('/api/admin/cogs/ingredients');
      if (res.ok) {
        const data = await res.json();
        setAvailableIngredients(data);
      }
    } catch (err) {
      console.error('Failed to fetch ingredients:', err);
    }
  };

  // Handle image file selection
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setUploadingImage(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  // Ingredient management
  const updateIngredientQty = (ingredientId: string, newQty: number) => {
    setIngredients(prev => 
      prev.map(ri => 
        ri.ingredient.id === ingredientId 
          ? { ...ri, quantity: newQty }
          : ri
      )
    );
  };

  const removeIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(ri => ri.ingredient.id !== ingredientId));
  };

  const addIngredient = () => {
    if (!newIngredientId || !newIngredientQty) return;
    
    const ingredient = availableIngredients.find(i => i.id === newIngredientId);
    if (!ingredient) return;
    
    // Check if already exists
    if (ingredients.some(ri => ri.ingredient.id === newIngredientId)) {
      alert('Ingredient already added');
      return;
    }
    
    setIngredients(prev => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        quantity: parseFloat(newIngredientQty),
        ingredient: {
          id: ingredient.id,
          name: ingredient.name,
          unit: ingredient.unit,
          source: ingredient.source,
        }
      }
    ]);
    
    setNewIngredientId('');
    setNewIngredientQty('');
    setShowAddIngredient(false);
  };

  // Save all changes
  const handleSave = async () => {
    if (!flavor) return;
    
    setSaving(true);
    try {
      // Save product (flavor) details
      const flavorRes = await fetch(`/api/catalog/flavors/${flavor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          imageUrl: imageUrl || null,
        }),
      });
      
      if (!flavorRes.ok) throw new Error('Failed to save product');
      
      // Save recipe if exists
      if (flavor.cogsRecipeId && flavor.cogsRecipe) {
        const recipeRes = await fetch(`/api/admin/cogs/recipes/${flavor.cogsRecipeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: recipeName,
            batchYield,
            batchYieldUnit: batchYieldUnit || null,
            ingredients: ingredients.map(ri => ({
              ingredientId: ri.ingredient.id,
              quantity: ri.quantity,
            })),
          }),
        });
        
        if (!recipeRes.ok) throw new Error('Failed to save recipe');
      }
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onSave?.();
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !flavor) return null;

  const recipe = flavor.cogsRecipe;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-[#FDF8F3] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E5DDD3]">
          {/* Header */}
          <div className="bg-white border-b border-[#E5DDD3] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#5C4A3D]">
              Product Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Image Upload Area */}
            <div>
              <label className="block text-sm font-bold text-[#5C4A3D] mb-2">
                Product Image
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                  isDragging 
                    ? 'border-[#4A7C59] bg-[#E8F0EA]' 
                    : 'border-[#E5DDD3] hover:border-[#4A7C59] hover:bg-[#FDFCFB]'
                }`}
              >
                {uploadingImage ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loader2 className="animate-spin text-[#4A7C59]" size={32} />
                  </div>
                ) : imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <Upload size={24} className="mx-auto mb-1" />
                        <span className="text-sm">Click or drop to replace</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8B7355]">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">Drop image here or click to upload</span>
                    <span className="text-xs mt-1 opacity-60">JPG, PNG, WebP</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-bold text-[#5C4A3D] mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D]"
                placeholder="e.g., Classic Applesauce"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-[#5C4A3D] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] resize-none"
                placeholder="Tell the story of this product..."
              />
            </div>

            {/* Recipe Section */}
            {recipe && (
              <div className="border-t border-[#E5DDD3] pt-6">
                <h3 className="text-sm font-bold text-[#8B7355] uppercase tracking-wider mb-4">
                  Recipe
                </h3>
                
                {/* Recipe Name */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#8B7355] mb-1">
                    Recipe Name
                  </label>
                  <input
                    type="text"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] text-sm"
                  />
                </div>

                {/* Batch Yield */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1">
                      Batch Yield
                    </label>
                    <input
                      type="number"
                      value={batchYield || ''}
                      onChange={(e) => setBatchYield(e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-3 py-2 bg-white border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] text-sm"
                      placeholder="e.g., 6"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1">
                      Yield Unit
                    </label>
                    <select
                      value={batchYieldUnit}
                      onChange={(e) => setBatchYieldUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] text-sm"
                    >
                      <option value="">Select unit</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="cups">Cups</option>
                      <option value="pints">Pints</option>
                      <option value="quarts">Quarts</option>
                      <option value="gallons">Gallons</option>
                      <option value="jars">Jars</option>
                      <option value="lbs">Pounds (lbs)</option>
                    </select>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-[#8B7355]">
                      Ingredients
                    </label>
                    <button
                      onClick={() => setShowAddIngredient(true)}
                      className="text-xs text-[#4A7C59] hover:text-[#3d6549] flex items-center gap-1"
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-[#E5DDD3] divide-y divide-[#F5F0EB]">
                    {ingredients.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-400">
                        No ingredients yet
                      </div>
                    ) : (
                      ingredients.map((ri) => (
                        <div key={ri.id} className="flex items-center gap-3 p-3">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            ri.ingredient.source === 'GARDEN' 
                              ? 'bg-green-400' 
                              : ri.ingredient.source === 'PACKAGING'
                                ? 'bg-amber-400'
                                : 'bg-blue-400'
                          }`} />
                          <span className="flex-1 text-sm text-[#5C4A3D] truncate">
                            {ri.ingredient.name}
                          </span>
                          <input
                            type="number"
                            value={ri.quantity}
                            onChange={(e) => updateIngredientQty(ri.ingredient.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-[#E5DDD3] rounded-lg text-right"
                            step="0.01"
                          />
                          <span className="text-xs text-[#8B7355] w-12">
                            {ri.ingredient.unit}
                          </span>
                          <button
                            onClick={() => removeIngredient(ri.ingredient.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Ingredient Form */}
                  {showAddIngredient && (
                    <div className="mt-3 p-3 bg-[#F5F0EB] rounded-xl">
                      <div className="flex gap-2">
                        <select
                          value={newIngredientId}
                          onChange={(e) => setNewIngredientId(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-[#E5DDD3] rounded-lg bg-white"
                        >
                          <option value="">Select ingredient...</option>
                          {availableIngredients
                            .filter(i => !ingredients.some(ri => ri.ingredient.id === i.id))
                            .map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.name} ({i.unit})
                              </option>
                            ))}
                        </select>
                        <input
                          type="number"
                          value={newIngredientQty}
                          onChange={(e) => setNewIngredientQty(e.target.value)}
                          placeholder="Qty"
                          className="w-20 px-3 py-2 text-sm border border-[#E5DDD3] rounded-lg"
                          step="0.01"
                        />
                        <button
                          onClick={addIngredient}
                          disabled={!newIngredientId || !newIngredientQty}
                          className="px-3 py-2 bg-[#4A7C59] text-white rounded-lg text-sm disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddIngredient(false);
                            setNewIngredientId('');
                            setNewIngredientQty('');
                          }}
                          className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Recipe Warning */}
            {!recipe && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700">
                  <strong>No recipe linked.</strong> This product was created without a Kitchen recipe.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-white border-t border-[#E5DDD3] px-6 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-[#5C4A3D] bg-white border border-[#E5DDD3] rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saveSuccess}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-colors ${
                saveSuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-[#4A7C59] text-white hover:bg-[#3D6649]'
              } disabled:opacity-70`}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={18} />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
