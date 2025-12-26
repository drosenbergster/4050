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

### API routes (`app/api/`)
- `app/api/products/*`: Public product endpoints
- `app/api/checkout/route.ts`: Creates order + Stripe PaymentIntent (hardened to avoid “paid without order”)
- `app/api/webhooks/stripe/route.ts`: Stripe webhook updates order status + triggers email
- `app/api/admin/*`: Admin-protected order management

## Shared code (`lib/`)
- `lib/types.ts`: Shared TS types used by UI + API
- `lib/server/db.ts`: Prisma singleton client
- `lib/server/auth.ts`: Admin auth/session utilities
- `lib/server/mail.ts`: Resend email templates/sender





