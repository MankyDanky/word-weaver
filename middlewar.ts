import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that require authentication
const protectedPaths = ['/dashboard', '/profile'];

// Paths that should redirect to dashboard if user is already logged in
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Check if path requires authentication
  const isPathProtected = protectedPaths.some(pp => path.startsWith(pp));
  const isAuthPath = authPaths.some(ap => path.startsWith(ap));
  
  if (!token) {
    // No token and trying to access protected route
    if (isPathProtected) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', path);
      return NextResponse.redirect(url);
    }
    
    // User isn't logged in and accessing non-protected route
    return NextResponse.next();
  }
  
  try {
    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    
    // User is logged in and trying to access login/register page
    if (isAuthPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // User is authenticated, allow access
    return NextResponse.next();
  } catch {
    // Invalid token
    if (isPathProtected) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', path);
      return NextResponse.redirect(url);
    }
    
    // Continue with invalid token for non-protected routes
    return NextResponse.next();
  }
}

export const config = {
  // Define paths that will trigger this middleware
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};