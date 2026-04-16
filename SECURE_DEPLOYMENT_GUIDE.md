# Secure Deployment Guide - Zero Downtime Deployment

## Pre-Deployment Checklist (MUST DO BEFORE EVERY DEPLOYMENT)

### 1. Local Testing (30 minutes)
```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Check for issues
python manage.py check --deploy

# Run all tests
python manage.py test

# Check migrations
python manage.py makemigrations --check --dry-run

# Test with SQLite (for quick validation)
python manage.py migrate
python manage.py runserver
```

**✓ All tests must pass before deployment**

---

### 2. Code Quality Check (10 minutes)
```bash
# Search for debug code
grep -r "print(" backend/ --include="*.py" | grep -v "migrations" | grep -v "__pycache__"

# Search for hardcoded secrets
grep -r "password.*=" backend/ --include="*.py" | grep -v "migrations"

# Check for TODO/FIXME
grep -r "TODO\|FIXME" backend/ --include="*.py"
```

**✓ Remove all debug code and hardcoded values**

---

### 3. Database Safety (CRITICAL)

**Before deployment, ALWAYS backup the database:**

```bash
# SSH to server
ssh sammy@antlegal.anthemgt.com

# Create backup directory
mkdir -p ~/backups/$(date +%Y%m%d)

# Backup database
cd ~/LawFirmManagementApplicationApp/backend
cp db.sqlite3 ~/backups/$(date +%Y%m%d)/db.sqlite3.backup

# Backup media files
cp -r media ~/backups/$(date +%Y%m%d)/media_backup

# Verify backup
ls -lh ~/backups/$(date +%Y%m%d)/
```

**✓ Backup created and verified**

---

## Deployment Process (Step-by-Step)

### Step 1: Pre-Deployment Health Check
```bash
# SSH to server
ssh sammy@antlegal.anthemgt.com

# Check current status
cd ~/LawFirmManagementApplicationApp/backend
source venv/bin/activate

# Test database connection
python manage.py check

# Check Gunicorn status
sudo systemctl status gunicorn

# Check disk space
df -h

# Check memory
free -h
```

**✓ All services running, sufficient resources**

---

### Step 2: Deploy Using Safe Script

```bash
cd ~/LawFirmManagementApplicationApp

# Make script executable
chmod +x deploy_safe.sh

# Run deployment
./deploy_safe.sh
```

**The script will:**
1. ✓ Create automatic backup
2. ✓ Pull latest code
3. ✓ Install dependencies
4. ✓ Run Django checks
5. ✓ Show migration plan (you approve)
6. ✓ Apply migrations
7. ✓ Collect static files
8. ✓ Clear cache
9. ✓ Restart Gunicorn
10. ✓ Health check
11. ✓ Auto-rollback if anything fails

---

### Step 3: Post-Deployment Verification

```bash
# Check Gunicorn is running
sudo systemctl status gunicorn

# Check for errors in logs (last 50 lines)
sudo journalctl -u gunicorn -n 50

# Test API endpoint
curl -X POST https://antlegal.anthemgt.com/api/auth/login_username_password/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Should return 400 (bad credentials) not 500 (server error)
```

**✓ No 500 errors, API responding**

---

### Step 4: Manual Testing (5 minutes)

Open browser and test:
- [ ] Login page loads
- [ ] Can login with valid credentials
- [ ] Dashboard displays correctly
- [ ] Can view list pages (firms, users, cases)
- [ ] Can create a new record
- [ ] Can upload a file
- [ ] No console errors (F12 developer tools)

**✓ All critical features working**

---

## Common Issues and Solutions

### Issue 1: Migration Fails

**Symptom:** Error during `python manage.py migrate`

**Solution:**
```bash
# Check migration status
python manage.py showmigrations

# If conflict, fake the initial migration
python manage.py migrate --fake-initial

# If still fails, check specific app
python manage.py migrate firms --fake

# Last resort: rollback
git reset --hard HEAD@{1}
sudo systemctl restart gunicorn
```

---

### Issue 2: Gunicorn Won't Start

**Symptom:** `sudo systemctl status gunicorn` shows failed

**Solution:**
```bash
# Check detailed logs
sudo journalctl -u gunicorn -n 100 --no-pager

# Common causes:
# 1. Syntax error in Python code
python manage.py check

# 2. Missing dependency
pip install -r requirements.txt

# 3. Permission issue
sudo chown -R sammy:sammy ~/LawFirmManagementApplicationApp

# 4. Port already in use
sudo lsof -i :8000
sudo kill -9 <PID>

# Restart
sudo systemctl restart gunicorn
```

---

### Issue 3: 500 Internal Server Error

**Symptom:** API returns 500 errors

**Solution:**
```bash
# Check Django logs
sudo journalctl -u gunicorn -f

# Clear Python cache
cd ~/LawFirmManagementApplicationApp/backend
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -name "*.pyc" -delete

# Check database connection
python manage.py dbshell
# Type: .exit

# Restart services
sudo systemctl restart gunicorn
```

---

### Issue 4: Static Files Not Loading

**Symptom:** CSS/JS not loading, 404 errors

**Solution:**
```bash
cd ~/LawFirmManagementApplicationApp/backend

# Recollect static files
python manage.py collectstatic --clear --noinput

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check permissions
ls -la staticfiles/
sudo chown -R sammy:www-data staticfiles/
```

---

### Issue 5: Database Locked

**Symptom:** "database is locked" error

**Solution:**
```bash
# Stop Gunicorn
sudo systemctl stop gunicorn

# Check for processes using database
lsof ~/LawFirmManagementApplicationApp/backend/db.sqlite3

# Kill if needed
kill -9 <PID>

# Start Gunicorn
sudo systemctl start gunicorn
```

---

## Emergency Rollback Procedure

If deployment completely breaks the site:

```bash
# 1. SSH to server
ssh sammy@antlegal.anthemgt.com

# 2. Go to project directory
cd ~/LawFirmManagementApplicationApp

# 3. Rollback code
git log --oneline -5  # See recent commits
git reset --hard <previous-commit-hash>

# 4. Restore database backup
cd backend
cp ~/backups/$(date +%Y%m%d)/db.sqlite3.backup db.sqlite3

# 5. Restart services
sudo systemctl restart gunicorn
pm2 restart lawfirm-frontend

# 6. Verify
curl https://antlegal.anthemgt.com/api/auth/login_username_password/
```

---

## Deployment Safety Rules

### ✅ DO:
1. Always backup database before deployment
2. Test locally first
3. Use `deploy_safe.sh` script
4. Monitor logs after deployment
5. Test critical features manually
6. Deploy during low-traffic hours
7. Keep backups for at least 7 days

### ❌ DON'T:
1. Deploy without testing locally
2. Deploy without backup
3. Deploy during peak hours
4. Skip migration review
5. Ignore warning messages
6. Deploy multiple changes at once
7. Modify database directly on server

---

## Monitoring After Deployment

### First 10 minutes:
```bash
# Watch logs in real-time
sudo journalctl -u gunicorn -f
```

### First hour:
```bash
# Check for errors every 15 minutes
sudo journalctl -u gunicorn --since "15 minutes ago" | grep -i error
```

### First 24 hours:
- Monitor user reports
- Check error logs twice
- Verify all features working

---

## Deployment Checklist Summary

**Before Deployment:**
- [ ] All tests pass locally
- [ ] No debug code in production
- [ ] Database backup created
- [ ] Migrations tested locally
- [ ] Dependencies updated in requirements.txt

**During Deployment:**
- [ ] Use deploy_safe.sh script
- [ ] Review migration plan before applying
- [ ] Monitor deployment output
- [ ] No errors in deployment log

**After Deployment:**
- [ ] Gunicorn running
- [ ] No 500 errors in logs
- [ ] API endpoints responding
- [ ] Login works
- [ ] Dashboard loads
- [ ] File uploads work
- [ ] No console errors

**If Issues:**
- [ ] Check logs first
- [ ] Try common fixes
- [ ] Rollback if critical
- [ ] Document the issue

---

## Quick Reference Commands

```bash
# Status checks
sudo systemctl status gunicorn
sudo systemctl status nginx
pm2 status

# Restart services
sudo systemctl restart gunicorn
sudo systemctl restart nginx
pm2 restart lawfirm-frontend

# View logs
sudo journalctl -u gunicorn -f
sudo journalctl -u nginx -f
pm2 logs lawfirm-frontend

# Database backup
cp backend/db.sqlite3 ~/backups/db_$(date +%Y%m%d_%H%M%S).sqlite3

# Clear cache
find backend -type d -name "__pycache__" -exec rm -rf {} +
find backend -name "*.pyc" -delete

# Rollback
git reset --hard HEAD@{1}
sudo systemctl restart gunicorn
```

---

## Support

If deployment fails and you can't fix it:
1. Rollback immediately
2. Check logs: `sudo journalctl -u gunicorn -n 100`
3. Document the error
4. Test fix locally before redeploying

**Remember: It's better to rollback and fix than to leave site broken!**
