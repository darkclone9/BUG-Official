import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { text, type } = await request.json();

    if (!text || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: text and type' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Get the generative model (using Gemini Pro which is stable and widely available)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create the prompt based on the type
    let prompt = '';

    if (type === 'event_name' || type === 'tournament_name') {
      prompt = `You are Antony the Ant, the helpful mascot of BUG Gaming Club.

A user has written the following ${type === 'event_name' ? 'event' : 'tournament'} name:
"${text}"

Please improve this name to make it more engaging, professional, and exciting while maintaining the original intent.
The name should be catchy and appeal to gamers. Keep it concise (under 60 characters).

Return ONLY the improved name, nothing else.`;
    } else if (type === 'event_description' || type === 'tournament_description') {
      prompt = `You are Antony the Ant, the helpful mascot of BUG Gaming Club.

A user has written the following ${type === 'event_description' ? 'event' : 'tournament'} description:
"${text}"

Please improve this description to make it more engaging, clear, and professional while maintaining the original intent and key information.
The description should:
- Be exciting and appeal to gamers
- Clearly communicate what the event/tournament is about
- Include any important details from the original
- Be well-structured and easy to read
- Be between 100-300 characters

Return ONLY the improved description, nothing else.`;
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be event_name, event_description, tournament_name, or tournament_description' },
        { status: 400 }
      );
    }

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedText = response.text().trim();

    return NextResponse.json({ improvedText });
  } catch (error) {
    console.error('Error in AI assistant:', error);

    // Provide more detailed error message
    let errorMessage = 'Failed to generate improved text. Please try again.';

    if (error instanceof Error) {
      // Check for specific Gemini API errors
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your Gemini API key configuration.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else if (error.message.includes('blocked')) {
        errorMessage = 'Content was blocked by safety filters. Please try different text.';
      } else {
        errorMessage = `AI Error: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
