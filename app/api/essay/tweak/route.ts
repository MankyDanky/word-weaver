import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/services/auth';
import dbConnect from '@/lib/mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Verify authentication
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
    if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Essay content is required' },
        { status: 400 }
      );
    }
    
    if (!body.feedback || typeof body.feedback !== 'string' || body.feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback is required for tweaking the essay' },
        { status: 400 }
      );
    }
    
    const { content, feedback, title = "" } = body;
    
    // Get tweaked essay from Perplexity
    const tweakResult = await tweakEssay(content, feedback, title);
    
    if (!tweakResult.success) {
      return NextResponse.json(
        { error: tweakResult.error || 'Failed to tweak essay' },
        { status: 500 }
      );
    }
    
    // Return just the improved essay
    return new Response(tweakResult.improvedEssay, {
      headers: { 'Content-Type': 'text/plain' }
    });
    
  } catch (error) {
    console.error('Essay tweak error:', error);
    return NextResponse.json(
      { error: 'Failed to tweak essay', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Function to tweak essay using Perplexity API
async function tweakEssay(content: string, feedback: string, title: string) {
  try {
    // Create a detailed prompt for tweaking the essay
    const promptContent = `
    You are an expert writing coach. I need you to improve an essay${title ? ` titled "${title}"` : ""} based on specific feedback while preserving most of the original content.

    ORIGINAL ESSAY:
    ${content}

    FEEDBACK TO ADDRESS:
    ${feedback}

    TASK:
    1. Make targeted improvements to address the feedback
    2. Maintain as much of the original content as possible
    3. Only modify what's necessary to address the feedback
    4. Preserve the author's voice and style
    5. Maintain the core arguments and structure

    IMPORTANT INSTRUCTIONS:
    1. Return ONLY the complete improved essay text
    2. Do NOT include any explanations, summaries, or comments
    3. Maintain the original formatting and structure
    4. There should be no placeholder text or meta commentary
    `;
    
    console.log('Sending request to Perplexity API for essay tweaking...');
    
    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "user", content: promptContent }
        ],
        max_tokens: 3000 // Higher token limit to accommodate full essay
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', errorData);
      return { success: false, error: 'Failed to tweak essay with AI' };
    }
    
    const data = await response.json();
    let improvedEssay = data.choices[0].message.content.trim();
    
    // Clean up the response if needed
    // Remove any markdown formatting the AI might have included
    improvedEssay = improvedEssay.replace(/```\w*\n|```/g, '');
    
    return {
      success: true,
      improvedEssay: improvedEssay
    };
    
  } catch (error) {
    console.error('Essay tweak error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}