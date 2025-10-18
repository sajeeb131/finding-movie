# Troubleshooting Deployment Error

## Issue: Health Check Failing - "Connection reset by peer"

The deployment is failing at the health check step where it tries to connect to `http://localhost:4000`. The container is starting but the application isn't responding.

## Possible Causes and Solutions

### 1. Application Not Starting Properly

The Docker container is running but the Node.js application inside might be failing to start.

**Check container logs:**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
docker logs finding-movie-server
```

Look for errors like:
- Database connection errors
- Missing environment variables
- Port binding issues
- Application crashes

### 2. Missing Environment Variables in Docker Container

The `.env` file is excluded by `.dockerignore`, so environment variables aren't being copied to the Docker image.

**Solution 1: Pass environment variables during docker run**

Update the deployment script in `.github/workflows/deploy-backend.yml`:

```yaml
# Run the new container
docker run -d \
  --name finding-movie-server \
  --restart unless-stopped \
  -p 4000:4000 \
  -e MONGODB_URI="mongodb+srv://finding-movie:nika@nodetutorials.amp8imj.mongodb.net/movie-finding?retryWrites=true&w=majority" \
  -e PORT=4000 \
  -e TMDB_API_KEY="20448842c6dda672a24bf844d65b2ff7" \
  ${{ env.DOCKER_IMAGE }}:latest
```

**Solution 2: Create a .env file on EC2 and mount it**

1. Create `.env` file on EC2:
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
cat > ~/.env << EOF
MONGODB_URI=mongodb+srv://finding-movie:nika@nodetutorials.amp8imj.mongodb.net/movie-finding?retryWrites=true&w=majority
PORT=4000
TMDB_API_KEY="20448842c6dda672a24bf844d65b2ff7"
EOF
```

2. Update the deployment script to mount the file:
```yaml
# Run the new container
docker run -d \
  --name finding-movie-server \
  --restart unless-stopped \
  -p 4000:4000 \
  -v ~/.env:/app/.env:ro \
  ${{ env.DOCKER_IMAGE }}:latest
```

### 3. Database Connection Issues

The application might be failing to connect to MongoDB.

**Check if MongoDB URI is accessible:**
```bash
# On EC2 instance
curl "mongodb+srv://finding-movie:nika@nodetutorials.amp8imj.mongodb.net/movie-finding?retryWrites=true&w=majority"
```

### 4. Port Binding Issues

The application might be trying to bind to a different port or interface.

**Check what's listening on port 4000:**
```bash
# On EC2 instance
sudo netstat -tlnp | grep :4000
```

### 5. Application Startup Time

The application might need more than 10 seconds to start.

**Solution: Increase the sleep time in the deployment script:**

```yaml
# Wait for the container to start
sleep 30
```

## Quick Fix Steps

### Step 1: Check Container Logs
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
docker logs finding-movie-server
```

### Step 2: If Environment Variables are Missing
Update your deployment workflow to include environment variables:

1. Go to `.github/workflows/deploy-backend.yml`
2. Find the docker run command (around line 91)
3. Add the environment variables as shown in Solution 1 above
4. Commit and push the changes

### Step 3: Test Locally
Test the Docker image locally to ensure it works:

```bash
# On your local machine
docker run -d \
  --name test-server \
  -p 4000:4000 \
  -e MONGODB_URI="mongodb+srv://finding-movie:nika@nodetutorials.amp8imj.mongodb.net/movie-finding?retryWrites=true&w=majority" \
  -e PORT=4000 \
  -e TMDB_API_KEY="20448842c6dda672a24bf844d65b2ff7" \
  your-docker-username/finding-movie-server:latest

# Wait and test
sleep 10
curl http://localhost:4000

# Clean up
docker stop test-server
docker rm test-server
```

### Step 4: Manual Deployment Test
Manually deploy on EC2 to debug:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# Pull the image
docker pull your-docker-username/finding-movie-server:latest

# Run with environment variables
docker run -d \
  --name finding-movie-server \
  --restart unless-stopped \
  -p 4000:4000 \
  -e MONGODB_URI="mongodb+srv://finding-movie:nika@nodetutorials.amp8imj.mongodb.net/movie-finding?retryWrites=true&w=majority" \
  -e PORT=4000 \
  -e TMDB_API_KEY="20448842c6dda672a24bf844d65b2ff7" \
  your-docker-username/finding-movie-server:latest

# Check logs
docker logs finding-movie-server

# Test connection
curl http://localhost:4000
```

## Most Likely Issue

Based on the error, the most likely issue is that the environment variables (MONGODB_URI, PORT, TMDB_API_KEY) are not available inside the Docker container because `.env` is excluded by `.dockerignore`. The application is probably failing to start due to missing the MongoDB connection string.

## Recommended Fix

Update your deployment workflow to pass environment variables explicitly (Solution 1 above). This is the cleanest approach and doesn't require storing files on the EC2 instance.