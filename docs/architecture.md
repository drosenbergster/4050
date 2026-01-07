# 4050 Simplified Architecture Document

**Version:** 2.6 (Kitchen-Shop Separation)  
**Date:** January 6, 2026  
**Status:** In Development  
**Project:** 4050 Homemade Kindness

---

## Introduction

This document outlines the simplified fullstack architecture for 4050, focused on a straightforward, heartfelt experience for sharing homemade goods from a PNW heritage garden.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-06 | 2.6 | Kitchen-Shop Separation: Kitchen food-focused (no costs), Shop handles pricing/COGS, auto price calculation | Winston (Architect) |
| 2026-01-04 | 2.5 | Product Hierarchy (Category→Flavor→Size→Batch), Catalog Management, Kitchen integration | Winston (Architect) |
| 2025-12-27 | 2.4 | Added Recipe Costing feature with Ingredient Library | Winston (Architect) |
| 2025-12-19 | 2.3 | Added Admin Order API routes and Search logic | James (Dev) |
| 2025-12-18 | 2.2 | Transitioned from "Voices" to "Seeds of Kindness" ($10 = 1 seed) | John (PM) |
| 2025-12-18 | 2.1 | Refocused terminology (Basket, Homemade Goods, Impact Tracker) | Mary (Analyst) |
| 2025-11-28 | 2.0 | Simplified architecture - removed EasyPost, Resend | Mary (Analyst) |

---

## High Level Architecture

### Technical Summary

4050 uses **Next.js 14+ (App Router)** deployed to Vercel, with **PostgreSQL + Prisma** for data, **Stripe** for payments, and **Vercel Blob** for image storage. The architecture prioritizes a solo stewardship vibe: minimalist UI, flat-rate shipping, and a "Seeds of Kindness" impact tracker for community visibility.

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Frontend | Next.js 14+ (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first styling |
| Database | PostgreSQL | Data storage |
| ORM | Prisma | Type-safe database access |
| Storage | Vercel Blob | Product images |
| Payments | Stripe | Payment processing |
| Auth | NextAuth.js | Admin authentication (Google) |
| Emails | Resend | Transactional emails (Confirmation) |
| State | React Context + localStorage | Basket state |

---

## Data Models

### Product Hierarchy (v2.5)

The product system follows a four-level hierarchy designed for artisan food products:

```
ProductCategory → ProductFlavor → ProductSize → ProductBatch
```

#### ProductCategory
Top-level product groupings.
- id, name (unique), description, imageUrl, sortOrder, isActive
- Examples: "Jams and Spreads", "Applesauce", "Pickles", "Dried Goods"

#### ProductFlavor
Specific product variants within a category. **This is the primary "product" entity.**
- id, categoryId, name, description, imageUrl, isAvailable, sortOrder
- **cogsRecipeId**: Links to Kitchen recipe for cost/price management
- **costUpdatedAt**: Timestamp when recipe costs were last updated (triggers "💰 Costs updated" badge in Shop)
- Examples: "Caramel Thyme Apple Butter", "Classic Applesauce", "Raspberry Jam"

#### ProductSize
Size/packaging options for each flavor. **Inventory is tracked at this level.**
- id, flavorId, sizeKey, sizeLabel, sizeOz, unitPrice, quantity, isActive, sortOrder
- **labelCost**: Label cost in cents (default $0.15)
- **containerCost**: Container cost in cents (varies by size: bag $0.30, jars $1.00-$1.30)
- COGS calculated: (recipe costPerOz × sizeOz) + labelCost + containerCost
- Examples: "8 oz jar" ($5.99), "16 oz jar" ($9.99)

#### ProductBatch
Production batch tracking for inventory management.
- id, flavorId, sizeId (optional), batchDate, quantity, notes
- Used to track when batches were made and increment inventory

### Order System

#### Order
- id, customerName, customerEmail, customerPhone, shippingAddress (JSON), fulfillmentMethod
- **proceedsChoice**: Selected cause ID (Seeds of Kindness)
- **extraSupportAmount**: "Sow Extra Seeds" amount (cents)
- **seedCount**: Calculated seeds sown (1 base + 1 per $10)
- shippingCost, subtotal, total, paymentStatus, fulfillmentStatus, stripePaymentIntentId

#### OrderItem
- id, orderId, productName (snapshot), quantity, unitPrice, lineTotal
- **flavorId**: Links to ProductFlavor (new hierarchy)
- **sizeKey**: Size identifier for the ordered item
- *Legacy fields*: productId, variantKey (for backwards compatibility)

### Kitchen (Recipe Costing)

#### Ingredient
- id, name, unitCost, unit, source (GARDEN/PANTRY/PACKAGING), category, notes
- Purchase tracking: purchaseSize, purchaseUnit, purchaseCost

#### CogsRecipe
- id, name, description, containerType, containerCost, labelCost, energyCost, retailPrice
- status: IDEA → READY → PUBLISHED
- batchYield: Number of jars per batch (for batch costing mode)
- **Links to ProductFlavor** when published to store

### Garden Planner

#### Crop
- Growing timeline (seedStartWeek, harvestStart/End, peakStart/End)
- Yield tracking (plantCount, yieldPerUnit, yieldUnit, lastYearYield)
- Layout (spacingInches) for garden sandbox
- Links to Ingredient for cost tracking

#### SeasonalTask
- Monthly task tracking with completion status

#### GardenLayout
- JSON canvas data for garden bed layouts

### Organization Management (Seeds of Kindness)

#### Organization
- Beneficiary organizations for proceeds
- status: ACTIVE, IN_POOL, PAST_PARTNER
- category: FOOD, GARDEN, YOUTH, COMMUNITY

#### Nomination
- Community nominations for new beneficiary organizations

---

## API Routes

### Public API
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/products` | GET | Fetch public product list (legacy) | No |
| `/api/catalog` | GET | Fetch full catalog hierarchy | No |
| `/api/checkout` | POST | Initialize Stripe and Order | No |
| `/api/webhooks/stripe` | POST | Handle Stripe payment events | No |
| `/api/organizations` | GET | List active organizations | No |
| `/api/organizations/nominate` | POST | Submit organization nomination | No |

### Catalog API (Product Hierarchy)
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/catalog` | GET | Full catalog (categories + flavors + sizes) | No |
| `/api/catalog/categories` | GET/POST | List/create categories | Yes |
| `/api/catalog/flavors` | GET/POST | List/create flavors | Yes |
| `/api/catalog/flavors/[id]` | GET/PUT/DELETE | Manage single flavor | Yes |
| `/api/catalog/flavors/[id]/sizes` | GET/POST | List/create sizes for flavor | Yes |
| `/api/catalog/sizes/[id]` | GET/PUT/DELETE | Manage single size | Yes |
| `/api/catalog/sizes/[id]/inventory` | PATCH | Adjust size inventory (+/-) | Yes |
| `/api/catalog/batches` | GET/POST | List/create production batches | Yes |

### Kitchen API (Recipe Costing)
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/admin/cogs/ingredients` | GET/POST | List/create ingredients | Yes |
| `/api/admin/cogs/ingredients/[id]` | GET/PATCH/DELETE | Manage single ingredient | Yes |
| `/api/admin/cogs/recipes` | GET/POST | List/create recipes (with status filter) | Yes |
| `/api/admin/cogs/recipes/[id]` | GET/PATCH/DELETE | Manage single recipe | Yes |

### Admin API
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/admin/orders` | GET | Fetch all orders with items | Yes |
| `/api/admin/orders/[id]` | PATCH | Update order status | Yes |
| `/api/admin/products/from-recipe` | POST | Publish recipe to store | Yes |
| `/api/admin/organizations` | GET/POST | Manage organizations | Yes |
| `/api/admin/nominations` | GET | List nominations | Yes |
| `/api/admin/nominations/[id]` | PATCH | Approve/reject nomination | Yes |

### Garden Planner API
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/admin/crops` | GET/POST | Manage crops | Yes |
| `/api/admin/crops/[id]` | PATCH/DELETE | Single crop operations | Yes |
| `/api/admin/tasks` | GET/POST | Manage seasonal tasks | Yes |
| `/api/admin/layouts` | GET/POST | Manage garden layouts | Yes |

---

## Frontend Pages

### Public Pages
- `/` - Homepage (The Heritage Garden Story)
- `/shop` - From the Garden (Product catalog with filters)
- `/product/[id]` - Product detail page (flavor with size selection)
- `/basket` - Your Basket
- `/checkout` - Guest Checkout (Hydration-safe)
- `/thank-you` - Thank You (Seeds Sown summary)
- `/about` - Our Story (PNW Backyard Heritage)
- `/impact` - Seeds of Kindness impact page
- `/privacy` - Privacy policy

### Admin Pages
- `/admin/login` - Admin login (Google OAuth)
- `/admin` - Dashboard with tabs:
  - **Orders** - Order fulfillment with packing slips & address labels
  - **Shop** - Business-focused product management (pricing, COGS, inventory)
  - **Kitchen** - Food-focused recipe creation (no costs, just ingredients)
  - **Garden Planner** - Seasonal timeline and layout sandbox
  - **Organizations** - Seeds of Kindness beneficiary management
- `/admin/dev` - Development testing (localhost only, no auth required)
- `/admin/orders/[id]/*` - Order detail views (packing slip, address label)

---

## Key Workflows

### Publishing a Product (Kitchen → Shop)

**Kitchen** is food-focused (no cost displays). **Shop** handles all business concerns.

1. **Create Recipe** in Kitchen (💡 Dreaming Up)
   - Add ingredients with quantities
   - Set batch yield and container type
   - No cost information shown - Kitchen is food-focused
   
2. **Mark Ready** (✨ Almost There)
   - Recipe reviewed and ready for store
   
3. **Publish to Store** ("Put on Shelf")
   - Click "Put on Shelf" → Opens publish modal
   - Select/create category, add description, image
   - **Select first size** (4oz, 8oz, 16oz, or 32oz)
   - Container type auto-populated (4oz → bag, others → jar)
   - **Price auto-calculated** from COGS with 40% target margin
   - Creates ProductFlavor + first ProductSize, sets recipe status to PUBLISHED
   
4. **Manage in Shop tab**
   - View COGS breakdown (ingredients + container + label)
   - See margin % and suggested price per size
   - Add additional size options with auto-calculated prices
   - "View recipe →" link to navigate back to Kitchen
   - "💰 Costs updated" badge when recipe changes affect prices

5. **Recipe Edit Impact**
   - Editing a published recipe shows warning modal
   - Confirms cost recalculation before saving
   - Shop prices auto-update when recipe costs change

6. **Manage Inventory**
   - Track stock at size level
   - Add/subtract inventory inline

### Customer Purchase Flow

1. Browse `/shop` → Filter by category, search products
2. Click product → View detail page with sizes
3. Select size → Add to Basket
4. View `/basket` → Review items
5. Checkout → Fill details, select pickup/shipping
6. **Seeds of Kindness** → Choose beneficiary
7. **Sow Extra Seeds** → Optional additional donation
8. Payment → Stripe processes
9. Success → `/thank-you` with seeds sown summary

### Admin Order Fulfillment

1. Login → Navigate to `/admin`
2. View pending orders with quick counts
3. Click order → View details in modal
4. Mark as fulfilled → Toggle status

---

## Database Schema Considerations

### Legacy Models (Migration Path)

The schema includes legacy `Product` and `ProductVariant` models for backwards compatibility. New code should use the Product Hierarchy:

| Legacy | New Equivalent |
|--------|----------------|
| Product | ProductFlavor |
| ProductVariant | ProductSize |
| Product.category | ProductCategory |

### OrderItem Dual References

OrderItem maintains both legacy (`productId`, `variantKey`) and new (`flavorId`, `sizeKey`) fields during transition:

```prisma
model OrderItem {
  // New hierarchy
  flavorId    String?
  sizeKey     String?
  // Legacy (backwards compatibility)
  productId   String?
  variantKey  String?
}
```

### Inventory Tracking

Stock is tracked at the **ProductSize** level:
- `ProductSize.quantity` holds current stock
- Use `/api/catalog/sizes/[id]/inventory` for adjustments
- Batches are informational (production tracking)

---

## Deployment

- **Frontend/Backend:** Vercel
- **Database:** Supabase PostgreSQL
- **Storage:** Vercel Blob
- **Migrations:** `prisma migrate deploy`
- **Environment:** See `docs/setup/` for configuration guides
