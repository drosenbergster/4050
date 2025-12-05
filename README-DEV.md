# 4050 Development Guide

## Quick Start

### 1. Database Setup

First, ensure you have a PostgreSQL database and DATABASE_URL configured:

```bash
# Create .env.local file
DATABASE_URL=postgresql://user:password@host:port/database
```

### 2. Run Database Migration

```bash
# Create the database tables
npm run db:migrate

# Or manually:
npx prisma migrate dev --name add_products_orders
```

### 3. Seed Products

```bash
# Populate database with 10 products
npm run db:seed
```

This will create:
- Applesauce
- Sugar-Free Applesauce
- Apple Rings
- Apple Butter
- Apple Chips
- Raspberry Jam
- Blueberry Jam
- Apple Jam
- Pickled Green Beans
- Pickles

**Note:** All products start with $0.00 price - set pricing via admin panel when ready.

### 4. View Database

```bash
# Open Prisma Studio to view/edit data
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with products
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Regenerate Prisma Client

---

## Database Schema

### Models

- **User** - Admin users for authentication
- **Product** - Store products (name, description, price, imageUrl, isAvailable)
- **Order** - Customer orders (customer info, fulfillment method, payment status)
- **OrderItem** - Products in an order (with price snapshots)

See `prisma/schema.prisma` for full schema definition.

---

## Shipping

Flat rate shipping: **$10.00**

- Local Pickup: $0.00
- Shipping: $10.00 (flat rate)

Location-based adjustments can be added later.

See `lib/shipping.ts` for calculation logic.

---

## Next Steps

1. ✅ Database schema complete
2. ✅ Products seeded
3. ⏳ Set up admin authentication (NextAuth.js)
4. ⏳ Build product catalog page
5. ⏳ Build shopping cart
6. ⏳ Build checkout with Stripe
7. ⏳ Build admin pages

See `docs/development-status.md` for full progress tracking.

---

## Environment Variables

Required environment variables (add to `.env.local`):

```bash
# Database
DATABASE_URL=postgresql://...

# NextAuth (admin auth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Vercel Blob (image storage)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

---

## Product Information

### Current Products (10)
All seeded with placeholder images and $0.00 pricing (TBD).

### Upcoming Products (Future)
- Pear Butter
- Strawberry Jam
- Apple Pie Filling
- Spiced Apple Cider Jam
- Pickled Beets
- Dried Pear Chips

---

## Pickup Information

- **Location:** 4050 HQ (exact address TBD)
- **Hours:** TBD
- **Display:** Shown on About page and during checkout when pickup selected

---

## Questions?

See:
- `docs/prd.md` - Product Requirements Document
- `docs/architecture.md` - Technical Architecture
- `docs/development-status.md` - Development Progress
- `docs/open-questions.md` - Open Questions

