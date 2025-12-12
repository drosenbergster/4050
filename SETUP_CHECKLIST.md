# 🚀 Google OAuth Setup - Step-by-Step Checklist

## ✅ Step 1: Create Google OAuth App

**Current page: Google Cloud Console**

### If you see "Select a project" dropdown:
1. Click **"NEW PROJECT"**
2. Project name: `4050-store`
3. Click **"CREATE"**
4. Wait for project to be created (~30 seconds)

### If you already have a project selected:
Skip to OAuth setup below

---

### OAuth Client Setup:

1. Click **"+ CREATE CREDENTIALS"** button (top of page)
2. Select **"OAuth client ID"**

3. **If prompted to configure consent screen:**
   - Click **"CONFIGURE CONSENT SCREEN"**
   - Select: **External**
   - Click **"CREATE"**
   
   **Fill in OAuth consent screen:**
   - App name: `4050 Admin`
   - User support email: [YOUR EMAIL]
   - Developer contact email: [YOUR EMAIL]
   - Click **"SAVE AND CONTINUE"** (3 times through all screens)
   - Click **"BACK TO DASHBOARD"**
   - Go back to: Credentials → Create Credentials → OAuth client ID

4. **Create OAuth client ID:**
   - Application type: **Web application**
   - Name: `4050 Production`
   
   **Authorized JavaScript origins:**
   - Leave empty for now
   
   **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3000/api/auth/callback/google`
   - Click **"+ ADD URI"** again
   - Add: `https://TEMP.vercel.app/api/auth/callback/google` (we'll update this)
   
   - Click **"CREATE"**

5. **Copy your credentials:**
   ```
   Client ID: [COPY THIS - ends in .apps.googleusercontent.com]
   Client Secret: [COPY THIS]
   ```
   
   ⚠️ **PASTE THESE INTO vercel-env-import.txt FILE NOW!**

---

## ✅ Step 2: Update vercel-env-import.txt

Open `vercel-env-import.txt` and replace:

```env
GOOGLE_CLIENT_ID="YOUR-CLIENT-ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR-CLIENT-SECRET"
ADMIN_ALLOWED_EMAILS="your-email@gmail.com"
```

With YOUR actual values:
- GOOGLE_CLIENT_ID → Paste what you copied
- GOOGLE_CLIENT_SECRET → Paste what you copied  
- ADMIN_ALLOWED_EMAILS → YOUR email (the one you used for Google Console)

**Save the file!**

---

## ✅ Step 3: Deploy to Vercel

**Ready to import to Vercel?** (Type "ready" when vercel-env-import.txt is updated)



