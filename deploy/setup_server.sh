#!/bin/bash
# Law Firm Management Application - Server Setup Script
# Run this on your DigitalOcean server: bash deploy/setup_server.sh

set -e

REPO_DIR="/home/sammy/LawFirmManagementApplicationApp"
IP="157.245.101.58"

echo "=== Updating System & Installing Dependencies ==="
sudo apt-get update -y
sudo apt-get install -y python3-pip python3-venv nginx git curl postgresql postgresql-contrib libpq-dev

# Install Node.js 18.x (LTS)
echo "=== Installing Node.js & PM2 ==="
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

echo "=== Setting Up Backend ==="
cd "$REPO_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Sync DB and static files
# Note: Ensure .env is set up before running this if using Postgres
python3 manage.py migrate
python3 manage.py collectstatic --no-input
deactivate

echo "=== Setting Up Frontend ==="
cd "$REPO_DIR/frontend"
npm install
npm run build

# Start Frontend with PM2
pm2 delete lawfirm-frontend || true
pm2 start npm --name "lawfirm-frontend" -- start

echo "=== Configuring Gunicorn & Nginx ==="
# Gunicorn Service
sudo cp "$REPO_DIR/deploy/gunicorn.service" /etc/systemd/system/gunicorn.service
sudo systemctl start gunicorn
sudo systemctl enable gunicorn

# Nginx Config
sudo cp "$REPO_DIR/deploy/nginx.conf" /etc/nginx/sites-available/lawfirm
sudo ln -sf /etc/nginx/sites-available/lawfirm /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

# Permissions
sudo chown -R sammy:www-data "$REPO_DIR"
chmod -R 775 "$REPO_DIR/backend/media" "$REPO_DIR/backend/staticfiles"

echo "=== SETUP COMPLETE! ==="
echo "Backend: http://$IP/api/"
echo "Frontend: http://$IP/"
echo "Check backend logs: sudo journalctl -u gunicorn"
echo "Check frontend logs: pm2 logs lawfirm-frontend"
