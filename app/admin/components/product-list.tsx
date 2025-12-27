'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Pencil, Trash2, Plus, Loader2, Settings, X, ChevronDown, ChevronRight } from 'lucide-react';
import ProductFormModal from './product-form-modal';
import DeleteConfirmModal from './delete-confirm-modal';

const DEFAULT_CATEGORIES = [
    'Applesauces',
    'Jams',
    'Spreads',
    'Dried Goods',
    'Pickled Goods',
];

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
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
    const [tempDescription, setTempDescription] = useState('');
    const [tempPrice, setTempPrice] = useState('');
    
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
            const res = await fetch('/api/products');
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
                                <th className="px-3 py-2.5 text-center text-xs font-semibold text-[#8B7355] uppercase tracking-wider w-24">
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F0EB]">
                            {products.map((product) => (
                                <tr 
                                    key={product.id} 
                                    className={`transition-colors ${
                                        product.isAvailable 
                                            ? 'hover:bg-[#FDFCFB]' 
                                            : 'bg-gray-50/50'
                                    }`}
                                >
                                    <td className="px-3 py-2">
                                        <div className={`text-sm font-medium ${
                                            product.isAvailable ? 'text-[#5C4A3D]' : 'text-gray-400'
                                        }`}>
                                            {product.name}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <select
                                                value={product.category || ''}
                                                onChange={(e) => handleCategoryChange(product, e.target.value)}
                                                className="flex-1 text-xs border border-[#E5DDD3] rounded px-1.5 py-0.5 bg-white text-[#5C4A3D] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59]"
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
                                                {formatPrice(product.price)}
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
                            ))}
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
