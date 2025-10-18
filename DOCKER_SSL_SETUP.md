# Setting up HTTPS for Docker Container on EC2

## Overview
You'll set up Nginx as a reverse proxy on your EC2 instance that:
1. Handles HTTPS with SSL certificate
2. Forwards requests to your Docker container running on port 4000
3. Your Docker container continues to run on HTTP internally

## Step 1: Install Nginx on EC2

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Nginx
sudo dnf install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

## Step 2: Configure Nginx as Reverse Proxy

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/conf.d/finding-movie.conf
```

Add this configuration (replace `your-ec2-ip` with your actual EC2 public IP):

```nginx
server {
    listen 80;
    server_name 3.1.101.29;
    
    # Forward all requests to your Docker container
    location / {
        proxy_pass http://localhost:4000;
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

Save the file (Ctrl+X, then Y, then Enter).

Test and restart Nginx:

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 3: Option A - Use Self-Signed Certificate (Quick & Free)

```bash
# Create directory for certificates
sudo mkdir -p /etc/ssl/private

# Generate self-signed certificate (valid for 1 year)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/finding-movie.key \
    -out /etc/ssl/certs/finding-movie.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=your-ec2-ip"
```

Update Nginx configuration for HTTPS:

```bash
sudo nano /etc/nginx/conf.d/finding-movie.conf
```

Replace the content with:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name 3.1.101.29;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name 3.1.101.29;
    
    # SSL certificate
    ssl_certificate /etc/ssl/certs/finding-movie.crt;
    ssl_certificate_key /etc/ssl/private/finding-movie.key;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Forward all requests to your Docker container
    location / {
        proxy_pass http://localhost:4000;
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

Test and restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Step 4: Update Security Group

1. Go to AWS Console → EC2 → Security Groups
2. Select your EC2's security group
3. Add inbound rule:
   - Type: HTTPS
   - Port: 443
   - Source: 0.0.0.0/0

## Step 5: Update Vercel Environment Variable

1. Go to your Vercel project → Settings → Environment Variables
2. Update `VITE_API_URI` to: `https://3.1.101.29`

## Step 6: Test the Setup

1. Check if Nginx is working:
   ```bash
   curl http://your-ec2-ip/health
   ```

2. Check if HTTPS is working:
   ```bash
   curl -k https://your-ec2-ip/health
   ```
   (The `-k` flag allows self-signed certificates)

3. Redeploy your Vercel app or wait for it to pick up the new environment variable

## Important Notes

### Self-Signed Certificate Warning
Browsers will show a security warning for self-signed certificates. For development:
- In Chrome, click "Advanced" → "Proceed to your-ec2-ip (unsafe)"
- This warning won't appear in production when you use a proper certificate

### For Production (Optional)
If you have a domain name, you can get a free SSL certificate from Let's Encrypt:

```bash
# Install certbot
sudo dnf install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Certbot will automatically update your Nginx configuration
```

### Docker Container Remains Unchanged
Your Docker container doesn't need any changes. It continues to:
- Run on port 4000 internally
- Use HTTP internally
- Nginx handles all HTTPS termination outside the container

This approach is more secure and easier to manage than running HTTPS inside the container itself.