# Vercel DATABASE_URL Fix

## Problem
The `/api/products` endpoint is returning 500 errors because Prisma can't connect to the database in production.

## Solution
Update the `DATABASE_URL` environment variable in Vercel to use the IPv4-compatible Transaction Pooler and ensure the username includes the project-specific tenant prefix.
Also set `DIRECT_URL` to the direct 5432 connection for Prisma migrations and introspection.

## Steps to Fix

### 1. Go to Vercel Dashboard
https://vercel.com/david-rosenbergs-projects-4a669732/4050/settings/environment-variables

### 2. Update DATABASE_URL
**Find the `DATABASE_URL` variable and update it to the Pooler URL:**

```
postgresql://postgres.fwagehvkevmjbyujommf:mHt_t%263%23ed%26diY9@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Key changes required for success:**
- ✅ **Tenant Prefix**: The username must be `postgres.fwagehvkevmjbyujommf` (not just `postgres`).
- ✅ **Port 6543**: Required for IPv4 compatibility in Vercel.
- ✅ **Query Params**: Must include `?pgbouncer=true&connection_limit=1`.
- ✅ **URL-encoded password**: Ensure special characters like `&` are encoded (e.g., `%26`).

### 3. Redeploy
After updating the environment variable:
1. Click **"Redeploy"** on the latest deployment
2. Or push a new commit to trigger auto-deploy

---

## Why This Matters
- **Direct connection (port 5432):** IPv6-only, doesn't work with Vercel's IPv4 infrastructure
- **Transaction Pooler (port 6543):** IPv4-compatible, works with Prisma + Vercel

## DIRECT_URL (Prisma migrations)
Set `DIRECT_URL` to the **direct** connection string (5432). This is used by Prisma for migrations/introspection while runtime uses the pooler via `DATABASE_URL`.

---

## Verification
After deployment, check:
1. Visit https://4050.vercel.app
2. Products should load with Unsplash images
3. Console should show no 500 errors

---

**Current Status:** DATABASE_URL needs to be updated in Vercel's environment variables dashboard (I cannot do this automatically via MCP).









