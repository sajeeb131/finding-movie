# Deployment Checklist

## Quick Steps to Trigger Your First Deployment

### 1. Verify Your Secrets Are Set
- Go to your GitHub repository → Settings → Secrets and variables → Actions
- Confirm all required secrets are added:
  - DOCKER_USERNAME
  - DOCKER_PASSWORD
  - EC2_HOST
  - EC2_USER
  - EC2_SSH_KEY
  - VERCEL_TOKEN
  - VERCEL_ORG_ID
  - VERCEL_PROJECT_ID

### 2. Trigger the Deployment (Choose ONE option)

#### Option A: Make a Small Change (Recommended)
1. Make a small change to trigger the workflow:
   - Backend: Add a comment to any file in the `server/` directory
   - Frontend: Add a comment to any file in the `client/` directory
2. Commit and push:
   ```bash
   git add .
   git commit -m "Trigger initial deployment"
   git push origin main
   ```

#### Option B: Manually Trigger GitHub Actions (If enabled)
1. Go to your repository → Actions tab
2. Select the workflow you want to run (deploy-backend or deploy-frontend)
3. Click "Run workflow" button (if available)

#### Option C: Use the GitHub API (Advanced)
You can use GitHub API to trigger a workflow dispatch event, but this requires additional setup.

### 3. Monitor the Deployment

#### For Backend:
1. Go to Actions tab in your GitHub repository
2. Click on "Deploy Backend" workflow run
3. Watch the progress - it should:
   - Build and test the code
   - Build Docker image
   - Push to Docker Hub
   - Deploy to EC2 via SSH

#### For Frontend:
1. Go to Actions tab
2. Click on "Deploy Frontend" workflow run
3. Watch the progress - it should:
   - Build the React app
   - Deploy to Vercel

### 4. Verify Deployment

#### Check Backend:
1. SSH into your EC2 instance:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-ip
   ```
2. Check if container is running:
   ```bash
   docker ps
   ```
3. Check logs if needed:
   ```bash
   docker logs finding-movie-server
   ```
4. Test API endpoint:
   ```bash
   curl http://localhost:4000
   ```

#### Check Frontend:
1. Go to your Vercel dashboard
2. Check if the latest deployment succeeded
3. Visit your Vercel URL to verify the site is working
4. Check browser console for API connection errors

### 5. Troubleshooting Common Issues

If deployment fails:

1. **Backend Issues**:
   - Check GitHub Actions logs for error messages
   - Verify Docker Hub credentials
   - Check EC2 SSH connection
   - Ensure port 4000 is open in security group

2. **Frontend Issues**:
   - Check Vercel deployment logs
   - Verify Vercel secrets are correct
   - Check if API endpoint is accessible from Vercel

### 6. Next Steps After Successful Deployment

1. **Update Frontend API Configuration**:
   - Modify `client/src/utils/api.js` to use environment variables
   - This ensures it works in both development and production

2. **Set Up Custom Domain** (Optional):
   - Configure custom domain in Vercel
   - Set up DNS records
   - Configure SSL (automatic with Vercel)

3. **Monitor and Maintain**:
   - Set up monitoring alerts
   - Regularly update dependencies
   - Backup your database

## Quick Commands Reference

```bash
# Check Docker containers on EC2
docker ps
docker logs finding-movie-server

# Restart container if needed
docker restart finding-movie-server

# Pull latest image manually
docker pull your-docker-username/finding-movie-server:latest
```

Remember: Your deployments will now happen automatically whenever you push changes to the main branch!