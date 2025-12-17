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
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {product.imageUrl && (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-lg object-cover mr-3"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {product.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatPrice(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.category || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isAvailable
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {product.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditClick(product)}
                                            className="text-[#4A7C59] hover:text-[#3D6649] mr-3"
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(product)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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
