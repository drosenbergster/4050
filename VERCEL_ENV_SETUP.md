# Vercel Environment Variables Setup

## Copy these into Vercel Dashboard during import:

### 1. DATABASE_URL
```
postgresql://postgres.fwagehvkevmjbyujommf:mHt_t%263%23ed%26diY9@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
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

### 4. ADMIN_EMAIL
```
YOUR-EMAIL-HERE
```

### 5. ADMIN_PASSWORD
```
YOUR-PASSWORD-HERE
```

---

## Steps:
1. Go to: https://vercel.com/new
2. Import: `drosenbergster/4050`
3. Click "Environment Variables"
4. Add all 5 variables above
5. Set to: **Production, Preview, Development**
6. Click "Deploy"

## After deployment:
1. Get your deployment URL
2. Update NEXTAUTH_URL with actual URL
3. Redeploy or update env var in dashboard







