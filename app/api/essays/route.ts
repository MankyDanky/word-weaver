import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Essay from '@/models/Essay';
import { getUserIdFromToken } from '@/lib/services/auth';

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get user ID from JWT token
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Query for essays belonging to the user, sorted by most recent first
    const essays = await Essay.find({ user: userId })
      .sort({ created_at: -1 })
      .select('-__v')
      .lean();
      
    // Return the essays
    return NextResponse.json({ essays, count: essays.length });
    
  } catch {
    console.error('Error fetching essays');
    return NextResponse.json(
      { error: 'Failed to fetch essays' },
      { status: 500 }
    );
  }
}