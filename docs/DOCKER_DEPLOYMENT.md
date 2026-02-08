# Docker Deployment Guide - DigitalOcean Droplet

Complete guide to deploying SurvivalIndex backend on a DigitalOcean Droplet using Docker.

## Prerequisites

- DigitalOcean account
- Domain name (optional, but recommended)
- Anthropic API key for AI evaluations

## Step 1: Create a DigitalOcean Droplet

### Via DigitalOcean Dashboard

1. Go to https://cloud.digitalocean.com/droplets
2. Click **Create Droplet**
3. Choose configuration:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month - 1GB RAM, 1 vCPU, 25GB SSD)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) or password
   - **Hostname**: `survivalindex-backend`
4. Click **Create Droplet**
5. Note the IP address once created

### Via CLI (Alternative)

```bash
# Install doctl if not already installed
brew install doctl

# Authenticate
doctl auth init

# Create droplet
doctl compute droplet create survivalindex-backend \
  --image ubuntu-22-04-x64 \
  --size s-1vcpu-1gb \
  --region nyc1 \
  --ssh-keys YOUR_SSH_KEY_ID

# Get droplet IP
doctl compute droplet list
```

## Step 2: Connect to Your Droplet

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system packages
apt update && apt upgrade -y
```

## Step 3: Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version

# Enable Docker to start on boot
systemctl enable docker
systemctl start docker
```

## Step 4: Set Up the Application

### Clone Repository

```bash
# Install git if needed
apt install git -y

# Clone your repository
cd /opt
git clone https://github.com/selwyntheo/survivalindex.git
cd survivalindex/apps/backend

# Create data directory for SQLite database
mkdir -p data
```

### Configure Environment Variables

```bash
# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
DATABASE_URL=file:/app/data/prod.db
FRONTEND_URL=https://your-frontend-url.ondigitalocean.app
ANTHROPIC_API_KEY=your-anthropic-api-key-here
EOF

# Secure the .env file
chmod 600 .env
```

**Important**: Replace the values:
- `FRONTEND_URL`: Your actual frontend URL
- `ANTHROPIC_API_KEY`: Your actual Anthropic API key

## Step 5: Build and Run with Docker

### Option A: Using Docker Compose (Recommended)

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Check status
docker-compose ps
```

### Option B: Using Docker Directly

```bash
# Build the image
docker build -t survivalindex-backend .

# Run the container
docker run -d \
  --name survivalindex-backend \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  --restart unless-stopped \
  survivalindex-backend

# View logs
docker logs -f survivalindex-backend

# Check status
docker ps
```

## Step 6: Verify Deployment

```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Test API root
curl http://localhost:8080/api

# Expected response:
# {"status":"ok","timestamp":"...","environment":"production"}
```

## Step 7: Configure Firewall

```bash
# Install UFW (Uncomplicated Firewall)
apt install ufw -y

# Allow SSH (IMPORTANT: Do this first!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow backend port (if accessing directly)
ufw allow 8080/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## Step 8: Set Up Nginx Reverse Proxy (Optional but Recommended)

### Install Nginx

```bash
# If using docker-compose, nginx is already included
# Otherwise, install nginx separately:
apt install nginx -y

# Copy nginx config
cp nginx.conf /etc/nginx/nginx.conf

# Test configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx
```

### Configure Domain (Optional)

If you have a domain name:

```bash
# Update nginx.conf with your domain
nano /etc/nginx/nginx.conf
# Change: server_name your-domain.com;

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com

# Certbot will automatically configure SSL and set up auto-renewal
```

## Step 9: Seed the Database

```bash
# Enter the container
docker exec -it survivalindex-backend sh

# Run seed script
npm run seed

# Exit container
exit
```

## Step 10: Set Up Auto-Updates (Optional)

### Create Update Script

```bash
cat > /opt/survivalindex/update.sh << 'EOF'
#!/bin/bash
cd /opt/survivalindex
git pull origin main
cd apps/backend
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo "Deployment updated at $(date)" >> /var/log/survivalindex-updates.log
EOF

chmod +x /opt/survivalindex/update.sh
```

### Set Up Webhook for Auto-Deploy (Optional)

```bash
# Install webhook
apt install webhook -y

# Create webhook configuration
cat > /etc/webhook.conf << 'EOF'
[
  {
    "id": "survivalindex-deploy",
    "execute-command": "/opt/survivalindex/update.sh",
    "command-working-directory": "/opt/survivalindex",
    "response-message": "Deploying SurvivalIndex...",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "your-webhook-secret",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
EOF

# Start webhook service
webhook -hooks /etc/webhook.conf -verbose -port 9000 &
```

## Management Commands

### View Logs

```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart backend only
docker-compose restart backend
```

### Update Application

```bash
cd /opt/survivalindex
git pull origin main
cd apps/backend
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Management

```bash
# Backup database
docker exec survivalindex-backend sh -c 'cp /app/data/prod.db /app/data/backup-$(date +%Y%m%d-%H%M%S).db'

# Copy backup to host
docker cp survivalindex-backend:/app/data/backup-*.db ./backups/

# Restore database
docker cp ./backups/backup-20260208.db survivalindex-backend:/app/data/prod.db
docker-compose restart backend
```

### Run Migrations

```bash
# Run migrations manually
docker exec survivalindex-backend npx prisma migrate deploy

# Or rebuild and restart
docker-compose down
docker-compose up -d
```

## Monitoring

### Check Container Health

```bash
# Container status
docker ps

# Resource usage
docker stats survivalindex-backend

# Health check
docker inspect --format='{{.State.Health.Status}}' survivalindex-backend
```

### Set Up Monitoring (Optional)

```bash
# Install monitoring tools
apt install htop iotop -y

# Monitor system resources
htop

# Monitor disk usage
df -h

# Monitor logs in real-time
tail -f /var/log/syslog
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
netstat -tulpn | grep 8080

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Issues

```bash
# Reset database
docker-compose down
rm -rf data/prod.db
docker-compose up -d

# Run migrations
docker exec survivalindex-backend npx prisma migrate deploy

# Seed database
docker exec survivalindex-backend npm run seed
```

### Out of Memory

```bash
# Check memory usage
free -h

# Restart services to free memory
docker-compose restart

# Upgrade droplet if needed
# DigitalOcean Dashboard → Droplet → Resize
```

### SSL Certificate Issues

```bash
# Renew certificate manually
certbot renew

# Test renewal
certbot renew --dry-run

# Check certificate status
certbot certificates
```

## Security Best Practices

1. **Change default SSH port**
   ```bash
   nano /etc/ssh/sshd_config
   # Change: Port 2222
   systemctl restart sshd
   ufw allow 2222/tcp
   ```

2. **Disable root login**
   ```bash
   # Create a new user
   adduser deploy
   usermod -aG sudo deploy
   
   # Disable root SSH
   nano /etc/ssh/sshd_config
   # Change: PermitRootLogin no
   systemctl restart sshd
   ```

3. **Set up automatic security updates**
   ```bash
   apt install unattended-upgrades -y
   dpkg-reconfigure -plow unattended-upgrades
   ```

4. **Regular backups**
   ```bash
   # Create backup script
   cat > /opt/backup.sh << 'EOF'
   #!/bin/bash
   DATE=$(date +%Y%m%d-%H%M%S)
   docker exec survivalindex-backend sh -c "cp /app/data/prod.db /app/data/backup-$DATE.db"
   # Upload to S3 or DigitalOcean Spaces
   EOF
   
   chmod +x /opt/backup.sh
   
   # Add to crontab (daily at 2 AM)
   crontab -e
   # Add: 0 2 * * * /opt/backup.sh
   ```

## Cost Optimization

- **Basic Droplet**: $6/month (sufficient for small to medium traffic)
- **Upgrade to $12/month**: If you need 2GB RAM for higher traffic
- **Use DigitalOcean Spaces**: For database backups ($5/month for 250GB)
- **Enable monitoring**: Free with DigitalOcean

## Accessing Your API

Once deployed, your API will be available at:

- **Direct**: `http://YOUR_DROPLET_IP:8080/api`
- **Via Nginx**: `http://YOUR_DROPLET_IP/api`
- **With Domain**: `https://api.yourdomain.com/api`

Update your frontend's `VITE_API_URL` to point to this URL.

## Next Steps

1. ✅ Droplet created and configured
2. ✅ Docker containers running
3. ✅ Database seeded
4. 🔄 Configure domain and SSL
5. 🔄 Set up monitoring and backups
6. 🔄 Update frontend to use new backend URL
7. 🔄 Test AI evaluation endpoints

## Support

For issues:
- Check logs: `docker-compose logs -f`
- Verify health: `curl http://localhost:8080/api/health`
- Review this guide's troubleshooting section
- Check DigitalOcean community forums
