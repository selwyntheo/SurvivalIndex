# 🚀 Quick Start - Docker Deployment

Deploy SurvivalIndex backend to a DigitalOcean Droplet in under 10 minutes.

## Prerequisites

- DigitalOcean account
- SSH key configured
- Anthropic API key

## Option 1: Automated Deployment (Easiest)

```bash
# From your local machine
cd apps/backend
./deploy.sh YOUR_DROPLET_IP
```

The script will:
1. Install Docker and dependencies
2. Clone the repository
3. Configure environment variables
4. Build and start containers
5. Configure firewall
6. Test the deployment

## Option 2: Manual Deployment

### 1. Create Droplet

```bash
# Via CLI
doctl compute droplet create survivalindex-backend \
  --image ubuntu-22-04-x64 \
  --size s-1vcpu-1gb \
  --region nyc1 \
  --ssh-keys YOUR_SSH_KEY_ID

# Or via Dashboard: https://cloud.digitalocean.com/droplets
# Choose: Ubuntu 22.04, Basic $6/month, 1GB RAM
```

### 2. SSH and Install Docker

```bash
ssh root@YOUR_DROPLET_IP

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose git -y
```

### 3. Clone and Configure

```bash
cd /opt
git clone https://github.com/selwyntheo/survivalindex.git
cd survivalindex/apps/backend

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
DATABASE_URL=file:/app/data/prod.db
FRONTEND_URL=https://your-frontend-url.com
ANTHROPIC_API_KEY=your-api-key-here
EOF

chmod 600 .env
mkdir -p data
```

### 4. Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Test
curl http://localhost:8080/api/health
```

### 5. Configure Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp
ufw enable
```

## Verify Deployment

```bash
# Health check
curl http://YOUR_DROPLET_IP:8080/api/health

# API info
curl http://YOUR_DROPLET_IP:8080/api

# Expected response:
# {"status":"ok","timestamp":"...","environment":"production"}
```

## Seed Database

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Run seed
docker exec survivalindex-backend-backend-1 npm run seed

# Or enter container and run manually
docker exec -it survivalindex-backend-backend-1 sh
npm run seed
exit
```

## Update Frontend

Update your frontend's API URL:

```bash
# In your frontend .env or config
VITE_API_URL=http://YOUR_DROPLET_IP:8080
```

## Common Commands

```bash
# View logs
docker-compose logs -f backend

# Restart
docker-compose restart

# Stop
docker-compose down

# Update code
git pull origin main
docker-compose down
docker-compose up -d --build

# Backup database
docker exec survivalindex-backend-backend-1 sh -c 'cp /app/data/prod.db /app/data/backup.db'
docker cp survivalindex-backend-backend-1:/app/data/backup.db ./backup.db
```

## Optional: Set Up Domain & SSL

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d api.yourdomain.com

# Update nginx.conf with your domain
nano /opt/survivalindex/apps/backend/nginx.conf
# Change: server_name api.yourdomain.com;

# Restart nginx
docker-compose restart nginx
```

## Costs

- **Droplet**: $6/month (1GB RAM)
- **Bandwidth**: 1TB included
- **Total**: ~$6/month

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs backend
docker-compose down -v
docker-compose up -d --build
```

**Can't connect:**
```bash
# Check firewall
ufw status

# Check if service is running
docker ps
curl http://localhost:8080/api/health
```

**Out of memory:**
```bash
# Check memory
free -h

# Upgrade droplet to 2GB RAM ($12/month)
```

## Next Steps

1. ✅ Backend deployed and running
2. 🔄 Update frontend API URL
3. 🔄 Seed database with projects
4. 🔄 Test AI evaluation endpoints
5. 🔄 Set up domain and SSL (optional)
6. 🔄 Configure monitoring and backups

## Full Documentation

See `docs/DOCKER_DEPLOYMENT.md` for complete documentation including:
- Nginx reverse proxy setup
- SSL/HTTPS configuration
- Monitoring and logging
- Backup strategies
- Security best practices
- Auto-deployment setup

## Support

- **Logs**: `docker-compose logs -f backend`
- **Health**: `curl http://YOUR_IP:8080/api/health`
- **Docs**: See `docs/DOCKER_DEPLOYMENT.md`
