# 🚀 Production Deployment Checklist — AI Trip Planner

> **Stack:** Next.js 16 + Convex + Clerk + Gemini AI + Arcjet + Mapbox GL JS
> **Deploy Target:** Vercel (frontend) + Convex Cloud (backend)

---

## ✅ Step 1: Build Verification

- [x] `npx tsc --noEmit` passes (no type errors)
- [x] `npm run lint` passes (no ESLint errors)
- [x] `npm run build` completes without errors
- [x] `next.config.ts` updated with production settings (images + webpack)
- [x] `.gitignore` includes `.env*` (verified)

---

## 🔧 Step 2: Deploy Convex to Production

Run:
```bash
npx convex deploy
```

This will:
- Create a production Convex deployment (separate from `dev:rapid-pony-660`)
- Output **production** `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` values
- Deploy schema, functions, and indexes to production

After deploying, set production environment variables in Convex:
```bash
# Set Clerk JWT issuer for your PRODUCTION Clerk instance
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://YOUR-PROD-CLERK-DOMAIN.clerk.accounts.dev" --prod
```

### Checklist
- [ ] `npx convex deploy` completed successfully
- [ ] Noted production `CONVEX_DEPLOYMENT` value
- [ ] Noted production `NEXT_PUBLIC_CONVEX_URL` value
- [ ] `CLERK_JWT_ISSUER_DOMAIN` set for production (`--prod`)
- [ ] Production deployment visible in [Convex Dashboard](https://dashboard.convex.dev)

---

## 🔐 Step 3: Set Up Clerk Production Instance

In [Clerk Dashboard](https://dashboard.clerk.com):

1. **Switch to Production instance** (top-right dropdown: Development → Production)
2. **Add production domain** to allowed origins:
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com` (if applicable)
3. **Verify JWT Template:**
   - Go to **JWT Templates** → **convex** template
   - Confirm it exists in the Production instance
   - Note the **Production Issuer URL** (different from dev!)
4. **Copy Production API keys:**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → starts with `pk_live_`
   - `CLERK_SECRET_KEY` → starts with `sk_live_`

### Checklist
- [ ] Switched to Production instance in Clerk Dashboard
- [ ] Production domain added to allowed origins
- [ ] JWT Template "convex" exists in Production
- [ ] Noted `pk_live_` publishable key
- [ ] Noted `sk_live_` secret key
- [ ] Noted Production Issuer URL for Convex

---

## 🌐 Step 4: Deploy to Vercel

### Option A: Via Vercel CLI (quick)
```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy to production
vercel --prod
```

### Option B: Via GitHub (recommended for CI/CD)
1. Push code to GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repository
4. Vercel auto-detects Next.js settings
5. Add environment variables (Step 5) before first deploy

### Checklist
- [ ] Code pushed to GitHub (or CLI login successful)
- [ ] Vercel project created and linked
- [ ] Initial deployment triggered

---

## 🔑 Step 5: Configure Vercel Environment Variables

In **Vercel Dashboard → Project → Settings → Environment Variables**, add ALL of the following for the **Production** environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | From Clerk Production instance |
| `CLERK_SECRET_KEY` | `sk_live_...` | From Clerk Production instance |
| `CONVEX_DEPLOYMENT` | `prod:...` | From `npx convex deploy` output |
| `NEXT_PUBLIC_CONVEX_URL` | `https://....convex.cloud` | Production Convex URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://....convex.site` | Production Convex site URL |
| `ARCJET_KEY` | `ajkey_...` | Same key or create new in Arcjet dashboard |
| `GEMINI_API_KEY` | `AIza...` | Same Google Gemini API key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `pk.eyJ1...` | Same Mapbox token (add domain restriction) |

> ⚠️ After adding all env vars, Vercel will trigger an automatic redeploy.

### Checklist
- [ ] All 8 environment variables added (no typos!)
- [ ] Verified `NEXT_PUBLIC_` prefix on client-side vars
- [ ] Redeploy triggered after adding env vars
- [ ] Build logs show no errors

---

## 🔗 Step 6: Post-Deploy Configuration

### Update Convex JWT Issuer (if not done yet)
```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN \
  "https://YOUR-PROD-CLERK-DOMAIN.clerk.accounts.dev" --prod
```

### Update Mapbox Token Domain Restriction
In [Mapbox Dashboard](https://account.mapbox.com/access-tokens):
1. Edit your access token
2. Add production URL restriction: `https://your-app.vercel.app`

### Update Arcjet Site Settings (optional)
In [Arcjet Dashboard](https://app.arcjet.com):
1. Add production domain if needed
2. Verify rate limiting rules apply

### Checklist
- [ ] Convex `CLERK_JWT_ISSUER_DOMAIN` matches Production Clerk Issuer
- [ ] Mapbox token allows production domain
- [ ] Arcjet production domain configured

---

## 🧪 Step 7: Functional Testing (on production URL)

| Feature | Status |
|---------|--------|
| Landing page loads correctly | ☐ |
| Sign up / Sign in works (Clerk) | ☐ |
| Create trip form loads | ☐ |
| AI trip generation works (Gemini) | ☐ |
| Trip saved to Convex (check prod dashboard) | ☐ |
| View trip page renders full itinerary | ☐ |
| Map markers appear on trip map | ☐ |
| My trips page shows all trips | ☐ |
| Global 3D map loads | ☐ |
| Rate limiting works (Arcjet) | ☐ |
| Delete trip works | ☐ |

---

## 📊 Step 8: Performance

- [ ] Lighthouse score > 80 on mobile
- [ ] No console errors in production
- [ ] Images load correctly
- [ ] Map renders without errors

---

## 🔥 Common Production Issues & Fixes

### "Missing NEXT_PUBLIC_* variables"
**Cause:** NEXT_PUBLIC_ vars not added to Vercel
**Fix:** Add to Vercel env vars → redeploy

### "Convex functions returning 401"
**Cause:** CLERK_JWT_ISSUER_DOMAIN mismatch between dev/prod Clerk
**Fix:** `npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://..." --prod`

### "Mapbox map not loading"
**Cause:** Token domain restriction doesn't include production URL
**Fix:** Add production domain to Mapbox token allowed URLs

### "Arcjet blocking all requests"
**Cause:** Production domain not whitelisted
**Fix:** Add production URL in Arcjet site settings

### "Clerk auth redirect loops"
**Cause:** Clerk publishable key is from dev instance, not production
**Fix:** Use `pk_live_` and `sk_live_` keys from Clerk Production instance

### "Convex queries fail silently"
**Cause:** Using dev Convex URL in production
**Fix:** Set `NEXT_PUBLIC_CONVEX_URL` to the production Convex deployment URL
