'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { X, Loader2, AlertTriangle } from 'lucide-react';

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
                <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Delete Product</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
