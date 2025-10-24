# Netlify Deployment Guide for Koopi

This guide will walk you through deploying your Koopi application to Netlify with custom subdomain support.

## Prerequisites

- GitHub account with your code repository
- Netlify account (free tier is sufficient)
- Domain ownership of `koopi.online`

## Step 1: Prepare Your Repository

1. Ensure all your code is committed to your Git repository
2. Push to GitHub, GitLab, or Bitbucket
3. Make sure these files exist in your repo:
   - `netlify.toml` (already created)
   - `.env.example` (for reference)
   - `src/middleware.ts` (for subdomain routing)

## Step 2: Deploy to Netlify

### Option A: Deploy from Git (Recommended)

1. Log in to [Netlify](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your Koopi repository
6. Configure build settings:
   - **Build command**: `yarn build` (should auto-detect)
   - **Publish directory**: `.next` (should auto-detect)
   - **Base directory**: (leave empty)
7. Click **"Show advanced"** → **"New variable"** to add environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = your_measurement_id
NEXT_PUBLIC_BASE_DOMAIN = koopi.online
```

8. Click **"Deploy site"**
9. Wait for deployment to complete (usually 2-5 minutes)

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify site
netlify init

# Set environment variables
netlify env:set NEXT_PUBLIC_FIREBASE_API_KEY "your_key"
netlify env:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN "your_domain"
netlify env:set NEXT_PUBLIC_FIREBASE_PROJECT_ID "your_project"
netlify env:set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET "your_bucket"
netlify env:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID "your_sender_id"
netlify env:set NEXT_PUBLIC_FIREBASE_APP_ID "your_app_id"
netlify env:set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID "your_measurement_id"
netlify env:set NEXT_PUBLIC_BASE_DOMAIN "koopi.online"

# Deploy
netlify deploy --prod
```

## Step 3: Configure Custom Domain

1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Add your main domain: `koopi.online`
4. Click **"Verify"** and **"Add domain"**
5. Click **"Add domain alias"** and add wildcard: `*.koopi.online`
6. Netlify will provide DNS instructions

**Important:** You MUST add both `koopi.online` AND `*.koopi.online` for subdomain routing to work!

## Step 4: Configure DNS

Follow the detailed instructions in `DNS_SETUP_GUIDE.md` to configure your domain's DNS settings.

### Quick DNS Setup (Cloudflare Example):

```
Type: CNAME
Name: @
Content: your-site-name.netlify.app
Proxy: Enabled (Orange cloud)

Type: CNAME  
Name: *
Content: your-site-name.netlify.app
Proxy: Enabled (Orange cloud)
```

## Step 5: Enable HTTPS

1. In Netlify, go to **Site settings** → **Domain management** → **HTTPS**
2. Wait for SSL certificate provisioning (usually automatic)
3. Enable **"Force HTTPS"** to redirect all HTTP traffic to HTTPS
4. The SSL certificate will cover both `koopi.online` and `*.koopi.online`

## Step 6: Configure Build Hooks (Optional)

Set up automatic deployments:

1. Go to **Site settings** → **Build & deploy** → **Build hooks**
2. Click **"Add build hook"**
3. Name it (e.g., "Deploy on Push")
4. Select branch (e.g., "main")
5. Copy the webhook URL
6. Add it to your Git repository's webhook settings

## Step 7: Test Your Deployment

### Test Main Domain:
```bash
curl https://koopi.online
```
Should show your landing page

### Test Subdomain:
```bash
curl https://lk-store.koopi.online
```
Should show the LK Store

### Test Wildcard:
```bash
curl https://any-store-name.koopi.online
```
Should route correctly (or show 404 if store doesn't exist)

## Step 8: Configure Redirects and Rewrites

The `netlify.toml` file handles:
- Subdomain routing via Next.js middleware
- Automatic redirects from old URLs to new subdomain URLs
- HTTPS enforcement

No additional configuration needed!

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to **Deploys** tab
2. Click on failed deploy
3. View logs for errors

**Common issues:**
- Missing environment variables → Add them in Site settings
- Node version mismatch → Add `NODE_VERSION=20` env variable
- Build timeout → Contact Netlify support for increased build time

### Subdomain Not Working

**Verify:**
1. Wildcard domain (`*.koopi.online`) is added in Netlify
2. DNS wildcard record (`*`) points to Netlify
3. DNS propagation is complete (use https://dnschecker.org)
4. middleware.ts file is deployed

**Check middleware:**
```bash
# View deployed middleware
curl -I https://test-subdomain.koopi.online
# Look for x-subdomain header in response
```

### SSL Certificate Issues

**Solutions:**
1. Wait 24 hours for DNS propagation
2. In Netlify, go to Domain settings → HTTPS → Click "Renew certificate"
3. Verify both domains are added: `koopi.online` and `*.koopi.online`
4. Check DNS records are correct

### Old URLs Not Redirecting

**Verify:**
1. middleware.ts is in the src/ directory
2. The middleware export config includes all paths
3. Redeploy the site

## Production Checklist

Before going live:

- [ ] All environment variables set in Netlify
- [ ] Custom domain added: `koopi.online`
- [ ] Wildcard domain added: `*.koopi.online`
- [ ] DNS records configured correctly
- [ ] SSL certificate active and valid
- [ ] Force HTTPS enabled
- [ ] Test main domain loads
- [ ] Test at least 2 store subdomains work
- [ ] Test old URLs redirect to new subdomains
- [ ] Firebase authorized domains updated
- [ ] Test authentication flow works
- [ ] Test store creation flow
- [ ] Monitor first deployments for errors

## Continuous Deployment

Netlify automatically deploys when you push to your repository:

1. Make changes locally
2. Commit and push to Git
3. Netlify automatically detects changes
4. New deployment starts automatically
5. Site updates in 2-5 minutes

## Rollback Procedure

If something goes wrong:

1. Go to **Deploys** tab
2. Find a previous working deployment
3. Click **"Publish deploy"** on that deployment
4. Site will rollback immediately

## Performance Optimization

### Enable Netlify Features:

1. **Asset Optimization** (Site settings → Build & deploy → Post processing):
   - Enable "Bundle CSS"
   - Enable "Minify CSS"
   - Enable "Minify JS"
   - Enable "Compress images"

2. **Netlify Edge** (if available):
   - Distributes your site globally
   - Reduces latency

3. **Analytics** (optional):
   - Site settings → Analytics
   - Track visitor stats

## Monitoring

### Set Up Notifications:

1. Site settings → Notifications
2. Add email for deploy notifications
3. Add webhook for Slack/Discord integration
4. Set up uptime monitoring (optional: use UptimeRobot)

## Cost Considerations

Netlify free tier includes:
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS included
- Custom domains included
- Unlimited team members

**For Koopi:**
- Small to medium stores: FREE
- Growing stores: May need Pro plan ($19/month) for more bandwidth
- Monitor usage in Netlify dashboard

## Support Resources

- Netlify Docs: https://docs.netlify.com
- Netlify Forums: https://answers.netlify.com
- Netlify Status: https://www.netlifystatus.com
- Next.js on Netlify: https://docs.netlify.com/frameworks/next-js

## Post-Deployment Tasks

1. Update Firebase authorized domains:
   - Add `koopi.online`
   - Add your Netlify deploy preview domains if needed

2. Update social media links to new domain

3. Set up Google Analytics/Search Console with new domain

4. Create sitemap for SEO

5. Test checkout and payment flows

6. Monitor error logs for first few days

---

✅ Your Koopi platform is now live with custom subdomain support!

Each new store automatically gets: `https://storename.koopi.online`
