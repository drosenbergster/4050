'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { X, Loader2, ImageIcon, Settings, Trash2, Pencil } from 'lucide-react';

const DEFAULT_CATEGORIES = [
    'Applesauces',
    'Jams',
    'Spreads',
    'Dried Goods',
    'Pickled Goods',
];

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: (Product & { category?: string }) | null;
    onSuccess: (message: string) => void;
    customCategories?: string[];
    onCategoriesChange?: (categories: string[]) => void;
}

export default function ProductFormModal({
    isOpen,
    onClose,
    product,
    onSuccess,
    customCategories = [],
    onCategoriesChange,
}: ProductFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageError, setImageError] = useState(false);
    
    // Category management
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editCategoryValue, setEditCategoryValue] = useState('');

    const isEditing = !!product;
    
    // All categories (default + custom)
    const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...customCategories])].sort();

    // Reset form when modal opens/closes or product changes
    useEffect(() => {
        if (isOpen && product) {
            setName(product.name);
            setDescription(product.description);
            setPriceDisplay((product.price / 100).toFixed(2));
            setImageUrl(product.imageUrl);
            setCategory(product.category || '');
            setIsAvailable(product.isAvailable);
            setError(null);
            setImageError(false);
        } else if (isOpen) {
            // Reset for new product
            setName('');
            setDescription('');
            setPriceDisplay('');
            setImageUrl('');
            setCategory('');
            setIsAvailable(true);
            setError(null);
            setImageError(false);
        }
    }, [isOpen, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!name.trim()) {
            setError('Please enter a product name');
            return;
        }
        if (!description.trim()) {
            setError('Please enter a description');
            return;
        }
        const priceNum = parseFloat(priceDisplay);
        if (isNaN(priceNum) || priceNum <= 0) {
            setError('Please enter a valid price');
            return;
        }
        if (!imageUrl.trim()) {
            setError('Please enter an image URL');
            return;
        }

        setLoading(true);

        try {
            const priceInCents = Math.round(priceNum * 100);

            const payload = {
                name: name.trim(),
                description: description.trim(),
                price: priceInCents,
                imageUrl: imageUrl.trim(),
                category: category || null,
                isAvailable,
            };

            const url = isEditing ? `/api/products/${product.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save product');
            }

            onSuccess(isEditing ? 'Product updated!' : 'Product added!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-[#FDF8F3] rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-[#E5DDD3]">
                    {/* Header with Image Preview */}
                    <div className="bg-white border-b border-[#E5DDD3] p-6">
                        <div className="flex items-start gap-4">
                            {/* Image Preview */}
                            <div className="flex-shrink-0">
                                {imageUrl && !imageError ? (
                                    <img
                                        src={imageUrl}
                                        alt="Product preview"
                                        className="w-20 h-20 rounded-xl object-cover border-2 border-[#E5DDD3]"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        <ImageIcon size={24} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-serif font-bold text-[#5C4A3D]">
                                        {isEditing ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-[#5C4A3D] transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                {isEditing && (
                                    <p className="text-sm text-[#8B7355] mt-1">
                                        Editing: <span className="font-medium">{product?.name}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-bold text-[#5C4A3D] mb-2">
                                Product Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] placeholder-gray-400"
                                placeholder="e.g., Apple Butter"
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
                                className="w-full px-4 py-3 bg-white border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] placeholder-gray-400 resize-none"
                                placeholder="Tell the story of this product..."
                            />
                            <p className="text-xs text-[#8B7355] mt-1 italic">
                                This shows on the shop page
                            </p>
                        </div>

                        {/* Price and Category Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-bold text-[#5C4A3D] mb-2">
                                    Price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-[#8B7355] font-medium">$</span>
                                    <input
                                        type="text"
                                        value={priceDisplay}
                                        onChange={(e) => setPriceDisplay(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-white border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] placeholder-gray-400"
                                        placeholder="10.99"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-[#5C4A3D]">
                                        Category
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryManager(true)}
                                        className="text-xs text-[#4A7C59] hover:text-[#3D6649] flex items-center gap-1"
                                    >
                                        <Settings size={12} />
                                        Manage
                                    </button>
                                </div>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] appearance-none cursor-pointer"
                                >
                                    <option value="">Choose one...</option>
                                    {allCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-bold text-[#5C4A3D] mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => {
                                    setImageUrl(e.target.value);
                                    setImageError(false);
                                }}
                                className="w-full px-4 py-3 bg-white border border-[#E5DDD3] rounded-xl focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent text-[#5C4A3D] placeholder-gray-400 text-sm"
                                placeholder="https://..."
                            />
                            <p className="text-xs text-[#8B7355] mt-1 italic">
                                Paste a link to your product image
                            </p>
                        </div>

                        {/* Show in Shop Toggle */}
                        <div className="bg-white border border-[#E5DDD3] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-[#5C4A3D]">Show in Shop</p>
                                    <p className="text-xs text-[#8B7355]">
                                        {isAvailable ? 'Customers can see and buy this' : 'Hidden from customers'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAvailable(!isAvailable)}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                        isAvailable ? 'bg-[#4A7C59]' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                                            isAvailable ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-[#5C4A3D] bg-white border border-[#E5DDD3] rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#4A7C59] text-white rounded-xl hover:bg-[#3D6649] disabled:opacity-50 transition-colors font-bold"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {isEditing ? 'Save Changes' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Category Manager Modal */}
            {showCategoryManager && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-[#F9F6F2] px-6 py-4 border-b border-[#E5DDD3] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#5C4A3D]">Manage Categories</h3>
                            <button
                                onClick={() => {
                                    setShowCategoryManager(false);
                                    setEditingCategory(null);
                                }}
                                className="text-[#8B7355] hover:text-[#5C4A3D] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 max-h-80 overflow-y-auto">
                            <div className="space-y-2">
                                {allCategories.map((cat) => (
                                    <div
                                        key={cat}
                                        className="flex items-center justify-between p-3 bg-[#F9F6F2] rounded-lg"
                                    >
                                        {editingCategory === cat ? (
                                            <input
                                                type="text"
                                                value={editCategoryValue}
                                                onChange={(e) => setEditCategoryValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        if (editCategoryValue.trim() && onCategoriesChange) {
                                                            const newCats = customCategories.filter(c => c !== cat);
                                                            newCats.push(editCategoryValue.trim());
                                                            onCategoriesChange(newCats);
                                                            if (category === cat) {
                                                                setCategory(editCategoryValue.trim());
                                                            }
                                                        }
                                                        setEditingCategory(null);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setEditingCategory(null);
                                                    }
                                                }}
                                                onBlur={() => setEditingCategory(null)}
                                                autoFocus
                                                className="flex-1 px-2 py-1 text-sm border border-[#4A7C59] rounded focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30"
                                            />
                                        ) : (
                                            <span className="text-sm text-[#5C4A3D]">{cat}</span>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingCategory(cat);
                                                    setEditCategoryValue(cat);
                                                }}
                                                className="p-1.5 text-[#4A7C59] hover:bg-[#E8F0EA] rounded transition-colors"
                                                title="Edit category"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete category "${cat}"?`)) {
                                                        if (onCategoriesChange) {
                                                            onCategoriesChange(customCategories.filter(c => c !== cat));
                                                        }
                                                        if (category === cat) {
                                                            setCategory('');
                                                        }
                                                    }
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Delete category"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    const newCat = prompt('Enter new category name:');
                                    if (newCat && newCat.trim() && onCategoriesChange) {
                                        if (!allCategories.includes(newCat.trim())) {
                                            onCategoriesChange([...customCategories, newCat.trim()]);
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
