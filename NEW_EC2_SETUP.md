# New EC2 Instance Setup Guide

## Quick Setup for Your New EC2 Instance

### 1. Update GitHub Secrets with New Instance Details

First, update these secrets in your GitHub repository:
- **EC2_HOST**: Your new EC2 instance's public IP address
- **EC2_USER**: SSH username (usually `ec2-user` for Amazon Linux, `ubuntu` for Ubuntu)
- **EC2_SSH_KEY**: The private key content from your new PEM file

### 2. Connect to Your New EC2 Instance

```bash
ssh -i /path/to/your/new-key.pem ec2-user@your-new-ec2-public-ip
```

### 3. Install Docker on Amazon Linux 2023

```bash
# Update the system
sudo dnf update -y

# Install Docker
sudo dnf install -y docker

# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Add your user to the docker group (so you can run docker without sudo)
sudo usermod -a -G docker ec2-user

# Log out and log back in for group changes to take effect
exit
```

Note: Amazon Linux 2023 uses `dnf` instead of `yum` as the package manager

### 4. Verify Docker Installation

Reconnect to your instance and run:
```bash
docker --version
docker info
```

### 5. Configure Security Group

1. Go to AWS Console → EC2 → Security Groups
2. Find the security group attached to your new instance
3. Add inbound rules:
   - **Port 22** (SSH): Source 0.0.0.0/0 (or your IP for better security)
   - **Port 4000** (Backend API): Source 0.0.0.0/0
   - **Port 80** (HTTP): Source 0.0.0.0/0 (optional, for future use)
   - **Port 443** (HTTPS): Source 0.0.0.0/0 (optional, for future use)

### 6. Test Docker with a Simple Container

```bash
# Run a test container
docker run --rm hello-world

# If this works, Docker is properly installed
```

### 7. Trigger Your First Deployment

Now that your EC2 is ready:

1. **Make a small change to trigger deployment**:
   ```bash
   # Add a comment to any server file
   echo "// Initial deployment test" >> server/server.js
   
   # Commit and push
   git add server/server.js
   git commit -m "Trigger initial deployment to new EC2"
   git push origin main
   ```

### 8. Monitor and Verify Deployment

1. **Watch GitHub Actions**:
   - Go to your repository → Actions tab
   - Monitor the "Deploy Backend" workflow

2. **Check if container is running on EC2**:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   docker ps
   ```
   You should see a container named `finding-movie-server`

3. **Check container logs**:
   ```bash
   docker logs finding-movie-server
   ```

4. **Test the API**:
   - From EC2: `curl http://localhost:4000`
   - From your local machine: `curl http://your-ec2-ip:4000`

### 9. Deploy Frontend (if needed)

If you also need to deploy the frontend:

1. Make a small change to trigger frontend deployment:
   ```bash
   echo "// Frontend deployment test" >> client/src/App.jsx
   git add client/src/App.jsx
   git commit -m "Trigger frontend deployment"
   git push origin main
   ```

2. Monitor the "Deploy Frontend" workflow in GitHub Actions

### 10. Update Frontend API Configuration

After both deployments are successful:

1. Update `client/src/utils/api.js`:
   ```javascript
   export const API_URI = import.meta.env.VITE_API_URI || "http://your-new-ec2-ip:4000"
   ```

2. Or update the VITE_API_URI environment variable in your Vercel project settings

### Troubleshooting Common Issues

#### Docker Permission Denied
```bash
# If you get permission denied, try:
sudo docker ps
# Or log out and log back in after adding user to docker group
```

#### Container Not Starting
```bash
# Check logs
docker logs finding-movie-server

# Check if port is already in use
sudo netstat -tlnp | grep :4000
```

#### Can't Connect to API
1. Verify security group allows port 4000
2. Check if container is running: `docker ps`
3. Check container logs for errors

#### SSH Connection Issues
1. Verify you're using the correct PEM file
2. Check security group allows port 22
3. Ensure you're using the correct username (ec2-user or ubuntu)

### Quick Commands Reference

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Check Docker status
sudo systemctl status docker

# List running containers
docker ps

# View container logs
docker logs finding-movie-server

# Stop container
docker stop finding-movie-server

# Start container
docker start finding-movie-server

# Remove container
docker rm finding-movie-server

# Pull latest image manually
docker pull your-docker-username/finding-movie-server:latest
```

### Next Steps After Successful Setup

1. **Set up monitoring** (optional):
   - Install CloudWatch agent
   - Set up alerts for container failures

2. **Configure backup** (optional):
   - Set up automated snapshots
   - Backup your MongoDB data

3. **Security hardening** (optional):
   - Configure IAM roles
   - Set up a bastion host for SSH access
   - Enable VPC flow logs

Once you complete these steps, your CI/CD pipeline will automatically deploy to your new EC2 instance whenever you push changes to the main branch!