'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { X, Loader2, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSuccess: () => void;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    product,
    onSuccess,
}: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!product) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete product');
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-[#FDF8F3] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#E5DDD3]">
                    {/* Header with Product Preview */}
                    <div className="bg-white border-b border-[#E5DDD3] p-6">
                        <div className="flex items-start gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-16 h-16 rounded-xl object-cover border-2 border-red-200 opacity-60 grayscale"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-serif font-bold text-[#5C4A3D]">
                                        Remove Product?
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-[#5C4A3D] transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <p className="text-sm text-[#8B7355] mt-1">
                                    {product.name} • {formatPrice(product.price)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-red-800">
                                        This will permanently remove "{product.name}" from your shop.
                                    </p>
                                    <p className="text-sm text-red-600 mt-1">
                                        This can't be undone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tip */}
                        <p className="text-sm text-[#8B7355] italic mb-4">
                            💡 Tip: If you just want to hide it temporarily, use the ON/OFF toggle instead.
                        </p>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-[#5C4A3D] bg-white border border-[#E5DDD3] rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Keep It
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors font-bold"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                Yes, Remove It
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
