# Quick Fix with Ngrok (5-minute solution)

Since setting up SSL on EC2 takes time, let's use ngrok to get an HTTPS URL immediately.

## Step 1: Install ngrok on your EC2 instance

```bash
ssh -i your-key.pem ec2-user@47.129.32.71

# Download ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz

# Extract it
tar xvzf ngrok-v3-stable-linux-amd64.tgz

# Run ngrok to expose port 4000
./ngrok http 4000
```

## Step 2: Copy the HTTPS URL

After running ngrok, you'll see something like:
```
Forwarding                    https://abc123-def456.ngrok.io -> http://localhost:4000
```

Copy the `https://abc123-def456.ngrok.io` URL (your URL will be different).

## Step 3: Update Vercel Environment Variable

1. Go to your Vercel project: https://vercel.com/sajeeb131s-projects/finding-movie
2. Click "Settings" tab
3. Click "Environment Variables" in the sidebar
4. Find the `VITE_API_URI` variable
5. Update its value to your ngrok URL: `https://abc123-def456.ngrok.io`
6. Click "Save"

## Step 4: Redeploy Vercel

1. Go to your Vercel project dashboard
2. Click "Deployments" tab
3. Click the three dots (...) next to the latest deployment
4. Click "Redeploy"

OR make a small change to trigger redeployment:
```bash
# On your local machine
echo "// Trigger redeploy" >> client/src/utils/api.js
git add client/src/utils/api.js
git commit -m "Trigger redeploy for ngrok URL"
git push origin main
```

## Step 5: Test

After Vercel redeploys (usually takes 1-2 minutes), your app should work! The browser error should be gone because:
- Frontend: HTTPS (Vercel)
- API: HTTPS (ngrok)
- No mixed content error!

## Important Notes

1. **Ngrok URL changes**: Every time you restart ngrok, you get a new URL
2. **Free ngrok limitations**: Free ngrok URLs expire after some time
3. **For production**: Use the SSL setup guide I sent earlier

## To Keep Ngrok Running

If you close your SSH connection, ngrok will stop. To keep it running:

```bash
# Use nohup to keep it running after logout
nohup ./ngrok http 4000 &

# Check if it's still running
ps aux | grep ngrok

# To stop it later
pkill ngrok
```

This should get your app working immediately while you set up proper SSL on EC2!