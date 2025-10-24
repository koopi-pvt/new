import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  
  // Get the base domain from environment or default
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'koopi.online';
  
  // Check if this is a subdomain request
  const isSubdomain = hostname.includes('.') && 
                      hostname !== baseDomain && 
                      hostname !== `www.${baseDomain}` &&
                      !hostname.includes('localhost') &&
                      !hostname.includes('vercel.app') &&
                      !hostname.includes('netlify.app');
  
  // Extract subdomain (store name)
  let subdomain = '';
  if (isSubdomain) {
    subdomain = hostname.split('.')[0];
    
    // Exclude 'www' subdomain
    if (subdomain === 'www') {
      // Redirect www to non-www
      const redirectUrl = new URL(url.pathname, `https://${baseDomain}`);
      redirectUrl.search = url.search;
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // If it's a subdomain and not accessing dashboard/api routes
  if (subdomain && !url.pathname.startsWith('/dashboard') && !url.pathname.startsWith('/api')) {
    // Rewrite to store page with subdomain as storeName
    const storeUrl = new URL(`/store/${subdomain}${url.pathname}`, request.url);
    storeUrl.search = url.search;
    
    // Add custom header to identify subdomain routing
    const response = NextResponse.rewrite(storeUrl);
    response.headers.set('x-subdomain', subdomain);
    return response;
  }
  
  // Redirect old path-based store URLs to subdomain URLs (if not localhost)
  if (url.pathname.startsWith('/store/') && !hostname.includes('localhost')) {
    const pathParts = url.pathname.split('/');
    const storeName = pathParts[2];
    
    if (storeName) {
      // Redirect to subdomain
      const subdomainUrl = new URL(
        url.pathname.replace(`/store/${storeName}`, ''),
        `https://${storeName}.${baseDomain}`
      );
      subdomainUrl.search = url.search;
      
      // If path is empty, set to root
      if (subdomainUrl.pathname === '') {
        subdomainUrl.pathname = '/';
      }
      
      return NextResponse.redirect(subdomainUrl, 301);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
