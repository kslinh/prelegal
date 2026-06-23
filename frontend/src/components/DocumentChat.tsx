'use client';

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DocumentChatResponse {
  reply: string;
  extracted_fields: Record<string, string>;
}

interface DocumentChatProps {
  templateId: string;
  templateName: string;
  currentFields: Record<string, string>;
  onFieldsExtracted: (fields: Record<string, string>) => void;
}

export default function DocumentChat({
  templateId,
  templateName,
  currentFields,
  onFieldsExtracted
}: DocumentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/chat/document/${templateId}`, {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMessage],
          current_fields: currentFields,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data: DocumentChatResponse = await response.json();

      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      // Extract and apply fields
      if (data.extracted_fields && Object.keys(data.extracted_fields).length > 0) {
        onFieldsExtracted(data.extracted_fields);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col h-[800px]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#032147]">Create Your {templateName}</h2>
        <p className="text-sm text-gray-600 mt-1">Chat with our AI to build your agreement. We'll extract all the details automatically.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="text-5xl">💬</div>
            <div>
              <p className="text-base font-semibold text-[#032147] mb-2">Start Your {templateName}</p>
              <p className="text-sm text-gray-600 max-w-xs">Describe what you need for your agreement. Example:</p>
              <p className="text-xs text-[#209dd7] mt-3 italic max-w-xs">"TechCorp Inc is sharing source code with Acme Corp. We need a 2-year mutual NDA governed by California law."</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#209dd7] text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-xs text-red-800">⚠️ {error}</p>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me about your agreement... (Shift+Enter for newline)"
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#209dd7] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-[#753991] text-white rounded-lg text-sm font-medium hover:bg-[#5e2e73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-fit"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
