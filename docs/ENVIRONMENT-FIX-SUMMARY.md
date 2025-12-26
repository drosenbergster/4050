# Environment Database Connection Handoff

This document summarizes the findings regarding the `FATAL: Tenant or user not found` error and provides clear steps to ensure a stable database connection across different environments.

## 🔍 The Findings

During testing, we encountered the `FATAL: Tenant or user not found` error. This is a common issue with Supabase + Prisma + Vercel related to how connection pooling is handled.

### 1. The Root Cause
- **Port 5432 (Direct)**: Uses IPv6. Vercel's serverless functions currently operate on IPv4, meaning they cannot connect directly to Supabase via 5432 in many cases.
- **Port 6543 (Pooler)**: Uses IPv4 and PGBouncer. This is required for Vercel, but if configured incorrectly (e.g., missing `?pgbouncer=true` or incorrect tenant prefix), it throws the "Tenant not found" error.

---

## 🛠️ The Fixes

### 📍 Local Development (.env)
For the most stable local experience, **bypass the pooler** and use the direct connection.

1. Open your `.env` file.
2. Set `DATABASE_URL` to the **Direct Connection String** (port 5432).
3. Ensure `DIRECT_URL` is also set to the same value.

```bash
# Recommended Local Settings
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.fwagehvkevmjbyujommf.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.fwagehvkevmjbyujommf.supabase.co:5432/postgres"
```

### 📍 Vercel Production (Dashboard)
Vercel **requires the pooler** (port 6543) to work reliably with Prisma.

1. Go to **Vercel Settings > Environment Variables**.
2. Update `DATABASE_URL` to the **Transaction Pooler String**.
3. **CRITICAL**: Append `?pgbouncer=true&connection_limit=1` to the end.
4. Set `DIRECT_URL` to the **Direct Connection String** (port 5432) for migrations.

**Correct Vercel DATABASE_URL format:**
`postgresql://postgres.fwagehvkevmjbyujommf:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`

---

## ✅ Verification Steps
1. **Local**: Run `npx prisma db pull` or `npm run db:seed`. If it connects, the local config is correct.
2. **Production**: Check the `/api/products` or `/api/checkout` endpoints. A `503` or `500` error with "Tenant not found" in the Vercel logs means the pooler string is incorrect.

## 🧠 Build-Time Note (Next.js)
During `next build`, some routes/pages may execute server code that touches the database. If `DATABASE_URL` is misconfigured, you may see `FATAL: Tenant or user not found` in build logs. Fixing `DATABASE_URL` (pooler) resolves this; some pages (like `/shop`) may still render via static fallback, but checkout/admin require a working DB.

## 📝 Summary for Handoff
- **Local Dev**: Use port 5432.
- **Vercel**: Use port 6543 + `?pgbouncer=true&connection_limit=1`.
- **Tenant Prefix**: Ensure the username in the pooler string is `postgres.[YOUR-PROJECT-REF]`.

