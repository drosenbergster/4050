# Source Tree

High-level map of the repository to help contributors find things quickly.

## Top-level
- `app/`: Next.js App Router routes (pages + API routes)
- `lib/`: Shared utilities and server helpers (Prisma client, auth helpers, mail)
- `prisma/`: Prisma schema + migrations + seed
- `docs/`: Product + architecture + operational docs
- `public/`: Static assets

## App Router (`app/`)
- `app/page.tsx`: Home
- `app/shop/page.tsx`: Product list (falls back to static data if DB is offline)
- `app/basket/page.tsx`: Basket
- `app/checkout/page.tsx`: 3-step checkout (Details → Plant Your Seeds → Payment)
- `app/thank-you/page.tsx`: Post-checkout confirmation page

### Admin Pages (`app/admin/`)
- `app/admin/page.tsx`: Main admin dashboard (Orders, Products, Recipe Costing tabs)
- `app/admin/dev/page.tsx`: Dev-mode admin (localhost only, no auth)
- `app/admin/login/page.tsx`: Google OAuth login
- `app/admin/components/`:
  - `cogs-calculator.tsx`: Recipe Costing UI component
  - `product-list.tsx`: Product management component
  - `order-detail-modal.tsx`: Order fulfillment modal
  - `product-form-modal.tsx`: Product add/edit form
  - `delete-confirm-modal.tsx`: Delete confirmation dialog

### API routes (`app/api/`)
- `app/api/products/*`: Public product endpoints
- `app/api/checkout/route.ts`: Creates order + Stripe PaymentIntent
- `app/api/webhooks/stripe/route.ts`: Stripe webhook for order updates + email
- `app/api/admin/orders/*`: Admin order management
- `app/api/admin/products/*`: Admin product management
- `app/api/admin/cogs/`:
  - `ingredients/route.ts`: GET/POST ingredients
  - `ingredients/[id]/route.ts`: GET/PATCH/DELETE single ingredient
  - `recipes/route.ts`: GET/POST recipes
  - `recipes/[id]/route.ts`: GET/PATCH/DELETE single recipe

## Shared code (`lib/`)
- `lib/types.ts`: Shared TS types (Product, Order, Ingredient, CogsRecipe, etc.)
- `lib/causes.ts`: Seeds of Kindness cause definitions
- `lib/format.ts`: Formatting utilities
- `lib/shipping.ts`: Shipping cost calculations
- `lib/server/db.ts`: Prisma singleton client
- `lib/server/auth.ts`: Admin auth/session utilities (NextAuth)
- `lib/server/mail.ts`: Resend email templates/sender

## Database (`prisma/`)
- `prisma/schema.prisma`: Database schema (User, Product, Order, Ingredient, CogsRecipe)
- `prisma/seed.ts`: Main seed script
- `prisma/seed-cogs.ts`: Recipe Costing seed data (45 ingredients, 16 recipes)
- `prisma/migrations/`: Database migrations
