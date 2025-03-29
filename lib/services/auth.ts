import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Verifies JWT token from request cookies and extracts user ID
 * @param request The Next.js request object
 * @returns The user ID if token is valid, null otherwise
 */
export function getUserIdFromToken(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    return (verified as { userId: string }).userId;
  } catch {
    return null;
  }
}

/**
 * Middleware-like function to require authentication
 * Returns user ID if authenticated, or throws a response error if not
 */
export function requireAuth(request: NextRequest): string {
  const userId = getUserIdFromToken(request);
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  return userId;
}