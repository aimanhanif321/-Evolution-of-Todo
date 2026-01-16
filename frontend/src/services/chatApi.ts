/**
 * Chat API Client for Taskora AI Chatbot
 *
 * Phase III: AI-powered chat interface for task management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://subhankaladi123-todo-app.hf.space/api';

// ============================================================================
// Types
// ============================================================================

export interface ToolCallResult {
  tool: string;
  params: Record<string, any>;
  result?: Record<string, any>;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCallResult[];
}

export interface ConversationSummary {
  id: number;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message: string | null;
}

export interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface MessageResponse {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCallResult[];
  created_at: string;
}

export interface MessagesListResponse {
  messages: MessageResponse[];
  conversation_id: number;
  has_more: boolean;
}

export interface DeleteConversationResponse {
  success: boolean;
  conversation_id: number;
  messages_deleted: number;
}

export interface ChatApiError {
  code: string;
  message: string;
}

export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ChatApiError;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

async function handleResponse<T>(response: Response): Promise<ChatApiResponse<T>> {
  try {
    const data = await response.json();

    if (!response.ok) {
      // Handle unauthorized
      if (response.status === 401 || response.status === 403) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      }

      return {
        success: false,
        error: {
          code: data.detail?.code || response.status.toString(),
          message: data.detail?.message || data.detail || 'An error occurred',
        },
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse response',
      },
    };
  }
}

// ============================================================================
// Chat API Functions
// ============================================================================

/**
 * Send a chat message and get AI response
 *
 * @param userId - User ID
 * @param message - Message content
 * @param conversationId - Optional existing conversation ID
 */
export async function sendMessage(
  userId: string,
  message: string,
  conversationId?: number
): Promise<ChatApiResponse<ChatResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });

    return handleResponse<ChatResponse>(response);
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      },
    };
  }
}

/**
 * Get user's conversations list
 *
 * @param userId - User ID
 * @param limit - Max conversations to return (default: 20)
 * @param offset - Pagination offset (default: 0)
 */
export async function getConversations(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ChatApiResponse<ConversationListResponse>> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/${userId}/conversations?${params}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<ConversationListResponse>(response);
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      },
    };
  }
}

/**
 * Get messages for a specific conversation
 *
 * @param userId - User ID
 * @param conversationId - Conversation ID
 * @param limit - Max messages to return (default: 50)
 */
export async function getMessages(
  userId: string,
  conversationId: number,
  limit: number = 50
): Promise<ChatApiResponse<MessagesListResponse>> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/${userId}/conversations/${conversationId}/messages?${params}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<MessagesListResponse>(response);
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      },
    };
  }
}

/**
 * Delete a conversation and all its messages
 *
 * @param userId - User ID
 * @param conversationId - Conversation ID to delete
 */
export async function deleteConversation(
  userId: string,
  conversationId: number
): Promise<ChatApiResponse<DeleteConversationResponse>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${userId}/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<DeleteConversationResponse>(response);
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      },
    };
  }
}

// ============================================================================
// Export default object for convenience
// ============================================================================

const chatApi = {
  sendMessage,
  getConversations,
  getMessages,
  deleteConversation,
};

export default chatApi;
