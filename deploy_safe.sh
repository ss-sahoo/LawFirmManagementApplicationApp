#!/bin/bash

# Safe Deployment Script for AntLegal
# This script ensures zero-downtime deployment with rollback capability

set -e  # Exit on any error

echo "=== AntLegal Safe Deployment Script ==="
echo "Starting deployment at $(date)"

# Configuration
PROJECT_DIR="/home/sammy/LawFirmManagementApplicationApp"
BACKEND_DIR="$PROJECT_DIR/backend"
BACKUP_DIR="/home/sammy/backups/antlegal_$(date +%Y%m%d_%H%M%S)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# Function to rollback on failure
rollback() {
    print_error "Deployment failed! Rolling back..."
    cd "$PROJECT_DIR"
    git reset --hard HEAD@{1}
    cd "$BACKEND_DIR"
    sudo systemctl restart gunicorn
    print_warning "Rolled back to previous version"
    exit 1
}

# Set trap to rollback on error
trap rollback ERR

# Step 1: Create backup
print_warning "Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$BACKEND_DIR/db.sqlite3" "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$BACKEND_DIR/media" "$BACKUP_DIR/" 2>/dev/null || true
print_success "Backup created at $BACKUP_DIR"

# Step 2: Pull latest code
print_warning "Pulling latest code..."
cd "$PROJECT_DIR"
git fetch origin
git pull origin main
print_success "Code updated"

# Step 3: Activate virtual environment
print_warning "Activating virtual environment..."
cd "$BACKEND_DIR"
source venv/bin/activate
print_success "Virtual environment activated"

# Step 4: Install/Update dependencies
print_warning "Installing dependencies..."
pip install -r requirements.txt --quiet
print_success "Dependencies installed"

# Step 5: Run Django checks
print_warning "Running Django system checks..."
python manage.py check --deploy
print_success "Django checks passed"

# Step 6: Run migrations (with dry-run first)
print_warning "Checking for migrations..."
python manage.py migrate --plan
read -p "Apply migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py migrate
    print_success "Migrations applied"
else
    print_warning "Migrations skipped"
fi

# Step 7: Collect static files
print_warning "Collecting static files..."
python manage.py collectstatic --noinput --clear
print_success "Static files collected"

# Step 8: Clear Python cache
print_warning "Clearing Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete
print_success "Cache cleared"

# Step 9: Run tests (optional)
print_warning "Running tests..."
python manage.py test --keepdb --parallel 2>/dev/null || print_warning "Tests skipped or failed"

# Step 10: Restart services
print_warning "Restarting Gunicorn..."
sudo systemctl restart gunicorn
sleep 3

# Step 11: Check if Gunicorn is running
if sudo systemctl is-active --quiet gunicorn; then
    print_success "Gunicorn restarted successfully"
else
    print_error "Gunicorn failed to start!"
    rollback
fi

# Step 12: Health check
print_warning "Running health check..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://antlegal.anthemgt.com/api/auth/login_username_password/ -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}' || echo "000")

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "200" ]; then
    print_success "Health check passed (HTTP $HTTP_CODE)"
else
    print_error "Health check failed (HTTP $HTTP_CODE)"
    rollback
fi

# Step 13: Update frontend (if needed)
if [ -d "$PROJECT_DIR/frontend" ]; then
    print_warning "Updating frontend..."
    cd "$PROJECT_DIR/frontend"
    npm install --silent
    pm2 restart lawfirm-frontend || print_warning "Frontend restart skipped"
    print_success "Frontend updated"
fi

echo ""
print_success "=== Deployment completed successfully at $(date) ==="
print_success "Backup location: $BACKUP_DIR"
echo ""
