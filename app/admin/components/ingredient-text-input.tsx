'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Check, AlertCircle, X, Leaf, Package, ShoppingBag, Plus } from 'lucide-react';
import {
  parseAmountAndUnit,
  findMatchingIngredients,
  getSourceIcon,
  formatAmount,
  type ParsedIngredient,
  type IngredientMatch,
} from '@/lib/ingredient-parser';
import type { Ingredient, IngredientSource } from '@/lib/types';

// ============================================
// Types
// ============================================

interface IngredientTextInputProps {
  ingredients: Ingredient[];
  initialLines?: ParsedIngredient[];
  onChange: (parsed: ParsedIngredient[]) => void;
  onCreateIngredient: (name: string, source: IngredientSource) => Promise<Ingredient>;
}

// ============================================
// Component
// ============================================

export default function IngredientTextInput({
  ingredients,
  initialLines = [],
  onChange,
  onCreateIngredient,
}: IngredientTextInputProps) {
  // Recipe ingredients list (already added)
  const [recipeIngredients, setRecipeIngredients] = useState<ParsedIngredient[]>(initialLines);
  
  // Current entry fields
  const [amountValue, setAmountValue] = useState('');
  const [ingredientValue, setIngredientValue] = useState('');
  
  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteMatches, setAutocompleteMatches] = useState<IngredientMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // New ingredient prompt
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const amountRef = useRef<HTMLInputElement>(null);
  const ingredientRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Notify parent when recipe ingredients change
  useEffect(() => {
    onChange(recipeIngredients);
  }, [recipeIngredients, onChange]);

  // ============================================
  // Autocomplete Logic
  // ============================================

  const updateAutocomplete = useCallback((searchText: string) => {
    if (searchText.length < 2) {
      setShowAutocomplete(false);
      setAutocompleteMatches([]);
      return;
    }

    const matches = findMatchingIngredients(searchText, ingredients, 5);
    setAutocompleteMatches(matches);
    setShowAutocomplete(matches.length > 0);
    setSelectedIndex(0);
  }, [ingredients]);

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIngredientValue(value);
    updateAutocomplete(value);
    setShowNewPrompt(false);
  };

  // ============================================
  // Add Ingredient to Recipe
  // ============================================

  const addIngredient = useCallback((matchedIngredient?: Ingredient) => {
    const trimmedIngredient = ingredientValue.trim();
    if (!trimmedIngredient) return;

    // Parse amount and unit from the amount field
    const { amount, unit } = parseAmountAndUnit(amountValue.trim() || '1');
    
    // Find matched ingredient if not provided
    let ingredient = matchedIngredient;
    if (!ingredient) {
      const matches = findMatchingIngredients(trimmedIngredient, ingredients, 1);
      if (matches.length > 0 && matches[0].score >= 80) {
        ingredient = matches[0].ingredient;
      }
    }

    if (ingredient) {
      // Add to recipe
      const newEntry: ParsedIngredient = {
        amount,
        unit,
        name: ingredient.name,
        rawLine: `${amount} ${unit} ${ingredient.name}`,
        matchedIngredient: ingredient,
      };

      setRecipeIngredients(prev => [...prev, newEntry]);
      
      // Clear fields for next entry
      setAmountValue('');
      setIngredientValue('');
      setShowAutocomplete(false);
      
      // Focus back to amount field
      amountRef.current?.focus();
    } else {
      // Ingredient not found - show new ingredient prompt
      setShowNewPrompt(true);
    }
  }, [amountValue, ingredientValue, ingredients]);

  const selectAutocomplete = (match: IngredientMatch) => {
    setIngredientValue(match.ingredient.name);
    setShowAutocomplete(false);
    addIngredient(match.ingredient);
  };

  // ============================================
  // New Ingredient Creation
  // ============================================

  const handleCreateIngredient = async (source: IngredientSource) => {
    const trimmedName = ingredientValue.trim();
    if (!trimmedName) return;

    setIsCreating(true);
    try {
      const newIngredient = await onCreateIngredient(trimmedName, source);
      
      // Add to recipe with the new ingredient
      const { amount, unit } = parseAmountAndUnit(amountValue.trim() || '1');
      const newEntry: ParsedIngredient = {
        amount,
        unit,
        name: newIngredient.name,
        rawLine: `${amount} ${unit} ${newIngredient.name}`,
        matchedIngredient: newIngredient,
      };

      setRecipeIngredients(prev => [...prev, newEntry]);
      
      // Clear fields
      setAmountValue('');
      setIngredientValue('');
      setShowNewPrompt(false);
      
      // Focus back to amount field
      amountRef.current?.focus();
    } catch (error) {
      console.error('Failed to create ingredient:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // ============================================
  // Remove Ingredient
  // ============================================

  const removeIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================
  // Keyboard Navigation
  // ============================================

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      ingredientRef.current?.focus();
    }
  };

  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, autocompleteMatches.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (autocompleteMatches.length > 0) {
          selectAutocomplete(autocompleteMatches[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        Ingredients <span className="font-normal text-gray-400">(for the whole batch)</span>
      </label>

      {/* Entry Fields */}
      <div className="flex gap-2 items-start">
        {/* Amount Field */}
        <div className="w-32 flex-shrink-0">
          <input
            ref={amountRef}
            type="text"
            value={amountValue}
            onChange={(e) => setAmountValue(e.target.value)}
            onKeyDown={handleAmountKeyDown}
            placeholder="2 cups"
            className="w-full px-3 py-2 border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">Amount</p>
        </div>

        {/* Ingredient Field with Autocomplete */}
        <div className="flex-1 relative">
          <div className="flex gap-2">
            <input
              ref={ingredientRef}
              type="text"
              value={ingredientValue}
              onChange={handleIngredientChange}
              onKeyDown={handleIngredientKeyDown}
              onBlur={() => {
                // Delay to allow click on autocomplete
                setTimeout(() => setShowAutocomplete(false), 150);
              }}
              placeholder="sugar, apples, cinnamon..."
              className="flex-1 px-3 py-2 border border-[#E5DDD3] rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={() => addIngredient()}
              disabled={!ingredientValue.trim()}
              className="px-3 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3d6b4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">Ingredient (press Enter to add)</p>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && autocompleteMatches.length > 0 && (
            <div
              ref={autocompleteRef}
              className="absolute z-20 left-0 right-12 mt-1 bg-white border border-[#E5DDD3] rounded-lg shadow-lg overflow-hidden"
            >
              {autocompleteMatches.map((match, idx) => (
                <button
                  key={match.ingredient.id}
                  type="button"
                  onClick={() => selectAutocomplete(match)}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                    idx === selectedIndex 
                      ? 'bg-[#E8F0EA] text-[#4A7C59]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{getSourceIcon(match.ingredient.source)}</span>
                  <span>{match.ingredient.name}</span>
                  {match.score === 100 && (
                    <Check size={14} className="ml-auto text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* New Ingredient Prompt */}
          {showNewPrompt && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-[#FDF8F3] border border-[#E5DDD3] rounded-lg shadow-lg p-3">
              <p className="text-sm text-[#5C4A3D] mb-3">
                <span className="font-medium">&quot;{ingredientValue}&quot;</span> is new — what&apos;s the source?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateIngredient('GARDEN')}
                  disabled={isCreating}
                  className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Leaf size={16} />
                  Garden
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateIngredient('PANTRY')}
                  disabled={isCreating}
                  className="flex-1 px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag size={16} />
                  Pantry
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateIngredient('PACKAGING')}
                  disabled={isCreating}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Package size={16} />
                  Packaging
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPrompt(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Enter amount (like <code className="bg-gray-100 px-1 rounded">2 cups</code> or <code className="bg-gray-100 px-1 rounded">6</code>) then ingredient name. Press Enter to add.
      </p>

      {/* Recipe Ingredients List - Cookbook Style */}
      {recipeIngredients.length > 0 && (
        <div className="border border-[#E5DDD3] rounded-lg overflow-hidden bg-white">
          <div className="bg-[#FDF8F3] px-4 py-2 border-b border-[#E5DDD3]">
            <span className="text-sm font-semibold text-[#5C4A3D]">
              Recipe Ingredients ({recipeIngredients.length})
            </span>
          </div>
          <ul className="divide-y divide-[#E5DDD3]/50">
            {recipeIngredients.map((item, index) => (
              <li 
                key={index}
                className="flex items-center gap-4 px-4 py-3 hover:bg-[#FDF8F3]/50 group"
              >
                {/* Amount - Right aligned, cookbook style */}
                <span className="w-16 text-right font-medium text-[#5C4A3D] text-base tabular-nums">
                  {formatAmount(item.amount)}
                </span>
                
                {/* Unit - Abbreviated, muted */}
                <span className="w-12 text-sm text-gray-500">
                  {item.unit}
                </span>
                
                {/* Ingredient Name - Primary text */}
                <span className="flex-1 text-[#5C4A3D] font-medium">
                  {item.matchedIngredient?.name || item.name}
                </span>
                
                {/* Source Icon */}
                {item.matchedIngredient && (
                  <span className="text-sm opacity-60">
                    {getSourceIcon(item.matchedIngredient.source)}
                  </span>
                )}
                
                {/* Remove Button - Shows on hover */}
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
