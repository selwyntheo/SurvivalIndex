# 🚀 DigitalOcean Deployment Plan - SurvivalIndex

Comprehensive guide to deploy SurvivalIndex (frontend + backend + AI agent) on DigitalOcean.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Option A: App Platform (Recommended)](#option-a-app-platform-recommended)
4. [Option B: Droplet + Manual Setup](#option-b-droplet--manual-setup)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Domain & SSL](#domain--ssl)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Monitoring & Logging](#monitoring--logging)
10. [Cost Estimation](#cost-estimation)
11. [Deployment Checklist](#deployment-checklist)

---

## 🏗️ Architecture Overview

```
Internet
    │
    ├─> Frontend (React/Vite)
    │   └─> Deployed on: DO App Platform or Static Sites
    │       └─> URL: https://survivalindex.ai
    │
    └─> Backend API (Express + AI Judge)
        └─> Deployed on: DO App Platform or Droplet
            └─> URL: https://api.survivalindex.ai
            └─> Database: PostgreSQL (Managed Database)
            └─> External API: Anthropic Claude
```

### Components to Deploy

1. **Frontend**: Static React app (built with Vite)
2. **Backend**: Node.js Express API with AI Judge
3. **Database**: PostgreSQL (managed or self-hosted)
4. **Secrets**: Anthropic API key, GitHub token

---

## ✅ Prerequisites

### 1. DigitalOcean Account
- Sign up at https://www.digitalocean.com/
- Add payment method
- Enable 2FA for security

### 2. Required API Keys
- **Anthropic API Key**: Get from https://console.anthropic.com/
- **GitHub Token** (optional): For project analysis

### 3. Local Setup
- Git repository with all code
- Docker installed (optional, for local testing)
- `doctl` CLI tool (optional, for automation)

### 4. Domain Name (Optional)
- Purchase domain (e.g., from Namecheap, GoDaddy)
- Or use DigitalOcean DNS with free subdomain

---

## 🎯 Option A: App Platform (Recommended)

**Best for:** Quick deployment, auto-scaling, zero DevOps

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already)
cd /Volumes/D/Projects/SurvivalIndex
git init
git add .
git commit -m "Ready for deployment"

# Create GitHub repository
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/survivalindex.git
git branch -M main
git push -u origin main
```

### Step 2: Create PostgreSQL Managed Database

1. **DigitalOcean Console** → **Databases** → **Create Database**
2. **Settings:**
   - Engine: PostgreSQL 16
   - Plan: Basic ($15/month for 1GB RAM, 10GB storage)
   - Datacenter: Choose closest to your users
   - Database name: `survivalindex`
3. **Wait 3-5 minutes** for provisioning
4. **Copy Connection Details:**
   - Host
   - Port
   - Username
   - Password
   - Database name

### Step 3: Deploy Backend on App Platform

1. **DigitalOcean Console** → **App Platform** → **Create App**
2. **Source:** Connect GitHub repository
3. **Select Repository:** `YOUR_USERNAME/survivalindex`
4. **Detect Components:**
   - App Platform will auto-detect `apps/backend`
5. **Configure Backend:**
   ```yaml
   Name: survivalindex-backend
   Type: Web Service
   Branch: main
   Source Directory: /apps/backend
   Build Command: npm install && npx prisma generate
   Run Command: npm start
   HTTP Port: 3001
   Environment: Node.js
   Instance Size: Basic ($5/month - 512MB RAM)
   Instance Count: 1
   ```

6. **Environment Variables** (click "Edit" → "Environment Variables"):
   ```
   DATABASE_URL=postgresql://user:password@host:port/survivalindex?sslmode=require
   ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
   GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
   NODE_ENV=production
   FRONTEND_URL=https://survivalindex-frontend.ondigitalocean.app
   PORT=3001
   ```

7. **Health Check:**
   - Path: `/api/health`
   - Port: 3001

### Step 4: Deploy Frontend on App Platform

1. **Same App** → **Add Component** → **Static Site**
2. **Configure Frontend:**
   ```yaml
   Name: survivalindex-frontend
   Type: Static Site
   Branch: main
   Source Directory: /apps/frontend
   Build Command: npm install && npm run build
   Output Directory: dist
   ```

3. **Environment Variables:**
   ```
   VITE_API_URL=https://survivalindex-backend.ondigitalocean.app
   ```

4. **Routing Rules** (for React Router):
   ```
   /* → /index.html (200 rewrite)
   ```

### Step 5: Run Database Migrations

```bash
# SSH into backend via App Platform Console
# Or use doctl CLI:
doctl apps exec YOUR_APP_ID --component survivalindex-backend

# Inside the container:
npx prisma migrate deploy
npm run seed
```

### Step 6: Verify Deployment

```bash
# Test backend
curl https://survivalindex-backend.ondigitalocean.app/api/health

# Test frontend
curl https://survivalindex-frontend.ondigitalocean.app/

# Test AI evaluation
curl -X POST https://survivalindex-backend.ondigitalocean.app/api/ai-judge/evaluate/1
```

---

## 🖥️ Option B: Droplet + Manual Setup

**Best for:** Full control, custom configurations, cost optimization

### Step 1: Create Droplet

1. **DigitalOcean Console** → **Droplets** → **Create Droplet**
2. **Settings:**
   - Image: Ubuntu 24.04 LTS
   - Plan: Basic ($12/month - 2GB RAM, 1 vCPU, 50GB SSD)
   - Datacenter: Choose closest region
   - Authentication: SSH key (recommended)
   - Hostname: `survivalindex-prod`
3. **Create Droplet** → Wait 1-2 minutes

### Step 2: Initial Server Setup

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2

# Install certbot (SSL)
apt install -y certbot python3-certbot-nginx

# Create app user
adduser --disabled-password --gecos "" survivalindex
usermod -aG sudo survivalindex
```

### Step 3: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE survivalindex;
CREATE USER survivalindex WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE survivalindex TO survivalindex;
\q
```

### Step 4: Deploy Backend

```bash
# Switch to app user
su - survivalindex

# Clone repository
git clone https://github.com/YOUR_USERNAME/survivalindex.git
cd survivalindex/apps/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://survivalindex:STRONG_PASSWORD_HERE@localhost:5432/survivalindex"
ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY_HERE"
GITHUB_TOKEN="ghp_YOUR_TOKEN_HERE"
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://survivalindex.ai"
EOF

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed

# Start with PM2
pm2 start src/server.js --name survivalindex-backend
pm2 save
pm2 startup
```

### Step 5: Deploy Frontend

```bash
# Build frontend
cd ~/survivalindex/apps/frontend
npm install

# Create production .env
echo "VITE_API_URL=https://api.survivalindex.ai" > .env.production

# Build
npm run build

# Copy to Nginx web root
sudo mkdir -p /var/www/survivalindex
sudo cp -r dist/* /var/www/survivalindex/
sudo chown -R www-data:www-data /var/www/survivalindex
```

### Step 6: Configure Nginx

```bash
# Backend API reverse proxy
sudo nano /etc/nginx/sites-available/api.survivalindex.ai
```

```nginx
server {
    listen 80;
    server_name api.survivalindex.ai;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Frontend static site
sudo nano /etc/nginx/sites-available/survivalindex.ai
```

```nginx
server {
    listen 80;
    server_name survivalindex.ai www.survivalindex.ai;
    root /var/www/survivalindex;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/api.survivalindex.ai /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/survivalindex.ai /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Setup SSL with Let's Encrypt

```bash
# Get SSL certificates
sudo certbot --nginx -d survivalindex.ai -d www.survivalindex.ai
sudo certbot --nginx -d api.survivalindex.ai

# Auto-renewal is configured by default
# Test renewal:
sudo certbot renew --dry-run
```

### Step 8: Setup Firewall

```bash
# Configure UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 🗄️ Database Setup

### Managed Database (Recommended)

**Pros:**
- Automatic backups
- High availability
- Automatic updates
- Monitoring included
- Scaling with one click

**Setup:**
1. DigitalOcean → Databases → Create
2. Choose PostgreSQL 16
3. Select plan ($15-$150/month)
4. Copy connection string
5. Add to `DATABASE_URL` in backend

**Connection String Format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

### Self-Hosted on Droplet

**Pros:**
- Lower cost (included in droplet price)
- Full control

**Cons:**
- Manual backups needed
- Manual updates
- Single point of failure

**Backup Script:**

```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/survivalindex/backups"
mkdir -p $BACKUP_DIR

pg_dump -U survivalindex survivalindex | gzip > $BACKUP_DIR/survivalindex_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 🔐 Environment Variables

### Backend Environment Variables

```bash
# Required
DATABASE_URL="postgresql://..."
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Optional
GITHUB_TOKEN="ghp_..."
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://survivalindex.ai"
```

### Frontend Environment Variables

```bash
# Build-time variable
VITE_API_URL="https://api.survivalindex.ai"
```

### Security Best Practices

1. **Never commit .env files** to Git
2. **Use DigitalOcean Spaces** for secret management (App Platform)
3. **Rotate API keys** every 90 days
4. **Use read-only database user** for analytics
5. **Enable connection pooling** for database

---

## 🌐 Domain & SSL

### Option 1: DigitalOcean Nameservers

1. **Purchase domain** from any registrar
2. **Update nameservers** to:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`
3. **DigitalOcean** → **Networking** → **Add Domain**
4. **Create A records:**
   - `@` → Your Droplet/App IP
   - `www` → Your Droplet/App IP
   - `api` → Your Backend IP

### Option 2: External DNS (Cloudflare)

1. Use Cloudflare for DNS (free tier)
2. Point A records to DigitalOcean IPs
3. Enable Cloudflare proxy for DDoS protection
4. Use Cloudflare SSL (Full mode)

### SSL Certificates

**App Platform:** Automatic (Let's Encrypt)
**Droplet:** Use Certbot (shown above)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Backend deployment
      - name: Deploy Backend
        uses: digitalocean/app_action@v1
        with:
          app_id: ${{ secrets.DO_APP_ID }}
          token: ${{ secrets.DO_TOKEN }}

      # Or for Droplet:
      - name: Deploy to Droplet
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: survivalindex
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/survivalindex
            git pull origin main
            cd apps/backend
            npm install
            npx prisma migrate deploy
            pm2 restart survivalindex-backend
            cd ../frontend
            npm install
            npm run build
            sudo cp -r dist/* /var/www/survivalindex/
```

**Required Secrets:**
- `DO_APP_ID`: App Platform app ID
- `DO_TOKEN`: DigitalOcean API token
- `DROPLET_IP`: Droplet IP address
- `SSH_PRIVATE_KEY`: SSH key for droplet access

---

## 📊 Monitoring & Logging

### Built-in Monitoring (App Platform)

- CPU usage
- Memory usage
- Request rate
- Error rate
- Response time

**Access:** App Platform Dashboard → Insights tab

### Custom Monitoring (Droplet)

**Install monitoring tools:**

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Install monitoring
npm install -g pm2-server-monit
pm2-server-monit start
```

**Logging:**

```bash
# View logs
pm2 logs survivalindex-backend

# Save logs
pm2 logs --json > /var/log/survivalindex.log
```

### External Monitoring

**Options:**
- **Uptime Robot** (free): https://uptimerobot.com/
- **Better Uptime** ($10/month): https://betteruptime.com/
- **DigitalOcean Monitoring** (free with droplet)

**Setup Health Checks:**
- Endpoint: `https://api.survivalindex.ai/api/health`
- Interval: 5 minutes
- Alert: Email/Slack when down

---

## 💰 Cost Estimation

### Option A: App Platform (Fully Managed)

| Component | Plan | Cost/Month |
|-----------|------|------------|
| Backend (Web Service) | Basic (512MB) | $5 |
| Frontend (Static Site) | Basic | $3 |
| Database (PostgreSQL) | Basic (1GB RAM) | $15 |
| **Total** | | **$23/month** |

**Scaling:**
- Backend → Professional ($12/month per instance)
- Database → Scale up to $60/month for 2GB RAM

### Option B: Droplet (Self-Managed)

| Component | Plan | Cost/Month |
|-----------|------|------------|
| Droplet (Ubuntu) | Basic (2GB RAM) | $12 |
| Managed Database | Basic (1GB RAM) | $15 |
| Bandwidth | 2TB included | $0 |
| Backups (20% of droplet) | Optional | $2.40 |
| **Total** | | **$27-29/month** |

**Or Fully Self-Hosted:**
- Droplet only: **$12-18/month** (includes PostgreSQL on droplet)

### Additional Costs

- **Domain Name:** $10-15/year
- **Anthropic API:** Pay-per-use (Claude Sonnet 4.5)
  - Input: $3 per million tokens
  - Output: $15 per million tokens
  - Estimated: $5-20/month for moderate usage
- **DigitalOcean Spaces** (object storage): $5/month (optional)

**Total Monthly Cost:** $30-50/month (App Platform) or $20-40/month (Droplet)

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database migration files ready
- [ ] Anthropic API key obtained
- [ ] Domain purchased (optional)

### Database

- [ ] PostgreSQL database created
- [ ] Connection string saved securely
- [ ] Migrations run successfully
- [ ] Sample data seeded
- [ ] Backup strategy configured

### Backend

- [ ] Deployed to App Platform or Droplet
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] API endpoints accessible
- [ ] AI Judge evaluating correctly
- [ ] Database connection stable

### Frontend

- [ ] Built successfully
- [ ] Deployed to static hosting or Droplet
- [ ] API_URL configured correctly
- [ ] Routing working (SPA mode)
- [ ] Assets loading correctly

### Security

- [ ] SSL certificates installed
- [ ] HTTPS enforced
- [ ] Firewall configured
- [ ] API rate limiting enabled
- [ ] Secrets not exposed in frontend
- [ ] CORS configured correctly

### Monitoring

- [ ] Health check monitoring active
- [ ] Error logging configured
- [ ] Uptime alerts set up
- [ ] Performance monitoring enabled

### Post-Deployment

- [ ] Test all API endpoints
- [ ] Test frontend functionality
- [ ] Run AI evaluation test
- [ ] Check database connections
- [ ] Verify SSL certificate
- [ ] Test from multiple devices/browsers
- [ ] Update DNS (if using custom domain)
- [ ] Announce launch! 🎉

---

## 🚀 Quick Deploy Commands

### Deploy Backend (App Platform)

```bash
# Install doctl
brew install doctl  # macOS
# or snap install doctl  # Linux

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec .do/app.yaml
```

### Deploy to Droplet

```bash
# One-line deploy
ssh survivalindex@YOUR_IP "cd ~/survivalindex && git pull && cd apps/backend && npm install && npx prisma migrate deploy && pm2 restart all && cd ../frontend && npm install && npm run build && sudo cp -r dist/* /var/www/survivalindex/"
```

---

## 📚 Additional Resources

- **DigitalOcean Docs:** https://docs.digitalocean.com/
- **App Platform Guide:** https://docs.digitalocean.com/products/app-platform/
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment
- **PM2 Guide:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Config:** https://nginx.org/en/docs/

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs survivalindex-backend
# or
doctl apps logs YOUR_APP_ID --component backend

# Common issues:
# - DATABASE_URL incorrect
# - Prisma client not generated: npx prisma generate
# - Port already in use
```

### Frontend can't connect to backend
```bash
# Check CORS settings in backend
# Verify VITE_API_URL is correct
# Check network tab in browser DevTools
```

### Database connection failed
```bash
# Test connection
psql $DATABASE_URL

# Check:
# - SSL mode (add ?sslmode=require)
# - Firewall rules
# - Database credentials
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates
```

---

**Next Steps:** Choose Option A or B and follow the deployment guide step-by-step!
