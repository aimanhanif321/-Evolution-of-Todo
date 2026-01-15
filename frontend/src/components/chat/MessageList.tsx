"use client";

import React, { useEffect, useRef } from 'react';
import { MessageResponse } from '@/services/chatApi';
import MessageBubble from './MessageBubble';
import { MessageSquare } from 'lucide-react';

interface MessageListProps {
  messages: MessageResponse[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
        <MessageSquare className="w-16 h-16 mb-4 text-slate-700" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">
          Welcome to Taskora AI
        </h3>
        <p className="text-sm text-center max-w-md">
          I can help you manage your tasks. Try saying:
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-indigo-400">"Add a task to buy groceries"</p>
          <p className="text-indigo-400">"Show me my tasks"</p>
          <p className="text-indigo-400">"Mark the first task as done"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
