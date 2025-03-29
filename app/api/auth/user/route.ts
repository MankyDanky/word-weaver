import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  
  try {
    // Verify the token
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as { userId: string };
    
    await dbConnect();
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}