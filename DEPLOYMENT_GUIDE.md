# Deploy Angular App to AWS EC2

## Overview
This guide deploys your Angular app to an AWS EC2 instance and makes it publicly accessible via HTTP/HTTPS.

## Prerequisites
- AWS Account with EC2 access
- SSH key pair (.pem file) downloaded
- Your Angular app running locally (verified)

## Step 1: Build the Angular App (Local)

Run these commands in your local `angular-app` folder:

```powershell
cd "C:\Users\My PC\Documents\Websites\PA\AP-UI\angular-app"
npm run build
```

This creates an optimized production build in `dist/angular-app/` folder.

---

## Step 2: Create an AWS EC2 Instance

### 2a. Launch Instance
1. Go to AWS Console → EC2 → Instances → Launch Instances
2. Choose an AMI: **Ubuntu 24.04 LTS** (free tier eligible)
3. Instance Type: **t2.micro** (free tier)
4. Configure Security Group (create new or use existing):
   - **Inbound Rules:**
     - SSH (22): from your IP (for setup)
     - HTTP (80): from 0.0.0.0/0 (public access)
     - HTTPS (443): from 0.0.0.0/0 (if using SSL)
   - **Outbound Rules:** Allow all (default)
5. Storage: 20 GB (default fine)
6. Key Pair: Download your `.pem` file (keep it safe)
7. Launch and wait for instance to be running

### 2b. Get Public IP
- Note your instance's **Public IP Address** (e.g., `54.123.45.67`)

---

## Step 3: Connect to EC2 Instance via SSH

### On Windows PowerShell:
```powershell
# Change to the folder where your .pem file is
cd "C:\path\to\your\.pem\folder"

# Set correct permissions (Windows)
$pem = "your-key-pair.pem"
icacls $pem /inheritance:r /grant:r "$env:USERNAME`:(F)"

# SSH into the instance
ssh -i $pem ubuntu@<YOUR_PUBLIC_IP>
# Example: ssh -i my-key.pem ubuntu@54.123.45.67
```

---

## Step 4: Set Up EC2 Instance

### 4a. Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 4b. Install Node.js (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs npm
node --version
npm --version
```

### 4c. Install Nginx (reverse proxy)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Verify: Visit `http://<YOUR_PUBLIC_IP>` — you should see the Nginx welcome page.

---

## Step 5: Upload Your Built App to EC2

### Option A: Using SCP (Secure Copy)
From your **local** machine (PowerShell):

```powershell
$pem = "your-key-pair.pem"
$publicIp = "54.123.45.67"

# Copy the built dist folder to EC2
scp -i $pem -r "C:\Users\My PC\Documents\Websites\PA\AP-UI\angular-app\dist\angular-app" ubuntu@${publicIp}:/tmp/

# Or via WSL/Git Bash if PowerShell scp isn't available:
wsl scp -i /mnt/c/path/to/your-key.pem -r C:/Users/My\ PC/Documents/Websites/PA/AP-UI/angular-app/dist/angular-app ubuntu@54.123.45.67:/tmp/
```

### Option B: Using Git (if repo is public)
```bash
# On EC2:
cd /tmp
git clone https://github.com/your-username/your-repo.git
cd your-repo/angular-app
npm install --no-audit --no-fund
npm run build
```

---

## Step 6: Set Up Nginx to Serve the App

### 6a. Create Nginx config
```bash
sudo tee /etc/nginx/sites-available/angular-app > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /var/www/angular-app/dist/angular-app;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;
}
EOF
```

### 6b. Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/angular-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site if desired
```

### 6c. Test Nginx config
```bash
sudo nginx -t
```

### 6d. Restart Nginx
```bash
sudo systemctl restart nginx
```

---

## Step 7: Move Your App to the Web Root

```bash
# Assuming you uploaded to /tmp/angular-app
sudo mkdir -p /var/www/angular-app/dist
sudo cp -r /tmp/angular-app /var/www/angular-app/dist/
sudo chown -R www-data:www-data /var/www/angular-app
sudo chmod -R 755 /var/www/angular-app
```

---

## Step 8: Verify Deployment

1. Open your browser: `http://<YOUR_PUBLIC_IP>`
   - You should see your Angular app running
2. Test the queue table and other features

---

## Step 9 (Optional): Set Up SSL/HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com  # If you have a domain
sudo certbot renew --dry-run  # Test auto-renewal
```

Update Nginx config to redirect HTTP to HTTPS:
```bash
sudo tee /etc/nginx/sites-available/angular-app > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/angular-app/dist/angular-app;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;
}
EOF

sudo systemctl restart nginx
```

---

## Troubleshooting

### App shows 404 or blank page
- Check permissions: `sudo ls -la /var/www/angular-app/`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify index.html exists: `ls /var/www/angular-app/dist/angular-app/index.html`

### Nginx isn't serving the app
```bash
sudo systemctl status nginx
sudo journalctl -u nginx -n 50
```

### Port 80 already in use
```bash
sudo lsof -i :80
sudo kill -9 <PID>
```

### Update app (pull latest build)
```bash
cd /var/www/angular-app
sudo rm -rf dist/angular-app
# Re-upload or rebuild, then restart Nginx
sudo systemctl restart nginx
```

---

## Cost Estimate (AWS Free Tier, 12 months)
- **t2.micro EC2**: Free (750 hrs/month for 1 year)
- **Data transfer**: ~1 GB free per month
- **Total**: **Free** for first year

---

## Next Steps
- Monitor your instance: AWS Console → CloudWatch
- Set up auto-scaling if traffic grows
- Configure backups and snapshots
- Use AWS RDS for database (if needed)
