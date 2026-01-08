# Netlify Vite Build Fix

## Problem
Netlify build error: `vite: not found` (exit code 127)

## Root Cause
Netlify by default runs npm in production mode (`npm ci --prefer-offline --no-audit`), which skips `devDependencies`. Since Vite is a build tool declared in `devDependencies`, it's not installed in the Netlify build environment.

## Solution

### Option 1: Set NPM_FLAGS in Netlify (RECOMMENDED)

1. **Go to your Netlify site dashboard**
   - Navigate to: Site settings → Build & deploy → Environment

2. **Add environment variable:**
   - Key: `NPM_FLAGS`
   - Value: `--include=dev`

3. **Trigger a new deploy:**
   - Go to Deploys
   - Click "Trigger deploy" → "Deploy site"

This tells npm to install devDependencies even in production builds.

---

### Option 2: Set NPM_CONFIG_PRODUCTION=false (ALTERNATIVE)

If Option 1 doesn't work:

1. **In Netlify site settings:**
   - Key: `NPM_CONFIG_PRODUCTION`
   - Value: `false`

2. **Trigger a new deploy**

---

### Option 3: Move Vite to Dependencies (NUCLEAR)

If you prefer not to change Netlify settings:

```bash
cd /Users/taksimon/Desktop/TAKÁCS-SIMON_F8BTO8_SZAKDOLGOZAT/app/frontend

# Move vite from devDependencies to dependencies
npm install vite

# Commit changes
git add package.json package-lock.json
git commit -m "Move vite to dependencies for Netlify production build"
git push
```

Then trigger redeploy in Netlify.

---

## Recommended Flow

1. ✅ Use Option 1 (NPM_FLAGS)
2. Go to Netlify Site Settings
3. Add the environment variable
4. Redeploy
5. Build should now succeed

If Option 1 fails, try Option 2, then Option 3 as last resort.

---

## Verification

After applying one of the above fixes:
- Check Netlify logs again
- You should see `npm install` successfully installing vite
- Build should complete without the "vite: not found" error
