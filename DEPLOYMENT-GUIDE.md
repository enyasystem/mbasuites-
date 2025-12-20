# Deployment Guide - External Hosting with Your Own Supabase

## Step 1: Export Your Code via GitHub

1. In Lovable, go to **Settings → GitHub**
2. Connect your GitHub account if not already connected
3. Create a new repository or push to an existing one
4. Your code will be synced to GitHub

## Step 2: Clone and Set Up Locally

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

## Step 3: Create Environment Variables

Create a `.env` file in the root of your project:

```env
VITE_SUPABASE_PROJECT_ID="ehpdimadogtqzarriuzz"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocGRpbWFkb2d0cXphcnJpdXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzc4NDQsImV4cCI6MjA4MTY1Mzg0NH0.TpvSgl4Ove0NQwRb9gYp3_UJTHgGKZCzAlkY9Ejzvv8"
VITE_SUPABASE_URL="https://ehpdimadogtqzarriuzz.supabase.co"
```

## Step 4: Update Supabase Client (if needed)

The client at `src/integrations/supabase/client.ts` already uses environment variables, so it will automatically use your new credentials.

## Step 5: Deploy to Vercel

### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Add the environment variables:
   - `VITE_SUPABASE_PROJECT_ID` = `ehpdimadogtqzarriuzz`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocGRpbWFkb2d0cXphcnJpdXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzc4NDQsImV4cCI6MjA4MTY1Mzg0NH0.TpvSgl4Ove0NQwRb9gYp3_UJTHgGKZCzAlkY9Ejzvv8`
   - `VITE_SUPABASE_URL` = `https://ehpdimadogtqzarriuzz.supabase.co`
5. Click "Deploy"

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_SUPABASE_PROJECT_ID
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_SUPABASE_URL

# Redeploy with env vars
vercel --prod
```

## Step 6: Configure Supabase Auth Redirects

In your new Supabase project dashboard:
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
3. Add to **Redirect URLs**:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/**`
   - `http://localhost:5173` (for local development)

## Step 7: Regenerate Supabase Types (Optional)

If you want to regenerate the types file for your new project:

```bash
# Install Supabase CLI
npm i -g supabase

# Login
supabase login

# Generate types
supabase gen types typescript --project-id ehpdimadogtqzarriuzz > src/integrations/supabase/types.ts
```

---

## Summary Checklist

- [ ] Export code to GitHub
- [ ] Run `database-export.sql` in new Supabase SQL Editor
- [ ] Deploy edge functions (see `edge-functions-setup.md`)
- [ ] Add `RESEND_API_KEY` secret in Supabase
- [ ] Deploy to Vercel with environment variables
- [ ] Configure auth redirect URLs in Supabase
- [ ] Re-register users (auth data cannot be migrated)
- [ ] Assign admin role to your admin user after they register

---

## Your New Supabase Credentials

| Variable | Value |
|----------|-------|
| Project ID | `ehpdimadogtqzarriuzz` |
| URL | `https://ehpdimadogtqzarriuzz.supabase.co` |
| Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocGRpbWFkb2d0cXphcnJpdXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzc4NDQsImV4cCI6MjA4MTY1Mzg0NH0.TpvSgl4Ove0NQwRb9gYp3_UJTHgGKZCzAlkY9Ejzvv8` |
