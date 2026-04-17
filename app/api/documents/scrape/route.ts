import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_MODEL } from '@/lib/constants';
import { openai } from '@/lib/openai.utils';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Fetch the document and its associated document type instructions and subject content
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        id,
        document_type_id,
        subject_id,
        document_types (
          ai,
          transformation_instructions
        ),
        subjects (
          name,
          content
        )
      `)
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found. Scrape can only be performed on existing documents.' },
        { status: 404 }
      );
    }

    const documentType = document.document_types as unknown as { ai: boolean; transformation_instructions: string } | null;
    const subject = document.subjects as unknown as { name: string; content: string } | null;
    const transformationInstructions = documentType?.transformation_instructions;

    if (documentType && documentType.ai === false) {
      return NextResponse.json(
        { error: 'Scraping is only available for AI document types. This document is manual — edit its content directly instead.' },
        { status: 400 }
      );
    }

    if (!subject || !transformationInstructions) {
      return NextResponse.json(
        { error: 'Document is missing subject or transformation instructions' },
        { status: 400 }
      );
    }

    // Create a system prompt that instructs the AI to research and transform
    const systemPrompt = `
You are an expert researcher and knowledge synthesizer.

Your task:
1. Review the following subject material thoroughly.
2. Synthesize the information according to these specific transformation instructions.
3. At the very end of the document, add a "## Resources" section listing the primary sources of information used including external knowledge applied but excluding the provided subject details.

**Transformation Instructions:**
${transformationInstructions}

**Subject to Research:**
Subject: ${subject.name}
Details: ${subject.content}

Provide a comprehensive, well-structured response that follows the transformation instructions exactly.
Be accurate, insightful, and focus on creating high-quality knowledge.
`;

    // Call OpenRouter (via OpenAI SDK) - using cheapest good model
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please research and synthesize knowledge about the subject: ${subject.name}. Use the provided details: ${subject.content}. Remember to list your resources at the end of the document.` }
      ],
      temperature: 0.3,
      max_tokens: 8000,
    });

    const generatedContent = completion.choices[0]?.message?.content || 
      'Failed to generate content.';

    // Update the existing document's content, updated_at, and metadata
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        content: generatedContent,
        updated_at: new Date().toISOString(),
        metadata: {
          model: completion.model,
          tokens: completion.usage,
          generated_at: new Date().toISOString(),
          is_refresh: true
        }
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: 'Document successfully refreshed.'
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
