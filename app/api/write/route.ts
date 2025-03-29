import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/services/auth';
import dbConnect from '@/lib/mongoose';

// Function to count words in text
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

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
    
    // Initial essay generation (now the only generation)
    const result = await generateEssay(topic, thesis, args, wordCount, style);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate essay' },
        { status: 500 }
      );
    }
    
    const essayContent = result.content;
    const citations = result.citations || [];
    
    // Get final word count
    const finalWordCount = countWords(essayContent);
    console.log(`Final essay word count: ${finalWordCount}/${wordCount}`);
    
    // Return the generated essay
    return NextResponse.json({
      content: essayContent,
      citations,
      wordCount: finalWordCount,
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

// Function to generate essay
async function generateEssay(
  topic: string, 
  thesis: string, 
  args: string[], 
  wordCount: number, 
  style: string
) {
  try {
    // Calculate token limit (estimating ~2.0 tokens per word)
    const tokenLimit = Math.max(10000, Math.ceil(wordCount * 2.2)); 
    
    // Create a detailed prompt for better essay quality
    let promptContent = `Write a comprehensive ${style} essay on the topic: "${topic}". The essay should be approximately ${wordCount} words long.`;
    
    if (thesis) {
      promptContent += ` The central thesis should be: "${thesis}".`;
    } else {
      promptContent += ` Develop a strong thesis statement related to this topic.`;
    }
    
    if (args && args.length > 0) {
      promptContent += ` Include and develop the following key arguments: ${args.map((arg: string) => `"${arg}"`).join(", ")}.`;
    }
    
    promptContent += `
    
    Requirements (strictly follow these):
    - The essay should be AS CLOSE TO ${wordCount} words in length, do NOT make the essay too short below this length
    - Have clear headings and subheadings
    - Have a clear introduction with a thesis statement
    - Include well-developed body paragraphs with supporting evidence and examples
    - End with a conclusion that synthesizes the main points
    - Include citations for factual claims or quotes
    - Be written in ${style} style
    - Do NOT include placeholder text or meta commentary about the essay
    - Do NOT include a works cited section or a word count at the end
    
    Write a complete essay that meets these requirements.`;
    
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
      return { success: false, error: 'Failed to generate essay with AI' };
    }
    
    const data = await response.json();

    return { 
      success: true, 
      content: data.choices[0].message.content,
      citations: data.citations || []
    };
    
  } catch (error) {
    console.error('Essay generation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}