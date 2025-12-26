'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/format';
import { Package, ShoppingBag, LogOut, Heart, Coins, Leaf, CheckCircle, Clock } from 'lucide-react';
import ProductList from './components/product-list';
import { CURRENT_CAUSES } from '@/lib/causes';
import OrderDetailModal from './components/order-detail-modal';
import { FulfillmentStatus, OrderWithItems } from '@/lib/types';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session && activeTab === 'orders') {
      fetchOrders();
    }
  }, [session, activeTab]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const toggleFulfillment = async (orderId: string, currentStatus: FulfillmentStatus) => {
    const newStatus: FulfillmentStatus = currentStatus === 'PENDING' ? 'FULFILLED' : 'PENDING';
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus: newStatus }),
      });
      if (response.ok) {
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, fulfillmentStatus: newStatus } : o);
        setOrders(updatedOrders);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, fulfillmentStatus: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const openOrderDetail = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

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
          <div className="space-y-6">
            {/* Impact Summary Tally - The Seed Growth */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CURRENT_CAUSES.map(cause => {
                const causeSeeds = orders.filter(o => o.proceedsChoice === cause.id).reduce((sum, o) => sum + (o.seedCount || 0), 0);
                const totalSeeds = orders.reduce((sum, o) => sum + (o.seedCount || 0), 0);
                const percentage = totalSeeds > 0 ? Math.round((causeSeeds / totalSeeds) * 100) : 0;
                
                return (
                  <div key={cause.id} className="bg-white p-6 rounded-xl shadow-sm border border-[#E5DDD3]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-[#E8F0EA] rounded-lg text-[#4A7C59]">
                        <Leaf size={20} />
                      </div>
                      <span className="text-xs font-bold text-[#8B7355] uppercase tracking-wider">{percentage}% of Growth</span>
                    </div>
                    <h3 className="font-serif font-bold text-[#5C4A3D] mb-1">{cause.name}</h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[#4A7C59]">{causeSeeds}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-tight font-bold">Seeds Sown</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-[#4A7C59] h-full transition-all duration-1000" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-[#8B7355] font-medium mt-1">
                        Extra Support Sown: {formatPrice(orders.filter(o => o.proceedsChoice === cause.id).reduce((sum, o) => sum + (o.extraSupportAmount || 0), 0))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
              {isLoadingOrders ? (
                <div className="p-8 text-center text-gray-500">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No orders found.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <li key={order.id}>
                      <div 
                        className="px-4 py-4 sm:px-6 hover:bg-[#FDF8F3] cursor-pointer transition-colors group"
                        onClick={() => openOrderDetail(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-[#2C3E50] truncate">
                              Order #{order.id.slice(-4)}
                            </p>
                            <span className="text-xs text-gray-400 font-mono italic">
                              {CURRENT_CAUSES.find(c => c.id === order.proceedsChoice)?.name || 'No Cause Selected'}
                            </span>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[#4A7C59] text-xs font-bold">
                              <Leaf size={12} />
                              {order.seedCount} Seeds Sown
                            </div>
                            {order.extraSupportAmount && order.extraSupportAmount > 0 && (
                              <div className="flex items-center gap-1 text-[#8B7355] text-xs font-bold">
                                <Coins size={12} />
                                +{formatPrice(order.extraSupportAmount)} extra
                              </div>
                            )}
                            <button
                              onClick={() => toggleFulfillment(order.id, order.fulfillmentStatus)}
                              className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full transition-colors ${order.fulfillmentStatus === 'FULFILLED'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                }`}
                            >
                              {order.fulfillmentStatus === 'FULFILLED' ? (
                                <CheckCircle size={12} />
                              ) : (
                                <Clock size={12} />
                              )}
                              {order.fulfillmentStatus}
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex flex-col">
                            <p className="flex items-center text-sm text-gray-500">
                              {order.customerName} ({order.customerEmail})
                            </p>
                            <p className="mt-1 flex items-center text-xs text-[#8B7355] font-serif italic group-hover:text-[#4A7C59]">
                              Click to view details and items
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
              )}
            </div>
          </div>
        ) : (
          <ProductList />
        )}
      </main>

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        onToggleFulfillment={toggleFulfillment}
      />
    </div>
  );
}

