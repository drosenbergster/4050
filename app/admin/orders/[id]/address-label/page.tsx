import { redirect } from 'next/navigation';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';
import { formatDateTime } from '@/lib/format';
import { PrintActions } from './print-actions';

export default async function AddressLabelPage({
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

  if (order.fulfillmentMethod !== 'SHIPPING' || !order.shippingAddress) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold text-gray-900">No shipping label for pickup orders.</p>
          <p className="mt-1 text-sm text-gray-600">
            This order is marked as <span className="font-semibold">{order.fulfillmentMethod}</span>.
          </p>
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

  const shippingAddress = order.shippingAddress as any;

  return (
    <div className="mx-auto max-w-3xl p-6 print:p-0">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Address Label</h1>
          <div className="mt-1 text-sm text-gray-600">
            Order <span className="font-mono font-semibold">#{order.id.slice(-8).toUpperCase()}</span> •{' '}
            {formatDateTime(order.createdAt)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Note: this is an <span className="font-semibold">address label only</span> (no postage). Shipping-postage
            labels require a carrier integration.
          </div>
        </div>
        <PrintActions />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 print:border-none print:p-0">
        <div className="mx-auto w-full max-w-lg rounded-lg border-2 border-dashed border-gray-300 p-8 print:border-black">
          <div className="text-lg font-bold text-gray-900">{order.customerName}</div>
          <div className="mt-2 text-base text-gray-900">
            {shippingAddress.street}
            <br />
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
          </div>
          <div className="mt-4 text-sm text-gray-700">
            {order.customerEmail}
            <br />
            {order.customerPhone}
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Printed from 4050 Admin • {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}



