import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Essay from '@/models/Essay';
import { getUserIdFromToken } from '@/lib/services/auth';
import mongoose from 'mongoose';

// GET specific essay by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();
    
    const id = params.id;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid essay ID' },
        { status: 400 }
      );
    }
    
    // Get user ID from JWT token
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Find the essay and verify it belongs to the user
    const essay = await Essay.findOne({ 
      _id: id, 
      user: userId 
    }).lean();
    
    if (!essay) {
      return NextResponse.json(
        { error: 'Essay not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ essay });
    
  } catch (error) {
    console.error('Error fetching essay:', error);
    return NextResponse.json(
      { error: 'Failed to fetch essay' },
      { status: 500 }
    );
  }
}

// DELETE essay by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();
    
    const id = params.id;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid essay ID' },
        { status: 400 }
      );
    }
    
    // Get user ID from JWT token
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Find the essay first to verify ownership
    const essay = await Essay.findOne({ _id: id, user: userId });
    
    if (!essay) {
      return NextResponse.json(
        { error: 'Essay not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    // Delete the essay
    await Essay.deleteOne({ _id: id });
    
    return NextResponse.json({ 
      message: 'Essay deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting essay:', error);
    return NextResponse.json(
      { error: 'Failed to delete essay' },
      { status: 500 }
    );
  }
}

// Update essay by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();
    
    const id = params.id;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid essay ID' },
        { status: 400 }
      );
    }
    
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
    
    // Find the essay and verify it belongs to the user
    const essay = await Essay.findOne({ _id: id, user: userId });
    
    if (!essay) {
      return NextResponse.json(
        { error: 'Essay not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    // Update essay fields, only if provided
    if (body.topic !== undefined) essay.topic = body.topic;
    if (body.thesis !== undefined) essay.thesis = body.thesis;
    if (body.content !== undefined) essay.content = body.content;
    if (body.arguments !== undefined) essay.arguments = body.arguments;
    if (body.citations !== undefined) essay.citations = body.citations;
    if (body.status !== undefined) essay.status = body.status;
    if (body.wordCount !== undefined) essay.wordCount = body.wordCount;
    
    // Save the updated essay
    await essay.save();
    
    return NextResponse.json({ 
      essay,
      message: 'Essay updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating essay:', error);
    return NextResponse.json(
      { error: 'Failed to update essay' },
      { status: 500 }
    );
  }
}