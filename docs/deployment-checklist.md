# Deployment Checklist & Database Setup

## Current Status
- **Frontend**: Complete (Home, Shop, About, Cart, Admin UI).
- **Backend**: API Routes ready but using Mock Data.
- **Database**: Schema defined, but connection pending.

## Database Connection Issue
We are unable to connect to the Supabase database `fwagehvkevmjbyujommf`.
- **Direct Connection (Port 5432)**: Fails because the database is IPv6 only, and the current environment (and potentially Vercel/standard node environments) requires IPv4 or special configuration.
- **Pooler Connection (Port 6543)**: Fails with "Tenant or user not found". This usually means the project is not in the default `us-east-1` region, so the pooler hostname `aws-0-us-east-1.pooler.supabase.com` is incorrect.

## Action Required
To fix this, we need the correct **Connection String** from your Supabase Dashboard.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select project `fwagehvkevmjbyujommf`.
3. Go to **Project Settings** (cog icon) -> **Database**.
4. Under **Connection String**, select **URI** and **Transaction** mode (for port 6543) or **Session** mode (for port 5432).
5. Copy the value (it looks like `postgresql://postgres.fwagehvkevmjbyujommf:[YOUR-PASSWORD]@...`).

## Setting up Environment Variables
Once you have the correct string, create a `.env` file in the root directory (copy `env.example`) and update `DATABASE_URL`:

```bash
cp env.example .env
# Edit .env and paste your connection string
```

## Migration & Seeding
After fixing `.env`, run:

```bash
npm run db:migrate
npm run db:seed
```

This will create the tables and add the initial products.

## Switching to Real Data
1. Open `app/shop/page.tsx` and uncomment the `getProducts` database call, removing the `MOCK_PRODUCTS`.
2. Open `app/admin/page.tsx` and remove mock data, enabling the real API calls (which need to be implemented in `app/api/products/route.ts`).

