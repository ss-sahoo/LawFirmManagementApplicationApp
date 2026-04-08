# Deployment Guide: Law Firm Management Application

This repo is now configured for **automated deployment** to your DigitalOcean server (`157.245.101.58`).

## 1. Prerequisites (Initial Setup)

Before deploying for the first time, you must manually set up the server.

### Connect to your server
```bash
ssh sammy@157.245.101.58
```

### Initial Setup Procedure
1. **Clone the repository** (if not already there):
   ```bash
   cd /home/sammy/
   git clone https://github.com/ss-sahoo/LawFirmManagementApplicationApp.git
   cd LawFirmManagementApplicationApp
   ```

2. **Configure Environment Variables** (`.env`):
   Create `backend/.env` with production values:
   ```bash
   SECRET_KEY='your-production-secret-key'
   DEBUG=False
   ALLOWED_HOSTS='157.245.101.58'
   CORS_ALLOWED_ORIGINS='http://157.245.101.58'
   CSRF_TRUSTED_ORIGINS='http://157.245.101.58'
   ```

3. **Run the Setup Script**:
   This script installs Python, Node.js, Nginx, Gunicorn, and PM2.
   ```bash
   bash deploy/setup_server.sh
   ```

## 2. Automated Deployment (CI/CD)

Once the initial setup is done, every push to the `main` branch will automatically update the server.

### Set up GitHub Secrets
Go to your **GitHub Repository Settings** > **Secrets and variables** > **Actions** and add these:

| Secret Name | Value |
|-------------|-------|
| `SERVER_IP` | `157.245.101.58` |
| `SSH_PRIVATE_KEY` | Your private SSH key (`~/.ssh/id_rsa` from your local machine) |

## 3. Server Management Commands

- **Restart Backend**: `sudo systemctl restart gunicorn`
- **Restart Frontend**: `pm2 restart lawfirm-frontend`
- **Backend Logs**: `sudo journalctl -u gunicorn`
- **Frontend Logs**: `pm2 logs lawfirm-frontend`
- **Update everything manually**: `bash deploy/setup_server.sh`
