# Deployment Guide for Finding-Movie Project

## Overview

This guide explains the CI/CD and Docker setup for your movie recommendation project and provides step-by-step instructions for configuring the necessary environment variables, secrets, and services for successful deployment to your AWS EC2 instance.

## Architecture Overview

### Frontend (Client)
- **Technology**: React with Vite
- **Deployment Platform**: Vercel
- **CI/CD**: GitHub Actions (`.github/workflows/deploy-frontend.yml`)
- **Trigger**: Push to main branch when client files change

### Backend (Server)
- **Technology**: Node.js with Express
- **Database**: MongoDB Atlas
- **Deployment Platform**: Docker container on AWS EC2
- **CI/CD**: GitHub Actions (`.github/workflows/deploy-backend.yml`)
- **Trigger**: Push to main branch when server files change

## Required Configurations

### 1. GitHub Repository Secrets

You need to configure the following secrets in your GitHub repository settings:

#### For Backend Deployment:
1. **DOCKER_USERNAME**: Your Docker Hub username
2. **DOCKER_PASSWORD**: Your Docker Hub password or access token
3. **EC2_HOST**: Public IP address or DNS name of your EC2 instance
4. **EC2_USER**: SSH username for your EC2 instance (usually `ec2-user` for Amazon Linux, `ubuntu` for Ubuntu)
5. **EC2_SSH_KEY**: Private SSH key content for connecting to your EC2 instance

#### For Frontend Deployment:
1. **VERCEL_TOKEN**: Your Vercel authentication token
2. **VERCEL_ORG_ID**: Your Vercel organization ID
3. **VERCEL_PROJECT_ID**: Your Vercel project ID

### 2. Environment Variables for Backend

The backend requires the following environment variables (already configured in `server/.env`):

1. **MONGODB_URI**: MongoDB Atlas connection string
2. **PORT**: Server port (default: 4000)
3. **TMDB_API_KEY**: The Movie Database (TMDB) API key

### 3. EC2 Instance Setup

Your EC2 instance needs to have:
1. Docker installed
2. Docker Compose (optional, for local development)
3. Port 4000 open in the security group
4. SSH access configured with the key pair you'll use in GitHub secrets

## Step-by-Step Setup Instructions

### 1. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret" and add the following:

#### For Backend:
- **DOCKER_USERNAME**: Your Docker Hub username
- **DOCKER_PASSWORD**: Your Docker Hub password or access token
- **EC2_HOST**: Your EC2 instance public IP or DNS
- **EC2_USER**: SSH username (e.g., `ec2-user` or `ubuntu`)
- **EC2_SSH_KEY**:
  - Locate the `.pem` file you downloaded when creating the EC2 instance
  - Open the `.pem` file in a text editor (Notepad, VS Code, etc.)
    - On Windows: Right-click the file → Open with → Notepad or VS Code
    - On Mac/Linux: Use `cat your-key-file.pem` in terminal or open with any text editor
  - Copy the entire content, including the first and last lines:
    ```
    -----BEGIN RSA PRIVATE KEY-----
    MIIEpAIBAAKCAQEAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ... (many lines of random characters) ...
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    -----END RSA PRIVATE KEY-----
    ```
  - Paste the entire content as the secret value in GitHub
  - Note: Make sure you copy ALL lines including the BEGIN and END lines

### What if you lose the PEM file?

If you've lost your PEM file, you have two options:

#### Option 1: Create a New Key Pair (Recommended)
1. Go to AWS Console → EC2 → Key Pairs
2. Click "Create key pair"
3. Give it a name (e.g., `finding-movie-deploy-key`)
4. Select RSA and .pem format
5. Click "Create key pair" and download the new key file
6. Update your EC2 instance to use the new key:
   - Stop your EC2 instance
   - Right-click the instance → Security → Modify instance metadata options
   - Enable "Stop - Hibernate" if not already enabled
   - Right-click the instance → Image and templates → Launch more like this
   - In the launch wizard, select your new key pair
   - Launch a new instance with the same configuration
   - Terminate the old instance

#### Option 2: Create an AMI and Relaunch
1. Right-click your current instance → Image and templates → Create image
2. Wait for the AMI to be created
3. Launch a new instance from the AMI with a new key pair
4. Update your security groups and any elastic IPs if needed

#### Important Notes:
- AWS doesn't allow you to recover or regenerate a lost private key
- Always keep backup copies of your key files in secure locations
- Consider using AWS Systems Manager Session Manager as an alternative to SSH keys for future deployments

#### For Frontend:
- **VERCEL_TOKEN**:
  - Log in to Vercel (https://vercel.com)
  - Click on your profile picture → Settings → Tokens
  - Click "Create Token"
  - Give it a name (e.g., "GitHub Actions")
  - Copy the generated token

- **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**:
  - First, you need to create a Vercel project (see step 3 below)
  - After creating the project, go to your project's dashboard
  - Click "Settings" tab
  - The "General" section will show both the Organization ID and Project ID
  - Copy both values

### 3. Create and Configure Vercel Project

1. **Create a new Vercel project:**
   - Go to https://vercel.com and log in
   - Click "Add New..." → "Project"
   - Choose "Import Git Repository"
   - Connect your GitHub account if not already connected
   - Select your finding-movie repository
   - Vercel will automatically detect it as a React/Vite project

2. **Configure project settings:**
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./client` (important - this tells Vercel to look in the client folder)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Add Environment Variables:**
   - In the project settings, go to "Environment Variables"
   - Add a variable for your backend API:
     - Name: `VITE_API_URI`
     - Value: `http://your-ec2-public-ip:4000` (replace with your EC2 IP)
   - Click "Save"

4. **Deploy the project:**
   - Click "Deploy" to deploy your initial version
   - After deployment, Vercel will give you a production URL

5. **Get the IDs:**
   - Go to your project's "Settings" tab
   - In the "General" section, you'll find:
     - Organization ID
     - Project ID
   - Copy these values to your GitHub secrets

### 2. Prepare Your EC2 Instance

1. Connect to your EC2 instance via SSH:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-ip
   ```

2. Install Docker:
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -a -G docker ec2-user
   ```

3. Verify Docker installation:
   ```bash
   docker --version
   ```

4. Open port 4000 in your EC2 security group:
   - Go to AWS Console → EC2 → Security Groups
   - Select the security group associated with your instance
   - Add an inbound rule:
     - Type: TCP
     - Port Range: 4000
     - Source: 0.0.0.0/0 (for testing) or your specific IP for production

### 4. Update Frontend API Configuration

You have two options for configuring the frontend API endpoint:

#### Option 1: Using Environment Variables (Recommended)
1. Modify [`client/src/utils/api.js`](client/src/utils/api.js:1) to use environment variables:
   ```javascript
   export const API_URI = import.meta.env.VITE_API_URI || "http://localhost:4000"
   ```

2. The `VITE_API_URI` environment variable is already configured in your Vercel project settings (from step 3 above), so it will automatically use your EC2 IP in production.

#### Option 2: Hardcode the IP Address
Update [`client/src/utils/api.js`](client/src/utils/api.js:1) to point directly to your EC2 instance:
```javascript
export const API_URI = "http://your-ec2-public-ip:4000"
```

Note: This approach is less flexible as you'll need to manually update the file if your EC2 IP changes.

### 5. Optional: Configure Custom Domain (for production)

For a production setup, consider:
1. Setting up a custom domain with HTTPS
2. Using AWS Route 53 for DNS management
3. Configuring an SSL certificate with AWS Certificate Manager
4. Setting up a reverse proxy with Nginx on your EC2 instance

## Deployment Process

### Automatic Deployment

Once configured, the deployment process will trigger automatically:

1. **For Backend**:
   - When you push changes to the `server/` directory on the main branch
   - GitHub Actions will build and test the code
   - Create a Docker image and push it to Docker Hub
   - Connect to your EC2 instance via SSH
   - Pull the latest image and restart the container

2. **For Frontend**:
   - When you push changes to the `client/` directory on the main branch
   - GitHub Actions will build the React app
   - Deploy it to Vercel

### Manual Deployment (if needed)

#### Backend:
1. Build the Docker image locally:
   ```bash
   cd server
   docker build -t your-docker-username/finding-movie-server .
   ```

2. Push to Docker Hub:
   ```bash
   docker push your-docker-username/finding-movie-server
   ```

3. Deploy to EC2:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-ip
   docker pull your-docker-username/finding-movie-server:latest
   docker stop finding-movie-server || true
   docker rm finding-movie-server || true
   docker run -d --name finding-movie-server --restart unless-stopped -p 4000:4000 your-docker-username/finding-movie-server:latest
   ```

#### Frontend:
1. Build locally:
   ```bash
   cd client
   npm run build
   ```

2. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```

## Troubleshooting

### Common Issues:

1. **Docker Hub Authentication Error**:
   - Verify your DOCKER_USERNAME and DOCKER_PASSWORD secrets
   - Consider using a Docker access token instead of your password

2. **SSH Connection Error**:
   - Ensure your EC2_SSH_KEY secret includes the entire key content
   - Verify the EC2_HOST and EC2_USER values
   - Check that port 22 is open in your security group

3. **Backend Not Accessible**:
   - Verify port 4000 is open in your EC2 security group
   - Check if the Docker container is running: `docker ps`
   - Check container logs: `docker logs finding-movie-server`

4. **Frontend Can't Connect to Backend**:
   - Verify the API_URI in `client/src/utils/api.js` points to your EC2 instance
   - Check if CORS is properly configured in the backend

5. **MongoDB Connection Error**:
   - Verify your MONGODB_URI is correct
   - Ensure your IP is whitelisted in MongoDB Atlas

## Security Considerations

1. **Environment Variables**: Never commit sensitive information to your repository
2. **SSH Keys**: Use a dedicated key pair for CI/CD, not your personal one
3. **Docker**: Use a non-root user in your Docker container (already configured)
4. **Network**: Consider using a VPN or security groups to restrict access to your EC2 instance
5. **HTTPS**: Use HTTPS in production by setting up a reverse proxy with SSL

## Monitoring and Maintenance

1. **Logs**: Check Docker logs with `docker logs finding-movie-server`
2. **Updates**: Regularly update your EC2 instance and Docker
3. **Backups**: Set up regular backups for your MongoDB database
4. **Monitoring**: Consider setting up monitoring with AWS CloudWatch or similar tools

## Next Steps

1. Configure all the required GitHub secrets
2. Set up your EC2 instance with Docker
3. Update the frontend API configuration
4. Test the deployment process by pushing a small change
5. Verify both frontend and backend are accessible
6. (Optional) Set up custom domain and HTTPS for production

For any issues or questions, refer to the troubleshooting section or check the GitHub Actions logs in your repository.