# 🚀 Ready to Deploy - Quick Guide

## ✅ What's Been Fixed

1. **Source directories** corrected to `/apps/backend` and `/apps/frontend`
2. **Backend build** includes Prisma generation and migrations
3. **Frontend build** explicitly configured with Vite output directory
4. **Health check** path corrected to `/api/health`
5. **Environment variables** added for DATABASE_URL, FRONTEND_URL, ANTHROPIC_API_KEY
6. **Build debugging** added to verify dist directory creation

## 📋 Files Changed

- `@/Volumes/D/Projects/SurvivalIndex/.do/app.yaml` - Fixed deployment configuration
- `@/Volumes/D/Projects/SurvivalIndex/apps/frontend/vite.config.js` - Explicit build output
- `@/Volumes/D/Projects/SurvivalIndex/apps/backend/prisma/seed.js` - 50 projects seed
- `@/Volumes/D/Projects/SurvivalIndex/apps/backend/prisma/add-projects-template.js` - Template for adding more

## 🔧 Deploy Commands

### Option 1: Update Existing App

```bash
# Get your app ID
doctl apps list

# Update with fixed configuration
doctl apps update <YOUR_APP_ID> --spec .do/app.yaml

# Watch the deployment
doctl apps logs <YOUR_APP_ID> --follow
```

### Option 2: Via Dashboard

1. Go to https://cloud.digitalocean.com/apps
2. Select your app
3. Go to **Settings** → **App Spec**
4. Replace entire spec with contents of `.do/app.yaml`
5. Click **Save** and watch the build logs

## 🔑 After Deployment

Set the Anthropic API key (required for AI evaluations):

```bash
# Via CLI
doctl apps update <APP_ID> --env ANTHROPIC_API_KEY=your-actual-key

# Or via Dashboard:
# Settings → Environment Variables → Add Variable
# Key: ANTHROPIC_API_KEY
# Type: Secret
# Scope: RUN_TIME
```

## 🧪 Verify Deployment

```bash
# Get your app URL
doctl apps list

# Test backend health
curl https://your-app-url.ondigitalocean.app/api/health

# Test API root
curl https://your-app-url.ondigitalocean.app/api

# Visit frontend
open https://your-app-url.ondigitalocean.app/
```

## 📊 Expected Build Output

**Backend:**
```
✓ npm install
✓ npx prisma generate
✓ npx prisma migrate deploy
✓ Health check: /api/health responds
```

**Frontend:**
```
✓ npm install
✓ npm run build
✓ dist/ directory created with:
  - index.html
  - assets/
  - vite.svg
```

## 🐛 If Build Still Fails

Check the build logs for:

1. **"dist does not exist"** - The debugging commands will show if dist was created
2. **"Prisma generate failed"** - Check DATABASE_URL is set correctly
3. **"Health check failed"** - Ensure app listens on port 8080

View logs:
```bash
doctl apps logs <APP_ID> --type=build
doctl apps logs <APP_ID> --type=deploy
doctl apps logs <APP_ID> --type=run
```

## 📝 Current Configuration Summary

```yaml
Backend Service:
  Source: /apps/backend
  Build: npm install && npx prisma generate && npx prisma migrate deploy
  Run: npm start (port 8080)
  Health: /api/health (30s initial delay)
  Env: NODE_ENV, PORT, DATABASE_URL, FRONTEND_URL, ANTHROPIC_API_KEY

Frontend Static Site:
  Source: /apps/frontend
  Build: npm install && npm run build && pwd && ls -la && ls -la dist/
  Output: dist/
  Env: VITE_API_URL=${backend.PUBLIC_URL}
```

## 🎯 Next Steps After Successful Deploy

1. ✅ Verify both frontend and backend are accessible
2. 🔑 Set ANTHROPIC_API_KEY secret
3. 🌱 Consider running seed script (data will reset on redeploy with SQLite)
4. 🗄️ For production: Migrate to PostgreSQL managed database
5. 📊 Test AI evaluation: `POST /api/ai-judge/evaluate/:projectId`

## 💡 Production Recommendations

**Use PostgreSQL instead of SQLite:**
1. Create DigitalOcean Managed Database (PostgreSQL)
2. Update DATABASE_URL to point to managed DB
3. Update `schema.prisma` datasource provider to `postgresql`
4. Run migrations: `npx prisma migrate deploy`
5. Run seed: `npm run seed`

This ensures data persists across deployments!
