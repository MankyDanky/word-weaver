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
    if (!body.topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    // Extract parameters with defaults
    const { 
      topic, 
      thesis = "", 
      arguments: args = [], 
      wordCount = 1000,
      style = "academic" // Default style
    } = body;
    
    // Calculate token limit (estimating ~1.5 tokens per word)
    const tokenLimit = Math.min(4000, Math.ceil(wordCount * 1.5));
    
    // Create a detailed prompt for better essay quality
    let promptContent = `Write a well-structured ${style} essay on the topic: "${topic}".`;
    
    if (thesis) {
      promptContent += ` The central thesis should be: "${thesis}".`;
    } else {
      promptContent += ` Develop a strong thesis statement related to this topic.`;
    }
    
    if (args && args.length > 0) {
      promptContent += ` Include and develop the following key arguments: ${args.map((arg: string) => `"${arg}"`).join(", ")}.`;
    }
    
    promptContent += `
    
    The essay should:
    - Be approximately ${wordCount} words long
    - Have a clear introduction with a thesis statement
    - Include well-developed body paragraphs with supporting evidence
    - End with a conclusion that synthesizes the main points
    - Include citations for any factual claims or quotes, but don't make the works cited at the bottom yet
    - Be written in ${style} style
    
    Please provide a coherent, well-researched essay with proper structure and flow.`;
    
    console.log('Sending request to Perplexity API...');
    
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
        max_tokens: tokenLimit
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate essay with AI', details: errorData },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    // Extract the essay content
    const essayContent = data.choices[0].message.content;
    
    // Extract citations
    const citations = data.citations || [];
    
    // Count actual words in the essay
    const actualWordCount = essayContent.split(/\s+/).length;
    
    // Return the generated essay
    return NextResponse.json({
      content: essayContent,
      citations,
      wordCount: actualWordCount,
      topic,
      thesis,
      arguments: args
    });
    
  } catch (error) {
    console.error('Essay generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate essay', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}