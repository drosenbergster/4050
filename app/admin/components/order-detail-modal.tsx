'use client';

import { FulfillmentStatus, OrderWithItems } from '@/lib/types';
import { X, User, Phone, Mail, MapPin, Package, Leaf, Coins, CheckCircle, Clock } from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/format';
import { CURRENT_CAUSES } from '@/lib/causes';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithItems | null;
  onToggleFulfillment: (orderId: string, currentStatus: FulfillmentStatus) => void;
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onToggleFulfillment,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const cause = CURRENT_CAUSES.find(c => c.id === order.proceedsChoice);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-[#FDF8F3] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E5DDD3]">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-[#E5DDD3] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5C4A3D]">
                Order Details
              </h2>
              <p className="text-xs text-[#8B7355] font-mono">
                #{order.id.toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#5C4A3D] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
            {/* Fulfillment Status Banner */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              order.fulfillmentStatus === 'FULFILLED'
                ? 'bg-green-50 border-green-100 text-green-800'
                : 'bg-yellow-50 border-yellow-100 text-yellow-800'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {order.fulfillmentStatus === 'FULFILLED' ? <CheckCircle size={20} /> : <Clock size={20} />}
                Status: {order.fulfillmentStatus}
              </div>
              <button
                onClick={() => onToggleFulfillment(order.id, order.fulfillmentStatus)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  order.fulfillmentStatus === 'FULFILLED'
                    ? 'bg-white border border-green-200 hover:bg-green-100'
                    : 'bg-[#4A7C59] text-white hover:bg-[#3D6649]'
                }`}
              >
                Mark as {order.fulfillmentStatus === 'FULFILLED' ? 'Pending' : 'Fulfilled'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#8B7355] uppercase tracking-wider flex items-center gap-2">
                  <User size={16} /> Customer Information
                </h3>
                <div className="bg-white p-4 rounded-xl border border-[#E5DDD3] space-y-3">
                  <p className="font-serif font-bold text-[#5C4A3D]">{order.customerName}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-[#636E72] flex items-center gap-2">
                      <Mail size={14} /> {order.customerEmail}
                    </p>
                    <p className="text-sm text-[#636E72] flex items-center gap-2">
                      <Phone size={14} /> {order.customerPhone}
                    </p>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#8B7355] uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} /> Fulfillment ({order.fulfillmentMethod})
                </h3>
                <div className="bg-white p-4 rounded-xl border border-[#E5DDD3]">
                  {order.fulfillmentMethod === 'SHIPPING' && order.shippingAddress ? (
                    <div className="text-sm text-[#636E72] italic">
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </div>
                  ) : (
                    <p className="text-sm text-[#636E72] italic">Local Pickup at 4050 HQ</p>
                  )}
                </div>
              </div>

              {/* Impact Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#8B7355] uppercase tracking-wider flex items-center gap-2">
                  <Leaf size={16} /> Impact Sown
                </h3>
                <div className="bg-[#E8F0EA] p-5 rounded-xl border border-[#4A7C59]/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#4A7C59]">Seeds Sown</span>
                    <span className="text-2xl font-bold text-[#4A7C59]">{order.seedCount}</span>
                  </div>
                  <div className="pt-3 border-t border-[#4A7C59]/10">
                    <p className="text-xs font-bold text-[#4A7C59] uppercase mb-1">Cause Supported</p>
                    <p className="text-sm font-serif font-bold text-[#5C4A3D]">{cause?.name || 'No Cause Selected'}</p>
                  </div>
                  {order.extraSupportAmount && order.extraSupportAmount > 0 && (
                    <div className="pt-3 border-t border-[#4A7C59]/10 flex justify-between items-center">
                      <span className="text-xs font-bold text-[#8B7355] flex items-center gap-1">
                        <Coins size={12} /> Extra Support
                      </span>
                      <span className="text-sm font-bold text-[#8B7355]">{formatPrice(order.extraSupportAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#8B7355] uppercase tracking-wider flex items-center gap-2">
                <Package size={16} /> Order Items
              </h3>
              <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F9F6F2] border-b border-[#E5DDD3] text-[#8B7355] font-bold">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DDD3]">
                    {order.items.map((item) => (
                      <tr key={item.id} className="text-[#5C4A3D]">
                        <td className="px-4 py-3 font-serif font-bold">{item.productName}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-xs">{formatPrice(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatPrice(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F9F6F2] font-bold text-[#5C4A3D]">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right">Subtotal</td>
                      <td className="px-4 py-3 text-right">{formatPrice(order.subtotal)}</td>
                    </tr>
                    {order.shippingCost && order.shippingCost > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right">Shipping</td>
                        <td className="px-4 py-3 text-right">{formatPrice(order.shippingCost)}</td>
                      </tr>
                    )}
                    {order.extraSupportAmount && order.extraSupportAmount > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right">Extra Support</td>
                        <td className="px-4 py-3 text-right">{formatPrice(order.extraSupportAmount)}</td>
                      </tr>
                    )}
                    <tr className="text-lg bg-[#F5EDE4]">
                      <td colSpan={3} className="px-4 py-4 text-right font-serif">Total</td>
                      <td className="px-4 py-4 text-right font-serif">{formatPrice(order.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="text-center text-xs text-[#8B7355] pt-4 italic">
              Order placed on {formatDateTime(order.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

