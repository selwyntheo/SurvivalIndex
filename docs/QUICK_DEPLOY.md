# ⚡ Quick Deploy to DigitalOcean (5 Minutes)

## 🎯 Prerequisites

1. **DigitalOcean Account** - https://www.digitalocean.com/
2. **Anthropic API Key** - https://console.anthropic.com/
3. **GitHub Account** with code pushed

---

## 🚀 Deploy in 3 Steps

### Step 1: Push to GitHub (2 min)

```bash
cd /Volumes/D/Projects/SurvivalIndex

# Initialize git (if not done)
git init
git add .
git commit -m "Ready for deployment"

# Create GitHub repo at https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/survivalindex.git
git branch -M main
git push -u origin main
```

### Step 2: Update Configuration (1 min)

Edit `.do/app.yaml` and replace:

```yaml
# Line 17 & 40:
repo: YOUR_USERNAME/survivalindex

# Line 28:
value: YOUR_ANTHROPIC_KEY_HERE

# Line 33 (optional):
value: YOUR_GITHUB_TOKEN_HERE
```

### Step 3: Deploy (2 min)

**Option A: Using Web UI** (Easiest)

1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **GitHub** → Select your repository
4. Click **"Autodeploy"** → DigitalOcean will detect the configuration
5. Review settings → Click **"Create Resources"**
6. ☕ Wait 5-10 minutes for deployment
7. 🎉 Click the URL to view your app!

**Option B: Using CLI** (Faster)

```bash
# Install doctl
brew install doctl  # macOS
# or
snap install doctl  # Linux

# Authenticate
doctl auth init
# Paste your API token from: https://cloud.digitalocean.com/account/api/tokens

# Deploy
doctl apps create --spec .do/app.yaml

# Monitor deployment
doctl apps list
doctl apps logs YOUR_APP_ID --follow
```

---

## ✅ Verify Deployment

```bash
# Get your URLs
doctl apps list

# Test backend
curl https://YOUR-APP-survivalindex-backend.ondigitalocean.app/api/health

# Test AI evaluation
curl -X POST https://YOUR-APP-survivalindex-backend.ondigitalocean.app/api/ai-judge/evaluate/1

# Open frontend in browser
open https://YOUR-APP-survivalindex-frontend.ondigitalocean.app
```

---

## 🎨 Custom Domain (Optional)

1. **DigitalOcean Console** → Your App → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `survivalindex.ai` and `api.survivalindex.ai`
4. Update your domain's nameservers to:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`
5. Wait 24-48 hours for DNS propagation

---

## 💰 Cost

- **Backend**: $5/month (512MB RAM)
- **Frontend**: $3/month (static site)
- **Database**: $15/month (1GB RAM PostgreSQL)
- **Total**: **$23/month**

Plus Anthropic API usage (~$5-20/month depending on evaluations)

---

## 🔧 Update Deployment

Every time you push to `main` branch, App Platform auto-deploys!

```bash
# Make changes
git add .
git commit -m "Updated AI scoring logic"
git push

# Auto-deploys in 2-3 minutes! ✨
```

---

## 📊 Monitor

- **Dashboard**: https://cloud.digitalocean.com/apps
- **Logs**: Click your app → **Runtime Logs**
- **Metrics**: **Insights** tab shows CPU, memory, requests

---

## 🆘 Troubleshooting

### Deployment failed?

```bash
# Check logs
doctl apps logs YOUR_APP_ID

# Common issues:
# 1. Forgot to update .do/app.yaml with your GitHub username
# 2. Invalid Anthropic API key
# 3. Prisma migration failed - check DATABASE_URL
```

### Can't connect to backend?

```bash
# Check CORS settings
# Verify FRONTEND_URL in backend environment variables
# Check backend logs for errors
```

### Database connection failed?

```bash
# App Platform automatically injects DATABASE_URL
# Check if database is running: DigitalOcean → Databases
# Verify Prisma migrations ran: Check build logs
```

---

## 🎉 You're Live!

Your SurvivalIndex app is now deployed with:

✅ Auto-scaling backend
✅ Static frontend with CDN
✅ Managed PostgreSQL database
✅ Automatic SSL certificates
✅ Auto-deploy on git push
✅ Built-in monitoring

**Next:** Share your app URL and start rating software! 🚀
