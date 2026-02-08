# DigitalOcean Deployment Guide

## Prerequisites

1. DigitalOcean account
2. GitHub repository: `selwyntheo/survivalindex`
3. `doctl` CLI installed (optional, for CLI deployment)

## Deployment Options

### Option 1: Deploy via DigitalOcean Dashboard (Recommended)

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Select **GitHub** as source
4. Authorize DigitalOcean to access your GitHub account
5. Select repository: `selwyntheo/survivalindex`
6. Select branch: `main`
7. Click **"Next"**
8. DigitalOcean will auto-detect the app spec from `.do/app.yaml`
9. Review the configuration:
   - **Backend Service**: Node.js API on port 8080
   - **Frontend Static Site**: React + Vite build
10. Click **"Next"** and then **"Create Resources"**

### Option 2: Deploy via CLI

```bash
# Install doctl
brew install doctl  # macOS
# or download from: https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Create the app
doctl apps create --spec .do/app.yaml

# Get app ID
doctl apps list

# Check deployment status
doctl apps get <APP_ID>
```

## App Configuration

The deployment includes:

### Backend Service
- **Runtime**: Node.js
- **Port**: 8080
- **Health Check**: `/health`
- **Routes**: `/api/*`, `/health`
- **Instance**: Basic XXS (512MB RAM, $5/month)

### Frontend Static Site
- **Build**: Vite
- **Output**: `dist/`
- **Environment**: `VITE_API_URL` automatically set to backend URL
- **Routes**: `/*` (all routes)
- **Catchall**: `index.html` (for SPA routing)

## Post-Deployment

After deployment completes:

1. **Get your URLs**:
   - Frontend: `https://survivalindex-xxxxx.ondigitalocean.app`
   - Backend: `https://backend-xxxxx.ondigitalocean.app`

2. **Test the API**:
   ```bash
   curl https://backend-xxxxx.ondigitalocean.app/health
   curl https://backend-xxxxx.ondigitalocean.app/api/projects
   ```

3. **Test the Frontend**:
   - Visit your frontend URL
   - The app should automatically connect to the backend API

## Monitoring

- View logs in the DigitalOcean dashboard
- Monitor health checks and resource usage
- Set up alerts for downtime

## Updating the App

### Automatic Deployment
- Push to `main` branch triggers automatic deployment
- Both frontend and backend redeploy on changes

### Manual Deployment
```bash
# Trigger deployment via CLI
doctl apps create-deployment <APP_ID>
```

## Scaling

To scale your app:

1. Go to App Platform dashboard
2. Select your app
3. Click on the service (backend or frontend)
4. Adjust instance size or count
5. Save changes

### Instance Sizes
- **Basic XXS**: 512MB RAM, $5/month
- **Basic XS**: 1GB RAM, $12/month
- **Basic S**: 2GB RAM, $24/month
- **Professional**: Higher performance, starting at $12/month

## Troubleshooting

### Backend not starting
- Check logs in DigitalOcean dashboard
- Verify `package.json` has correct start script
- Ensure health check endpoint `/health` is working

### Frontend not loading
- Check build logs for errors
- Verify `VITE_API_URL` environment variable is set
- Check browser console for CORS errors

### API connection issues
- Verify backend is running and healthy
- Check CORS configuration in backend
- Ensure frontend is using correct API URL

## Cost Estimate

- Backend (Basic XXS): $5/month
- Frontend (Static Site): $0-3/month (free tier available)
- **Total**: ~$5-8/month

## Custom Domain (Optional)

1. Go to your app settings
2. Click **"Domains"**
3. Add your custom domain
4. Update DNS records as instructed
5. SSL certificate is automatically provisioned

## Support

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Community Forums](https://www.digitalocean.com/community)
