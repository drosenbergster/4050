# Vercel Environment Variables Setup

## Copy these into Vercel Dashboard during import:

### 1. DATABASE_URL
```
postgresql://postgres.fwagehvkevmjbyujommf:YOUR_DB_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### 1b. DIRECT_URL (Required for Prisma migrations)
```
postgresql://postgres:YOUR_DB_PASSWORD@db.fwagehvkevmjbyujommf.supabase.co:5432/postgres
```

### 2. NEXTAUTH_SECRET
```
YW8XvAS6J7rzp/BZhWUhkWTu0s2ULQQsQ9rqcB17lyU=
```

### 3. NEXTAUTH_URL
```
https://YOUR-PROJECT.vercel.app
```
*(Update after first deploy with your actual URL)*

### 4. ADMIN_ALLOWED_EMAILS
Comma-separated list of Google emails allowed to access `/admin`.
```
drosenbergster@gmail.com,pdxpitgal@gmail.com
```

---

## Steps:
1. Go to: https://vercel.com/new
2. Import: `drosenbergster/4050`
3. Click "Environment Variables"
4. Add all variables above (include DIRECT_URL + ADMIN_ALLOWED_EMAILS)
5. Set to: **Production, Preview, Development**
6. Click "Deploy"

## After deployment:
1. Get your deployment URL
2. Update NEXTAUTH_URL with actual URL
3. Redeploy or update env var in dashboard

## If you see: `FATAL: Tenant or user not found`
- This indicates the pooler string is wrong (missing tenant prefix, wrong port, or missing `pgbouncer=true`).
- Fix `DATABASE_URL` to the transaction pooler (6543) and ensure:
  - username is `postgres.<PROJECT_REF>`
  - query params include `pgbouncer=true&connection_limit=1`









