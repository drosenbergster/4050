# Tech Stack

This project is a small Next.js e-commerce experience designed for a simple "homegrown" checkout flow.

## Runtime
- **Next.js (App Router)**: Full-stack React framework (pages + API routes)
- **React**: UI rendering
- **TypeScript**: Shared types across frontend and backend

## Data & Infra
- **PostgreSQL**: Primary data store
- **Prisma**: ORM + schema/migrations + generated client
- **Supabase** (or equivalent Postgres): Hosted Postgres provider
- **Vercel**: Deployment target (serverless runtime)

## Authentication
- **NextAuth.js**: Google OAuth for admin access

## Payments & Email
- **Stripe**: Payments (PaymentIntent + webhook)
- **Resend**: Transactional emails (order confirmation)

## UI
- **Tailwind CSS**: Styling system
- **lucide-react**: Icon set

## Custom Utilities
- **Unit Conversions** (`lib/unit-conversions.ts`): Handles volume/weight conversions for ingredient costing









