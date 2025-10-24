# Custom Domain Setup Guide for Koopi

This guide will help you configure your `koopi.online` domain to support wildcard subdomains for individual stores.

## Overview

After setup, your stores will be accessible via:
- Main site: `koopi.online` (landing page)
- Store 1: `shop1.koopi.online`
- Store 2: `shop2.koopi.online`
- And so on...

## Prerequisites

- You own the domain `koopi.online`
- Access to your domain registrar's DNS management panel (e.g., GoDaddy, Namecheap, Cloudflare, etc.)
- Your Netlify site is deployed and you have the Netlify site name

## Step 1: Get Your Netlify Site Information

1. Log in to your Netlify account
2. Go to your site dashboard
3. Note down your site name (e.g., `your-app-name.netlify.app`)
4. Go to **Site settings** → **Domain management**

## Step 2: Add Custom Domain in Netlify

1. In Netlify dashboard, go to **Domain management**
2. Click **Add custom domain**
3. Enter `koopi.online` and click **Verify**
4. If prompted about DNS configuration, click **Yes, add domain**
5. Click **Add domain** again and add `*.koopi.online` (wildcard subdomain)
6. Netlify will provide you with DNS records to configure

## Step 3: Configure DNS Records

### Option A: Using Netlify DNS (Recommended - Easiest)

1. In your domain registrar (where you bought koopi.online):
   - Find the **Nameservers** section
   - Replace existing nameservers with Netlify's nameservers:
     ```
     dns1.p01.nsone.net
     dns2.p01.nsone.net
     dns3.p01.nsone.net
     dns4.p01.nsone.net
     ```
2. Save changes
3. Wait 24-48 hours for DNS propagation (usually faster, 1-4 hours)
4. Netlify will automatically configure all necessary records

### Option B: Using Your Current DNS Provider (Manual Setup)

If you prefer to keep your current DNS provider, add these records:

#### For Main Domain (koopi.online)

**A Records** (if using Netlify load balancer):
```
Type: A
Name: @ (or leave blank for root domain)
Value: 75.2.60.5
TTL: 3600 (or auto)
```

Or **CNAME Record** (if Netlify provides one):
```
Type: CNAME
Name: @
Value: your-app-name.netlify.app
TTL: 3600
```

#### For WWW Subdomain

```
Type: CNAME
Name: www
Value: your-app-name.netlify.app
TTL: 3600
```

#### For Wildcard Subdomains (CRITICAL for store functionality)

```
Type: CNAME
Name: *
Value: your-app-name.netlify.app
TTL: 3600
```

**Important:** The wildcard record (`*`) is essential for all store subdomains to work!

### Option C: Using Cloudflare (Advanced)

If you use Cloudflare:

1. Add your domain to Cloudflare
2. Update nameservers at your registrar to Cloudflare's nameservers
3. In Cloudflare DNS settings, add:

```
Type: CNAME
Name: @
Value: your-app-name.netlify.app
Proxy status: Proxied (orange cloud)
TTL: Auto
```

```
Type: CNAME
Name: *
Value: your-app-name.netlify.app
Proxy status: Proxied (orange cloud)
TTL: Auto
```

4. In Cloudflare SSL/TLS settings:
   - Set SSL mode to **Full** or **Full (strict)**
   - Enable **Automatic HTTPS Rewrites**

## Step 4: Configure Environment Variables in Netlify

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Add the following variable:

```
Key: NEXT_PUBLIC_BASE_DOMAIN
Value: koopi.online
```

3. Click **Save**
4. Trigger a new deployment (or it will auto-deploy)

## Step 5: SSL Certificate Setup

### If using Netlify DNS:
- Netlify automatically provisions SSL certificates for your domain and all subdomains
- This includes the wildcard certificate for `*.koopi.online`
- No action needed!

### If using external DNS:
1. In Netlify, go to **Domain settings**
2. Netlify will attempt to provision an SSL certificate
3. If it fails, you may need to:
   - Verify DNS records are correct
   - Wait for DNS propagation
   - Click **Renew certificate** manually

## Step 6: Verify Setup

### Test Main Domain:
1. Visit `https://koopi.online` in your browser
2. You should see your landing page

### Test Wildcard Subdomain:
1. Visit `https://lk-store.koopi.online`
2. You should see the LK Store storefront
3. Try other store names: `https://[any-store-name].koopi.online`

### Check SSL:
1. Click the padlock icon in your browser
2. Verify the certificate is valid
3. Check that it covers `*.koopi.online`

## Step 7: Update Firebase (if needed)

Add your domain to Firebase authorized domains:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add:
   - `koopi.online`
   - `*.koopi.online` (if supported)
   - Or add specific subdomains as needed

## Troubleshooting

### DNS Not Propagating
- Use [https://www.whatsmydns.net/](https://www.whatsmydns.net/) to check DNS propagation
- Enter your domain and select CNAME or A record type
- Check multiple locations worldwide

### SSL Certificate Issues
- Ensure DNS records are correct
- Wait 24 hours for DNS propagation
- Try manual certificate renewal in Netlify
- Check that you've added both `koopi.online` and `*.koopi.online` as custom domains

### Subdomain Not Working
- Verify wildcard CNAME record (`*`) is present
- Check that TTL has expired (wait for DNS cache to clear)
- Test with: `dig *.koopi.online` or `nslookup random.koopi.online`

### "Site Not Found" Error
- Verify Netlify deployment is successful
- Check that domain is added in Netlify domain management
- Ensure middleware.ts is deployed

### Existing Store URLs
- Old URLs like `koopi.online/store/shop-name` will automatically redirect to `shop-name.koopi.online`
- This is handled by the middleware

## Common DNS Providers Instructions

### GoDaddy
1. Log in to GoDaddy
2. Go to **My Products** → **DNS**
3. Add CNAME records as specified above
4. Save changes

### Namecheap
1. Log in to Namecheap
2. Go to **Domain List** → **Manage**
3. Click **Advanced DNS**
4. Add CNAME records as specified above
5. Save changes

### Google Domains
1. Log in to Google Domains
2. Select your domain
3. Click **DNS** on the left
4. Scroll to **Custom resource records**
5. Add CNAME records as specified above
6. Save changes

## Timeline

- DNS configuration: 5-10 minutes
- DNS propagation: 1-48 hours (typically 1-4 hours)
- SSL certificate provisioning: 5-30 minutes after DNS propagation
- Full setup time: 2-24 hours

## Support

If you encounter issues:
1. Check all DNS records are correct
2. Wait 24 hours for full DNS propagation
3. Verify Netlify deployment is successful
4. Check Netlify deploy logs for errors
5. Test with `curl` or browser dev tools to see exact errors

## Security Notes

- Always use HTTPS (handled automatically by Netlify)
- Wildcard SSL certificate protects all subdomains
- Consider enabling Cloudflare for additional DDoS protection
- Keep your Netlify deploy keys secure

## Next Steps

After DNS setup is complete:
1. Test your main domain
2. Test a few store subdomains
3. Update any hardcoded URLs in your marketing materials
4. Set up monitoring for domain health
5. Configure email DNS records if needed (MX, SPF, DKIM)

---

✅ Once setup is complete, all stores will automatically use the subdomain format!
