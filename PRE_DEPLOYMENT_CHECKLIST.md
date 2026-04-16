# Pre-Deployment Checklist for AntLegal

## Before Every Deployment

### 1. Local Testing
- [ ] Run `python manage.py check` locally
- [ ] Run `python manage.py test` locally
- [ ] Test all modified APIs with Postman/curl
- [ ] Check for any `print()` statements or debug code
- [ ] Verify all migrations are created: `python manage.py makemigrations --check`

### 2. Code Review
- [ ] Review all changed files
- [ ] Check for hardcoded values (passwords, tokens, URLs)
- [ ] Verify imports are correct
- [ ] Check for circular imports
- [ ] Ensure DEBUG=False in production settings

### 3. Database
- [ ] Create migrations if models changed
- [ ] Test migrations on local database first
- [ ] Backup production database before deployment

### 4. Dependencies
- [ ] Update requirements.txt if new packages added
- [ ] Check for package version conflicts

## Deployment Steps

### Safe Deployment Process

```bash
# 1. SSH into server
ssh sammy@antlegal.anthemgt.com

# 2. Run health check BEFORE deployment
cd ~/LawFirmManagementApplicationApp/backend
python test_health.py

# 3. Run safe deployment script
cd ~/LawFirmManagementApplicationApp
chmod +x deploy_safe.sh
./deploy_safe.sh

# 4. Run health check AFTER deployment
cd backend
python test_health.py

# 5. Monitor logs for errors
sudo journalctl -u gunicorn -f
```

## Rollback Procedure

If deployment fails:

```bash
# The deploy_safe.sh script automatically rolls back on error
# Manual rollback if needed:
cd ~/LawFirmManagementApplicationApp
git reset --hard HEAD@{1}
cd backend
sudo systemctl restart gunicorn
```

## Common Issues and Fixes

### Issue: Migration conflicts
```bash
python manage.py migrate --fake-initial
```

### Issue: Static files not loading
```bash
python manage.py collectstatic --clear --noinput
```

### Issue: Gunicorn won't start
```bash
# Check logs
sudo journalctl -u gunicorn -n 50

# Check syntax
python manage.py check

# Restart
sudo systemctl restart gunicorn
```

### Issue: 500 errors after deployment
```bash
# Clear Python cache
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete

# Restart gunicorn
sudo systemctl restart gunicorn
```

## Post-Deployment Verification

- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create/edit records
- [ ] File uploads work
- [ ] No 500 errors in logs
- [ ] Frontend connects to backend

## Emergency Contacts

- Developer: [Your contact]
- Server Admin: [Admin contact]
- Backup location: `/home/sammy/backups/`
