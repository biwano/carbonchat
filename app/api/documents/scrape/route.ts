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
          additional_sources,
          source_relevance_factors
        ),
        subjects (
          name,
          content
        )
      `)
      .eq('id', id)
      .single();

    if (docError || !document) {
      console.error('Document not found:', docError);
      return NextResponse.json(
        { error: 'Document not found. Scrape can only be performed on existing documents.' },
        { status: 404 }
      );
    }

    const documentType = document.document_types as unknown as Pick<DocumentType, 'ai' | 'transformation_instructions' | 'additional_sources' | 'source_relevance_factors'> | null;
    const subject = document.subjects as unknown as Pick<Subject, 'name' | 'content'> | null;
    const transformationInstructions = documentType?.transformation_instructions;
    const additionalSources = documentType?.additional_sources;
    const sourceRelevanceFactors = documentType?.source_relevance_factors;

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
    You are an expert researcher and knowledge synthesizer with advanced web-research capabilities.
    
    Your mission is to create high-quality, accurate, and up-to-date knowledge entries.
    
    **Research Phase:**
    1. Deeply analyze the provided Subject material.
    2. Use your research capabilities to investigate the "Additional Sources" provided (these may be URLs, blogs, social media accounts, or specific domains).
    3. Look for the most recent information, favoring latest developments and current data over historical or outdated facts.
    4. Rate and prioritize each source based on the "Source Relevance Factors" provided below.
    5. Cross-reference information across multiple sources to ensure accuracy.
    
    **Synthesis Phase:**
    1. Transform the gathered information according to the "Transformation Instructions" provided below.
    2. Maintain the requested tone, structure, and depth.
    3. Ensure the output is formatted as clean, professional Markdown.
    
    **Output Requirement:**
    Return your response as a JSON object with exactly these two keys:
    - "content": The synthesized knowledge (markdown format).
    - "sources": A comprehensive list of all sources, URLs, and references used for the research, as a single string (markdown format). 
      - **CRITICAL**: For EVERY source, you MUST add a brief note reflecting its relevance, quality, and age based on the "Source Relevance Factors". Format each source clearly (e.g., "* [Source Name](URL) — **Relevance**: High (Official documentation from 2024)").
    
    **Transformation Instructions:**
    ${transformationInstructions}

    **Source Relevance Factors:**
    ${sourceRelevanceFactors || 'Rate sources based on their authority, freshness, and direct relevance to the subject.'}
    
    **Subject to Research:**
    Subject: ${subject.name}
    Details: ${subject.content}
    ${additionalSources ? `\n**Additional Sources to Research and Browse:**\n${additionalSources}` : ''}
    
    Focus on creating a "definitive guide" style entry that is immediately useful for the knowledge base.
    `;
    
    // Call OpenRouter (via OpenAI SDK) - using cheapest good model
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Execute research and synthesis for the subject: ${subject.name}. Refer to the system instructions for specific details, sources, and relevance factors.` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 8000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      return NextResponse.json({ error: 'AI failed to generate any content' }, { status: 500 });
    }

    let generatedContent = '';
    let generatedSources = '';

    try {
      const parsedResponse = JSON.parse(responseText);
      generatedContent = parsedResponse.content;
      generatedSources = parsedResponse.sources || '';
    } catch (e) {
      console.warn('Failed to parse AI response as JSON, falling back to raw text:', e);
      generatedContent = responseText;
    }

    if (!generatedContent) {
      return NextResponse.json({ error: 'AI generated empty content' }, { status: 500 });
    }

    // Update the existing document's content, sources, updated_at, and metadata
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        content: generatedContent,
        sources: generatedSources,
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
