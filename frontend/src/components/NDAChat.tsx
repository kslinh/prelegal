'use client';

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface NDAFormData {
  templateType: 'nda-001' | 'mnda-001' | 'nda-comprehensive';
  disclosingPartyName: string;
  disclosingPartyType: 'corporation' | 'llc' | 'individual' | 'partnership';
  disclosingPartyAddress: string;
  receivingPartyName: string;
  receivingPartyType: 'corporation' | 'llc' | 'individual' | 'partnership';
  receivingPartyAddress: string;
  effectiveDate: string;
  purpose: string;
  jurisdiction: string;
  termDuration: string;
  terminationNotice: string;
  survivalPeriod: string;
  returnPeriod: string;
  technicalSurvivalPeriod?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface NDACharResponse {
  reply: string;
  extracted_fields: Partial<NDAFormData>;
}

interface NDACharProps {
  formData: NDAFormData;
  onFieldsExtracted: (fields: Partial<NDAFormData>) => void;
}

export default function NDAChat({ formData, onFieldsExtracted }: NDACharProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/chat/nda', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMessage],
          current_fields: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data: NDACharResponse = await response.json();

      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      // Extract and apply fields
      if (data.extracted_fields) {
        onFieldsExtracted(data.extracted_fields);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col h-[600px]">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AI Assistant</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-sm text-gray-500 mb-2">👋 Start a conversation</p>
              <p className="text-xs text-gray-400">Tell me about your NDA - who's involved, what you're sharing, and any specific terms you need.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about your NDA... (Shift+Enter for newline)"
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-fit"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
