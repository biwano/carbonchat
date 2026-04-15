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
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch ALL documents with their document type instructions
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        content,
        document_types!inner(transformation_instructions)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
    }

    // Build a rich system prompt using all knowledge
    let knowledgeContext = "You have access to the following knowledge base:\n\n";

    if (documents && documents.length > 0) {
      documents.forEach((doc: any, index: number) => {
        const instructions = doc.document_types?.transformation_instructions || '';
        knowledgeContext += `--- Document ${index + 1} ---\n`;
        if (instructions) {
          knowledgeContext += `Transformation Style: ${instructions}\n\n`;
        }
        knowledgeContext += `${doc.content}\n\n`;
      });
    } else {
      knowledgeContext += "No documents available in the knowledge base yet.\n";
    }

    knowledgeContext += "\nAnswer the user's question using ONLY the information above. If you don't know something, say so. Be helpful, accurate, and direct.";

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp',
      messages: [
        { 
          role: 'system', 
          content: knowledgeContext 
        },
        { 
          role: 'user', 
          content: message 
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content || 
      "I don't have enough information to answer that question yet.";

    return NextResponse.json({ response });

  } catch (error: unknown) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { 
        response: "Sorry, I encountered an error while processing your request." 
      },
      { status: 200 } // Return 200 so UI doesn't break
    );
  }
}
