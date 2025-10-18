# Frontend API Connection Fix

## Issues Identified:

1. **Mixed Content Error**: Frontend (HTTPS) trying to call API (HTTP) - browsers block this
2. **API Route Structure**: Your server has routes at `/api/ai/search` not just `/ai/search`

## Solutions:

### Option 1: Use HTTPS for API (Recommended)

You need to set up HTTPS on your EC2 instance. Here's how:

1. **Install Nginx on EC2**:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   sudo dnf install -y nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

2. **Get a free SSL certificate with Let's Encrypt**:
   ```bash
   sudo dnf install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```
   (You'll need a domain name for this)

3. **Configure Nginx as reverse proxy**:
   Create `/etc/nginx/conf.d/finding-movie.conf`:
   ```nginx
   server {
       listen 80;
       server_name your-ec2-ip-or-domain;
       
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Update Vercel environment variable**:
   - Go to Vercel project settings
   - Update `VITE_API_URI` to: `https://your-ec2-ip-or-domain`

### Option 2: Use a Proxy Service (Quick Fix)

Use a service like CORS Anywhere or ngrok for development:

```bash
# On EC2, install ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
./ngrok http 4000
```

Then update Vercel `VITE_API_URI` to: `https://your-ngrok-url`

### Option 3: Use Vercel Serverless Functions (Best for Production)

Create a proxy API route in Vercel:

1. Create `client/api/ai/search.js`:
   ```javascript
   export default async function handler(req, res) {
     const response = await fetch('http://your-ec2-ip:4000/api/ai/search', {
       method: req.method,
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(req.body),
     });
     
     const data = await response.json();
     res.status(response.status).json(data);
   }
   ```

2. Update `client/src/utils/api.js`:
   ```javascript
   export const API_URI = ""  // Empty for same-origin
   ```

3. The frontend will call `/api/ai/search` which Vercel will proxy to your EC2

### Option 4: Temporary Fix - Disable HTTPS in Vercel (Not Recommended)

1. Go to Vercel project settings
2. Under "Domains", disable "Force HTTPS"
3. This will make your site HTTP-only (not secure)

## API Route Explanation

Your server routes are structured as:
- `/api/ai/search` - AI-powered movie search
- `/api/search` - Regular movie search
- `/health` - Health check endpoint

The `/api` prefix is added in `server.js` lines 19-22:
```javascript
app.use('/api', movieRoutes);
app.use('/api/ai', aiMovieRoutes);
```

## Recommended Solution

For production, use **Option 1** (HTTPS on EC2) or **Option 3** (Vercel proxy). Both are secure and production-ready.

For quick testing, **Option 2** (ngrok) works well.