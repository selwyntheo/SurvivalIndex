# SurvivalIndex Deployment Strategy

## Current Architecture

### Frontend
- **Platform**: DigitalOcean App Platform (Static Site)
- **Source**: `/apps/frontend`
- **Build**: Vite + React
- **Cost**: Free tier available
- **URL**: Auto-generated `.ondigitalocean.app` domain

### Backend
- **Platform**: DigitalOcean Droplet (Docker)
- **Source**: `/apps/backend`
- **Runtime**: Node.js + Express + Prisma
- **Database**: SQLite (file-based)
- **Cost**: $6/month (1GB RAM droplet)
- **URL**: `http://YOUR_DROPLET_IP:8080`

## Why This Split?

**DigitalOcean App Platform Limitation**: The Node.js buildpack doesn't properly preserve `node_modules` in runtime containers when using monorepo structures with `source_dir`. This causes the backend to fail at runtime with "Cannot find package 'express'" errors, even though dependencies install successfully during build.

**Solution**: Deploy backend via Docker on a Droplet where we have full control over the container and dependencies.

## Deployment Steps

### 1. Deploy Backend (Docker on Droplet)

```bash
# Quick deploy
cd apps/backend
./deploy.sh YOUR_DROPLET_IP

# Or manual - see QUICKSTART_DOCKER.md
```

**Result**: Backend API running at `http://YOUR_DROPLET_IP:8080`

### 2. Update Frontend Configuration

After backend is deployed, update the frontend's API URL:

```bash
# Update .do/app.yaml
# Change VITE_API_URL to your droplet IP
doctl apps update 6affe60f-7a82-4713-9f9a-9d5936b3762c --spec .do/app.yaml
```

### 3. Deploy Frontend (App Platform)

```bash
# Frontend will auto-deploy on git push
git push origin main

# Or trigger manually
doctl apps create-deployment 6affe60f-7a82-4713-9f9a-9d5936b3762c
```

## Configuration Files

### Backend
- `apps/backend/Dockerfile` - Production container
- `apps/backend/docker-compose.yml` - Container orchestration
- `apps/backend/nginx.conf` - Reverse proxy (optional)
- `apps/backend/.env` - Environment variables (created on droplet)

### Frontend
- `.do/app.yaml` - App Platform configuration (frontend only)
- `apps/frontend/vite.config.js` - Build configuration

## Environment Variables

### Backend (.env on Droplet)
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=file:/app/data/prod.db
FRONTEND_URL=https://your-app.ondigitalocean.app
ANTHROPIC_API_KEY=your-api-key
```

### Frontend (App Platform)
```yaml
VITE_API_URL: http://YOUR_DROPLET_IP:8080
```

## Costs

| Component | Platform | Cost |
|-----------|----------|------|
| Frontend | DigitalOcean App Platform | Free |
| Backend | DigitalOcean Droplet (1GB) | $6/month |
| **Total** | | **$6/month** |

## Scaling Options

### Vertical Scaling (Increase Resources)
- Upgrade droplet: $12/month (2GB), $18/month (4GB)
- Add managed PostgreSQL: $15/month (replaces SQLite)

### Horizontal Scaling (Multiple Instances)
- Add load balancer: $12/month
- Multiple backend droplets: $6/month each
- Managed database required for multiple backends

## Production Recommendations

1. **Use PostgreSQL**: Replace SQLite with managed PostgreSQL ($15/month)
   - Data persists across deployments
   - Better performance for concurrent users
   - Enables horizontal scaling

2. **Add Domain & SSL**: 
   - Point domain to droplet
   - Use Certbot for free SSL
   - Update CORS settings

3. **Set Up Monitoring**:
   - DigitalOcean monitoring (free)
   - Application logs via Docker
   - Health check endpoints

4. **Implement Backups**:
   - Database backups to Spaces ($5/month)
   - Automated backup scripts
   - Retention policy

5. **Configure CI/CD**:
   - GitHub Actions for automated testing
   - Webhook for auto-deployment
   - Staging environment

## Migration Path to Full App Platform

If DigitalOcean fixes the monorepo buildpack issue, you can migrate back:

1. Re-add backend service to `.do/app.yaml`
2. Add managed PostgreSQL database
3. Update DATABASE_URL to use managed DB
4. Deploy via App Platform
5. Decommission droplet

## Alternative Platforms

If you want to avoid managing a droplet:

### Render.com
- Better monorepo support
- Free tier available
- Handles Node.js dependencies correctly
- Auto-deploy from GitHub

### Railway.app
- Excellent monorepo support
- $5/month credit included
- Simple deployment
- Built-in PostgreSQL

### Fly.io
- Docker-based (like our current setup)
- Free tier available
- Global edge deployment
- PostgreSQL included

## Troubleshooting

### Backend Issues
```bash
# Check logs
docker-compose logs -f backend

# Restart
docker-compose restart

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Frontend Issues
```bash
# Check build logs
doctl apps logs 6affe60f-7a82-4713-9f9a-9d5936b3762c --type=build

# Verify API URL
# Should point to droplet IP, not ${backend.PUBLIC_URL}
```

### CORS Issues
Update backend CORS settings in `src/server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Documentation

- **Quick Start**: `QUICKSTART_DOCKER.md`
- **Full Docker Guide**: `docs/DOCKER_DEPLOYMENT.md`
- **App Platform Issues**: `docs/DEPLOYMENT_FIX.md`
- **Seed Data**: `apps/backend/prisma/SEED_README.md`

## Support

- Backend logs: `docker-compose logs -f backend`
- Frontend logs: `doctl apps logs 6affe60f-7a82-4713-9f9a-9d5936b3762c`
- Health check: `curl http://YOUR_DROPLET_IP:8080/api/health`
