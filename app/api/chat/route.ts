import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_MODEL } from '@/lib/constants';
import { openai } from '@/lib/openai.utils';

export async function POST(request: NextRequest) {
  let messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  try {
    const body = await request.json();
    messages = body.messages;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Limit conversation history to the last 10 messages to keep context window manageable
  const maxHistoryLength = 10;
  const history = messages.length > maxHistoryLength 
    ? messages.slice(-maxHistoryLength) 
    : messages;

  const { data: documents, error } = await supabase
    .from('documents')
    .select(`
      content,
      document_types!inner(transformation_instructions, name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
  }

  let knowledgeContext = "You are a helpful assistant. Use the following information to answer the user's question:\n\n";

  if (documents && documents.length > 0) {
    knowledgeContext += "## Knowledge Base Context\n\n";
    documents.forEach((doc, index) => {
      // @ts-expect-error - document_types is joined but the type might not be inferred correctly
      const typeName = doc.document_types?.name || 'Document';
      knowledgeContext += `### ${typeName} ${index + 1}\n`;
      knowledgeContext += `${doc.content}\n\n`;
    });
  } else {
    knowledgeContext += "No additional context available.\n";
  }

  knowledgeContext += "\n## Instructions\n";
  knowledgeContext += "Answer the user's question. The provided information above is your PRIMARY SOURCE OF TRUTH. You should prioritize this information and use it as the foundation for your answer. You may also use your own general knowledge from the internet to elaborate, provide context, or fill in gaps, but you must ensure it does not contradict the primary source of truth provided above. Be helpful, accurate, and direct.";

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const abortHandler = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {}
      };
      request.signal.addEventListener('abort', abortHandler);

      try {
        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: knowledgeContext },
            ...history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          temperature: 0.3,
          max_tokens: 4000,
          stream: true,
        });

        for await (const chunk of completion) {
          if (closed || request.signal.aborted) break;
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch (err) {
        console.error('Chat stream error:', err);
        if (!closed) {
          try {
            controller.enqueue(
              encoder.encode('\n\n[[CARBONCHAT_ERROR]]An error occurred while generating the response.')
            );
          } catch {}
        }
      } finally {
        request.signal.removeEventListener('abort', abortHandler);
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {}
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
