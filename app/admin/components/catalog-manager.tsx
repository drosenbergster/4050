'use client';

import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/format';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Pencil, 
  Package, 
  Loader2,
  Check,
  X,
  Trash2
} from 'lucide-react';

interface ProductSize {
  id: string;
  flavorId: string;
  sizeKey: string;
  sizeLabel: string;
  sizeOz: number;
  unitPrice: number;
  quantity: number;
  isActive: boolean;
}

interface ProductFlavor {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  fullName: string;
  totalQuantity: number;
  minPrice: number;
  maxPrice: number;
  hasStock: boolean;
  sizes: ProductSize[];
  category?: ProductCategory;
}

interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  flavors: ProductFlavor[];
}

interface CatalogData {
  categories: ProductCategory[];
}

export default function CatalogManager() {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedFlavors, setExpandedFlavors] = useState<Set<string>>(new Set());
  
  // Editing states
  const [editingFlavorName, setEditingFlavorName] = useState<string | null>(null);
  const [tempFlavorName, setTempFlavorName] = useState('');
  const [editingFlavorDesc, setEditingFlavorDesc] = useState<string | null>(null);
  const [tempDescription, setTempDescription] = useState('');
  
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'quantity' | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [quantityMode, setQuantityMode] = useState<'add' | 'set'>('add');
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showAddSize, setShowAddSize] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/catalog');
      if (!res.ok) throw new Error('Failed to fetch catalog');
      const data = await res.json();
      setCatalog(data);
      // Auto-expand all categories
      setExpandedCategories(new Set(data.categories.map((c: ProductCategory) => c.id)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleFlavor = (flavorId: string) => {
    setExpandedFlavors(prev => {
      const next = new Set(prev);
      if (next.has(flavorId)) {
        next.delete(flavorId);
      } else {
        next.add(flavorId);
      }
      return next;
    });
  };

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (quantity <= 5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  // Save description
  const saveDescription = async (flavorId: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/catalog/flavors/${flavorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: tempDescription.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchCatalog();
      showSuccess('Description updated');
    } catch {
      showSuccess('Failed to update');
    } finally {
      setEditingFlavorDesc(null);
      setSaving(false);
    }
  };

  // Save flavor name
  const saveFlavorName = async (flavorId: string) => {
    if (saving || !tempFlavorName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/catalog/flavors/${flavorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempFlavorName.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchCatalog();
      showSuccess('Name updated');
    } catch {
      showSuccess('Failed to update');
    } finally {
      setEditingFlavorName(null);
      setSaving(false);
    }
  };

  // Note: Price editing removed - prices come from Kitchen/COGS

  // Save size quantity
  const saveSizeQuantity = async (sizeId: string) => {
    if (saving || !tempValue) return;
    const value = parseInt(tempValue, 10);
    if (isNaN(value)) {
      setEditingSizeId(null);
      return;
    }

    setSaving(true);
    try {
      if (quantityMode === 'add') {
        const res = await fetch(`/api/catalog/sizes/${sizeId}/inventory`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adjustment: value }),
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        showSuccess(`${value >= 0 ? '+' : ''}${value} → ${data.quantity}`);
      } else {
        const newQty = Math.max(0, value);
        const res = await fetch(`/api/catalog/sizes/${sizeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQty }),
        });
        if (!res.ok) throw new Error('Failed');
        showSuccess(`Set to ${newQty}`);
      }
      await fetchCatalog();
    } catch {
      showSuccess('Failed to update');
    } finally {
      setEditingSizeId(null);
      setEditingField(null);
      setSaving(false);
    }
  };

  // Delete size
  const handleDeleteSize = async (sizeId: string, sizeLabel: string) => {
    if (!confirm(`Delete "${sizeLabel}"? This cannot be undone.`)) return;
    
    try {
      const res = await fetch(`/api/catalog/sizes/${sizeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      await fetchCatalog();
      showSuccess(`${sizeLabel} deleted`);
    } catch {
      showSuccess('Failed to delete');
    }
  };

  const toggleFlavorAvailability = async (flavor: ProductFlavor) => {
    try {
      const res = await fetch(`/api/catalog/flavors/${flavor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !flavor.isAvailable }),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchCatalog();
      showSuccess(flavor.isAvailable ? 'Hidden' : 'Visible');
    } catch {
      showSuccess('Failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
        <button onClick={fetchCatalog} className="ml-4 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#5C4A3D]">Product Catalog</h2>
          <p className="text-sm text-[#8B7355]">Manage inventory and sizes • Products and prices come from Kitchen</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {catalog?.categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl border-2 border-[#E5DDD3] overflow-hidden shadow-sm">
            {/* LEVEL 1: Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-[#F5F0EB] to-[#FDFCFB] hover:from-[#F0EBE6] transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedCategories.has(category.id) ? (
                  <ChevronDown size={20} className="text-[#5C4A3D]" />
                ) : (
                  <ChevronRight size={20} className="text-[#8B7355]" />
                )}
                <span className="text-lg font-bold text-[#5C4A3D]">{category.name}</span>
                <span className="text-xs font-medium text-[#8B7355] bg-white/80 px-2.5 py-1 rounded-full border border-[#E5DDD3]">
                  {category.flavors.length} {category.flavors.length === 1 ? 'flavor' : 'flavors'}
                </span>
              </div>
{/* Flavors come from Kitchen - no add button here */}
            </button>

            {/* LEVEL 2: Flavors */}
            {expandedCategories.has(category.id) && (
              <div className="border-t-2 border-[#E5DDD3]">
                {category.flavors.length === 0 ? (
                  <div className="px-6 py-8 text-center text-[#8B7355]">
                    <p className="text-sm">No products in this category yet.</p>
                    <p className="text-xs mt-1">Products are added from the Kitchen when recipes are published.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5DDD3]">
                    {category.flavors.map((flavor) => (
                      <div key={flavor.id} className="bg-white">
                        {/* Flavor Header */}
                        <div className="px-5 py-4 ml-6 border-l-4 border-[#4A7C59]/20">
                          <div className="flex items-start justify-between gap-4">
                            {/* Flavor Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <button
                                  onClick={() => toggleFlavor(flavor.id)}
                                  className="flex items-center gap-1 hover:text-[#4A7C59] transition-colors"
                                >
                                  {expandedFlavors.has(flavor.id) ? (
                                    <ChevronDown size={16} className="text-[#4A7C59]" />
                                  ) : (
                                    <ChevronRight size={16} className="text-[#8B7355]" />
                                  )}
                                </button>
                                
                                {/* Editable Flavor Name */}
                                {editingFlavorName === flavor.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={tempFlavorName}
                                      onChange={(e) => setTempFlavorName(e.target.value)}
                                      onBlur={() => tempFlavorName.trim() && saveFlavorName(flavor.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && tempFlavorName.trim()) saveFlavorName(flavor.id);
                                        if (e.key === 'Escape') setEditingFlavorName(null);
                                      }}
                                      autoFocus
                                      className="text-base font-semibold text-[#5C4A3D] border-2 border-[#4A7C59] rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
                                    />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingFlavorName(flavor.id);
                                      setTempFlavorName(flavor.name);
                                    }}
                                    className="text-base font-semibold text-[#5C4A3D] hover:text-[#4A7C59] group flex items-center gap-1.5"
                                  >
                                    {flavor.name}
                                    <Pencil size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                                  </button>
                                )}
                                
                                {/* Price Range */}
                                <span className="text-sm text-[#8B7355]">
                                  {flavor.minPrice === flavor.maxPrice
                                    ? formatPrice(flavor.minPrice)
                                    : `${formatPrice(flavor.minPrice)}–${formatPrice(flavor.maxPrice)}`}
                                </span>

                                {/* Total Stock Badge */}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStockColor(flavor.totalQuantity)}`}>
                                  {flavor.totalQuantity} total
                                </span>
                              </div>

                              {/* Description */}
                              {editingFlavorDesc === flavor.id ? (
                                <div className="mt-3 space-y-2">
                                  <textarea
                                    value={tempDescription}
                                    onChange={(e) => setTempDescription(e.target.value)}
                                    placeholder="Product description..."
                                    rows={4}
                                    className="w-full text-sm border-2 border-[#4A7C59] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 resize-y min-h-[100px]"
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => saveDescription(flavor.id)}
                                      disabled={saving}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#4A7C59] hover:bg-[#3D6649] rounded-lg transition-colors"
                                    >
                                      <Check size={14} />
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingFlavorDesc(null)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#8B7355] hover:bg-[#F5F0EB] rounded-lg transition-colors"
                                    >
                                      <X size={14} />
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingFlavorDesc(flavor.id);
                                    setTempDescription(flavor.description || '');
                                  }}
                                  className="flex items-center gap-1.5 text-sm text-[#8B7355] hover:text-[#5C4A3D] mt-1 group"
                                >
                                  {flavor.description ? (
                                    <span className="italic">{flavor.description}</span>
                                  ) : (
                                    <span className="text-[#8B7355]/60">Add description...</span>
                                  )}
                                  <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>

                            {/* Flavor Actions */}
                            <div className="flex items-center gap-3">
                              {/* Visibility Toggle */}
                              <button
                                onClick={() => toggleFlavorAvailability(flavor)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  flavor.isAvailable ? 'bg-[#4A7C59]' : 'bg-gray-300'
                                }`}
                                title={flavor.isAvailable ? 'Visible in shop' : 'Hidden from shop'}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                    flavor.isAvailable ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>

                              {/* Add Size Button */}
                              <button
                                onClick={() => setShowAddSize(flavor.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#4A7C59] bg-[#E8F0EA] hover:bg-[#D8E8DC] rounded-lg transition-colors"
                              >
                                <Plus size={12} />
                                Size
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* LEVEL 3: Sizes */}
                        {expandedFlavors.has(flavor.id) && flavor.sizes.length > 0 && (
                          <div className="ml-12 mr-5 mb-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-[#8B7355] text-xs uppercase tracking-wider">
                                  <th className="text-left py-2 px-3 font-medium">Size</th>
                                  <th className="text-right py-2 px-3 font-medium w-28">Price</th>
                                  <th className="text-right py-2 px-3 font-medium w-32">Stock</th>
                                  <th className="w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F5F0EB]">
                                {flavor.sizes.map((size) => (
                                  <tr key={size.id} className="hover:bg-[#FDFCFB] group">
                                    {/* Size Label */}
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-2">
                                        <Package size={14} className="text-[#8B7355]" />
                                        <span className="font-medium text-[#5C4A3D]">{size.sizeLabel}</span>
                                      </div>
                                    </td>

                                    {/* Price - Read Only (from Kitchen) */}
                                    <td className="py-2.5 px-3 text-right">
                                      <span 
                                        className="font-medium text-[#8B7355] tabular-nums cursor-help"
                                        title="Price is set in Kitchen"
                                      >
                                        {formatPrice(size.unitPrice)}
                                      </span>
                                    </td>

                                    {/* Stock - Editable */}
                                    <td className="py-2.5 px-3 text-right">
                                      {editingSizeId === size.id && editingField === 'quantity' ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                          <select
                                            value={quantityMode}
                                            onChange={(e) => {
                                              setQuantityMode(e.target.value as 'add' | 'set');
                                              setTempValue(e.target.value === 'set' ? String(size.quantity) : '');
                                            }}
                                            className="text-xs border border-[#E5DDD3] rounded px-1 py-1 bg-white"
                                          >
                                            <option value="add">+/-</option>
                                            <option value="set">=</option>
                                          </select>
                                          <input
                                            type="number"
                                            value={tempValue}
                                            onChange={(e) => setTempValue(e.target.value)}
                                            onBlur={() => saveSizeQuantity(size.id)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') saveSizeQuantity(size.id);
                                              if (e.key === 'Escape') { setEditingSizeId(null); setEditingField(null); }
                                            }}
                                            autoFocus
                                            placeholder={quantityMode === 'add' ? '+/-' : 'qty'}
                                            className="w-14 text-sm text-right font-medium border border-[#4A7C59] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
                                          />
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEditingSizeId(size.id);
                                            setEditingField('quantity');
                                            setQuantityMode('add');
                                            setTempValue('');
                                          }}
                                          className={`inline-flex items-center gap-1.5 font-bold tabular-nums px-2.5 py-1 rounded border ${getStockColor(size.quantity)}`}
                                        >
                                          {size.quantity}
                                          <Pencil size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                                        </button>
                                      )}
                                    </td>

                                    {/* Delete Button */}
                                    <td className="py-2.5 px-2">
                                      <button
                                        onClick={() => handleDeleteSize(size.id, size.sizeLabel)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete size"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* No sizes message */}
                        {expandedFlavors.has(flavor.id) && flavor.sizes.length === 0 && (
                          <div className="ml-12 mr-5 mb-4 py-4 text-center text-sm text-[#8B7355] bg-[#FDFCFB] rounded-lg border border-dashed border-[#E5DDD3]">
                            No sizes configured.{' '}
                            <button
                              onClick={() => setShowAddSize(flavor.id)}
                              className="text-[#4A7C59] font-medium hover:underline"
                            >
                              Add a size
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Size Modal */}
      {showAddSize && (
        <AddSizeModal
          flavorId={showAddSize}
          onClose={() => setShowAddSize(null)}
          onSuccess={() => {
            setShowAddSize(null);
            fetchCatalog();
            showSuccess('Size added');
          }}
        />
      )}
    </div>
  );
}

// Add Size Modal
function AddSizeModal({
  flavorId,
  onClose,
  onSuccess,
}: {
  flavorId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [sizeOz, setSizeOz] = useState('');
  const [price, setPrice] = useState('');
  const [containerType, setContainerType] = useState('jar');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeOz || !price) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/catalog/flavors/${flavorId}/sizes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sizeOz: parseInt(sizeOz, 10),
          unitPrice: Math.round(parseFloat(price) * 100),
          containerType,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      onSuccess();
    } catch {
      alert('Failed to create size');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#F5F0EB] to-[#FDFCFB] px-6 py-4 border-b border-[#E5DDD3]">
          <h3 className="text-lg font-bold text-[#5C4A3D]">Add Size</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#5C4A3D] mb-1.5">
                Size (oz) *
              </label>
              <input
                type="number"
                value={sizeOz}
                onChange={(e) => setSizeOz(e.target.value)}
                placeholder="8"
                min="1"
                className="w-full border border-[#E5DDD3] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5C4A3D] mb-1.5">
                Container
              </label>
              <select
                value={containerType}
                onChange={(e) => setContainerType(e.target.value)}
                className="w-full border border-[#E5DDD3] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59]"
              >
                <option value="jar">Jar</option>
                <option value="bag">Bag</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C4A3D] mb-1.5">
              Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="7.99"
              className="w-full border border-[#E5DDD3] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-[#5C4A3D] hover:bg-[#F5F0EB] rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !sizeOz || !price}
              className="px-5 py-2.5 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3D6649] transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Size'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
