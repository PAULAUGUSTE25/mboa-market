# Migrate MBOA Market Backend from Render to Vercel

This guide walks through migrating your FastAPI backend and PostgreSQL database from Render to Vercel.

## Why Migrate?

- **Vercel Functions**: Serverless, auto-scaling, no cold spin-down issues
- **Neon Database**: Better connection pooling, higher limits, more features
- **Better Integration**: Frontend already on Netlify, can move to Vercel later for unified platform
- **Cost**: Neon Free plan offers more than Render free tier

## Prerequisites

1. **Vercel Account**: Create at [vercel.com](https://vercel.com)
2. **PostgreSQL Client Tools**: Install pg_dump and pg_restore
   - Windows: `choco install postgresql`
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql-client`

## Step 1: Set Up Neon Database (Vercel Postgres)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project (or create new one)
3. Go to **Storage** tab
4. Click **Add Database** → **Postgres** → **Neon**
5. Select region (closest to your users)
6. Choose plan (Free is fine for testing)
7. Copy the **NEON_DATABASE_URL** connection string

## Step 2: Migrate Data from Render to Neon

### Option A: Using the Migration Script

```bash
cd backend

# Set environment variables
set RENDER_DATABASE_URL=postgresql://<redacted>@host:5432/dbname
set NEON_DATABASE_URL=postgresql://<redacted>@ep-xyz.us-east-1.aws.neon.tech:5432/neondb

# Run migration
python migrate_render_to_neon.py
```

### Option B: Manual Migration

```bash
# Export from Render
pg_dump "postgresql://<redacted>@render-host:5432/renderdb" \
  --no-owner \
  --no-acl \
  --format=custom \
  --compress=0 \
  --jobs=8 \
  --file=render_backup.dump

# Import to Neon
pg_restore \
  --no-owner \
  --no-acl \
  --jobs=8 \
  --dbname="postgresql://<redacted>@ep-xyz.us-east-1.aws.neon.tech:5432/neondb" \
  render_backup.dump

# Verify
psql "postgresql://<redacted>@ep-xyz.us-east-1.aws.neon.tech:5432/neondb" -c "
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL SELECT 'listings', COUNT(*) FROM listings
UNION ALL SELECT 'listing_photos', COUNT(*) FROM listing_photos;
"
```

## Step 3: Deploy Backend to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from backend directory
cd backend
vercel

# Follow prompts:
# - Link to existing project or create new
# - Framework detection: Python
# - Build settings will be auto-detected from vercel.json
```

### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Python
   - **Root Directory**: `backend`
   - **Build Command**: (auto-detected from vercel.json)
   - **Output Directory**: `.`
5. Add Environment Variables (see below)
6. Click **Deploy**

## Step 4: Configure Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required Variables
```
DATABASE_URL=postgresql://<redacted>@ep-xyz.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
SECRET_KEY=your-secret-key-here
```

### Optional Variables (copy from Render)
```
CORS_ORIGINS=https://mboa-market.netlify.app,https://mboa-backoffice-admin.netlify.app
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-flash-latest
SMS_PROVIDER=twilio
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret
PAYMENT_PROVIDER=mtn_momo
PAYMENT_API_KEY=your-payment-api-key
PAYMENT_API_SECRET=your-payment-api-secret
STORAGE_BACKEND=cloudinary
CLOUDINARY_CLOUD_NAME=dvfmmovlw
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## Step 5: Update Frontend

After backend is deployed, update the frontend API URL:

1. Get your Vercel backend URL (e.g., `https://mboa-backend.vercel.app`)
2. Update Netlify environment variables:
   - `VITE_API_URL=https://mboa-backend.vercel.app`
3. Redeploy frontend

## Step 6: Test the Migration

1. **Health Check**: Visit `https://your-backend.vercel.app/api/health`
2. **DB Status**: Visit `https://your-backend.vercel.app/api/db-status`
3. **User Login**: Test with existing credentials
4. **Create Listing**: Verify data persistence
5. **Upload Image**: Test Cloudinary integration

## Step 7: Cleanup (After 7 Days)

Once everything is working:

1. **Delete Render Database**: Go to Render Dashboard → PostgreSQL → Delete
2. **Remove Render Backend**: Go to Render Dashboard → Services → Delete
3. **Update DNS**: If using custom domain, update to point to Vercel

## File Storage Note

**Vercel has no persistent disk storage.** Your current setup uses local storage (`./uploads`), which won't work on Vercel.

You already use Cloudinary for the background video. You should:

1. **Continue using Cloudinary** for all file uploads (recommended)
2. Or use **Vercel Blob Storage** (requires additional setup)

The backend already has Cloudinary configuration in `config.py`. Just ensure:
- `STORAGE_BACKEND=cloudinary`
- Add Cloudinary credentials to Vercel environment variables

## Troubleshooting

### Database Connection Errors
- Ensure DATABASE_URL uses `postgresql+asyncpg://` prefix
- Check SSL is enabled (`sslmode=require`)
- Verify Neon database is not paused

### CORS Errors
- Add your frontend domain to CORS_ORIGINS
- Check the cors_origin_regex in config.py includes vercel.app

### Function Timeout
- Increase `maxDuration` in vercel.json if needed (max 60s on free tier)
- Consider optimizing slow database queries

### Import Errors
- Ensure all dependencies are in requirements.txt
- Check Python version matches (3.12 recommended)

## Rollback Plan

If migration fails:

1. **Revert DATABASE_URL** in Vercel to Render URL
2. **Frontend**: Update VITE_API_URL back to Render backend
3. **Keep Render running** until Vercel is fully tested

## Cost Comparison

| Resource | Render Free | Neon Free |
|----------|-------------|-----------|
| Compute | 750 hours/month | 190 hours/month |
| Storage | 1 GB | 512 MB |
| DB Connections | 90 max | Unlimited (with pooling) |
| Spin-down | 15 min inactivity | Scale to zero (instant wake) |

## Next Steps After Migration

1. **Move Frontend to Vercel**: Unify both on same platform
2. **Set Up Preview Deployments**: Test changes before production
3. **Configure Custom Domain**: Use your own domain
4. **Set Up Monitoring**: Vercel Analytics, Neon monitoring
5. **Optimize Costs**: Review usage and upgrade plans if needed

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **FastAPI on Vercel**: https://vercel.com/docs/frameworks/backend/fastapi
