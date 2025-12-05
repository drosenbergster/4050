# 🔐 Google OAuth Setup Guide

## ✅ What I Did

1. **Updated Authentication** (`app/api/auth/[...nextauth]/route.ts`)
   - Replaced password login with Google OAuth
   - Only allows whitelisted email addresses
   - No passwords stored anywhere!

2. **Updated Login Page** (`app/admin/login/page.tsx`)
   - Beautiful "Sign in with Google" button
   - Matches your 4050 design theme

3. **Updated Environment Variables** (`vercel-env-import.txt`)
   - Removed ADMIN_EMAIL and ADMIN_PASSWORD
   - Added Google OAuth credentials

---

## 📋 Setup Steps (5 minutes)

### **Step 1: Create Google OAuth App**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Project"** (if you don't have one)
   - Name it: **"4050 Store"**
3. Click **"Create Credentials"** → **"OAuth client ID"**
4. Configure consent screen (if prompted):
   - User Type: **External**
   - App name: **"4050 Admin"**
   - User support email: **Your email**
   - Developer contact: **Your email**
   - Click **Save and Continue** through all steps
5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **"4050 Production"**
   - Authorized redirect URIs:
     ```
     https://YOUR-APP.vercel.app/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **Create**
6. **Copy** your Client ID and Client Secret

---

### **Step 2: Deploy to Vercel**

1. Go to: https://vercel.com/new
2. Import: **drosenbergster/4050**
3. Add Environment Variables (paste from `vercel-env-import.txt`):

```env
DATABASE_URL="postgresql://postgres.fwagehvkevmjbyujommf:mHt_t%263%23ed%26diY9@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

NEXTAUTH_SECRET="YW8XvAS6J7rzp/BZhWUhkWTu0s2ULQQsQ9rqcB17lyU="

NEXTAUTH_URL="https://YOUR-PROJECT.vercel.app"

GOOGLE_CLIENT_ID="YOUR-CLIENT-ID.apps.googleusercontent.com"

GOOGLE_CLIENT_SECRET="YOUR-CLIENT-SECRET"

ADMIN_ALLOWED_EMAILS="your-email@gmail.com"
```

4. Set all to: **Production, Preview, Development**
5. Click **Deploy** 🚀

---

### **Step 3: Update OAuth Redirect URL**

1. After deployment, copy your Vercel URL (e.g., `https://4050-abc123.vercel.app`)
2. Go back to Google Console: https://console.cloud.google.com/apis/credentials
3. Click your OAuth client
4. Update **Authorized redirect URIs**:
   ```
   https://YOUR-ACTUAL-VERCEL-URL.vercel.app/api/auth/callback/google
   ```
5. Also update **NEXTAUTH_URL** in Vercel env vars with your actual URL
6. Redeploy in Vercel

---

## 🧪 Test It

1. Go to: `https://your-app.vercel.app/admin/login`
2. Click **"Continue with Google"**
3. Sign in with YOUR Google account
4. You should be redirected to `/admin` ✅

---

## 🔒 Security Features

✅ **No passwords** stored in environment variables  
✅ **No passwords** stored in database  
✅ **Only YOUR email** can access admin  
✅ **Google 2FA** automatically works  
✅ **Encrypted** Google credentials by Vercel

---

## 🎯 To Add More Admins

Just update the environment variable in Vercel:

```env
ADMIN_ALLOWED_EMAILS="admin1@gmail.com,admin2@gmail.com,admin3@gmail.com"
```

---

## 🐛 Troubleshooting

**"Sign in error"** → Check that your email matches ADMIN_ALLOWED_EMAILS exactly

**"Redirect URI mismatch"** → Make sure the OAuth redirect URL matches your Vercel URL exactly

**"Access blocked"** → Your Google email isn't in ADMIN_ALLOWED_EMAILS

---

**Need help?** Let me know which step you're on!

