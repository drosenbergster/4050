# Admin Fulfillment Printing (Packing Slips + Address Labels)

This note documents the **print-friendly fulfillment pages** added to the Admin experience so we can pick up work later without re-discovering context.

## What was added

- **Packing slip (printable)** for any order:
  - Route: `/admin/orders/[id]/packing-slip`
  - Purpose: a simple “pick/pack” checklist with order details.
  - Includes: customer info, address (if shipping), totals, item list with checkboxes.

- **Address label (printable, no postage)** for shipping orders only:
  - Route: `/admin/orders/[id]/address-label`
  - Purpose: a clean address label for printing onto label paper.
  - Important: this is **not** a carrier postage label. Postage labels require a shipping provider integration.

- **Order modal buttons** to open print pages:
  - In `app/admin/components/order-detail-modal.tsx`, added:
    - “Print packing slip” (always shown)
    - “Print address label” (only when `fulfillmentMethod === 'SHIPPING'` and there is a `shippingAddress`)

- **Small admin UX polish**
  - Default admin tab is now **Products** (catalog-first workflow).
  - Clicking the fulfillment status pill in the orders list no longer also opens the order detail modal (uses `stopPropagation()`).

## How to use

1. Go to Admin: `/admin`
2. Open an order (Orders tab → click order row)
3. Click:
   - **Print packing slip** → opens in a new tab → click **Print**
   - **Print address label** (shipping only) → opens in a new tab → click **Print**

## Implementation notes (where things live)

- Packing slip page:
  - `app/admin/orders/[id]/packing-slip/page.tsx`
  - `app/admin/orders/[id]/packing-slip/print-actions.tsx`
- Address label page:
  - `app/admin/orders/[id]/address-label/page.tsx`
  - `app/admin/orders/[id]/address-label/print-actions.tsx`
- Wiring into order modal:
  - `app/admin/components/order-detail-modal.tsx`
- Default tab + click propagation fix:
  - `app/admin/page.tsx`

These pages use server-side data fetching via Prisma (`prisma.order.findUnique`) and are protected by `getAuthSession()` (redirect to `/admin/login` if unauthenticated).

## Known limitations / future work

- **Postage labels are not implemented**
  - Current “address label” is a plain address block for printing.
  - To support “Buy + Print Shipping Label” we need a carrier integration (e.g., Shippo or EasyPost), store label URL + tracking, and add a button in the order UI.

- **No product variants/sizes in the data model yet**
  - Today, `OrderItem` has no concept of “size/variant”, so packing slips cannot show sizes.
  - For products with sizes, we’ll need a `ProductVariant` model and to snapshot selected variant info onto `OrderItem`.

- **Schema drift to resolve**
  - The DB migrations include `products.category`, but `prisma/schema.prisma` currently does not.
  - There’s also a migrations folder suggesting a “stock count” change that is not reflected in `schema.prisma`.
  - Before implementing variants/stock, bring Prisma schema back in sync with actual DB migrations.



