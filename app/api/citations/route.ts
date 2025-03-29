import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/services/auth';
import dbConnect from '@/lib/mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database (if needed for logging or user validation)
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
    if (!body.citations || !Array.isArray(body.citations) || body.citations.length === 0) {
      return NextResponse.json(
        { error: 'A list of citations (URLs) is required' },
        { status: 400 }
      );
    }

    const { citations } = body;

    // Generate works cited using Perplexity SONAR model
    const worksCitedResult = await generateWorksCited(citations);

    if (!worksCitedResult.success) {
      return NextResponse.json(
        { error: worksCitedResult.error || 'Failed to generate works cited' },
        { status: 500 }
      );
    }

    // Return the generated works cited
    return NextResponse.json({
      worksCited: worksCitedResult.content,
    });
  } catch (error) {
    console.error('Works cited generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate works cited', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Function to generate works cited using Perplexity SONAR model
async function generateWorksCited(citations: string[]) {
  try {
    // Create a detailed prompt for generating works cited
    const promptContent = `
    Generate a properly formatted works cited section for the following citations in MLA format:
    ${citations.map((citation, index) => `${index + 1}. ${citation}`).join('\n')}

    Requirements:
    - Each citation must be formatted in MLA style
    - Include all provided citations in the works cited section
    - Do NOT include any placeholder text or meta commentary
    - Return only the formatted works cited section
    `;

    console.log('Sending request to Perplexity API for works cited...');

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: promptContent }],
        max_tokens: 1000, // Limit tokens to avoid excessive output
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', errorData);
      return { success: false, error: 'Failed to generate works cited with AI' };
    }

    const data = await response.json();

    return {
      success: true,
      content: data.choices[0].message.content,
    };
  } catch (error) {
    console.error('Works cited generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}