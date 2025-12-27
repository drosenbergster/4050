'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import ProductFormModal from './product-form-modal';
import DeleteConfirmModal from './delete-confirm-modal';

export default function ProductList() {
    const [products, setProducts] = useState<(Product & { category?: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<(Product & { category?: string }) | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    const handleEditClick = (product: Product & { category?: string }) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setDeletingProduct(product);
    };

    // Quick toggle for availability
    const handleToggleAvailability = async (product: Product & { category?: string }) => {
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

            {/* Products Table */}
            {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No products yet. Add your first product!</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-xl overflow-hidden border border-[#E5DDD3]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#F9F6F2]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                                    In Shop
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr 
                                    key={product.id} 
                                    className={`transition-all ${
                                        product.isAvailable 
                                            ? 'hover:bg-[#FDF8F3]' 
                                            : 'bg-gray-50 opacity-60'
                                    }`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {product.imageUrl && (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className={`w-12 h-12 rounded-lg object-cover mr-4 ${
                                                        !product.isAvailable ? 'grayscale' : ''
                                                    }`}
                                                />
                                            )}
                                            <div>
                                                <div className={`font-medium ${
                                                    product.isAvailable ? 'text-[#5C4A3D]' : 'text-gray-400'
                                                }`}>
                                                    {product.name}
                                                </div>
                                                {product.category && (
                                                    <div className="text-xs text-gray-400">
                                                        {product.category}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-medium ${
                                        product.isAvailable ? 'text-[#5C4A3D]' : 'text-gray-400'
                                    }`}>
                                        {formatPrice(product.price)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Toggle Switch */}
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleToggleAvailability(product)}
                                                disabled={togglingId === product.id}
                                                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:ring-offset-2 ${
                                                    product.isAvailable 
                                                        ? 'bg-[#4A7C59]' 
                                                        : 'bg-gray-300'
                                                } ${togglingId === product.id ? 'opacity-50' : ''}`}
                                                aria-label={product.isAvailable ? 'Hide from shop' : 'Show in shop'}
                                            >
                                                <span
                                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                                                        product.isAvailable ? 'translate-x-9' : 'translate-x-1'
                                                    }`}
                                                />
                                                <span className={`absolute text-[10px] font-bold uppercase ${
                                                    product.isAvailable 
                                                        ? 'left-2 text-white' 
                                                        : 'right-2 text-gray-500'
                                                }`}>
                                                    {product.isAvailable ? 'On' : 'Off'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#4A7C59] bg-[#E8F0EA] rounded-lg hover:bg-[#d4e5d8] transition-colors"
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
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
            />

            <DeleteConfirmModal
                isOpen={!!deletingProduct}
                onClose={() => setDeletingProduct(null)}
                product={deletingProduct}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}
