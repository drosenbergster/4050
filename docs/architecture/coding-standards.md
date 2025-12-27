# Coding Standards

This repo aims for “simple, honest, operational” code: minimal magic, strong typing, predictable behavior.

## TypeScript
- Prefer **shared types** from `lib/types.ts` over ad-hoc interfaces in components/pages.
- Avoid `any`. Use `unknown` for untrusted inputs, then validate/narrow.
- Treat API request bodies as untrusted: validate required fields and types.

## Next.js (App Router)
- Server routes live in `app/api/**/route.ts`.
- Use Next’s `NextResponse` for JSON responses.
- Keep client components explicit with `'use client'` and avoid hydration mismatches (don’t read `localStorage` before mount).

## Prisma / Database
- `DATABASE_URL` should be the **transaction pooler** in serverless (Vercel).
- `DIRECT_URL` should be the **direct** connection for migrations/introspection.
- Checkout routes must **recalculate totals server-side** from DB prices (never trust client totals).
- Avoid “paid but no order” flows: only return a Stripe `clientSecret` when the order is persisted and linked.

## Styling / UI
- Tailwind for styling.
- Keep copy “homegrown”: avoid corporate/enterprise tone in customer-facing text.

## Testing & Validation
- Run `npm run lint` and `npm run build` before calling work “ready”.








