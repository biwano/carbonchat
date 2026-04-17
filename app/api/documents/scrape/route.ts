import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DocumentType, Subject } from '@/lib/supabase.types';
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
          transformation_instructions,
          additional_sources
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

    const documentType = document.document_types as unknown as Pick<DocumentType, 'ai' | 'transformation_instructions' | 'additional_sources'> | null;
    const subject = document.subjects as unknown as Pick<Subject, 'name' | 'content'> | null;
    const transformationInstructions = documentType?.transformation_instructions;
    const additionalSources = documentType?.additional_sources;

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
    2. Review and research any provided additional sources (blogs, social media, etc.).
    3. Favor recent documents and information over older ones when researching and synthesizing.
    4. Synthesize the information according to these specific transformation instructions.
    
    Return your response as a JSON object with exactly these two keys:
    - "content": The synthesized knowledge (markdown format).
    - "sources": A list of all sources and URLs used for the research, as a single string (markdown format).
    
    **Transformation Instructions:**
    ${transformationInstructions}
    
    **Subject to Research:**
    Subject: ${subject.name}
    Details: ${subject.content}
    ${additionalSources ? `\n**Additional Sources to Research:**\n${additionalSources}` : ''}
    
    Be accurate, insightful, and focus on creating high-quality knowledge.
    `;
    
    // Call OpenRouter (via OpenAI SDK) - using cheapest good model
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please research and synthesize knowledge about the subject: ${subject.name}. Use the provided details: ${subject.content}.${additionalSources ? ` Also research these additional sources: ${additionalSources}.` : ''}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 8000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let generatedContent = 'Failed to generate content.';
    let generatedSources = '';

    if (responseText) {
      try {
        const parsedResponse = JSON.parse(responseText);
        generatedContent = parsedResponse.content || responseText;
        generatedSources = parsedResponse.sources || '';
      } catch (e) {
        console.warn('Failed to parse AI response as JSON, falling back to raw text:', e);
        generatedContent = responseText;
      }
    }

    // Update the existing document's content, sources, updated_at, and metadata
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        content: generatedContent,
        sources: generatedSources,
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
