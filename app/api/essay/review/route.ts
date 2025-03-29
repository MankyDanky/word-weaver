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
    
    const { content, title = "" } = body;
    
    // Get essay review from Perplexity
    const reviewResult = await getEssayReview(content, title);
    
    if (!reviewResult.success) {
      return NextResponse.json(
        { error: reviewResult.error || 'Failed to generate essay review' },
        { status: 500 }
      );
    }
    
    // Return the structured review
    return NextResponse.json(reviewResult.review);
    
  } catch (error) {
    console.error('Essay review error:', error);
    return NextResponse.json(
      { error: 'Failed to generate essay review', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Function to get essay review from Perplexity
async function getEssayReview(content: string, title: string) {
  try {
    // Create a detailed prompt for the essay review
    const promptContent = `
    You are an expert essay reviewer. Please review the following${title ? ` "${title}"` : ""} essay and provide structured feedback:

    ESSAY:
    ${content}

    Please provide a detailed review in the following JSON format (and ONLY in this format):
    {
      "ratings": {
        "grammar": [1-10 rating for grammar and mechanics],
        "structure": [1-10 rating for essay structure, organization, and flow],
        "substance": [1-10 rating for quality of arguments, evidence, and analysis],
        "overall": [1-10 overall rating]
      },
      "suggestions": [
        "A specific suggestion for improvement",
        "Another specific suggestion",
        ... (provide 3-5 actionable suggestions)
      ]
    }

    IMPORTANT INSTRUCTIONS:
    1. Your response MUST be valid JSON that can be parsed directly.
    2. Each rating should be an integer between 1-10, where 10 is excellent.
    3. Provide 1-3 specific, actionable suggestions for improvement. Keep these suggestions short and to the point while maintaining clarity and information.
    4. Do NOT include ANY explanatory text outside the JSON structure.
    5. Do NOT use markdown, code blocks, or other formatting.
    6. Simply return the raw JSON object.
    `;
    
    console.log('Sending request to Perplexity API for essay review...');
    
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
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', errorData);
      return { success: false, error: 'Failed to generate essay review with AI' };
    }
    
    const data = await response.json();
    let reviewContent = data.choices[0].message.content;
    console.log('AI review:', reviewContent);
    // Parse the JSON response
    try {
      // Clean the response to handle cases where the AI includes extra text
      reviewContent = reviewContent.trim();
      
      // If the response includes backticks (code blocks), extract just the JSON
      if (reviewContent.includes('```')) {
        reviewContent = reviewContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/)[1];
      }
     
      const reviewObject = JSON.parse(reviewContent);
      
      // Validate the expected structure
      if (!reviewObject.ratings || !reviewObject.suggestions || 
          !Array.isArray(reviewObject.suggestions) ||
          typeof reviewObject.ratings !== 'object') {
        throw new Error('Review response has invalid structure');
      }
      
      // Ensure ratings are integers between 1-10
      const ratings = reviewObject.ratings;
      for (const key of ['grammar', 'structure', 'substance', 'overall']) {
        if (!ratings[key] || typeof ratings[key] !== 'number') {
          ratings[key] = Math.round(ratings[key] || 5); // Default to 5 if missing or invalid
        }
        ratings[key] = Math.max(1, Math.min(10, Math.round(ratings[key]))); // Ensure integer between 1-10
      }
      
      return {
        success: true,
        review: reviewObject
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw response:', reviewContent);
      return { success: false, error: 'Failed to parse AI response' };
    }
    
  } catch (error) {
    console.error('Essay review error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}