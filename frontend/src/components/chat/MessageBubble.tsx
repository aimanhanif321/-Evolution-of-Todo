"use client";

import React from 'react';
import { MessageResponse, ToolCallResult } from '@/services/chatApi';
import ToolIndicator from './ToolIndicator';

interface MessageBubbleProps {
  message: MessageResponse;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] ${
          isUser
            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-md'
            : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-md'
        } px-4 py-3 shadow-lg`}
      >
        {/* Message content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Tool indicators for assistant messages */}
        {!isUser && message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            {message.tool_calls.map((toolCall, index) => (
              <ToolIndicator key={index} toolCall={toolCall} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-xs mt-2 ${
            isUser ? 'text-indigo-200' : 'text-slate-500'
          }`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
