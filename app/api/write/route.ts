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
    
    // Initial essay generation
    const initialResult = await generateEssay(topic, thesis, args, wordCount, style);
    
    if (!initialResult.success) {
      return NextResponse.json(
        { error: initialResult.error || 'Failed to generate essay' },
        { status: 500 }
      );
    }
    
    let essayContent = initialResult.content;
    let citations = initialResult.citations || [];
    
    // Word count extension loop
    let currentWordCount = countWords(essayContent);
    let extensionAttempts = 0;
    const MAX_EXTENSION_ATTEMPTS = 3; // Prevent infinite loops
    const WORD_COUNT_TOLERANCE = Math.ceil(wordCount * 0.1); // 10% of the target word count

    // Continue extending until we're within tolerance of target word count
    while (currentWordCount < wordCount - WORD_COUNT_TOLERANCE && extensionAttempts < MAX_EXTENSION_ATTEMPTS) {
      extensionAttempts++;
      console.log(`Essay extension attempt ${extensionAttempts}: Current word count ${currentWordCount}, target ${wordCount}, tolerance ${WORD_COUNT_TOLERANCE}`);
      
      const extensionResult = await extendEssay(
        essayContent, 
        topic, 
        thesis, 
        wordCount, 
        currentWordCount,
        style
      );
      
      if (extensionResult.success) {
        essayContent = extensionResult.content;
        
        // Add any new citations
        if (extensionResult.citations && extensionResult.citations.length > 0) {
          const newCitations: string[] = extensionResult.citations.filter(
            (citation: string) => !citations.includes(citation)
          );
          citations = [...citations, ...newCitations];
        }
        
        // Update current word count
        const newWordCount = countWords(essayContent);
        
        // Check if we're making meaningful progress
        if (newWordCount <= currentWordCount + 50) {
          console.log(`Extension not adding sufficient words (only added ${newWordCount - currentWordCount}). Breaking loop.`);
          break; // Break if extension isn't adding enough words
        }
        
        currentWordCount = newWordCount;
      } else {
        console.log('Extension attempt failed:', extensionResult.error);
        break; // Break on failure
      }
    }
    
    // Final word count
    const finalWordCount = countWords(essayContent);
    console.log(`Final essay word count: ${finalWordCount}/${wordCount} (${extensionAttempts} extension attempts)`);
    
    // Return the generated essay
    return NextResponse.json({
      content: essayContent,
      citations,
      wordCount: finalWordCount,
      topic,
      thesis,
      arguments: args,
      extensionAttempts
    });
    
  } catch (error) {
    console.error('Essay generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate essay', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Function to generate initial essay
async function generateEssay(
  topic: string, 
  thesis: string, 
  args: string[], 
  wordCount: number, 
  style: string
) {
  try {
    // Calculate token limit (estimating ~2.0 tokens per word)
    const tokenLimit = Math.min(4000, Math.ceil(wordCount * 2.2)); // Further increased token multiplier
    
    // Create a detailed prompt for better essay quality
    let promptContent = `Write a comprehensive ${style} essay on the topic: "${topic}". The essay MUST be exactly ${wordCount} words long (this is critically important).`;
    
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
    - The essay MUST be ${wordCount} words in length
    - Have clear headings and subheadings
    - Have a clear introduction with a thesis statement
    - Include well-developed body paragraphs with supporting evidence and examples
    - End with a conclusion that synthesizes the main points
    - Include citations for factual claims or quotes
    - Be written in ${style} style
    - Include sufficient detail to fulfill the word count requirement
    - Do NOT include placeholder text or meta commentary about the essay
    - Do NOT include a works cited section or a word count at the end
    
    Write a complete essay that is EXACTLY ${wordCount} words. Word count is critical.`;
    
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

// Function to extend an essay that's too short
async function extendEssay(
  originalEssay: string,
  topic: string,
  thesis: string,
  targetWordCount: number,
  currentWordCount: number,
  style: string
) {
  try {
    const wordsNeeded = targetWordCount - currentWordCount;
    
    // Calculate token limit for extension
    const tokenLimit = Math.min(4000, Math.ceil(wordsNeeded * 3.0)); // Increased token multiplier for extension
    
    const promptContent = `
    I have an essay on the topic "${topic}" that is ${currentWordCount} words, but it needs to be ${targetWordCount} words.
    
    Please extend this essay by adding approximately ${wordsNeeded} more words. The additions should:
    1. Expand existing points with more evidence, examples, or deeper analysis
    2. Add relevant new supporting points that strengthen the overall argument
    3. Flow naturally with the existing text and maintain the ${style} style
    4. Keep the original structure intact including headings and subheadings
    5. Focus on quality content that meaningfully enhances the essay
    6. Add to each section of the essay to ensure a balanced extension
    
    IMPORTANT INSTRUCTIONS:
    - Return the COMPLETE essay with your additions seamlessly integrated
    - Make sure the final essay is at least ${targetWordCount} words
    - Do NOT include placeholder text or meta commentary about the essay
    - Do NOT include a works cited section or a word count at the end
    
    Original essay:
    ${originalEssay}
    `;
    
    console.log(`Requesting extension for essay: Target ${targetWordCount}, Current ${currentWordCount}, Adding ~${wordsNeeded} words`);
    
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
      console.error('Perplexity API extension error:', errorData);
      return { success: false, error: 'Failed to extend essay' };
    }
    
    const data = await response.json();
    const extendedContent = data.choices[0].message.content;
    
    // Verify the extension actually added content
    const extendedWordCount = countWords(extendedContent);
    console.log(`Extension result: ${extendedWordCount} words (added ${extendedWordCount - currentWordCount} words)`);
    
    return { 
      success: true, 
      content: extendedContent,
      citations: data.citations || []
    };
    
  } catch (error) {
    console.error('Essay extension error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}