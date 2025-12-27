import { redirect } from 'next/navigation';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';
import { formatDateTime, formatPrice } from '@/lib/format';
import { PrintActions } from './print-actions';

export default async function PackingSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold text-gray-900">Order not found.</p>
          <p className="mt-1 text-sm text-gray-600">It may have been deleted.</p>
          <div className="mt-4">
            <a
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  const shippingAddress =
    order.fulfillmentMethod === 'SHIPPING' ? (order.shippingAddress as any) : null;

  return (
    <div className="mx-auto max-w-3xl p-6 print:p-0">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packing Slip</h1>
          <div className="mt-1 text-sm text-gray-600">
            Order <span className="font-mono font-semibold">#{order.id.slice(-8).toUpperCase()}</span> •{' '}
            {formatDateTime(order.createdAt)}
          </div>
        </div>
        <PrintActions />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 print:border-none print:p-0">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Ship To</div>
            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 print:border-none print:bg-transparent print:p-0">
              <div className="font-semibold text-gray-900">{order.customerName}</div>
              {order.fulfillmentMethod === 'SHIPPING' && shippingAddress ? (
                <div className="mt-1 text-sm text-gray-700">
                  {shippingAddress.street}
                  <br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-700">Local Pickup</div>
              )}
              <div className="mt-2 text-sm text-gray-700">
                {order.customerEmail}
                <br />
                {order.customerPhone}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Order Summary</div>
            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 print:border-none print:bg-transparent print:p-0">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.shippingCost && order.shippingCost > 0 && (
                <div className="mt-1 flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">{formatPrice(order.shippingCost)}</span>
                </div>
              )}
              {(order as any).extraSupportAmount && (order as any).extraSupportAmount > 0 && (
                <div className="mt-1 flex items-center justify-between">
                  <span>Extra Support</span>
                  <span className="font-semibold">{formatPrice((order as any).extraSupportAmount)}</span>
                </div>
              )}
              <div className="mt-2 border-t border-gray-200 pt-2 flex items-center justify-between text-base print:border-gray-400">
                <span className="font-bold">Total</span>
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Items</div>
          <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 print:border-gray-400">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-600 print:bg-transparent">
                <tr>
                  <th className="px-4 py-3 w-10 print:px-2">✓</th>
                  <th className="px-4 py-3 print:px-2">Item</th>
                  <th className="px-4 py-3 text-center w-20 print:px-2">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 print:px-2">
                      <div className="h-4 w-4 rounded border border-gray-400" />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 print:px-2">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 print:px-2">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 print:mt-8">
          Printed from 4050 Admin • {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}



