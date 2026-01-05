'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Pencil, Trash2, Plus, Loader2, Settings, X, ChevronDown, ChevronRight, Package } from 'lucide-react';
import ProductFormModal from './product-form-modal';
import DeleteConfirmModal from './delete-confirm-modal';

type ProductWithVariants = Product & { variants?: ProductVariant[] };

const DEFAULT_CATEGORIES = [
    'Applesauces',
    'Jams',
    'Spreads',
    'Dried Goods',
    'Pickled Goods',
];

export default function ProductList() {
    const [products, setProducts] = useState<ProductWithVariants[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Inline editing states
    const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
    const [tempDescription, setTempDescription] = useState('');
    const [tempPrice, setTempPrice] = useState('');
    const [tempQuantity, setTempQuantity] = useState('');
    const [quantityMode, setQuantityMode] = useState<'set' | 'add'>('set');
    
    // Variant editing states
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
    const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
    const [tempVariantQuantity, setTempVariantQuantity] = useState('');
    const [variantQuantityMode, setVariantQuantityMode] = useState<'set' | 'add'>('add');
    
    // Category manager modal
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editCategoryValue, setEditCategoryValue] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Get all unique categories (default + custom + from products)
    const allCategories = [...new Set([
        ...DEFAULT_CATEGORIES,
        ...customCategories,
        ...products.map(p => p.category).filter(Boolean) as string[]
    ])].sort();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/products?includeVariants=true');
            if (!res.ok) throw new Error('Failed to fetch products');
            const data = await res.json();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleAddClick = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setDeletingProduct(product);
    };

    // Quick toggle for availability
    const handleToggleAvailability = async (product: Product) => {
        setTogglingId(product.id);
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    isAvailable: !product.isAvailable,
                }),
            });
            if (!res.ok) throw new Error('Failed to update');
            
            // Update local state immediately for snappy UX
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p
            ));
            showSuccess(product.isAvailable ? 'Product hidden from shop' : 'Product now visible in shop');
        } catch (err) {
            console.error('Toggle failed:', err);
            showSuccess('Failed to update - please try again');
        } finally {
            setTogglingId(null);
        }
    };

    // Quick category change
    const handleCategoryChange = async (product: Product, newCategory: string) => {
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    category: newCategory || null,
                }),
            });
            if (!res.ok) throw new Error('Failed to update');
            
            // Update local state immediately
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, category: newCategory || null } : p
            ));
            showSuccess('Category updated');
        } catch (err) {
            console.error('Category update failed:', err);
            showSuccess('Failed to update category');
        }
    };

    // Inline description edit
    const startEditingDescription = (product: Product) => {
        setEditingDescriptionId(product.id);
        setTempDescription(product.description || '');
    };

    const saveDescription = async (product: Product) => {
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    description: tempDescription,
                }),
            });
            if (!res.ok) throw new Error('Failed to update');
            
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, description: tempDescription } : p
            ));
            showSuccess('Description updated');
        } catch (err) {
            console.error('Description update failed:', err);
            showSuccess('Failed to update description');
        } finally {
            setEditingDescriptionId(null);
        }
    };

    // Inline price edit
    const startEditingPrice = (product: Product) => {
        setEditingPriceId(product.id);
        setTempPrice((product.price / 100).toFixed(2));
    };

    const savePrice = async (product: Product) => {
        const priceInCents = Math.round(parseFloat(tempPrice) * 100);
        if (isNaN(priceInCents) || priceInCents < 0) {
            showSuccess('Invalid price');
            setEditingPriceId(null);
            return;
        }
        
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    price: priceInCents,
                }),
            });
            if (!res.ok) throw new Error('Failed to update');
            
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, price: priceInCents } : p
            ));
            showSuccess('Price updated');
        } catch (err) {
            console.error('Price update failed:', err);
            showSuccess('Failed to update price');
        } finally {
            setEditingPriceId(null);
        }
    };

    // Inline quantity edit
    const [savingQuantity, setSavingQuantity] = useState(false);
    
    const startEditingQuantity = (product: Product, mode: 'set' | 'add' = 'set') => {
        setEditingQuantityId(product.id);
        setQuantityMode(mode);
        setTempQuantity(mode === 'set' ? String(product.quantity) : '');
    };

    const saveQuantity = async (product: Product) => {
        if (savingQuantity) return; // Prevent double-save
        
        const value = parseInt(tempQuantity, 10);
        if (isNaN(value)) {
            showSuccess('Invalid quantity');
            setEditingQuantityId(null);
            return;
        }

        setSavingQuantity(true);
        try {
            if (quantityMode === 'add') {
                // Use inventory adjustment endpoint
                const res = await fetch(`/api/products/${product.id}/inventory`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adjustment: value }),
                });
                if (!res.ok) throw new Error('Failed to update');
                const data = await res.json();
                
                setProducts(prev => prev.map(p => 
                    p.id === product.id ? { ...p, quantity: data.quantity } : p
                ));
                showSuccess(`Added ${value} to stock (now ${data.quantity})`);
            } else {
                // Direct set
                const newQuantity = Math.max(0, value);
                const res = await fetch(`/api/products/${product.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: newQuantity }),
                });
                if (!res.ok) throw new Error('Failed to update');
                
                setProducts(prev => prev.map(p => 
                    p.id === product.id ? { ...p, quantity: newQuantity } : p
                ));
                showSuccess(`Stock set to ${newQuantity}`);
            }
        } catch (err) {
            console.error('Quantity update failed:', err);
            showSuccess('Failed to update quantity');
        } finally {
            setEditingQuantityId(null);
            setSavingQuantity(false);
        }
    };

    // Get stock status styling
    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { color: 'text-red-600 bg-red-50', label: 'Out of Stock' };
        if (quantity <= 5) return { color: 'text-amber-600 bg-amber-50', label: 'Low Stock' };
        return { color: 'text-emerald-600 bg-emerald-50', label: 'In Stock' };
    };

    // Toggle product variant expansion
    const toggleProductExpansion = (productId: string) => {
        setExpandedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // Variant quantity editing
    const [savingVariantQuantity, setSavingVariantQuantity] = useState(false);

    const startEditingVariantQuantity = (variant: ProductVariant, mode: 'set' | 'add' = 'add') => {
        setEditingVariantId(variant.id);
        setVariantQuantityMode(mode);
        setTempVariantQuantity(mode === 'set' ? String(variant.quantity) : '');
    };

    const saveVariantQuantity = async (productId: string, variant: ProductVariant) => {
        if (savingVariantQuantity) return;

        const value = parseInt(tempVariantQuantity, 10);
        if (isNaN(value)) {
            showSuccess('Invalid quantity');
            setEditingVariantId(null);
            return;
        }

        setSavingVariantQuantity(true);
        try {
            if (variantQuantityMode === 'add') {
                // Use variant inventory adjustment endpoint
                const res = await fetch(`/api/products/${productId}/variants/${variant.id}/inventory`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adjustment: value }),
                });
                if (!res.ok) throw new Error('Failed to update');
                const data = await res.json();

                // Update local state
                setProducts(prev => prev.map(p => {
                    if (p.id !== productId) return p;
                    return {
                        ...p,
                        quantity: p.variants?.reduce((sum, v) => 
                            sum + (v.id === variant.id ? data.quantity : v.quantity), 0) ?? p.quantity,
                        variants: p.variants?.map(v =>
                            v.id === variant.id ? { ...v, quantity: data.quantity } : v
                        ),
                    };
                }));
                showSuccess(`Added ${value} to ${variant.sizeLabel} (now ${data.quantity})`);
            } else {
                // Direct set via PUT
                const newQuantity = Math.max(0, value);
                const res = await fetch(`/api/products/${productId}/variants/${variant.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: newQuantity }),
                });
                if (!res.ok) throw new Error('Failed to update');

                // Update local state
                setProducts(prev => prev.map(p => {
                    if (p.id !== productId) return p;
                    const newVariants = p.variants?.map(v =>
                        v.id === variant.id ? { ...v, quantity: newQuantity } : v
                    );
                    return {
                        ...p,
                        quantity: newVariants?.reduce((sum, v) => sum + v.quantity, 0) ?? p.quantity,
                        variants: newVariants,
                    };
                }));
                showSuccess(`${variant.sizeLabel} stock set to ${newQuantity}`);
            }
        } catch (err) {
            console.error('Variant quantity update failed:', err);
            showSuccess('Failed to update variant quantity');
        } finally {
            setEditingVariantId(null);
            setSavingVariantQuantity(false);
        }
    };

    const handleFormSuccess = (message: string) => {
        setIsFormOpen(false);
        setEditingProduct(null);
        fetchProducts();
        showSuccess(message);
    };

    const handleDeleteSuccess = () => {
        setDeletingProduct(null);
        fetchProducts();
        showSuccess('Product deleted successfully');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading products...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
                <button onClick={fetchProducts} className="ml-4 underline">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">
                    {successMessage}
                </div>
            )}

            {/* Header with Add Button */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                    {products.length} product{products.length !== 1 ? 's' : ''}
                </h2>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg hover:bg-[#3D6649] transition-colors"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Products Table - Clean, accessible design */}
            {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No products yet. Add your first product!</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-[#E5DDD3]">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-[#E5DDD3] bg-[#FDFCFB]">
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#8B7355] uppercase tracking-wider w-36">
                                    Product
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#8B7355] uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-3 py-2.5 text-right text-xs font-semibold text-[#8B7355] uppercase tracking-wider w-24">
                                    Price
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-[#8B7355] uppercase tracking-wider w-28">
                                    Stock
                                </th>
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-[#8B7355] uppercase tracking-wider w-24">
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F0EB]">
                            {products.map((product) => {
                                const hasVariants = product.variants && product.variants.length > 0;
                                const isExpanded = expandedProducts.has(product.id);
                                
                                return (
                                    <React.Fragment key={product.id}>
                                        <tr 
                                            className={`transition-colors ${
                                                product.isAvailable 
                                                    ? 'hover:bg-[#FDFCFB]' 
                                                    : 'bg-gray-50/50'
                                            }`}
                                        >
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1.5">
                                                    {hasVariants && (
                                                        <button
                                                            onClick={() => toggleProductExpansion(product.id)}
                                                            className="p-0.5 text-[#8B7355] hover:text-[#4A7C59] hover:bg-[#E8F0EA] rounded transition-colors flex-shrink-0"
                                                            title={isExpanded ? 'Collapse sizes' : 'Expand sizes'}
                                                        >
                                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        </button>
                                                    )}
                                                    <div className={`text-sm font-medium ${
                                                        product.isAvailable ? 'text-[#5C4A3D]' : 'text-gray-400'
                                                    }`}>
                                                        {product.name}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <select
                                                        value={product.category || ''}
                                                        onChange={(e) => handleCategoryChange(product, e.target.value)}
                                                        className="text-xs border border-[#E5DDD3] rounded px-1.5 py-0.5 bg-white text-[#5C4A3D] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59]"
                                                    >
                                                        <option value="">No category</option>
                                                        {allCategories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => setShowCategoryManager(true)}
                                                className="p-1 text-[#8B7355] hover:text-[#4A7C59] hover:bg-[#E8F0EA] rounded transition-colors"
                                                title="Manage categories"
                                            >
                                                <Settings size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td 
                                        className={`px-3 py-2 cursor-pointer hover:bg-[#FDF8F3] transition-colors ${
                                            product.isAvailable ? 'text-[#5C4A3D]' : 'text-gray-400'
                                        }`}
                                        onClick={() => !editingDescriptionId && startEditingDescription(product)}
                                        title={editingDescriptionId === product.id ? undefined : "Click to edit description"}
                                    >
                                        {editingDescriptionId === product.id ? (
                                            <textarea
                                                value={tempDescription}
                                                onChange={(e) => setTempDescription(e.target.value)}
                                                onBlur={() => saveDescription(product)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        saveDescription(product);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setEditingDescriptionId(null);
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                                className="w-full text-sm leading-snug border border-[#4A7C59] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 resize-none"
                                                rows={2}
                                            />
                                        ) : (
                                            <p className="text-sm leading-snug">
                                                {product.description || <span className="text-gray-300 italic">Click to add description</span>}
                                            </p>
                                        )}
                                    </td>
                                    <td 
                                        className={`px-3 py-2 text-right cursor-pointer hover:bg-[#FDF8F3] transition-colors ${
                                            editingPriceId === product.id ? '' : ''
                                        }`}
                                        onClick={() => !editingPriceId && startEditingPrice(product)}
                                        title={editingPriceId === product.id ? undefined : "Click to edit price"}
                                    >
                                        {editingPriceId === product.id ? (
                                            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                                                <span className="text-sm text-gray-400 mr-1">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={tempPrice}
                                                    onChange={(e) => setTempPrice(e.target.value)}
                                                    onBlur={() => savePrice(product)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            savePrice(product);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setEditingPriceId(null);
                                                        }
                                                    }}
                                                    autoFocus
                                                    className="w-20 text-sm text-right font-medium border border-[#4A7C59] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
                                                />
                                            </div>
                                        ) : (
                                            <div className={`text-sm font-medium tabular-nums ${
                                                product.isAvailable ? 'text-[#5C4A3D]' : 'text-gray-400'
                                            }`}>
                                                {hasVariants ? (
                                                    // Show price range for products with variants
                                                    (() => {
                                                        const prices = product.variants!.map(v => v.unitPrice);
                                                        const minPrice = Math.min(...prices);
                                                        const maxPrice = Math.max(...prices);
                                                        return minPrice === maxPrice 
                                                            ? formatPrice(minPrice)
                                                            : `${formatPrice(minPrice)}–${formatPrice(maxPrice)}`;
                                                    })()
                                                ) : (
                                                    formatPrice(product.price)
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    {/* Stock Column */}
                                    <td className="px-3 py-2">
                                        {editingQuantityId === product.id ? (
                                            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        value={quantityMode}
                                                        onChange={(e) => {
                                                            setQuantityMode(e.target.value as 'set' | 'add');
                                                            setTempQuantity(e.target.value === 'set' ? String(product.quantity) : '');
                                                        }}
                                                        className="text-xs border border-[#E5DDD3] rounded px-1 py-0.5 bg-white"
                                                    >
                                                        <option value="set">Set to</option>
                                                        <option value="add">Add</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        min={quantityMode === 'set' ? '0' : undefined}
                                                        value={tempQuantity}
                                                        onChange={(e) => setTempQuantity(e.target.value)}
                                                        onBlur={() => tempQuantity && saveQuantity(product)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && tempQuantity) {
                                                                saveQuantity(product);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setEditingQuantityId(null);
                                                            }
                                                        }}
                                                        autoFocus
                                                        placeholder={quantityMode === 'add' ? '+/-' : '0'}
                                                        className="w-14 text-sm text-center font-medium border border-[#4A7C59] rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
                                                    />
                                                </div>
                                            </div>
                                        ) : hasVariants ? (
                                            /* Variant-based stock display */
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded ${getStockStatus(product.quantity).color}`}>
                                                    {product.quantity}
                                                </span>
                                                {!isExpanded && (
                                                    <button
                                                        onClick={() => toggleProductExpansion(product.id)}
                                                        className="text-[10px] text-[#8B7355] leading-tight text-center max-w-[120px] hover:text-[#4A7C59] transition-colors"
                                                        title="Click to expand sizes"
                                                    >
                                                        {product.variants!.map((v, i) => (
                                                            <span key={v.id}>
                                                                {i > 0 && <span className="text-[#D4C4B5]"> · </span>}
                                                                <span className={v.quantity === 0 ? 'text-red-400' : ''}>
                                                                    {v.sizeOz}oz<span className="font-medium">:{v.quantity}</span>
                                                                </span>
                                                            </span>
                                                        ))}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            /* Simple stock display for products without variants */
                                            <div 
                                                className="flex flex-col items-center gap-1 cursor-pointer group"
                                                onClick={() => startEditingQuantity(product, 'set')}
                                                title="Click to edit stock"
                                            >
                                                <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded ${getStockStatus(product.quantity).color}`}>
                                                    {product.quantity}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditingQuantity(product, 'add');
                                                    }}
                                                    className="text-xs text-[#4A7C59] opacity-0 group-hover:opacity-100 hover:underline transition-opacity"
                                                >
                                                    + Add stock
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-col items-center gap-2">
                                            {/* In Shop Toggle */}
                                            <button
                                                onClick={() => handleToggleAvailability(product)}
                                                disabled={togglingId === product.id}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:ring-offset-1 ${
                                                    product.isAvailable 
                                                        ? 'bg-[#4A7C59]' 
                                                        : 'bg-gray-300'
                                                } ${togglingId === product.id ? 'opacity-50' : ''}`}
                                                title={product.isAvailable ? 'In shop - click to hide' : 'Hidden - click to show in shop'}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                        product.isAvailable ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                            {/* Edit & Delete */}
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className="p-1.5 text-[#4A7C59] bg-[#E8F0EA] hover:bg-[#d4e5d8] rounded-md transition-colors"
                                                    title="Edit product"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                    title="Delete product"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                
                                {/* Variant Rows (expandable) - Compact full-width design */}
                                {hasVariants && isExpanded && (
                                    <tr>
                                        <td colSpan={5} className="p-0 pt-0 pb-2">
                                            <div className="bg-gradient-to-r from-[#F5F0EB] to-[#FDFCFB] border-l-[3px] border-l-[#4A7C59] mx-4 rounded-r shadow-sm">
                                                {product.variants!.map((variant, idx) => (
                                                    <div 
                                                        key={variant.id}
                                                        className={`flex items-center justify-between px-4 py-2.5 hover:bg-white/50 transition-colors ${
                                                            idx > 0 ? 'border-t border-[#E5DDD3]' : ''
                                                        }`}
                                                    >
                                                        {/* Size & Price */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2 min-w-[140px]">
                                                                <Package size={12} className="text-[#8B7355] flex-shrink-0" />
                                                                <span className="text-sm font-medium text-[#5C4A3D]">{variant.sizeLabel}</span>
                                                            </div>
                                                            <span className="text-sm text-[#8B7355] tabular-nums">
                                                                {formatPrice(variant.unitPrice)}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Stock with inline editing */}
                                                        {editingVariantId === variant.id ? (
                                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <select
                                                                    value={variantQuantityMode}
                                                                    onChange={(e) => {
                                                                        setVariantQuantityMode(e.target.value as 'set' | 'add');
                                                                        setTempVariantQuantity(e.target.value === 'set' ? String(variant.quantity) : '');
                                                                    }}
                                                                    className="text-xs border border-[#E5DDD3] rounded px-1.5 py-1 bg-white"
                                                                >
                                                                    <option value="add">+</option>
                                                                    <option value="set">=</option>
                                                                </select>
                                                                <input
                                                                    type="number"
                                                                    min={variantQuantityMode === 'set' ? '0' : undefined}
                                                                    value={tempVariantQuantity}
                                                                    onChange={(e) => setTempVariantQuantity(e.target.value)}
                                                                    onBlur={() => tempVariantQuantity && saveVariantQuantity(product.id, variant)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && tempVariantQuantity) {
                                                                            saveVariantQuantity(product.id, variant);
                                                                        }
                                                                        if (e.key === 'Escape') {
                                                                            setEditingVariantId(null);
                                                                        }
                                                                    }}
                                                                    autoFocus
                                                                    placeholder="qty"
                                                                    className="w-16 text-sm text-center font-medium border border-[#4A7C59] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => startEditingVariantQuantity(variant, 'add')}
                                                                className="flex items-center gap-2 group"
                                                                title="Click to adjust stock"
                                                            >
                                                                {(() => {
                                                                    const status = getStockStatus(variant.quantity);
                                                                    return (
                                                                        <>
                                                                            <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded ${status.color}`}>
                                                                                {variant.quantity}
                                                                            </span>
                                                                            <span className="text-xs text-[#4A7C59] opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                edit
                                                                            </span>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            <ProductFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                product={editingProduct}
                onSuccess={handleFormSuccess}
                customCategories={customCategories}
                onCategoriesChange={setCustomCategories}
            />

            <DeleteConfirmModal
                isOpen={!!deletingProduct}
                onClose={() => setDeletingProduct(null)}
                product={deletingProduct}
                onSuccess={handleDeleteSuccess}
            />

            {/* Category Manager Modal */}
            {showCategoryManager && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-[#F9F6F2] px-6 py-4 border-b border-[#E5DDD3] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#5C4A3D]">Manage Categories</h3>
                            <button
                                onClick={() => {
                                    setShowCategoryManager(false);
                                    setEditingCategory(null);
                                    setExpandedCategories(new Set());
                                }}
                                className="text-[#8B7355] hover:text-[#5C4A3D] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                                {allCategories.map((cat) => {
                                    const categoryProducts = products.filter(p => p.category === cat);
                                    const productCount = categoryProducts.length;
                                    const isExpanded = expandedCategories.has(cat);
                                    
                                    const toggleExpand = () => {
                                        setExpandedCategories(prev => {
                                            const next = new Set(prev);
                                            if (next.has(cat)) {
                                                next.delete(cat);
                                            } else {
                                                next.add(cat);
                                            }
                                            return next;
                                        });
                                    };

                                    const handleEditCategory = async (oldName: string, newName: string) => {
                                        if (!newName.trim() || newName === oldName) return;
                                        const trimmed = newName.trim();
                                        
                                        // Add to custom categories if not already there
                                        if (!allCategories.includes(trimmed)) {
                                            setCustomCategories(prev => [...prev, trimmed]);
                                        }
                                        
                                        // Update all products with this category
                                        for (const p of products) {
                                            if (p.category === oldName) {
                                                await handleCategoryChange(p, trimmed);
                                            }
                                        }
                                        
                                        // Remove old from custom if it was custom
                                        setCustomCategories(prev => prev.filter(c => c !== oldName));
                                        
                                        // Update expanded state
                                        if (expandedCategories.has(oldName)) {
                                            setExpandedCategories(prev => {
                                                const next = new Set(prev);
                                                next.delete(oldName);
                                                next.add(trimmed);
                                                return next;
                                            });
                                        }
                                        
                                        showSuccess(`Category renamed to "${trimmed}"`);
                                    };

                                    const handleDeleteCategory = async () => {
                                        const confirmMsg = productCount > 0 
                                            ? `Delete "${cat}"? ${productCount} product(s) will have no category.`
                                            : `Delete category "${cat}"?`;
                                        if (confirm(confirmMsg)) {
                                            // Clear category from all products
                                            for (const p of products) {
                                                if (p.category === cat) {
                                                    await handleCategoryChange(p, '');
                                                }
                                            }
                                            // Remove from custom categories
                                            setCustomCategories(prev => prev.filter(c => c !== cat));
                                            showSuccess(`Category "${cat}" deleted`);
                                        }
                                    };
                                    
                                    return (
                                        <div key={cat} className="bg-[#F9F6F2] rounded-lg overflow-hidden">
                                            <div className="flex items-center justify-between p-3">
                                                <button
                                                    onClick={toggleExpand}
                                                    className="flex items-center gap-2 flex-1 text-left"
                                                    disabled={productCount === 0}
                                                >
                                                    {productCount > 0 ? (
                                                        isExpanded ? (
                                                            <ChevronDown size={16} className="text-[#8B7355]" />
                                                        ) : (
                                                            <ChevronRight size={16} className="text-[#8B7355]" />
                                                        )
                                                    ) : (
                                                        <span className="w-4" />
                                                    )}
                                                    {editingCategory === cat ? (
                                                        <input
                                                            type="text"
                                                            value={editCategoryValue}
                                                            onChange={(e) => setEditCategoryValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleEditCategory(cat, editCategoryValue);
                                                                    setEditingCategory(null);
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    setEditingCategory(null);
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                handleEditCategory(cat, editCategoryValue);
                                                                setEditingCategory(null);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            autoFocus
                                                            className="flex-1 px-2 py-1 text-sm border border-[#4A7C59] rounded focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
                                                        />
                                                    ) : (
                                                        <>
                                                            <span className="text-sm font-medium text-[#5C4A3D]">{cat}</span>
                                                            <span className="text-xs text-[#8B7355]">
                                                                ({productCount} product{productCount !== 1 ? 's' : ''})
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingCategory(cat);
                                                            setEditCategoryValue(cat);
                                                        }}
                                                        className="p-1.5 text-[#4A7C59] hover:bg-[#E8F0EA] rounded transition-colors"
                                                        title="Edit category"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCategory();
                                                        }}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete category"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            {isExpanded && productCount > 0 && (
                                                <div className="border-t border-[#E5DDD3] bg-white">
                                                    {categoryProducts.map((p) => (
                                                        <div 
                                                            key={p.id} 
                                                            className="px-4 py-2 pl-10 text-sm text-[#5C4A3D] border-b border-[#F5F0EB] last:border-b-0 flex items-center justify-between"
                                                        >
                                                            <span className={!p.isAvailable ? 'text-gray-400' : ''}>
                                                                {p.name}
                                                            </span>
                                                            <span className="text-xs text-[#8B7355]">
                                                                {formatPrice(p.price)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => {
                                    const newCat = prompt('Enter new category name:');
                                    if (newCat && newCat.trim()) {
                                        if (!allCategories.includes(newCat.trim())) {
                                            setCustomCategories(prev => [...prev, newCat.trim()]);
                                            showSuccess(`Category "${newCat.trim()}" added`);
                                        } else {
                                            alert('This category already exists.');
                                        }
                                    }
                                }}
                                className="mt-4 w-full py-2 text-sm text-[#4A7C59] border border-dashed border-[#4A7C59] rounded-lg hover:bg-[#E8F0EA] transition-colors"
                            >
                                + Add New Category
                            </button>
                        </div>
                        <div className="px-6 py-4 border-t border-[#E5DDD3]">
                            <button
                                onClick={() => {
                                    setShowCategoryManager(false);
                                    setEditingCategory(null);
                                    setExpandedCategories(new Set());
                                }}
                                className="w-full py-2 bg-[#4A7C59] text-white rounded-xl hover:bg-[#3D6649] transition-colors font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
