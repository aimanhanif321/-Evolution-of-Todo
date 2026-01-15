"""
Pydantic schemas for Chat API endpoints

Phase III: AI Chatbot feature
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ============================================================================
# Request Schemas
# ============================================================================

class ChatRequest(BaseModel):
    """Request body for POST /api/{user_id}/chat"""
    conversation_id: Optional[int] = Field(
        default=None,
        description="Existing conversation ID. If omitted, creates new conversation"
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's natural language message"
    )


# ============================================================================
# Response Schemas
# ============================================================================

class ToolCallResult(BaseModel):
    """Schema for MCP tool call result"""
    tool: str = Field(..., description="Tool name (add_task, list_tasks, etc.)")
    params: dict[str, Any] = Field(..., description="Input parameters")
    result: Optional[dict[str, Any]] = Field(None, description="Tool output")


class ChatResponse(BaseModel):
    """Response body for POST /api/{user_id}/chat"""
    conversation_id: int = Field(..., description="The conversation ID")
    response: str = Field(..., description="AI-generated natural language response")
    tool_calls: List[ToolCallResult] = Field(
        default_factory=list,
        description="List of MCP tools invoked (may be empty)"
    )


class ConversationSummary(BaseModel):
    """Summary of a conversation for listing"""
    id: int
    created_at: datetime
    updated_at: datetime
    message_count: int = Field(default=0, description="Number of messages")
    last_message: Optional[str] = Field(
        None,
        description="Preview of the last message"
    )


class ConversationListResponse(BaseModel):
    """Response body for GET /api/{user_id}/conversations"""
    conversations: List[ConversationSummary]
    total: int = Field(..., description="Total number of conversations")
    limit: int = Field(default=20, description="Page size limit")
    offset: int = Field(default=0, description="Page offset")


class MessageResponse(BaseModel):
    """Single message in conversation history"""
    id: int
    role: str = Field(..., description="'user' or 'assistant'")
    content: str
    tool_calls: Optional[List[ToolCallResult]] = None
    created_at: datetime


class MessagesListResponse(BaseModel):
    """Response body for GET /api/{user_id}/conversations/{id}/messages"""
    messages: List[MessageResponse]
    conversation_id: int
    has_more: bool = Field(
        default=False,
        description="Whether more messages exist beyond the limit"
    )


class DeleteConversationResponse(BaseModel):
    """Response body for DELETE /api/{user_id}/conversations/{id}"""
    success: bool = True
    conversation_id: int
    messages_deleted: int = Field(
        default=0,
        description="Number of messages deleted"
    )


# ============================================================================
# Error Schemas
# ============================================================================

class ErrorDetail(BaseModel):
    """Detailed error information"""
    code: str = Field(..., description="Error code (e.g., MESSAGE_REQUIRED)")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[dict[str, Any]] = Field(None, description="Additional details")


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: ErrorDetail
