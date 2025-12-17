'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/format';
import { Package, ShoppingBag, LogOut } from 'lucide-react';
import ProductList from './components/product-list';

interface MockOrder {
  id: string;
  customerName: string;
  total: number;
  fulfillmentStatus: 'PENDING' | 'FULFILLED';
  createdAt: string;
  fulfillmentMethod: 'SHIPPING' | 'PICKUP';
}

// Mock Data
const MOCK_ORDERS: MockOrder[] = [
  { id: 'ord_1', customerName: 'Jane Doe', total: 2999, fulfillmentStatus: 'PENDING', createdAt: new Date().toISOString(), fulfillmentMethod: 'SHIPPING' },
  { id: 'ord_2', customerName: 'John Smith', total: 1500, fulfillmentStatus: 'FULFILLED', createdAt: new Date(Date.now() - 86400000).toISOString(), fulfillmentMethod: 'PICKUP' },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-[#2C3E50]">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Logged in as {session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`${activeTab === 'orders'
                  ? 'border-[#2C3E50] text-[#2C3E50]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <ShoppingBag size={18} />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`${activeTab === 'products'
                  ? 'border-[#2C3E50] text-[#2C3E50]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Package size={18} />
              Products
            </button>
          </nav>
        </div>

        {activeTab === 'orders' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {MOCK_ORDERS.map((order) => (
                <li key={order.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#2C3E50] truncate">
                        Order #{order.id.slice(-4)}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.fulfillmentStatus === 'FULFILLED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {order.customerName}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {order.fulfillmentMethod}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Total: <span className="font-medium text-[#2C3E50]">{formatPrice(order.total)}</span>
                        </p>
                        <p className="ml-6">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ProductList />
        )}
      </main>
    </div>
  );
}

