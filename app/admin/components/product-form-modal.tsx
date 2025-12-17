'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { X, Loader2 } from 'lucide-react';

const CATEGORIES = ['Applesauce', 'Jams', 'Spreads', 'Dried Goods', 'Pickled'];

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: (Product & { category?: string }) | null;
    onSuccess: (message: string) => void;
}

export default function ProductFormModal({
    isOpen,
    onClose,
    product,
    onSuccess,
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

    const isEditing = !!product;

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
        } else if (isOpen) {
            // Reset for new product
            setName('');
            setDescription('');
            setPriceDisplay('');
            setImageUrl('');
            setCategory('');
            setIsAvailable(true);
            setError(null);
        }
    }, [isOpen, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        if (!description.trim()) {
            setError('Description is required');
            return;
        }
        const priceNum = parseFloat(priceDisplay);
        if (isNaN(priceNum) || priceNum <= 0) {
            setError('Price must be a positive number');
            return;
        }
        if (!imageUrl.trim()) {
            setError('Image URL is required');
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

            onSuccess(isEditing ? 'Product updated successfully' : 'Product created successfully');
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
                <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditing ? 'Edit Product' : 'Add Product'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                                placeholder="Apple Butter"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                                placeholder="Smooth, sweet apple butter made from heritage apples..."
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (USD) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={priceDisplay}
                                    onChange={(e) => setPriceDisplay(e.target.value)}
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                                    placeholder="9.99"
                                />
                            </div>
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL *
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent"
                            >
                                <option value="">Select category...</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Availability Toggle */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isAvailable"
                                checked={isAvailable}
                                onChange={(e) => setIsAvailable(e.target.checked)}
                                className="h-4 w-4 text-[#4A7C59] border-gray-300 rounded focus:ring-[#4A7C59]"
                            />
                            <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                                Available for purchase
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-[#4A7C59] text-white rounded-lg hover:bg-[#3D6649] disabled:opacity-50 transition-colors"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                {isEditing ? 'Save Changes' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
