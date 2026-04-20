'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  error?: string | null;
}

const ERROR_MARKER = '[[CARBONCHAT_ERROR]]';

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Carbonchat. Ask me anything!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const appendToLastAssistant = (
    updater: (prev: Message) => Message
  ) => {
    setMessages(prev => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === 'assistant') {
        next[next.length - 1] = updater(last);
      }
      return next;
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    
    setMessages([
      ...newMessages,
      { role: 'assistant', content: '', error: null },
    ]);
    setInput('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          if (buffer.length > 0) {
            const tail = buffer;
            buffer = '';
            appendToLastAssistant(prev => ({
              ...prev,
              content: prev.content + tail,
            }));
          }
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        const markerIndex = buffer.indexOf(ERROR_MARKER);
        if (markerIndex !== -1) {
          const contentPart = buffer.slice(0, markerIndex);
          const errorPart = buffer.slice(markerIndex + ERROR_MARKER.length);
          buffer = '';
          appendToLastAssistant(prev => ({
            ...prev,
            content: prev.content + contentPart,
            error: (prev.error ?? '') + errorPart,
          }));
          while (true) {
            const { value: v2, done: d2 } = await reader.read();
            if (d2) break;
            const extra = decoder.decode(v2, { stream: true });
            appendToLastAssistant(prev => ({
              ...prev,
              error: (prev.error ?? '') + extra,
            }));
          }
          break;
        }

        // Keep a tail the size of (marker length - 1) in the buffer so a
        // marker split across chunks is still detected on the next read.
        const safeFlushEnd = Math.max(0, buffer.length - (ERROR_MARKER.length - 1));
        if (safeFlushEnd > 0) {
          const chunkText = buffer.slice(0, safeFlushEnd);
          buffer = buffer.slice(safeFlushEnd);
          appendToLastAssistant(prev => ({
            ...prev,
            content: prev.content + chunkText,
          }));
        }
      }
    } catch (error) {
      const aborted =
        (error instanceof DOMException && error.name === 'AbortError') ||
        (error instanceof Error && error.name === 'AbortError');

      if (!aborted) {
        console.error('Chat fetch error:', error);
        appendToLastAssistant(prev => ({
          ...prev,
          error:
            (prev.error ?? '') +
            'Sorry, the response failed. Please try again.',
        }));
      }
    } finally {
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    abortControllerRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-1 overflow-auto space-y-6 p-6 bg-card rounded-2xl border border-border">
        {messages.map((message, index) => {
          const isLastAssistant =
            message.role === 'assistant' && index === messages.length - 1;
          const showTypingIndicator =
            isLastAssistant && isStreaming && message.content.length === 0 && !message.error;

          return (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted border border-border'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Bot className="w-4 h-4" />
                    <span className="text-xs font-medium">ASSISTANT</span>
                    {isLastAssistant && isStreaming && (
                      <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                )}
                <div className="text-sm leading-relaxed max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-primary">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3 text-primary">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-primary">{children}</h3>,
                      p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-normal [&>p]:mb-0">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground bg-muted/20 py-1 pr-2 rounded-r-sm">
                          {children}
                        </blockquote>
                      ),
                      code: ({ className, children, ...props }) => {
                        const isInline = !className?.includes('hljs');
                        return isInline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-[0.85rem] font-mono font-medium text-primary border border-border/50" {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="p-4 rounded-xl bg-muted/30 border border-border overflow-x-auto my-4">
                          {children}
                        </pre>
                      ),
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary font-medium underline underline-offset-4 hover:text-primary/80"
                        >
                          {children}
                        </a>
                      ),
                      table: ({ children }) => (
                        <div className="my-6 w-full overflow-y-auto rounded-lg border border-border">
                          <table className="w-full text-left text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-muted font-bold">{children}</thead>,
                      th: ({ children }) => <th className="px-4 py-2 border-b border-border">{children}</th>,
                      td: ({ children }) => <td className="px-4 py-2 border-b border-border last:border-0">{children}</td>,
                      tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {isLastAssistant && isStreaming && message.content.length > 0 && (
                    <span className="inline-block w-2 h-4 ml-0.5 align-[-2px] bg-foreground/70 animate-pulse" />
                  )}
                  {showTypingIndicator && (
                    <span className="text-muted-foreground italic">Thinking…</span>
                  )}
                </div>
                {message.error && (
                  <div className="mt-2 text-xs text-red-500 whitespace-pre-wrap">
                    {message.error}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="min-h-[60px] bg-muted border-border resize-y"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button
              onClick={stopStreaming}
              variant="destructive"
              className="px-8 self-end"
              aria-label="Stop generating"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-8 self-end"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
