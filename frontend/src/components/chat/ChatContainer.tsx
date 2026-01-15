"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageResponse, sendMessage, getMessages } from '@/services/chatApi';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { Plus, MessageSquare } from 'lucide-react';

const STORAGE_KEY = 'taskora_conversation_id';

export default function ChatContainer() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversation from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem(STORAGE_KEY);
      if (storedId) {
        setConversationId(parseInt(storedId, 10));
      }
    }
  }, []);

  // Load messages when conversation ID changes
  useEffect(() => {
    if (conversationId && user?.id) {
      loadMessages();
    }
  }, [conversationId, user?.id]);

  const loadMessages = async () => {
    if (!conversationId || !user?.id) return;

    try {
      const response = await getMessages(user.id, conversationId);
      if (response.success && response.data) {
        setMessages(response.data.messages);
      } else if (response.error?.code === '404' || response.error?.code === 'CONVERSATION_NOT_FOUND') {
        // Conversation doesn't exist anymore, clear it
        handleNewConversation();
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user?.id) {
      setError('Please log in to send messages');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Optimistic update - add user message immediately
    const tempUserMessage: MessageResponse = {
      id: Date.now(), // Temporary ID
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await sendMessage(user.id, content, conversationId || undefined);

      if (response.success && response.data) {
        // Update conversation ID if it's new
        if (!conversationId) {
          setConversationId(response.data.conversation_id);
          localStorage.setItem(STORAGE_KEY, response.data.conversation_id.toString());
        }

        // Add assistant message
        const assistantMessage: MessageResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.response,
          tool_calls: response.data.tool_calls,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
        setError(response.error?.message || 'Failed to send message');
      }
    } catch (err: any) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-indigo-500" />
          <h2 className="text-lg font-semibold text-white">Taskora AI</h2>
        </div>
        <button
          onClick={handleNewConversation}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Start new conversation"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Message list */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
