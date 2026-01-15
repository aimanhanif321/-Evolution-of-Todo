"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const MAX_LENGTH = 2000;

export default function ChatInput({
  onSend,
  isLoading = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading && trimmedMessage.length <= MAX_LENGTH) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = message.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isNearLimit = charCount > MAX_LENGTH * 0.9;

  return (
    <div className="border-t border-slate-800 p-4 bg-slate-900">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={`w-full bg-slate-800 text-white rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isOverLimit ? 'ring-2 ring-red-500' : ''
            }`}
            style={{ maxHeight: '150px' }}
          />

          {/* Character count indicator */}
          {isNearLimit && (
            <span
              className={`absolute right-3 bottom-3 text-xs ${
                isOverLimit ? 'text-red-400' : 'text-slate-500'
              }`}
            >
              {charCount}/{MAX_LENGTH}
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !message.trim() || isOverLimit}
          className="flex-shrink-0 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
          title="Send message (Enter)"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-slate-600 mt-2 text-center">
        Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> to send,{' '}
        <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
