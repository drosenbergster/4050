# Development Status

## Completed
- [x] Project initialization (Next.js 14+, TypeScript, Tailwind).
- [x] Prisma setup and schema definition (User, Product, Order).
- [x] **Kindness Refocus (Dec 2025)**:
  - Renamed "Cart" to "Basket" everywhere. 🧺
  - Refactored into a single **HomemadeCard** with "Kitchen Journal" styling. 🍎
  - Implemented **Seeds of Kindness** voting system ($10 = 1 seed). 🌱
  - Implemented **Sow Extra Seeds** (voluntary gifts) in checkout. 🤝
  - Updated all brand copy to reflect **Heritage Trees** and **PNW Backyard**. 🌲
  - Updated **Admin Dashboard** with Seed Growth Tracker. 📈
- [x] Admin Authentication (NextAuth.js Google OAuth).
- [x] Admin Product Management (UI + API).
- [x] API Routes for Products, Auth, and Checkout.
- [x] Database: Fixed naming to snake_case and added missing columns for Seeds system.
- [x] **Operational & Admin Enhancements (Dec 19, 2025)**:
  - **Admin Order Detail View**: Implemented full modal view for order fulfillment. 📦
  - **Fulfillment API**: Created real API routes for fetching and updating orders.
  - **Search & Filters**: Added product search and category filtering to Shop Page. 🔍
  - **Security Audit**: Hardened checkout validation and server-side recalculations. 🔐
  - **Database Seeding**: Fixed `npm run db:seed` script; now fully reliable. 🌱
  - **Technical Debt**: Removed deprecated components and fixed hydration/LCP errors.
  - **Transactional Emails**: Implemented Resend integration and Stripe Webhooks. 📧

## Pending / Blocked
- [ ] **Stripe Live Mode**: Awaiting live API keys for production testing.

## Next Steps
1. **End-to-End Visual Polish**: Final pass on typography and spacing for mobile checkout.
2. **Order Confirmation Emails**: Discuss and implement simple transactional emails.
3. **Product Content Pass**: Refine heritage descriptions for the current harvest.

## Known Issues
- `prisma.config.ts` causes build noise but deployment works.
- Hydration errors in Checkout (FIXED - using `mounted` state).
