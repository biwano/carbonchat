import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://carbonchat.local',
    'X-Title': 'Carbonchat',
  },
});

export async function POST(request: NextRequest) {
  try {
    const { documentTypeId, name, searchQuery } = await request.json();

    if (!documentTypeId || !searchQuery) {
      return NextResponse.json(
        { error: 'documentTypeId and searchQuery are required' },
        { status: 400 }
      );
    }

    // Fetch the document type to get transformation instructions
    const { data: docType, error: typeError } = await supabase
      .from('document_types')
      .select('name, transformation_instructions')
      .eq('id', documentTypeId)
      .single();

    if (typeError || !docType) {
      return NextResponse.json(
        { error: 'Document type not found' },
        { status: 404 }
      );
    }

    // Create a system prompt that instructs the AI to research and transform
    const systemPrompt = `
You are an expert researcher and knowledge synthesizer.

Your task:
1. Research the following query thoroughly using your available tools.
2. Synthesize the information according to these specific transformation instructions:

**Transformation Instructions:**
${docType.transformation_instructions}

**Query to Research:**
${searchQuery}

Provide a comprehensive, well-structured response that follows the transformation instructions exactly.
Be accurate, insightful, and focus on creating high-quality knowledge.
`;

    // Call OpenRouter (via OpenAI SDK) - using cheapest good model
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp', // Cheapest high-quality model on OpenRouter
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please research and synthesize knowledge about: ${searchQuery}` }
      ],
      temperature: 0.3,
      max_tokens: 8000,
    });

    const generatedContent = completion.choices[0]?.message?.content || 
      'Failed to generate content.';

    // Save to database
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        name: name || `Research: ${searchQuery.substring(0, 50)}...`,
        document_type_id: documentTypeId,
        search_query: searchQuery,
        content: generatedContent,
        metadata: {
          model: completion.model,
          tokens: completion.usage,
          generated_at: new Date().toISOString(),
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document,
      message: 'Document successfully generated and saved.'
    });

  } catch (error: unknown) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape document',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
