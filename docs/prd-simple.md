# 4050 Simple Product Requirements Document (PRD)

**Version:** 2.0 (Simplified)  
**Date:** November 28, 2025  
**Status:** Draft - Simplified Focus  
**Project:** 4050 Simple Produce Marketplace

---

## Goals and Background Context

### Goals

- Enable customers to browse and purchase homegrown produce products through a simple, intuitive interface
- Support local pickup as the primary fulfillment method (shipping optional with flat rate)
- Provide secure payment processing with Stripe integration
- Enable admin to easily add/edit products and view orders
- Launch quickly with minimal complexity

### Background Context

4050 sells homemade produce products (applesauce, apple butter, jams, jellies) made from homegrown heritage apples. The focus is on simplicity: customers browse products, add to cart, checkout, and pick up locally (or pay flat-rate shipping). This is a small-scale operation that needs a straightforward solution, not enterprise-level complexity.

**Key Simplifications:**
- Both local pickup and shipping (flat rate for shipping, no complex calculations)
- Simple product management (available/not available toggle, no complex inventory tracking)
- Basic order management (view orders, mark fulfilled)
- Minimal pages (Home, Shop, About, Checkout)
- No email confirmations (just thank you page)

---

## Core Requirements

### Functional Requirements

**FR1:** Display a simple product catalog with photos, names, descriptions, and prices.

**FR2:** Allow customers to add products to a shopping cart.

**FR3:** Allow customers to view cart, update quantities, and remove items.

**FR4:** Provide a simple checkout that collects:
- Customer name, email, phone
- Fulfillment method (Local Pickup or Shipping)
- If shipping: address (street, city, state, zip)
- Payment via Stripe

**FR5:** For shipping, use a simple flat rate (e.g., $8.00) - no real-time calculations. Local pickup has $0 shipping cost.

**FR6:** After payment, show a thank you page with order summary.

**FR7:** Admin can add/edit/delete products (name, description, price, photo, available/not available).

**FR8:** Admin can view orders and mark them as fulfilled.

**FR9:** Include a simple About page with brand story.

### Non-Functional Requirements

**NFR1:** Mobile-responsive design.

**NFR2:** Fast page loads (<3 seconds).

**NFR3:** Secure payment processing (Stripe handles PCI compliance).

**NFR4:** Simple to maintain (no complex infrastructure).

---

## User Flows

### Customer Purchase Flow

1. Browse products on `/shop` page
2. Click "Add to Cart" on desired products
3. View cart at `/cart`
4. Click "Checkout"
5. Fill in contact info and select pickup or shipping
6. If shipping: enter address (flat rate shipping cost added automatically)
7. Enter payment details via Stripe
8. See thank you page with order details

### Admin Flow

1. Log in at `/admin/login`
2. View orders at `/admin/orders`
3. Add/edit products at `/admin/products`
4. Mark orders as fulfilled when ready

---

## Simplified Epic Structure

### Epic 1: Core Shopping Experience
- Product catalog page
- Shopping cart
- Simple checkout with Stripe
- Thank you page

### Epic 2: Basic Admin
- Admin login
- Product management (add/edit/delete)
- Order viewing and fulfillment

### Epic 3: Simple Content
- Homepage
- About page

---

## What We're Removing (vs. Original PRD)

❌ **Removed:**
- Real-time shipping cost calculator (using flat rate instead)
- Email confirmations (just thank you page)
- Complex inventory tracking (just available/not available toggle)
- Admin dashboard with metrics
- Contact/FAQ page
- Privacy Policy and Terms pages (can add later if needed)
- Product detail pages (all info on catalog page)
- Order detail pages (just list view)
- Complex error handling and retry flows

✅ **Keeping:**
- Product catalog
- Shopping cart
- Checkout with Stripe
- Basic admin (products and orders)
- Simple About page

---

## Technical Simplifications

### Database Schema (Simplified)

**Product:**
- id, name, description, price, imageUrl, isAvailable (boolean)

**Order:**
- id, customerName, customerEmail, customerPhone, shippingAddress (JSON, nullable), fulfillmentMethod, shippingCost (flat rate), subtotal, total, paymentStatus, fulfillmentStatus, stripePaymentIntentId, createdAt

**OrderItem:**
- id, orderId, productId, productName (snapshot), quantity, unitPrice, lineTotal

**User (Admin):**
- id, email, passwordHash, name

### API Routes (Simplified)

**Public:**
- `GET /api/products` - List available products
- `POST /api/checkout` - Create order and payment intent

**Admin:**
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- `GET /api/admin/orders` - List orders
- `PATCH /api/admin/orders/[id]` - Mark fulfilled

### Pages (Simplified)

**Public:**
- `/` - Homepage
- `/shop` - Product catalog
- `/cart` - Shopping cart
- `/checkout` - Checkout form
- `/thank-you` - Order confirmation
- `/about` - About page

**Admin:**
- `/admin/login` - Admin login
- `/admin/products` - Product list and management
- `/admin/orders` - Order list

---

## Success Criteria

The simplified MVP is successful when:
1. A customer can browse products, add to cart, checkout, and pay
2. Admin can add products and view orders
3. System handles 10+ successful transactions
4. Mobile experience works smoothly

---

## Timeline

**Target:** Launch in 4-6 weeks (vs. 3-4 months for full version)

**Phase 1 (Week 1-2):** Setup, product catalog, cart
**Phase 2 (Week 3-4):** Checkout, Stripe integration
**Phase 3 (Week 5-6):** Admin, polish, launch

---

## Next Steps

1. Review this simplified PRD
2. Confirm what to keep/remove
3. Update architecture document to match simplified scope
4. Begin development with simplified focus

---

*This simplified PRD focuses on getting a working product to market quickly. We can add complexity later if needed.*

