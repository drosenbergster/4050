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
- `app/about/page.tsx`: About page
- `app/impact/page.tsx`: Impact/causes page

### Admin Pages (`app/admin/`)
- `app/admin/page.tsx`: Main admin dashboard (Orders, Products, Recipe Costing, Seasonal Planner tabs)
- `app/admin/dev/page.tsx`: Dev-mode admin (localhost only, no auth)
- `app/admin/login/page.tsx`: Google OAuth login
- `app/admin/orders/[id]/`: Order detail views (packing slip, address label)
- `app/admin/components/`:
  - `cogs-calculator.tsx`: Recipe Costing UI component
  - `product-list.tsx`: Product management with inline editing & category management
  - `product-form-modal.tsx`: Product add/edit form with category manager
  - `order-detail-modal.tsx`: Order fulfillment modal
  - `delete-confirm-modal.tsx`: Delete confirmation dialog
  - `seasonal-planner.tsx`: Seasonal Planner with crop calendar, tasks, and production planning

### API routes (`app/api/`)

#### Public APIs
- `app/api/products/route.ts`: GET all available products
- `app/api/products/[id]/route.ts`: GET single product
- `app/api/checkout/route.ts`: POST creates order + Stripe PaymentIntent
- `app/api/webhooks/stripe/route.ts`: Stripe webhook for order updates + email

#### Admin APIs
- `app/api/admin/orders/route.ts`: GET/POST orders
- `app/api/admin/orders/[id]/route.ts`: GET/PATCH/DELETE single order
- `app/api/admin/products/[id]/route.ts`: GET/PUT/DELETE single product
- `app/api/admin/products/from-recipe/route.ts`: POST create product from COGS recipe

#### COGS Calculator APIs
- `app/api/admin/cogs/ingredients/route.ts`: GET/POST ingredients
- `app/api/admin/cogs/ingredients/[id]/route.ts`: GET/PATCH/DELETE single ingredient
- `app/api/admin/cogs/recipes/route.ts`: GET/POST recipes
- `app/api/admin/cogs/recipes/[id]/route.ts`: GET/PATCH/DELETE single recipe

#### Seasonal Planner APIs
- `app/api/admin/crops/route.ts`: GET/POST crops
- `app/api/admin/crops/[id]/route.ts`: GET/PATCH/DELETE single crop
- `app/api/admin/tasks/route.ts`: GET/POST seasonal tasks (with year filter)
- `app/api/admin/tasks/[id]/route.ts`: GET/PATCH/DELETE single task
- `app/api/admin/tasks/archive/route.ts`: POST archive tasks by year

## Shared code (`lib/`)
- `lib/types.ts`: Shared TS types (Product, Order, Ingredient, CogsRecipe, Crop, SeasonalTask)
- `lib/causes.ts`: Seeds of Kindness cause definitions
- `lib/format.ts`: Formatting utilities (price, date)
- `lib/shipping.ts`: Shipping cost calculations
- `lib/static-data.ts`: Fallback product data for offline mode
- `lib/server/db.ts`: Prisma singleton client
- `lib/server/auth.ts`: Admin auth/session utilities (NextAuth)
- `lib/server/mail.ts`: Resend email templates/sender

## Database (`prisma/`)
- `prisma/schema.prisma`: Database schema including:
  - Core: User, Product, Order, OrderItem
  - COGS: Ingredient, CogsRecipe, CogsRecipeIngredient
  - Seasonal: Crop, SeasonalTask
- `prisma/seed.ts`: Main seed script
- `prisma/seed-cogs.ts`: Recipe Costing seed data (45 ingredients, 16 recipes)
- `prisma/seed-seasonal-planner.ts`: Seasonal planner seed data (12 crops, monthly tasks)
- `prisma/migrations/`: Database migrations
