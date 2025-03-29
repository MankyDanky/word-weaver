import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Essay from '@/models/Essay';
import { getUserIdFromToken } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
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
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    // Create a new essay
    const newEssay = await Essay.create({
      user: userId,
      topic: body.topic,
      thesis: body.thesis || '',
      content: body.content || '',
      arguments: body.arguments || [],
      citations: body.citations || [],
      status: body.status || 'draft',
      wordCount: body.wordCount || 0
    });
    
    return NextResponse.json({ 
      essay: newEssay,
      message: 'Essay created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating essay:', error);
    return NextResponse.json(
      { error: 'Failed to create essay' },
      { status: 500 }
    );
  }
}