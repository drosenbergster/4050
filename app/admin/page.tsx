'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/format';
import { Package, ShoppingBag, LogOut, Coins, Leaf, CheckCircle, Clock, Truck, Home, Filter, Calculator, Calendar } from 'lucide-react';
import ProductList from './components/product-list';
import CogsCalculator from './components/cogs-calculator';
import SeasonalPlanner from './components/seasonal-planner';
import { CURRENT_CAUSES } from '@/lib/causes';
import OrderDetailModal from './components/order-detail-modal';
import { FulfillmentStatus, OrderWithItems } from '@/lib/types';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'cogs' | 'planner'>('products');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showPendingOnly, setShowPendingOnly] = useState(true); // Default to pending

  // Counts for quick reference
  const pendingOrders = orders.filter(o => o.fulfillmentStatus === 'PENDING');
  const pendingCount = pendingOrders.length;
  const shippingPending = pendingOrders.filter(o => o.fulfillmentMethod === 'SHIPPING').length;
  const pickupPending = pendingOrders.filter(o => o.fulfillmentMethod === 'PICKUP').length;
  
  // Filtered orders based on toggle
  const displayedOrders = showPendingOnly ? pendingOrders : orders;

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
              {pendingCount > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
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
            <button
              onClick={() => setActiveTab('cogs')}
              className={`${activeTab === 'cogs'
                  ? 'border-[#2C3E50] text-[#2C3E50]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Calculator size={18} />
              Recipe Costing
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`${activeTab === 'planner'
                  ? 'border-[#2C3E50] text-[#2C3E50]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Calendar size={18} />
              Seasonal Planner
            </button>
          </nav>
        </div>

        {activeTab === 'orders' ? (
          <div className="space-y-6">
            {/* Today's Tasks - The First Thing Mom Sees */}
            {pendingCount > 0 && (
              <div className="bg-[#FDF8F3] border-2 border-[#E5DDD3] rounded-2xl p-6">
                <h2 className="text-xl font-serif font-bold text-[#5C4A3D] mb-4">
                  📦 Today&apos;s Tasks
                </h2>
                <div className="flex flex-wrap gap-4">
                  {shippingPending > 0 && (
                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-[#E5DDD3]">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#5C4A3D]">{shippingPending}</p>
                        <p className="text-xs text-gray-500 uppercase font-bold">To Ship</p>
                      </div>
                    </div>
                  )}
                  {pickupPending > 0 && (
                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-[#E5DDD3]">
                      <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <Home size={20} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#5C4A3D]">{pickupPending}</p>
                        <p className="text-xs text-gray-500 uppercase font-bold">For Pickup</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <button
                  onClick={() => setShowPendingOnly(true)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    showPendingOnly
                      ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pending Only ({pendingCount})
                </button>
                <button
                  onClick={() => setShowPendingOnly(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !showPendingOnly
                      ? 'bg-[#4A7C59] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Orders ({orders.length})
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white shadow overflow-hidden rounded-xl border border-gray-200">
              {isLoadingOrders ? (
                <div className="p-8 text-center text-gray-500">Loading orders...</div>
              ) : displayedOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                  <p className="text-lg font-serif text-[#5C4A3D]">All caught up!</p>
                  <p className="text-sm text-gray-500 mt-1">No pending orders right now.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {displayedOrders.map((order) => (
                    <li key={order.id}>
                      <div 
                        className="px-4 py-4 sm:px-6 hover:bg-[#FDF8F3] cursor-pointer transition-colors group"
                        onClick={() => openOrderDetail(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Fulfillment Method Icon */}
                            <div className={`p-2 rounded-lg ${
                              order.fulfillmentMethod === 'SHIPPING' 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'bg-green-50 text-green-600'
                            }`}>
                              {order.fulfillmentMethod === 'SHIPPING' ? <Truck size={18} /> : <Home size={18} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#2C3E50]">
                                {order.customerName}
                              </p>
                              <p className="text-xs text-gray-400">
                                Order #{order.id.slice(-4)} · {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-[#2C3E50]">
                              {formatPrice(order.total)}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFulfillment(order.id, order.fulfillmentStatus);
                              }}
                              className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-bold rounded-full transition-colors ${order.fulfillmentStatus === 'FULFILLED'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                }`}
                            >
                              {order.fulfillmentStatus === 'FULFILLED' ? (
                                <CheckCircle size={16} />
                              ) : (
                                <Clock size={16} />
                              )}
                              {order.fulfillmentStatus === 'FULFILLED' ? 'Done' : 'Pending'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Impact Summary - Moved Lower */}
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#8B7355] uppercase tracking-wider py-2">
                <Leaf size={16} />
                View Impact Summary
                <span className="ml-auto text-xs font-normal normal-case text-gray-400 group-open:hidden">Click to expand</span>
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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
            </details>
          </div>
        ) : activeTab === 'products' ? (
          <ProductList />
        ) : activeTab === 'cogs' ? (
          <CogsCalculator />
        ) : (
          <SeasonalPlanner />
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

