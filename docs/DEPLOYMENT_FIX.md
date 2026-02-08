# DigitalOcean Deployment Fix

## Issues Fixed

### 1. **Incorrect Source Directories**
- ❌ Before: `/backend` and `/`
- ✅ After: `/apps/backend` and `/apps/frontend`

### 2. **Missing Environment Variables**
Added required environment variables:
- `DATABASE_URL` - For Prisma database connection
- `FRONTEND_URL` - For CORS configuration
- `ANTHROPIC_API_KEY` - For AI evaluations (secret)

### 3. **Missing Build Steps**
- Added Prisma client generation: `npx prisma generate`
- Added database migrations: `npx prisma migrate deploy`

### 4. **Wrong Health Check Path**
- ❌ Before: `/health`
- ✅ After: `/api/health`

## Deployment Steps

### Option 1: Update Existing App (Recommended)

```bash
# Update the app configuration
doctl apps update <your-app-id> --spec .do/app.yaml

# Or if you have the app name
doctl apps list
doctl apps update <app-id> --spec .do/app.yaml
```

### Option 2: Create New App

```bash
# Delete old app (if needed)
doctl apps delete <old-app-id>

# Create new app with fixed config
doctl apps create --spec .do/app.yaml
```

### Option 3: Via DigitalOcean Dashboard

1. Go to your app in the DigitalOcean dashboard
2. Click **Settings** → **App Spec**
3. Replace the entire spec with the contents of `.do/app.yaml`
4. Click **Save** and redeploy

## Required Secrets

After deployment, you need to set the `ANTHROPIC_API_KEY` secret:

```bash
# Set the API key as a secret
doctl apps create-deployment <app-id> --wait

# Or via dashboard:
# Settings → Environment Variables → Add Variable
# Key: ANTHROPIC_API_KEY
# Value: your-api-key
# Type: Secret
```

## Database Persistence

⚠️ **Important**: The current configuration uses SQLite with `file:./prod.db`. This means:

- Database is stored in the container filesystem
- **Data will be lost on redeployment**

### For Production (Recommended)

Use a managed PostgreSQL database:

1. Create a DigitalOcean Managed Database (PostgreSQL)
2. Update `DATABASE_URL` to point to the managed database:

```yaml
- key: DATABASE_URL
  scope: RUN_AND_BUILD_TIME
  value: ${db.DATABASE_URL}  # Reference to managed database
```

3. Update `schema.prisma` datasource:

```prisma
datasource db {
  provider = "postgresql"  // Change from sqlite
  url      = env("DATABASE_URL")
}
```

### For Testing (Current Setup)

The SQLite database will work but data resets on each deploy. To seed the database:

```bash
# SSH into the app (if available) or add to build command
npm run seed
```

## Verification

After deployment, verify:

1. **Health Check**: `curl https://your-app.ondigitalocean.app/api/health`
2. **API Root**: `curl https://your-app.ondigitalocean.app/api`
3. **Frontend**: Visit `https://your-app.ondigitalocean.app/`

## Troubleshooting

### Build Fails
- Check that `apps/backend/package.json` exists
- Verify Prisma schema is valid
- Check build logs for specific errors

### Health Check Fails
- Ensure app is listening on port 8080
- Verify `/api/health` endpoint exists
- Check app logs: `doctl apps logs <app-id> --type=run`

### Database Errors
- Verify `DATABASE_URL` is set correctly
- Check migrations ran successfully in build logs
- Ensure Prisma client was generated

### Frontend Not Loading
- Check that `apps/frontend/package.json` exists
- Verify Vite build completes successfully
- Check `VITE_API_URL` is set to backend URL

## Next Steps

1. ✅ Fixed app.yaml configuration
2. 🔄 Redeploy using one of the methods above
3. 🔑 Set `ANTHROPIC_API_KEY` secret
4. 🗄️ Consider migrating to PostgreSQL for production
5. 🌱 Run seed script to populate database

## Updated Configuration Summary

```yaml
Backend:
  - Source: /apps/backend
  - Build: npm install && npx prisma generate && npx prisma migrate deploy
  - Run: npm start
  - Port: 8080
  - Health: /api/health

Frontend:
  - Source: /apps/frontend
  - Build: npm install && npm run build
  - Output: dist
```
