import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_MODEL } from '@/lib/constants';
import { openai } from '@/lib/openai.utils';

export async function POST(request: NextRequest) {
  let message: unknown;
  try {
    ({ message } = await request.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (typeof message !== 'string' || !message.trim()) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

  let knowledgeContext = "You have access to the following knowledge base:\n\n";

  if (documents && documents.length > 0) {
    documents.forEach((doc, index) => {
      knowledgeContext += `--- Document ${index + 1} ---\n`;
      knowledgeContext += `${doc.content}\n\n`;
    });
  } else {
    knowledgeContext += "No documents available in the knowledge base yet.\n";
  }

  knowledgeContext += "\nAnswer the user's question using ONLY the information above. If you don't know something, say so. Be helpful, accurate, and direct.";

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
            { role: 'user', content: message },
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
